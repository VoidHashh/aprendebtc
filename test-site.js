#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SITE = 'https://aprendebtc.com';
const LEVEL_DIRS = ['nivel-1', 'nivel-2', 'nivel-3', 'nivel-4', 'nivel-5', 'nivel-6'];

function walkHtml(dir, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (['.git', 'node_modules', '.tmp-ux'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkHtml(full, out);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

function toRel(abs) {
  return path.relative(ROOT, abs).replace(/\\/g, '/');
}

function isPublicHtml(rel) {
  return !rel.startsWith('includes/') && !rel.startsWith('assets/');
}

function toRoute(rel) {
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'index.html'.length);
  return '/' + rel;
}

function routeToRel(route) {
  if (route === '/') return 'index.html';
  const clean = route.replace(/^\//, '');
  if (route.endsWith('/')) return clean + 'index.html';
  return clean;
}

function cleanText(str) {
  return String(str).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function getInternalLinkCandidates(originRel, hrefRaw) {
  if (!hrefRaw) return [];
  const href = hrefRaw.trim();
  if (!href || href.startsWith('#')) return [];
  if (/^(https?:)?\/\//i.test(href)) return [];
  if (/^(mailto:|tel:|javascript:|data:)/i.test(href)) return [];

  const base = originRel.split('/').slice(0, -1).join('/');
  const clean = href.split('#')[0].split('?')[0].trim();
  let rel;

  if (clean.startsWith('/')) {
    rel = clean.replace(/^\//, '');
  } else {
    rel = path.posix.normalize(path.posix.join(base || '.', clean));
    if (rel.startsWith('./')) rel = rel.slice(2);
  }

  const candidates = new Set();
  const hasExt = /\.[a-z0-9]+$/i.test(rel);

  if (rel.endsWith('/')) {
    candidates.add(rel + 'index.html');
  } else {
    candidates.add(rel);
    if (!hasExt) {
      candidates.add(rel + '.html');
      candidates.add(rel + '/index.html');
    }
  }

  return Array.from(candidates).map((c) => c.replace(/^\.\//, ''));
}

function existsAny(candidates) {
  return candidates.some((c) => fs.existsSync(path.join(ROOT, c)));
}

function extractHrefList(html) {
  const out = [];
  const re = /<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi;
  let m;
  while ((m = re.exec(html)) !== null) out.push(m[1]);
  return out;
}

function extractSidebarLinks(html) {
  const block = html.match(/<nav\b[^>]*class=["'][^"']*\bsidebar\b[^"']*["'][^>]*>([\s\S]*?)<\/nav>/i);
  if (!block) return [];
  const out = [];
  const re = /<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi;
  let m;
  while ((m = re.exec(block[1])) !== null) out.push(m[1]);
  return out;
}

function extractPrevNext(html) {
  const block = html.match(/<nav\b[^>]*class=["'][^"']*\bpage-nav\b[^"']*["'][^>]*>([\s\S]*?)<\/nav>/i);
  if (!block) return { prev: null, next: null };
  const links = block[1].matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi);
  let prev = null;
  let next = null;
  for (const entry of links) {
    const href = entry[1];
    const txt = cleanText(entry[2]).toLowerCase();
    if (txt.includes('anterior')) prev = href;
    if (txt.includes('siguiente')) next = href;
  }
  return { prev, next };
}

function checkBrokenLinks(files) {
  const issues = [];
  for (const rel of files) {
    const html = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    const hrefs = extractHrefList(html);
    for (const href of hrefs) {
      const candidates = getInternalLinkCandidates(rel, href);
      if (!candidates.length) continue;
      if (!existsAny(candidates)) {
        issues.push({ file: rel, href, expected: candidates.join(' | ') });
      }
    }
  }
  return issues;
}

function checkStructure(files) {
  const issues = [];
  for (const rel of files) {
    const html = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["'][^>]*>/i);
    const h1Count = (html.match(/<h1\b/gi) || []).length;

    const checks = [
      { ok: !!(titleMatch && cleanText(titleMatch[1])), name: 'title' },
      { ok: !!(descMatch && cleanText(descMatch[1])), name: 'meta description' },
      { ok: /<meta\s+property=["']og:title["'][^>]*>/i.test(html), name: 'og:title' },
      { ok: /<link\s+rel=["']canonical["'][^>]*>/i.test(html), name: 'canonical' },
      { ok: /<div\s+data-include=["']header["'][^>]*><\/div>/i.test(html), name: 'include header' },
      { ok: /<div\s+data-include=["']footer["'][^>]*><\/div>/i.test(html), name: 'include footer' },
      { ok: /<nav\b[^>]*class=["'][^"']*\bbreadcrumb\b[^"']*["'][^>]*>/i.test(html), name: 'breadcrumb' },
      { ok: h1Count >= 1, name: '>=1 h1' },
      { ok: h1Count <= 1, name: '<=1 h1' },
      { ok: /<div\b[^>]*class=["'][^"']*\bad-slot\b[^"']*["'][^>]*>/i.test(html), name: 'ad-slot' },
    ];

    for (const c of checks) {
      if (!c.ok) issues.push({ file: rel, issue: c.name });
    }
  }
  return issues;
}

function checkSidebarConsistency() {
  const issues = [];
  for (let i = 1; i <= 6; i++) {
    const dir = `nivel-${i}`;
    const dirPath = path.join(ROOT, dir);
    if (!fs.existsSync(dirPath)) continue;

    const pages = fs.readdirSync(dirPath)
      .filter((f) => f.toLowerCase().endsWith('.html'))
      .map((f) => `${dir}/${f}`)
      .sort();

    if (pages.length < 2) continue;

    const baselineFile = pages[0];
    const baselineLinks = extractSidebarLinks(fs.readFileSync(path.join(ROOT, baselineFile), 'utf8'));
    const baselineKey = baselineLinks.join('|');

    for (const rel of pages.slice(1)) {
      const links = extractSidebarLinks(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
      const key = links.join('|');
      if (key !== baselineKey) {
        issues.push({ level: dir, file: rel, baseline: baselineFile, links: links.length, baselineLinks: baselineLinks.length });
      }
    }
  }
  return issues;
}

function resolveLinkToLevelFile(originRel, href) {
  const candidates = getInternalLinkCandidates(originRel, href);
  if (!candidates.length) return null;
  for (const c of candidates) {
    if (fs.existsSync(path.join(ROOT, c))) return c;
  }
  return null;
}

function checkPrevNext() {
  const issues = [];
  for (let i = 1; i <= 6; i++) {
    const dir = `nivel-${i}`;
    const dirPath = path.join(ROOT, dir);
    if (!fs.existsSync(dirPath)) continue;

    const pages = fs.readdirSync(dirPath)
      .filter((f) => f.toLowerCase().endsWith('.html') && f.toLowerCase() !== 'index.html')
      .sort();
    if (!pages.length) continue;

    const map = new Map();
    for (const file of pages) {
      const rel = `${dir}/${file}`;
      const html = fs.readFileSync(path.join(ROOT, rel), 'utf8');
      map.set(rel, extractPrevNext(html));
    }

    const orphans = Array.from(map.entries()).filter(([, nav]) => !nav.prev && !nav.next).map(([rel]) => rel);
    for (const o of orphans) issues.push({ level: dir, issue: 'orphan', file: o });

    const firstCandidates = Array.from(map.entries()).filter(([, nav]) => !nav.prev).map(([rel]) => rel);
    if (firstCandidates.length !== 1) {
      issues.push({ level: dir, issue: 'first-page-count', count: firstCandidates.length });
      continue;
    }

    const visited = [];
    const seen = new Set();
    let current = firstCandidates[0];
    let externalNext = null;

    while (current) {
      if (seen.has(current)) {
        issues.push({ level: dir, issue: 'loop', file: current });
        break;
      }
      seen.add(current);
      visited.push(current);

      const nav = map.get(current);
      if (!nav || !nav.next) break;

      const target = resolveLinkToLevelFile(current, nav.next);
      if (!target) {
        externalNext = nav.next;
        break;
      }
      if (!target.startsWith(dir + '/')) {
        externalNext = nav.next;
        break;
      }
      current = target;
    }

    if (visited.length !== pages.length) {
      issues.push({ level: dir, issue: 'incomplete-chain', visited: visited.length, total: pages.length });
    }

    if (i < 6) {
      const last = visited[visited.length - 1];
      const nav = map.get(last);
      if (!nav || !nav.next || !(nav.next.includes(`../nivel-${i + 1}/`) || nav.next.includes(`/nivel-${i + 1}/`))) {
        issues.push({ level: dir, issue: 'last-next-level', file: last || null, next: nav ? nav.next : null });
      }
    }

    if (externalNext && i < 6 && !(String(externalNext).includes(`../nivel-${i + 1}/`) || String(externalNext).includes(`/nivel-${i + 1}/`))) {
      issues.push({ level: dir, issue: 'unexpected-external-next', href: externalNext });
    }
  }
  return issues;
}

function parseSitemapRoutes() {
  const sitemapPath = path.join(ROOT, 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) return { routes: [], duplicates: [] };
  const xml = fs.readFileSync(sitemapPath, 'utf8');
  const routes = [];
  const re = /<loc>([^<]+)<\/loc>/gi;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const loc = m[1].trim();
    if (loc.startsWith(SITE)) {
      const route = loc.slice(SITE.length) || '/';
      routes.push(route.startsWith('/') ? route : `/${route}`);
    }
  }
  const seen = new Set();
  const duplicates = [];
  for (const r of routes) {
    if (seen.has(r)) duplicates.push(r);
    seen.add(r);
  }
  return { routes, duplicates };
}

function checkSitemap(files) {
  const issues = [];
  const { routes, duplicates } = parseSitemapRoutes();
  const routeSet = new Set(routes);

  for (const d of duplicates) issues.push({ issue: 'duplicate', route: d });

  const fileRoutes = files.map((rel) => toRoute(rel));
  for (const route of fileRoutes) {
    if (!routeSet.has(route)) {
      issues.push({ issue: 'missing-in-sitemap', route });
    }
  }

  for (const route of routeSet) {
    const rel = routeToRel(route);
    if (!fs.existsSync(path.join(ROOT, rel))) {
      issues.push({ issue: 'missing-file-for-route', route, expected: rel });
    }
  }

  return issues;
}

function printSection(name, issues, formatter) {
  console.log(`\n[${name}]`);
  if (!issues.length) {
    console.log('OK');
    return;
  }
  console.log(`FAIL (${issues.length})`);
  for (const item of issues.slice(0, 50)) {
    console.log(formatter(item));
  }
  if (issues.length > 50) {
    console.log(`... ${issues.length - 50} incidencias mas`);
  }
}

function main() {
  const allHtml = walkHtml(ROOT).map(toRel);
  const publicHtml = allHtml.filter(isPublicHtml);

  const broken = checkBrokenLinks(publicHtml);
  const structure = checkStructure(publicHtml);
  const sidebar = checkSidebarConsistency();
  const prevNext = checkPrevNext();
  const sitemap = checkSitemap(publicHtml);

  printSection('3.1 enlaces rotos', broken, (i) => `- ${i.file} -> ${i.href} (esperado: ${i.expected})`);
  printSection('3.2 estructura', structure, (i) => `- ${i.file}: falta ${i.issue}`);
  printSection('3.3 sidebar consistency', sidebar, (i) => `- ${i.level}: ${i.file} difiere de ${i.baseline}`);
  printSection('3.4 prev-next', prevNext, (i) => `- ${i.level}: ${JSON.stringify(i)}`);
  printSection('3.5 sitemap', sitemap, (i) => `- ${JSON.stringify(i)}`);

  const total = broken.length + structure.length + sidebar.length + prevNext.length + sitemap.length;
  console.log(`\nResumen: ${total} incidencias`);
  if (total > 0) process.exitCode = 1;
}

main();
