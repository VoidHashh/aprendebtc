#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const INCLUDE_EXT = new Set([
  '.html', '.htm', '.js', '.json', '.md', '.xml', '.txt', '.css', '.csv', '.yml', '.yaml',
]);
const EXCLUDE_DIRS = new Set(['.git', 'node_modules', '.idea', '.vscode', 'dist', 'build']);

const MOJIBAKE_RE = /[\u00C2\u00C3\u00E2\uFFFD]/;
const BROKEN_Q_RE = /\p{L}\?\p{L}/u;
const URL_Q_RE = /\?.+=/;

const issues = [];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (EXCLUDE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (!INCLUDE_EXT.has(ext)) continue;
    if (entry.name.startsWith('.tmp_') || entry.name.startsWith('.tmp')) continue;
    if (entry.name.endsWith('.min.js')) continue;
    if (entry.name === 'fix-mojibake-map.js') continue;

    const rel = path.relative(ROOT, full).replace(/\\/g, '/');
    const content = fs.readFileSync(full, 'utf8');
    const lines = content.split(/\r?\n/);
    lines.forEach((line, idx) => {
      if (MOJIBAKE_RE.test(line)) {
        issues.push({ type: 'mojibake', file: rel, line: idx + 1, text: line.slice(0, 240) });
      } else if (BROKEN_Q_RE.test(line) && !URL_Q_RE.test(line) && !line.includes('?:') && !line.includes('??') && !line.includes('?.')) {
        issues.push({ type: 'broken_q', file: rel, line: idx + 1, text: line.slice(0, 240) });
      }
    });
  }
}

walk(ROOT);

if (issues.length === 0) {
  console.log('Encoding check OK: no mojibake/broken_q patterns found.');
  process.exit(0);
}

const byFile = new Map();
for (const issue of issues) {
  byFile.set(issue.file, (byFile.get(issue.file) || 0) + 1);
}

console.error(`Encoding check FAILED: ${issues.length} issues in ${byFile.size} files.`);
[...byFile.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 30)
  .forEach(([file, count]) => console.error(`${count}\t${file}`));

process.exit(1);
