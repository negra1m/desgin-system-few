import { utilitiesRegistry } from './utilities.js';
import { actionsRegistry } from './actions.js';
import { formsRegistry } from './forms.js';
import { pickersRegistry } from './pickers.js';
import { navigationRegistry } from './navigation.js';
import { overlaysRegistry } from './overlays.js';
import { feedbackRegistry } from './feedback.js';
import { dataRegistry } from './data.js';
import { layoutRegistry } from './layout.js';
import { typographyRegistry } from './typography.js';
export { categories, LIBRARY_VERSION, type Category, type ComponentRecord } from './shared.js';

export const registry = [
  ...utilitiesRegistry, ...actionsRegistry, ...formsRegistry, ...pickersRegistry, ...navigationRegistry,
  ...overlaysRegistry, ...feedbackRegistry, ...dataRegistry, ...layoutRegistry, ...typographyRegistry,
];
