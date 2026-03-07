#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

const FILES = [
  'js/nav.js',
  'js/search.js',
  'scripts/generate-search-index.js',
  'sidechains/index.html',
  'sidechains/que-son-las-sidechains.html',
  'sidechains/rootstock-rsk.html',
  'sidechains/liquid-network.html',
  'sidechains/fedimint-y-cashu.html',
  'herramientas/ascii-hex.html',
  'herramientas/claves.html',
  'herramientas/compact-size.html',
  'herramientas/difficulty-converter.html',
  'herramientas/entropy-analyzer.html',
  'herramientas/firma.html',
  'herramientas/hash.html',
  'herramientas/lightning-invoice.html',
  'herramientas/merkle-tree.html',
  'herramientas/private-key.html',
  'herramientas/psbt-decoder.html',
  'herramientas/public-key.html',
  'herramientas/script.html',
  'herramientas/seed-validator.html',
  'herramientas/timelock-decoder.html',
  'herramientas/transaccion.html',
  'herramientas/tx-decoder.html',
  'herramientas/tx-splitter.html',
  'herramientas/unix-time.html',
];

const REPLACEMENTS = [
  ['\u00C3\u00A1', 'á'],
  ['\u00C3\u00A9', 'é'],
  ['\u00C3\u00AD', 'í'],
  ['\u00C3\u00B3', 'ó'],
  ['\u00C3\u00BA', 'ú'],
  ['\u00C3\u00B1', 'ñ'],
  ['\u00C3\u0081', 'Á'],
  ['\u00C3\u0089', 'É'],
  ['\u00C3\u008D', 'Í'],
  ['\u00C3\u0093', 'Ó'],
  ['\u00C3\u009A', 'Ú'],
  ['\u00C3\u0091', 'Ñ'],
  ['\u00C3\u00BC', 'ü'],
  ['\u00C3\u009C', 'Ü'],
  ['\u00C2\u00BF', '¿'],
  ['\u00C2\u00A1', '¡'],
  ['\u00E2\u20AC\u201D', '—'],
  ['\u00E2\u20AC\u201C', '–'],
  ['\u00E2\u20AC\u2122', '’'],
  ['\u00E2\u20AC\u0153', '“'],
  ['\u00E2\u20AC\u009D', '”'],
  ['\u00E2\u20AC\u00A6', '…'],
  ['\u00E2\u2020\u2019', '→'],
  ['\u00E2\u2020\u0090', '←'],
  ['\u00E2\u2020\u201D', '↔'],
  ['\u00E2\u00B0\u00B8', '°'],
];

function applyReplacements(source) {
  let out = source;
  for (let pass = 0; pass < 3; pass++) {
    let changed = false;
    for (const [from, to] of REPLACEMENTS) {
      if (out.includes(from)) {
        out = out.split(from).join(to);
        changed = true;
      }
    }
    if (!changed) break;
  }
  return out;
}

let changedFiles = 0;
for (const rel of FILES) {
  const fp = path.join(ROOT, rel);
  if (!fs.existsSync(fp)) continue;
  const src = fs.readFileSync(fp, 'utf8');
  const out = applyReplacements(src);
  if (out !== src) {
    fs.writeFileSync(fp, out, 'utf8');
    changedFiles += 1;
    console.log(`fixed: ${rel}`);
  }
}

console.log(`changed files: ${changedFiles}`);
