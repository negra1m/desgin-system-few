// Card: ver docs/composition-angular.md. Espelha packages/react/src/components/layout/card.tsx (partes sem markup próprio).
import { Directive, input } from '@angular/core';

/** Raiz: `<div fewCard variant="outlined" padding="md">`. */
@Directive({
  selector: '[fewCard]',
  exportAs: 'fewCard',
  host: { class: 'few-card', '[attr.data-variant]': 'variant()', '[attr.data-padding]': 'padding()' },
})
export class FewCard {
  readonly variant = input<'elevated' | 'outlined' | 'soft'>('outlined');
  readonly padding = input<'sm' | 'md' | 'lg'>('md');
}

/** Contêiner de Title/Description/Action. Action se alinha à direita via CSS (:has). */
@Directive({ selector: '[fewCardHeader]', host: { class: 'few-card-header' } })
export class FewCardHeader {}

/**
 * Título do cartão. No React, `level` troca a tag (h1–h6); como diretiva não troca a tag do host,
 * aplique `fewCardTitle` diretamente no h1–h6 escolhido pelo consumidor. `level` fica só para paridade de API.
 */
@Directive({ selector: '[fewCardTitle]', host: { class: 'few-card-title' } })
export class FewCardTitle {
  readonly level = input<1 | 2 | 3 | 4 | 5 | 6>(3);
}

@Directive({ selector: '[fewCardDescription]', host: { class: 'few-card-description' } })
export class FewCardDescription {}

/** Some dentro de Card.Header e se alinha à direita (grid-column 2, span das duas linhas). */
@Directive({ selector: '[fewCardAction]', host: { class: 'few-card-action' } })
export class FewCardAction {}

@Directive({ selector: '[fewCardContent]', host: { class: 'few-card-content' } })
export class FewCardContent {}

@Directive({ selector: '[fewCardFooter]', host: { class: 'few-card-footer' } })
export class FewCardFooter {}

/** Importe tudo de uma vez: `imports: [FEW_CARD]`. */
export const FEW_CARD = [FewCard, FewCardHeader, FewCardTitle, FewCardDescription, FewCardAction, FewCardContent, FewCardFooter] as const;
