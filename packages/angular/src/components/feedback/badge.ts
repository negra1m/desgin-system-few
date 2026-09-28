// Badge (ver docs/composition-angular.md). Fonte da verdade: packages/react/src/components/feedback/badge.tsx.
import { Component, booleanAttribute, computed, input } from '@angular/core';
import type { Tone } from '@fewcompany/core';

export type BadgeVariant = 'solid' | 'soft' | 'outline';
export type BadgeSize = 'sm' | 'md';

/** Componente simples (sem partes): `<span fewBadge tone="success" dot>Ativo</span>`. */
@Component({
  selector: '[fewBadge]',
  host: {
    '[class]': 'classes()',
    '[attr.data-tone]': 'tone()',
    '[attr.data-variant]': 'variant()',
  },
  template: `@if (dot()) { <span class="few-dot" aria-hidden="true"></span> }<ng-content></ng-content>`,
})
export class FewBadge {
  readonly tone = input<Tone>('neutral');
  readonly variant = input<BadgeVariant>('soft');
  readonly size = input<BadgeSize>('md');
  /** Bolinha antes do conteúdo. */
  readonly dot = input(false, { transform: booleanAttribute });
  protected readonly classes = computed(() => `few-badge few-tone--${this.tone()} few-badge--${this.variant()} few-badge--${this.size()}`);
}

export const FEW_BADGE = [FewBadge] as const;
