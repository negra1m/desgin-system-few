// O ngc reescreve imports relativos sem extensão. Node ESM exige extensão: acrescenta `.js` (ou `/index.js`) em dist e dist-full.
import { readdirSync, readFileSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

function walk(dir) { return readdirSync(dir).flatMap(name => { const path = join(dir, name); return statSync(path).isDirectory() ? walk(path) : name.endsWith('.js') || name.endsWith('.d.ts') ? [path] : []; }); }
function fixSpecifier(file, spec) {
  if (!spec.startsWith('.') || /\.(js|mjs|cjs|json)$/.test(spec)) return spec;
  const base = resolve(dirname(file), spec);
  if (existsSync(base + '.js')) return spec + '.js';
  if (existsSync(join(base, 'index.js'))) return spec.replace(/\/$/, '') + '/index.js';
  return spec;
}
let changed = 0;
for (const dist of ['../dist/', '../dist-full/']) {
  const root = fileURLToPath(new URL(dist, import.meta.url));
  if (!existsSync(root)) continue;
  for (const file of walk(root)) {
    const source = readFileSync(file, 'utf8');
    const output = source.replace(/(from\s+|import\s*\(\s*|import\s+)(['"])([^'"]+)\2/g, (match, lead, quote, spec) => `${lead}${quote}${fixSpecifier(file, spec)}${quote}`);
    if (output !== source) { writeFileSync(file, output); changed += 1; }
  }
}
console.log(`fix-esm: ${changed} arquivos ajustados`);
