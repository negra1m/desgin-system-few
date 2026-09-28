// Separator: ver docs/composition-angular.md. Espelha packages/react/src/components/layout/separator.tsx.
// Com `label`, a estrutura vira linha+rótulo+linha (por isso @Component com <ng-content> em vez de @Directive).
import { Component, booleanAttribute, input } from '@angular/core';
import type { Orientation } from '@fewcompany/core';

@Component({
  selector: '[fewSeparator]',
  template: `
    @if (label() !== undefined) {
      <span class="few-separator-line" aria-hidden="true"></span>
      <span class="few-separator-label">{{ label() }}<ng-content></ng-content></span>
      <span class="few-separator-line" aria-hidden="true"></span>
    } @else {
      <ng-content></ng-content>
    }
  `,
  host: {
    class: 'few-separator',
    '[class.few-separator-labeled]': 'label() !== undefined',
    '[attr.data-orientation]': 'orientation()',
    '[attr.role]': "decorative() ? 'none' : 'separator'",
    '[attr.aria-orientation]': "!decorative() && orientation() === 'vertical' ? 'vertical' : null",
  },
})
export class FewSeparator {
  readonly orientation = input<Orientation>('horizontal');
  /** Puramente visual (role="none"): use quando já existe separação semântica por outro elemento. */
  readonly decorative = input(false, { transform: booleanAttribute });
  /** Rótulo centralizado (ex.: "ou"), projetado via <ng-content>. Presente => vira linha+rótulo+linha. */
  readonly label = input<string | undefined>(undefined);
}

export const FEW_SEPARATOR = [FewSeparator] as const;
