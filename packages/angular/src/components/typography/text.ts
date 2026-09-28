// Ver docs/composition-angular.md. Fonte da verdade: packages/react/src/components/typography/text.tsx.
import { Directive, booleanAttribute, computed, input } from '@angular/core';
import { dataAttr } from '../../lib/attrs.js';

export type TextSize = 'xs' | 'sm' | 'md' | 'lg';
export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';
export type TextAlign = 'left' | 'center' | 'right';
export type TextTone = 'ink' | 'muted' | 'brand' | 'success' | 'warning' | 'danger' | 'info';

/**
 * Texto de corpo: aplique em p/span/div/label do consumidor (`<p fewText>`).
 * Truncamento em 1 linha via `truncate`, ou em N linhas via `lineClamp` (CSS var `--few-line-clamp`). `lineClamp` tem prioridade sobre `truncate`.
 */
@Directive({
  selector: 'p[fewText], span[fewText], div[fewText], label[fewText]',
  host: {
    class: 'few-text',
    '[attr.data-size]': 'size()',
    '[attr.data-weight]': 'weight()',
    '[attr.data-tone]': 'tone()',
    '[attr.data-align]': 'align()',
    '[attr.data-truncate]': 'dataAttr(truncate() && !clamped())',
    '[attr.data-clamp]': 'dataAttr(clamped())',
    '[attr.data-tabular]': 'dataAttr(tabular())',
    '[style.--few-line-clamp]': 'clamped() ? lineClamp() : null',
  },
})
export class FewText {
  readonly size = input<TextSize>('md');
  readonly weight = input<TextWeight>('regular');
  readonly tone = input<TextTone>('ink');
  readonly align = input<TextAlign>();
  readonly truncate = input(false, { transform: booleanAttribute });
  /** Trunca em N linhas via -webkit-line-clamp. */
  readonly lineClamp = input<number>();
  /** font-variant-numeric: tabular-nums, para alinhar números em coluna/tabela. */
  readonly tabular = input(false, { transform: booleanAttribute });
  protected readonly clamped = computed(() => {
    const value = this.lineClamp();
    return typeof value === 'number' && value > 0;
  });
  protected readonly dataAttr = dataAttr;
}

export const FEW_TEXT = [FewText] as const;
