#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SITE = 'https://aprendebtc.com';

function walkHtml(dir, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (['.git', 'node_modules', '.tmp-ux'].includes(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      walkHtml(full, out);
    } else if (e.isFile() && e.name.toLowerCase().endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

function isPublicPage(rel) {
  const r = rel.replace(/\\/g, '/');
  if (r.startsWith('includes/')) return false;
  if (r.startsWith('assets/')) return false;
  if (r.startsWith('{includes,css,js,assets')) return false;
  return true;
}

function toRoute(rel) {
  const r = rel.replace(/\\/g, '/');
  if (r === 'index.html') return '/';
  if (r.endsWith('/index.html')) return '/' + r.slice(0, -'index.html'.length);
  return '/' + r;
}

function classify(route) {
  if (route === '/') return { priority: '1.0', changefreq: 'weekly' };
  if (/^\/nivel-[1-6]\/$/.test(route)) return { priority: '0.9', changefreq: 'weekly' };
  if (/^\/nivel-[1-6]\/.+\.html$/.test(route)) return { priority: '0.8', changefreq: 'monthly' };
  if (route === '/base/' || /^\/base\/.+\.html$/.test(route)) return { priority: '0.8', changefreq: 'monthly' };
  if (route === '/herramientas/' || /^\/herramientas\/.+\.html$/.test(route)) return { priority: '0.7', changefreq: 'monthly' };
  if (route === '/glosario.html' || route === '/recursos.html') return { priority: '0.6', changefreq: 'monthly' };
  if (route === '/comunidad/' || /^\/comunidad\/.+\.html$/.test(route)) return { priority: '0.6', changefreq: 'monthly' };
  return { priority: '0.6', changefreq: 'monthly' };
}

function main() {
  const files = walkHtml(ROOT)
    .map((f) => path.relative(ROOT, f))
    .filter(isPublicPage);

  const routes = Array.from(new Set(files.map(toRoute))).sort((a, b) => {
    if (a === '/') return -1;
    if (b === '/') return 1;
    return a.localeCompare(b, 'es');
  });

  const lines = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');

  for (const route of routes) {
    const meta = classify(route);
    lines.push('  <url>');
    lines.push(`    <loc>${SITE}${route}</loc>`);
    lines.push(`    <changefreq>${meta.changefreq}</changefreq>`);
    lines.push(`    <priority>${meta.priority}</priority>`);
    lines.push('  </url>');
  }

  lines.push('</urlset>');
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), lines.join('\n') + '\n', 'utf8');
  console.log(`sitemap.xml generado con ${routes.length} URLs`);
}

main();
