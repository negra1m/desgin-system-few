// Input (ver docs/composition-angular.md). Fonte da verdade: packages/react/src/components/forms/input.tsx.
import { Directive, booleanAttribute, computed, inject, input } from '@angular/core';
import type { Size } from '@fewcompany/core';
import { dataAttr } from '../../lib/attrs.js';
import { FewField } from './field.js';

/**
 * `<input fewInput type="email">`. Sem asChild: é sempre um `<input>` real.
 * `invalid` combina com o FewField ancestral (quando existir) — ver adaptação em field.ts sobre aria-invalid.
 */
@Directive({
  selector: 'input[fewInput]',
  host: {
    class: 'few-input',
    '[class]': 'sizeClass()',
    '[attr.aria-invalid]': 'isInvalid() || null',
    '[attr.data-invalid]': 'dataAttr(isInvalid())',
  },
})
export class FewInput {
  private readonly field = inject(FewField, { optional: true });
  readonly size = input<Size>('md');
  readonly invalid = input(false, { transform: booleanAttribute });
  protected readonly isInvalid = computed(() => this.invalid() || (this.field?.invalid() ?? false));
  protected readonly sizeClass = computed(() => `few-input--${this.size()}`);
  protected readonly dataAttr = dataAttr;
}

/** Importe tudo de uma vez: `imports: [FEW_INPUT]`. */
export const FEW_INPUT = [FewInput] as const;
