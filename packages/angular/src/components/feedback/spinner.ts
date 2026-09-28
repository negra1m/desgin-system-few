// Spinner (ver docs/composition-angular.md). Fonte da verdade: packages/react/src/components/feedback/spinner.tsx.
import { Component, computed, input } from '@angular/core';
import type { Tone, Size } from '@fewcompany/core';
import { FewVisuallyHidden } from '../utilities/visually-hidden.js';

/** Componente simples: `<span fewSpinner label="Carregando pedidos"></span>`. role="status" já anuncia o label sr-only. */
@Component({
  selector: '[fewSpinner]',
  host: { '[class]': 'classes()', role: 'status' },
  imports: [FewVisuallyHidden],
  template: `<span class="few-spinner" aria-hidden="true"></span><span fewVisuallyHidden>{{ label() }}</span>`,
})
export class FewSpinner {
  readonly size = input<Size>('md');
  readonly tone = input<Tone>('neutral');
  /** Texto sr-only anunciado pelo leitor de tela. */
  readonly label = input('Carregando');
  protected readonly classes = computed(() => `few-spinner-root few-spinner-root--${this.size()} few-tone--${this.tone()}`);
}

export const FEW_SPINNER = [FewSpinner] as const;
