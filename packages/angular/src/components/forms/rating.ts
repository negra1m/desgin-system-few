// Rating (ver docs/composition-angular.md). Fonte da verdade: packages/react/src/components/forms/rating.tsx.
import { Component, Directive, booleanAttribute, computed, inject, input, model, signal } from '@angular/core';
import { nextIndex } from '@fewcompany/core';
import { dataAttr } from '../../lib/attrs.js';

/** Raiz: `<div fewRating [(value)]="stars" [max]="5">…</div>`. */
@Directive({
  selector: '[fewRating]',
  exportAs: 'fewRating',
  host: {
    class: 'few-rating', role: 'radiogroup', 'aria-label': 'Avaliação',
    '[attr.data-disabled]': 'dataAttr(disabled())',
    '[attr.data-readonly]': 'dataAttr(readOnly())',
    '(keydown)': 'onKeydown($event)',
    '(pointerleave)': 'onPointerLeave()',
  },
})
export class FewRating {
  readonly value = model(0);
  readonly max = input(5);
  readonly readOnly = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  private readonly hoverValue = signal<number | null>(null);
  readonly displayValue = computed(() => this.hoverValue() ?? this.value());
  protected readonly dataAttr = dataAttr;

  setHover(value: number | null) { this.hoverValue.set(value); }
  select(value: number) { this.value.set(value); }

  protected onKeydown(event: KeyboardEvent) {
    if (event.defaultPrevented || this.readOnly() || this.disabled()) return;
    const index = Math.max(0, this.value() - 1);
    const next = nextIndex(event.key, index, this.max(), { orientation: 'horizontal' });
    if (next === null) return;
    event.preventDefault();
    this.value.set(next + 1);
  }
  protected onPointerLeave() { this.hoverValue.set(null); }
}

/** `<button fewRatingItem [value]="1"></button>`: sem conteúdo projetado, cai na estrela padrão. */
@Component({
  selector: 'button[fewRatingItem]',
  host: {
    class: 'few-rating-item', type: 'button', role: 'radio',
    '[attr.aria-checked]': 'isCurrent()',
    '[attr.aria-label]': 'ariaLabel',
    '[attr.tabindex]': 'isCurrent() ? 0 : -1',
    '[disabled]': 'rating.disabled()',
    '[attr.data-state]': "filled() ? 'filled' : 'empty'",
    '(pointerenter)': 'onPointerEnter()',
    '(click)': 'onClick()',
  },
  template: `
    <ng-content>
      <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
        <path d="M10 1.6l2.6 5.4 5.9.7-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.7z" [attr.fill]="filled() ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
      </svg>
    </ng-content>
  `,
})
export class FewRatingItem {
  protected readonly rating = inject(FewRating);
  readonly value = input.required<number>();
  protected readonly filled = computed(() => this.value() <= this.rating.displayValue());
  private readonly current = computed(() => Math.max(1, Math.round(this.rating.displayValue())));
  protected readonly isCurrent = computed(() => this.value() === this.current());
  protected get ariaLabel() { return `${this.value()} de ${this.rating.max()}`; }

  protected onPointerEnter() { if (!this.rating.readOnly() && !this.rating.disabled()) this.rating.setHover(this.value()); }
  protected onClick() { if (!this.rating.readOnly() && !this.rating.disabled()) this.rating.select(this.value()); }
}

/** Importe tudo de uma vez: `imports: [FEW_RATING]`. */
export const FEW_RATING = [FewRating, FewRatingItem] as const;
