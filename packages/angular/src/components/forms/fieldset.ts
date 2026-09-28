// Fieldset (ver docs/composition-angular.md). Fonte da verdade: packages/react/src/components/forms/fieldset.tsx.
import { Directive } from '@angular/core';

/** `<fieldset fewFieldset disabled>`: `disabled` nativo já propaga para todos os controles descendentes. */
@Directive({ selector: 'fieldset[fewFieldset]', host: { class: 'few-fieldset' } })
export class FewFieldset {}

@Directive({ selector: 'legend[fewFieldsetLegend]', host: { class: 'few-fieldset-legend' } })
export class FewFieldsetLegend {}

/** Importe tudo de uma vez: `imports: [FEW_FIELDSET]`. */
export const FEW_FIELDSET = [FewFieldset, FewFieldsetLegend] as const;
