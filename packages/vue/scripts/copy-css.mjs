// Copia o CSS gerado pelo core (workspace) para o dist deste pacote. O CSS é o mesmo dos adaptadores React e Angular.
import { copyFileSync, mkdirSync } from 'node:fs';
const core = new URL('../../core/dist/', import.meta.url);
const dist = new URL('../dist/', import.meta.url);
mkdirSync(dist, { recursive: true });
copyFileSync(new URL('styles.css', core), new URL('styles.css', dist));
