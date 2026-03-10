const fs = require('fs');
const path = require('path');

const REPORT = '.tmp_interlink_report_blocks_1_6.md';
const BLOCK_NAME = 'Bloque 2';
const NEXT_BLOCK = '## Bloque 3';
const MAX_ROW = 148;
const APPLY = process.argv.includes('--apply');

const VOID_TAGS = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
const BLOCKED_TAGS = new Set(['h1','h2','h3','h4','h5','h6','nav','script','style','template','code','pre']);

function parseBlockRows() {
  const text = fs.readFileSync(REPORT, 'utf8');
  const start = text.indexOf(`## ${BLOCK_NAME}`);
  if (start === -1) throw new Error(`No encuentro ${BLOCK_NAME}`);
  const end = text.indexOf(NEXT_BLOCK, start);
  const block = text.slice(start, end === -1 ? undefined : end);
  const rows = [];
  for (const line of block.split(/\r?\n/)) {
    if (!line.startsWith('|')) continue;
    const parts = line.split('|').slice(1, -1).map((s) => s.trim());
    if (parts.length !== 6) continue;
    if (parts[0] === '#' || parts[0] === '---') continue;
    if (!/^\d+$/.test(parts[0])) continue;
    const idx = Number(parts[0]);
    if (idx > MAX_ROW) continue;
    if ((parts[5] || '').includes('DESCARTADO')) continue;
    rows.push({ idx, origin: parts[1], text: parts[2], anchor: parts[3], dest: parts[4], note: parts[5] || '' });
  }
  return rows;
}

function chooseDuplicate(origin, options) {
  const section = origin.replace(/^\//, '').split('/')[0];
  if (options.length === 1) return options[0];
  if (['nivel-1','nivel-2','nivel-3'].includes(section)) {
    return options.find((r) => r.dest.startsWith('/nivel-')) || options[0];
  }
  if (['nivel-4','nivel-5','nivel-6','la-madriguera','lightning'].includes(section)) {
    return options.find((r) => r.dest.startsWith('/lightning/')) || options[0];
  }
  if (section === 'base') {
    return options.find((r) => r.dest.startsWith('/nivel-')) || options[0];
  }
  return options[0];
}

function dedupeRows(rows) {
  const grouped = new Map();
  for (const row of rows) {
    const key = `${row.origin}||${row.text.toLowerCase()}||${row.anchor.toLowerCase()}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(row);
  }
  const selected = [];
  const duplicateSkips = [];
  for (const group of grouped.values()) {
    const chosen = chooseDuplicate(group[0].origin, group);
    selected.push(chosen);
    for (const row of group) {
      if (row !== chosen) duplicateSkips.push({ row, reason: 'duplicate_rule' });
    }
  }
  selected.sort((a, b) => a.idx - b.idx);
  return { selected, duplicateSkips };
}

function findTagEnd(html, start) {
  let quote = null;
  for (let i = start + 1; i < html.length; i++) {
    const ch = html[i];
    if (quote) {
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (ch === '>') return i;
  }
  return -1;
}

function parseTag(tagText) {
  if (/^<!--/.test(tagText) || /^<!/.test(tagText) || /^<\?/.test(tagText)) return { type: 'other' };
  const endMatch = tagText.match(/^<\s*\/\s*([a-zA-Z0-9:-]+)/);
  if (endMatch) return { type: 'end', tag: endMatch[1].toLowerCase() };
  const startMatch = tagText.match(/^<\s*([a-zA-Z0-9:-]+)/);
  if (!startMatch) return { type: 'other' };
  const tag = startMatch[1].toLowerCase();
  const classMatch = tagText.match(/\bclass\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
  const classValue = classMatch ? (classMatch[1] || classMatch[2] || classMatch[3] || '') : '';
  const classes = classValue.split(/\s+/).filter(Boolean);
  const selfClosing = /\/\s*>$/.test(tagText) || VOID_TAGS.has(tag);
  return { type: 'start', tag, classes, selfClosing };
}

function isBlocked(stack, inMain) {
  if (!inMain) return true;
  for (const node of stack) {
    if (BLOCKED_TAGS.has(node.tag)) return true;
    if (node.classes.some((c) => c.startsWith('callout') || c.startsWith('breadcrumb') || c.startsWith('page-nav') || c === 'article__subtitle')) return true;
  }
  return false;
}

function inLink(stack) {
  return stack.some((node) => node.tag === 'a');
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceFirstValid(html, row) {
  const escaped = escapeRegex(row.anchor);
  const termRe = new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, 'iu');
  let i = 0;
  let out = '';
  const stack = [];
  let mainDepth = 0;
  let found = false;
  let replaced = false;
  let skipExistingLink = false;

  while (i < html.length) {
    if (html[i] === '<') {
      const end = findTagEnd(html, i);
      if (end === -1) {
        out += html.slice(i);
        break;
      }
      const tagText = html.slice(i, end + 1);
      const tag = parseTag(tagText);
      out += tagText;
      if (tag.type === 'start') {
        if (tag.tag === 'main') mainDepth += 1;
        if (!tag.selfClosing) stack.push({ tag: tag.tag, classes: tag.classes });
      } else if (tag.type === 'end') {
        for (let s = stack.length - 1; s >= 0; s--) {
          if (stack[s].tag === tag.tag) {
            stack.splice(s, 1);
            break;
          }
        }
        if (tag.tag === 'main' && mainDepth > 0) mainDepth -= 1;
      }
      i = end + 1;
      continue;
    }

    const nextTag = html.indexOf('<', i);
    const end = nextTag === -1 ? html.length : nextTag;
    const chunk = html.slice(i, end);
    const searchable = !replaced && !skipExistingLink && !isBlocked(stack, mainDepth > 0);
    if (!searchable) {
      out += chunk;
      i = end;
      continue;
    }

    const match = termRe.exec(chunk);
    if (!match) {
      out += chunk;
      i = end;
      continue;
    }

    found = true;
    if (inLink(stack)) {
      out += chunk;
      skipExistingLink = true;
      i = end;
      continue;
    }

    const start = match.index;
    const stop = start + match[0].length;
    out += chunk.slice(0, start) + `<a href="${row.dest}">` + chunk.slice(start, stop) + '</a>' + chunk.slice(stop);
    replaced = true;
    i = end;
  }

  let reason = 'not_found';
  if (replaced) reason = 'implemented';
  else if (skipExistingLink) reason = 'already_linked_first_occurrence';
  else if (found) reason = 'found_but_not_replaced';

  return { html: out, replaced, reason };
}

function localPathFromRootHref(href) {
  return href.replace(/^\//, '').replace(/\//g, path.sep);
}

function main() {
  const rows = parseBlockRows();
  const { selected, duplicateSkips } = dedupeRows(rows);
  const perFile = new Map();
  for (const row of selected) {
    const key = localPathFromRootHref(row.origin);
    if (!perFile.has(key)) perFile.set(key, []);
    perFile.get(key).push(row);
  }

  const results = [];
  const modifiedFiles = new Set();
  for (const [file, fileRows] of perFile.entries()) {
    let html = fs.readFileSync(file, 'utf8');
    let changed = false;
    for (const row of fileRows) {
      const attempt = replaceFirstValid(html, row);
      results.push({ ...row, file, reason: attempt.reason, applied: attempt.replaced });
      if (attempt.replaced) {
        html = attempt.html;
        changed = true;
      }
    }
    if (changed && APPLY) {
      fs.writeFileSync(file, html, 'utf8');
      modifiedFiles.add(file);
    }
  }

  const implemented = results.filter((r) => r.applied);
  const skipped = results.filter((r) => !r.applied);
  const summary = {
    totalRows: rows.length,
    dedupedRows: selected.length,
    duplicateSkips: duplicateSkips.length,
    implemented: implemented.length,
    skipped: skipped.length,
    modifiedFiles: [...modifiedFiles].sort(),
    skippedBreakdown: skipped.reduce((acc, row) => {
      acc[row.reason] = (acc[row.reason] || 0) + 1;
      return acc;
    }, {}),
    results,
    duplicateSkipRows: duplicateSkips.map((d) => ({ idx: d.row.idx, origin: d.row.origin, dest: d.row.dest, reason: d.reason }))
  };

  fs.writeFileSync('.tmp_block2_apply_results.json', JSON.stringify(summary, null, 2), 'utf8');
  console.log(JSON.stringify({
    totalRows: summary.totalRows,
    dedupedRows: summary.dedupedRows,
    duplicateSkips: summary.duplicateSkips,
    implemented: summary.implemented,
    skipped: summary.skipped,
    skippedBreakdown: summary.skippedBreakdown,
    modifiedFiles: summary.modifiedFiles.length,
  }, null, 2));
}

main();
