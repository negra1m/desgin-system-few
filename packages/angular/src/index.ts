// Entrada pública do @fewcompany/angular. Cada categoria tem seu barrel em components/<categoria>/index.ts.
// Demos (src/demos) e o helper de SSR (src/testing) ficam fora da entrada pública: os testes importam do dist-full.
export { tokens, type FewTheme, type Tone, type Size, type Orientation } from '@fewcompany/core';
export * from './lib/index.js';
export * from './components/utilities/index.js';
export * from './components/actions/index.js';
export * from './components/forms/index.js';
export * from './components/pickers/index.js';
export * from './components/navigation/index.js';
export * from './components/overlays/index.js';
export * from './components/feedback/index.js';
export * from './components/data/index.js';
export * from './components/layout/index.js';
export * from './components/typography/index.js';
