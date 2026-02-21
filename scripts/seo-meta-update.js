#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SITE = 'https://aprendebtc.com';
const OG_IMAGE = `${SITE}/assets/og-image.png`;

function walkHtml(dir, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (['.git', 'node_modules', '.tmp-ux', 'includes', 'assets'].includes(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      walkHtml(full, out);
    } else if (e.isFile() && e.name.toLowerCase().endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

function toRoute(absPath) {
  const rel = path.relative(ROOT, absPath).replace(/\\/g, '/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'index.html'.length);
  return '/' + rel;
}

function decodeEntities(str) {
  return String(str)
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([\da-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function escapeAttr(v) {
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function extractTitle(html) {
  const m = html.match(/<title>([\s\S]*?)<\/title>/i);
  return m ? decodeEntities(m[1].replace(/\s+/g, ' ').trim()) : '';
}

function extractMetaDescription(html) {
  const m = html.match(/<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["'][^>]*>/i);
  return m ? decodeEntities(m[1].trim()) : '';
}

function stripSeoTags(html) {
  let out = html;
  out = out.replace(/^\s*<!--\s*Open Graph\s*-->\s*\n?/gim, '');
  out = out.replace(/^\s*<!--\s*Twitter Card\s*-->\s*\n?/gim, '');
  out = out.replace(/^\s*<!--\s*Canonical\s*-->\s*\n?/gim, '');
  out = out.replace(/^\s*<meta\s+property=["']og:[^>]*>\s*\n?/gim, '');
  out = out.replace(/^\s*<meta\s+name=["']twitter:[^>]*>\s*\n?/gim, '');
  out = out.replace(/^\s*<link\s+rel=["']canonical["'][^>]*>\s*\n?/gim, '');
  out = out.replace(/^\s*<link\s+rel=["']alternate["']\s+hreflang=["'](?:es|x-default)["'][^>]*>\s*\n?/gim, '');
  return out;
}

function buildSeoBlock({ url, title, description }, indent = '  ') {
  return [
    `${indent}<!-- Open Graph -->`,
    `${indent}<meta property="og:type" content="website" />`,
    `${indent}<meta property="og:url" content="${escapeAttr(url)}" />`,
    `${indent}<meta property="og:title" content="${escapeAttr(title)}" />`,
    `${indent}<meta property="og:description" content="${escapeAttr(description)}" />`,
    `${indent}<meta property="og:image" content="${OG_IMAGE}" />`,
    `${indent}<meta property="og:site_name" content="aprendeBTC" />`,
    `${indent}<meta property="og:locale" content="es_ES" />`,
    '',
    `${indent}<!-- Twitter Card -->`,
    `${indent}<meta name="twitter:card" content="summary_large_image" />`,
    `${indent}<meta name="twitter:title" content="${escapeAttr(title)}" />`,
    `${indent}<meta name="twitter:description" content="${escapeAttr(description)}" />`,
    `${indent}<meta name="twitter:image" content="${OG_IMAGE}" />`,
    '',
    `${indent}<!-- Canonical -->`,
    `${indent}<link rel="canonical" href="${escapeAttr(url)}" />`,
    `${indent}<link rel="alternate" hreflang="es" href="${escapeAttr(url)}" />`,
    `${indent}<link rel="alternate" hreflang="x-default" href="${escapeAttr(url)}" />`
  ].join('\n');
}

function main() {
  const htmlFiles = walkHtml(ROOT);
  let updated = 0;
  let skipped = 0;

  for (const file of htmlFiles) {
    let html = fs.readFileSync(file, 'utf8');
    if (!/<head[\s>]/i.test(html) || !/<\/head>/i.test(html)) {
      skipped++;
      continue;
    }

    const title = extractTitle(html);
    const description = extractMetaDescription(html);
    if (!title || !description) {
      skipped++;
      continue;
    }

    html = stripSeoTags(html);

    const route = toRoute(file);
    const url = `${SITE}${route}`;

    const descMatch = html.match(/^(\s*)<meta\s+name=["']description["']\s+content=["'][\s\S]*?["'][^>]*>/im);
    const indent = descMatch ? (descMatch[1] || '  ') : '  ';
    const block = buildSeoBlock({ url, title, description }, indent);

    html = html.replace(/(<meta\s+name=["']description["']\s+content=["'][\s\S]*?["'][^>]*>)/i, `$1\n${block}`);
    fs.writeFileSync(file, html, 'utf8');
    updated++;
  }

  console.log(`SEO meta update complete. updated=${updated}, skipped=${skipped}`);
}

main();
