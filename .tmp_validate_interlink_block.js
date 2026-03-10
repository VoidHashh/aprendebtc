const fs = require('fs');
const path = require('path');
const resultFile = process.argv[2];
if (!resultFile) throw new Error('Uso: node .tmp_validate_interlink_block.js <result.json>');
const r = require(path.resolve(resultFile));
const appliedPairs = new Set(r.results.filter(x => x.applied).map(x => `${x.dest}||${x.anchor.toLowerCase()}`));

function findTagEnd(html, start) {
  let quote = null;
  for (let i = start + 1; i < html.length; i++) {
    const ch = html[i];
    if (quote) { if (ch === quote) quote = null; continue; }
    if (ch === '"' || ch === "'") { quote = ch; continue; }
    if (ch === '>') return i;
  }
  return -1;
}

function parseTag(tagText) {
  if (/^<!--/.test(tagText) || /^<!/.test(tagText) || /^<\?/.test(tagText)) return { type: 'other' };
  const end = tagText.match(/^<\s*\/\s*([a-zA-Z0-9:-]+)/);
  if (end) return { type: 'end', tag: end[1].toLowerCase() };
  const start = tagText.match(/^<\s*([a-zA-Z0-9:-]+)/);
  if (!start) return { type: 'other' };
  const tag = start[1].toLowerCase();
  const classMatch = tagText.match(/\bclass\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
  const hrefMatch = tagText.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
  return {
    type: 'start',
    tag,
    classes: (classMatch ? (classMatch[1] || classMatch[2] || classMatch[3] || '') : '').split(/\s+/).filter(Boolean),
    href: hrefMatch ? (hrefMatch[1] || hrefMatch[2] || hrefMatch[3] || '') : '',
    selfClosing: /\/\s*>$/.test(tagText) || /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i.test(tag)
  };
}

function blockedReason(stack) {
  for (const node of stack) {
    if (['h1','h2','h3'].includes(node.tag)) return node.tag;
    if (node.classes.includes('article__subtitle')) return 'subtitle';
    if (node.classes.some(c => c.startsWith('callout'))) return 'callout';
  }
  return null;
}

const missing = [];
for (const file of r.modifiedFiles) {
  const html = fs.readFileSync(file, 'utf8');
  for (const m of html.matchAll(/href="(\/[^"#?]+)"/g)) {
    const href = m[1];
    const local = href.slice(1).replace(/\//g, path.sep);
    if (!fs.existsSync(local)) missing.push(`${file} -> ${href}`);
  }
}

const blocked = [];
for (const file of r.modifiedFiles) {
  const html = fs.readFileSync(file, 'utf8');
  let i = 0; const stack = []; const anchorStack = [];
  while (i < html.length) {
    if (html[i] === '<') {
      const end = findTagEnd(html, i); if (end === -1) break;
      const tag = parseTag(html.slice(i, end + 1));
      if (tag.type === 'start') {
        if (tag.tag === 'a') anchorStack.push({ href: tag.href, text: '', blocked: blockedReason(stack) });
        if (!tag.selfClosing) stack.push({ tag: tag.tag, classes: tag.classes });
      } else if (tag.type === 'end') {
        if (tag.tag === 'a') {
          const anchor = anchorStack.pop();
          if (anchor && anchor.href.startsWith('/')) {
            const key = `${anchor.href}||${anchor.text.trim().toLowerCase()}`;
            if (anchor.blocked && appliedPairs.has(key)) blocked.push(`${file} -> ${anchor.href} [${anchor.blocked}] text=${anchor.text.trim()}`);
          }
        }
        for (let s = stack.length - 1; s >= 0; s--) { if (stack[s].tag === tag.tag) { stack.splice(s, 1); break; } }
      }
      i = end + 1; continue;
    }
    const next = html.indexOf('<', i); const end = next === -1 ? html.length : next; const text = html.slice(i, end); if (anchorStack.length) anchorStack[anchorStack.length - 1].text += text; i = end;
  }
}

const byFile = r.results.filter(x => x.applied).reduce((a, x) => { a[x.file] = (a[x.file] || 0) + 1; return a; }, {});
const max = Object.keys(byFile).length ? Math.max(...Object.values(byFile)) : 0;
const over = Object.entries(byFile).filter(([, n]) => n > 8);

const summary = { missing, blocked, max, over };
fs.writeFileSync(resultFile.replace('.json', '.validation.json'), JSON.stringify(summary, null, 2), 'utf8');
console.log(JSON.stringify({ missing: missing.length, blocked: blocked.length, max, over: over.length }, null, 2));
if (missing.length || blocked.length || over.length) process.exitCode = 1;
