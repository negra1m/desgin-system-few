// Label (ver docs/composition-angular.md). Fonte da verdade: packages/react/src/components/forms/label.tsx.
import { Component, booleanAttribute, input } from '@angular/core';

/** Uso solto (for manual): `<label fewLabel for="email">E-mail</label>`. Dentro de um Field, use `fewFieldLabel` (ver field.ts). */
@Component({
  selector: 'label[fewLabel]',
  host: { class: 'few-form-label' },
  template: `<ng-content></ng-content>@if (required()) {<span class="few-form-label-required" aria-hidden="true"> *</span>}`,
})
export class FewLabel {
  /** Mostra um indicador (*) de campo obrigatório ao lado do texto. */
  readonly required = input(false, { transform: booleanAttribute });
}

/** Importe tudo de uma vez: `imports: [FEW_LABEL]`. */
export const FEW_LABEL = [FewLabel] as const;
