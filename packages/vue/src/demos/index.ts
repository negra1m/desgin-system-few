// Demos por categoria (usadas nos testes SSR e montadas ao vivo no catálogo via `@fewcompany/vue/demos`).
import type { Component } from 'vue';
import { UTILITIES_DEMOS } from './utilities.js';
import { ACTIONS_DEMOS } from './actions.js';
import { FORMS_DEMOS } from './forms.js';
import { PICKERS_DEMOS } from './pickers.js';
import { NAVIGATION_DEMOS } from './navigation.js';
import { OVERLAYS_DEMOS } from './overlays.js';
import { FEEDBACK_DEMOS } from './feedback.js';
import { DATA_DEMOS } from './data.js';
import { LAYOUT_DEMOS } from './layout.js';
import { TYPOGRAPHY_DEMOS } from './typography.js';
export * from './utilities.js';
export * from './actions.js';
export * from './forms.js';
export * from './pickers.js';
export * from './navigation.js';
export * from './overlays.js';
export * from './feedback.js';
export * from './data.js';
export * from './layout.js';
export * from './typography.js';

/** Mapa id do registry → demo Vue. */
export const VUE_DEMOS: Record<string, Component> = { ...UTILITIES_DEMOS, ...ACTIONS_DEMOS, ...FORMS_DEMOS, ...PICKERS_DEMOS, ...NAVIGATION_DEMOS, ...OVERLAYS_DEMOS, ...FEEDBACK_DEMOS, ...DATA_DEMOS, ...LAYOUT_DEMOS, ...TYPOGRAPHY_DEMOS };
