// Textarea (ver docs/composition-angular.md). Fonte da verdade: packages/react/src/components/forms/textarea.tsx.
import { Directive, ElementRef, booleanAttribute, computed, inject, input } from '@angular/core';
import { dataAttr } from '../../lib/attrs.js';
import { FewField } from './field.js';

/** `<textarea fewTextarea autoResize>`. `autoResize` cresce a altura conforme o conteúdo, sem rolagem própria. */
@Directive({
  selector: 'textarea[fewTextarea]',
  host: {
    class: 'few-input few-textarea',
    '[class.few-textarea--auto]': 'autoResize()',
    '[attr.aria-invalid]': 'isInvalid() || null',
    '[attr.data-invalid]': 'dataAttr(isInvalid())',
    '(input)': 'onInput()',
  },
})
export class FewTextarea {
  private readonly field = inject(FewField, { optional: true });
  private readonly hostEl = inject<ElementRef<HTMLTextAreaElement>>(ElementRef);
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly autoResize = input(false, { transform: booleanAttribute });
  protected readonly isInvalid = computed(() => this.invalid() || (this.field?.invalid() ?? false));
  protected readonly dataAttr = dataAttr;

  protected onInput() {
    if (!this.autoResize() || typeof document === 'undefined') return;
    const el = this.hostEl.nativeElement;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }
}

/** Importe tudo de uma vez: `imports: [FEW_TEXTAREA]`. */
export const FEW_TEXTAREA = [FewTextarea] as const;
