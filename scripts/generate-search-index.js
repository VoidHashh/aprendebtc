#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const OUTPUT = path.join(ROOT, 'js', 'search-index.site.json');

const EXCLUDED_DIRS = new Set([
  '.git',
  '.tmp-ux',
  'assets',
  'css',
  'includes',
  'js',
  'node_modules',
  'scripts',
  '{includes,css,js,assets'
]);

function walkHtml(dir, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (EXCLUDED_DIRS.has(entry.name)) continue;
    if (entry.name.startsWith('{')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkHtml(full, out);
      continue;
    }
    if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

function toRoute(relPath) {
  const rel = relPath.replace(/\\/g, '/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return `/${rel.slice(0, -'index.html'.length)}`;
  return `/${rel}`;
}

function decodeNumericEntity(match, base) {
  try {
    return String.fromCodePoint(parseInt(match, base));
  } catch (_) {
    return '';
  }
}

function decodeEntities(text) {
  return String(text || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => decodeNumericEntity(hex, 16))
    .replace(/&#([0-9]+);/g, (_, dec) => decodeNumericEntity(dec, 10));
}

function stripTags(html) {
  return decodeEntities(
    String(html || '')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

function getFirstMatch(html, regex) {
  const match = String(html || '').match(regex);
  return match ? stripTags(match[1]) : '';
}

function getAllMatches(html, regex) {
  const matches = [];
  const source = String(html || '');
  let match = regex.exec(source);
  while (match) {
    matches.push(stripTags(match[1]));
    match = regex.exec(source);
  }
  return matches;
}

function inferSectionAndNivel(route) {
  const pathName = route.replace(/\/+$/, '/');
  const nivelMatch = pathName.match(/^\/nivel-(\d)\//);
  if (nivelMatch) {
    return { section: `Nivel ${nivelMatch[1]}`, nivel: Number(nivelMatch[1]) };
  }
  if (pathName.startsWith('/base/')) return { section: 'Base de Conocimiento', nivel: undefined };
  if (pathName.startsWith('/la-madriguera/')) return { section: 'La Madriguera', nivel: undefined };
  if (pathName.startsWith('/herramientas/')) return { section: 'Herramientas', nivel: undefined };
  if (pathName.startsWith('/comunidad/')) return { section: 'Comunidad', nivel: undefined };
  if (pathName === '/glosario.html') return { section: 'Glosario', nivel: undefined };
  if (pathName === '/recursos.html') return { section: 'Recursos', nivel: undefined };
  if (pathName === '/sobre.html' || pathName === '/actualizaciones.html' || pathName === '/empezar.html') return { section: 'Proyecto', nivel: undefined };
  if (pathName === '/') return { section: 'Inicio', nivel: undefined };
  return { section: 'General', nivel: undefined };
}

function slugToWords(route) {
  return route
    .replace(/\//g, ' ')
    .replace(/\.html$/i, '')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildSemanticTags(title, description, bodyText) {
  const tags = new Set();
  const blob = `${title} ${description} ${bodyText}`.toLowerCase();

  if (/(seed|semilla|mnemonic|mnemoni|bip39)/.test(blob)) {
    tags.add('frase semilla');
    tags.add('seed phrase');
    tags.add('mnemonic');
    tags.add('bip39');
  }
  if (/(wallet|billetera|cartera)/.test(blob)) {
    tags.add('wallet');
    tags.add('billetera');
  }
  if (/(lightning|bolt11|invoice|factura)/.test(blob)) {
    tags.add('lightning');
    tags.add('factura lightning');
  }
  if (/(utxo|input|output|transacci)/.test(blob)) {
    tags.add('utxo');
    tags.add('transacciones');
  }
  if (/(xpub|xprv|bip32|derivation path|ruta de derivaci)/.test(blob)) {
    tags.add('xpub');
    tags.add('xprv');
    tags.add('bip32');
  }
  if (/(bech32|base58|wif|clave privada|clave pública|secp256k1)/.test(blob)) {
    tags.add('claves');
    tags.add('direcciones');
  }

  return Array.from(tags);
}

function cleanTitle(rawTitle) {
  const text = stripTags(rawTitle);
  return text
    .replace(/\s+â€”\s+(Nivel|Base|Herramientas|Comunidad)\b.*$/i, '')
    .replace(/\s+\|\s+aprendebtc\.com$/i, '')
    .trim();
}

function buildEntry(file) {
  const relPath = path.relative(ROOT, file);
  const route = toRoute(relPath);
  const html = fs.readFileSync(file, 'utf8');

  const h1 = getFirstMatch(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const titleTag = cleanTitle(getFirstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i));
  const metaDescription = getFirstMatch(
    html,
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i
  );
  const headings = getAllMatches(html, /<h[2-3][^>]*>([\s\S]*?)<\/h[2-3]>/gi)
    .filter(Boolean)
    .slice(0, 12);
  const mainBlock = getFirstMatch(html, /<main[^>]*>([\s\S]*?)<\/main>/i) || stripTags(html);
  const bodyText = mainBlock.slice(0, 4500);

  const title = h1 || titleTag || route;
  const sectionMeta = inferSectionAndNivel(route);

  const tags = new Set();
  tags.add(sectionMeta.section.toLowerCase());
  if (sectionMeta.nivel) tags.add(`nivel ${sectionMeta.nivel}`);
  slugToWords(route)
    .split(/\s+/)
    .filter((token) => token.length > 2)
    .forEach((token) => tags.add(token.toLowerCase()));
  buildSemanticTags(title, metaDescription, bodyText).forEach((tag) => tags.add(tag));

  const keywords = [metaDescription, ...headings, bodyText]
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 1500);

  return {
    title,
    url: route,
    tags: Array.from(tags).slice(0, 30),
    section: sectionMeta.section,
    ...(sectionMeta.nivel ? { nivel: sectionMeta.nivel } : {}),
    keywords
  };
}

function main() {
  const files = walkHtml(ROOT)
    .map((file) => path.resolve(file))
    .filter((file) => !file.endsWith(path.normalize('privacidad.html')))
    .sort((a, b) => a.localeCompare(b, 'es'));

  const entries = files.map(buildEntry);
  fs.writeFileSync(OUTPUT, JSON.stringify(entries, null, 2), 'utf8');
  console.log(`search-index.site.json generado con ${entries.length} entradas`);
}

main();


