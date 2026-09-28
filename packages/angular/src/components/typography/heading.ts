// Ver docs/composition-angular.md. Fonte da verdade: packages/react/src/components/typography/heading.tsx.
import { Directive, booleanAttribute, input } from '@angular/core';
import { dataAttr } from '../../lib/attrs.js';

export type HeadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
export type HeadingWeight = 'medium' | 'semibold' | 'bold';
export type HeadingAlign = 'left' | 'center' | 'right';
export type HeadingTone = 'ink' | 'muted' | 'brand' | 'gradient';

/**
 * Título semântico: aplique em h1–h6 do consumidor (`<h2 fewHeading>`).
 * O nível vem da tag escolhida por quem consome; `size` escolhe a escala visual, independente da tag.
 */
@Directive({
  selector: 'h1[fewHeading], h2[fewHeading], h3[fewHeading], h4[fewHeading], h5[fewHeading], h6[fewHeading]',
  host: {
    class: 'few-heading',
    '[attr.data-size]': 'size()',
    '[attr.data-weight]': 'weight()',
    '[attr.data-align]': 'align()',
    '[attr.data-truncate]': 'dataAttr(truncate())',
    '[attr.data-tone]': 'tone()',
  },
})
export class FewHeading {
  readonly size = input<HeadingSize>('lg');
  readonly weight = input<HeadingWeight>('semibold');
  readonly align = input<HeadingAlign>();
  /** Trunca em 1 linha (ellipsis). */
  readonly truncate = input(false, { transform: booleanAttribute });
  readonly tone = input<HeadingTone>('ink');
  protected readonly dataAttr = dataAttr;
}

export const FEW_HEADING = [FewHeading] as const;
