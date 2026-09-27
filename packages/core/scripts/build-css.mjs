// Concatena base.css + styles/components/**/*.css (ordem alfabética) em dist/styles.css.
import { readFileSync, readdirSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const styles = fileURLToPath(new URL('../src/styles/', import.meta.url));
const dist = fileURLToPath(new URL('../dist/', import.meta.url));
function walk(dir) { return readdirSync(dir).sort().flatMap(name => { const path = join(dir, name); return statSync(path).isDirectory() ? walk(path) : name.endsWith('.css') ? [path] : []; }); }
const parts = [readFileSync(join(styles, 'base.css'), 'utf8').trim(), ...walk(join(styles, 'components')).map(file => `/* ${file.slice(styles.length).replace(/\\/g, '/')} */\n${readFileSync(file, 'utf8').trim()}`)];
mkdirSync(dist, { recursive: true });
writeFileSync(join(dist, 'styles.css'), parts.join('\n') + '\n');
console.log(`styles.css: ${parts.length - 1} arquivos de componente`);
