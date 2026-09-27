"use client";
// Entrada pública do @fewcompany/ui (adaptador React). Cada categoria tem seu barrel em components/<categoria>/index.ts.
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
export { registry, categories, LIBRARY_VERSION, type ComponentRecord, type Category } from './registry/index.js';
