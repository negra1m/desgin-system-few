import type { DemoMap } from './types';
import { utilitiesDemos } from './utilities';
import { actionsDemos } from './actions';
import { formsDemos } from './forms';
import { pickersDemos } from './pickers';
import { navigationDemos } from './navigation';
import { overlaysDemos } from './overlays';
import { feedbackDemos } from './feedback';
import { dataDemos } from './data';
import { layoutDemos } from './layout';
import { typographyDemos } from './typography';
export type { DemoMap } from './types';

export const demos: DemoMap = { ...utilitiesDemos, ...actionsDemos, ...formsDemos, ...pickersDemos, ...navigationDemos, ...overlaysDemos, ...feedbackDemos, ...dataDemos, ...layoutDemos, ...typographyDemos };
