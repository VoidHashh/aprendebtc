#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SITE = 'https://aprendebtc.com';

function walkHtml(dir, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name === '.git' || e.name === 'node_modules') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkHtml(full, out);
    else if (e.isFile() && e.name.toLowerCase().endsWith('.html')) out.push(full);
  }
  return out;
}

function toRel(absPath) {
  return path.relative(ROOT, absPath).replace(/\\/g, '/');
}

function toRoute(absPath) {
  const rel = toRel(absPath);
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'index.html'.length);
  return '/' + rel;
}

function decodeEntities(str) {
  return String(str)
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&aacute;/g, 'á').replace(/&eacute;/g, 'é').replace(/&iacute;/g, 'í').replace(/&oacute;/g, 'ó').replace(/&uacute;/g, 'ú')
    .replace(/&Aacute;/g, 'Á').replace(/&Eacute;/g, 'É').replace(/&Iacute;/g, 'Í').replace(/&Oacute;/g, 'Ó').replace(/&Uacute;/g, 'Ú')
    .replace(/&ntilde;/g, 'ñ').replace(/&Ntilde;/g, 'Ñ')
    .replace(/&uuml;/g, 'ü').replace(/&Uuml;/g, 'Ü')
    .replace(/&iexcl;/g, '¡').replace(/&iquest;/g, '¿')
    .replace(/&rsquo;/g, '’').replace(/&ldquo;/g, '“').replace(/&rdquo;/g, '”')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
}

function extractMetaDescription(html) {
  const m = html.match(/<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["'][^>]*>/i);
  return m ? decodeEntities(m[1].trim()) : '';
}

function extractH1(html) {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!m) return '';
  const noTags = m[1].replace(/<[^>]+>/g, ' ');
  return decodeEntities(noTags).replace(/\s+/g, ' ').trim();
}

function stripLdJson(html) {
  return html.replace(/\s*<script\s+type=["']application\/ld\+json["']>[\s\S]*?<\/script>\s*/gi, '\n');
}

function makeScript(obj, indent = '  ') {
  return `${indent}<script type="application/ld+json">\n${JSON.stringify(obj, null, 2)}\n${indent}</script>`;
}

function isContentPage(rel) {
  return /^base\/.+\.html$/i.test(rel) || /^nivel-[1-6]\/.+\.html$/i.test(rel);
}

function main() {
  const files = walkHtml(ROOT);
  let updated = 0;
  for (const file of files) {
    const rel = toRel(file);
    let html = fs.readFileSync(file, 'utf8');
    if (!/<head[\s>]/i.test(html) || !/<\/head>/i.test(html)) continue;

    let jsonld = null;
    const route = toRoute(file);
    const url = `${SITE}${route}`;

    if (rel === 'index.html') {
      jsonld = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'aprendeBTC',
        alternateName: 'Aprende Bitcoin',
        url: 'https://aprendebtc.com',
        description: 'La guía más completa de Bitcoin en español. 6 niveles progresivos, desde tu primera compra hasta criptografía avanzada.',
        inLanguage: 'es',
        publisher: {
          '@type': 'Organization',
          name: 'aprendeBTC',
          url: 'https://aprendebtc.com'
        }
      };
    } else if (rel === 'glosario.html') {
      const desc = extractMetaDescription(html);
      jsonld = {
        '@context': 'https://schema.org',
        '@type': 'DefinedTermSet',
        name: 'Glosario de Bitcoin',
        description: desc || 'Glosario completo de términos de Bitcoin.',
        url,
        inLanguage: 'es',
        publisher: {
          '@type': 'Organization',
          name: 'aprendeBTC',
          url: 'https://aprendebtc.com'
        }
      };
    } else if (isContentPage(rel)) {
      const headline = extractH1(html);
      const desc = extractMetaDescription(html);
      if (headline && desc) {
        jsonld = {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline,
          description: desc,
          url,
          inLanguage: 'es',
          publisher: {
            '@type': 'Organization',
            name: 'aprendeBTC',
            url: 'https://aprendebtc.com'
          },
          isPartOf: {
            '@type': 'WebSite',
            name: 'aprendeBTC',
            url: 'https://aprendebtc.com'
          }
        };
      }
    }

    html = stripLdJson(html);

    if (jsonld) {
      const headIndentMatch = html.match(/^(\s*)<\/head>/im);
      const indent = headIndentMatch ? (headIndentMatch[1] || '  ') : '  ';
      const script = makeScript(jsonld, indent);
      html = html.replace(/<\/head>/i, `${script}\n</head>`);
    }

    fs.writeFileSync(file, html, 'utf8');
    updated++;
  }

  console.log(`JSON-LD update complete. processed=${updated}`);
}

main();
