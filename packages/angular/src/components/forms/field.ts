// Field: liga Label/Control/Description/Error via um baseId único (ver docs/composition-angular.md).
// Fonte da verdade: packages/react/src/components/forms/field.tsx. Description/Error são detectados via
// `contentChild` (equivalente ao `Children.toArray` do React) para montar o aria-describedby de forma síncrona.
//
// Adaptação documentada: aria-invalid NÃO é definido aqui. Se `[fewFieldControl]` e o próprio controle
// (`FewInput`/`FewTextarea`/`FewNativeSelectControl`) escrevessem o mesmo atributo `aria-invalid` no mesmo host,
// duas diretivas estariam ligadas à mesma propriedade do host — o Angular não suporta esse cenário de forma
// confiável. Em vez disso, cada controle injeta `FewField` (opcional) e combina seu próprio `invalid` com
// `field.invalid()`, exatamente como o React combina o `invalid` prop com o `aria-invalid` injetado pelo Slot.
import { Directive, Component, booleanAttribute, computed, contentChild, inject, input } from '@angular/core';
import { fewId } from '../../lib/ids.js';
import { dataAttr } from '../../lib/attrs.js';

/** Raiz: `<div fewField [invalid]="hasError" [required]="true">…</div>`. */
@Directive({
  selector: '[fewField]',
  exportAs: 'fewField',
  host: { class: 'few-field', '[attr.data-invalid]': 'dataAttr(invalid())' },
})
export class FewField {
  readonly baseId = fewId('field');
  /** Marca o campo como inválido: os controles descendentes combinam isso com seu próprio `invalid`. */
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });

  private readonly descriptionRef = contentChild(FewFieldDescription, { descendants: false });
  private readonly errorRef = contentChild(FewFieldError, { descendants: false });
  readonly hasDescription = computed(() => !!this.descriptionRef());
  readonly hasError = computed(() => !!this.errorRef());

  protected readonly dataAttr = dataAttr;
}

/** `<label fewFieldLabel>Nome</label>`: `for` e o indicador de obrigatório vêm do Field pai. */
@Component({
  selector: 'label[fewFieldLabel]',
  host: { class: 'few-form-label', '[attr.for]': 'controlId' },
  template: `<ng-content></ng-content>@if (field.required()) {<span class="few-form-label-required" aria-hidden="true"> *</span>}`,
})
export class FewFieldLabel {
  protected readonly field = inject(FewField);
  protected get controlId() { return `${this.field.baseId}-control`; }
}

/** Diretiva aplicada no controle real: `<input fewInput fewFieldControl>`. Injeta id/aria-describedby/aria-required. */
@Directive({
  selector: '[fewFieldControl]',
  host: {
    '[attr.id]': 'controlId',
    '[attr.aria-describedby]': 'describedBy()',
    '[attr.aria-required]': 'field.required() || null',
  },
})
export class FewFieldControl {
  protected readonly field = inject(FewField);
  protected get controlId() { return `${this.field.baseId}-control`; }
  protected readonly describedBy = computed(() => {
    const parts = [
      this.field.hasDescription() && `${this.field.baseId}-description`,
      this.field.hasError() && `${this.field.baseId}-error`,
    ].filter((part): part is string => Boolean(part));
    return parts.length ? parts.join(' ') : null;
  });
}

@Directive({
  selector: '[fewFieldDescription]',
  host: { class: 'few-field-description few-muted', '[attr.id]': 'id' },
})
export class FewFieldDescription {
  private readonly field = inject(FewField);
  protected get id() { return `${this.field.baseId}-description`; }
}

@Directive({
  selector: '[fewFieldError]',
  host: { class: 'few-field-error', role: 'alert', '[attr.id]': 'id' },
})
export class FewFieldError {
  private readonly field = inject(FewField);
  protected get id() { return `${this.field.baseId}-error`; }
}

/** Importe tudo de uma vez: `imports: [FEW_FIELD]`. */
export const FEW_FIELD = [FewField, FewFieldLabel, FewFieldControl, FewFieldDescription, FewFieldError] as const;
