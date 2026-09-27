// Copia o CSS gerado pelo core (workspace) e os tokens para o dist deste pacote.
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
const core = new URL('../../core/dist/', import.meta.url);
const dist = new URL('../dist/', import.meta.url);
mkdirSync(dist, { recursive: true });
copyFileSync(new URL('styles.css', core), new URL('styles.css', dist));
writeFileSync(new URL('tokens.js', dist), "export { tokens } from '@fewcompany/core';\n");
writeFileSync(new URL('tokens.d.ts', dist), "export { tokens } from '@fewcompany/core';\n");
