// Tag (ver docs/composition-angular.md). Fonte da verdade: packages/react/src/components/feedback/tag.tsx.
// React deriva role/teclado de "Boolean(onClick)" — sem equivalente em runtime no Angular (não há como inspecionar
// se `select` tem listeners), então a interatividade fica em um input explícito: `<span fewTag interactive (select)="...">`.
import { Component, Directive, booleanAttribute, computed, input, output } from '@angular/core';
import type { Tone } from '@fewcompany/core';
import { dataAttr } from '../../lib/attrs.js';

export type TagVariant = 'solid' | 'soft' | 'outline';
export type TagSize = 'sm' | 'md';

/** Raiz: `<span fewTag tone="info" variant="soft">`. Com `interactive`, ganha role="button" e teclado Enter/Espaço. */
@Directive({
  selector: '[fewTag]',
  exportAs: 'fewTag',
  host: {
    '[class]': 'classes()',
    '[attr.data-tone]': 'tone()',
    '[attr.data-variant]': 'variant()',
    '[attr.data-interactive]': 'dataAttr(interactive())',
    '[attr.role]': 'interactive() ? "button" : null',
    '[attr.tabindex]': 'interactive() ? 0 : null',
    '(click)': 'onClick()',
    '(keydown)': 'onKeydown($event)',
  },
})
export class FewTag {
  readonly tone = input<Tone>('neutral');
  readonly variant = input<TagVariant>('soft');
  readonly size = input<TagSize>('md');
  /** Presente = tag interativa (role="button", teclado Enter/Espaço, emite `select`). */
  readonly interactive = input(false, { transform: booleanAttribute });
  readonly select = output<void>();
  protected readonly dataAttr = dataAttr;
  protected readonly classes = computed(() => `few-tag few-tone--${this.tone()} few-tag--${this.variant()} few-tag--${this.size()}`);
  protected onClick() { if (this.interactive()) this.select.emit(); }
  protected onKeydown(event: KeyboardEvent) {
    if (event.defaultPrevented || !this.interactive()) return;
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); this.select.emit(); }
  }
}

@Directive({ selector: '[fewTagLabel]', host: { class: 'few-tag-label' } })
export class FewTagLabel {}

@Directive({ selector: '[fewTagIcon]', host: { class: 'few-tag-icon', 'aria-hidden': 'true' } })
export class FewTagIcon {}

/** Fechar: `<button fewTagClose label="React" (remove)="...">`. aria-label padrão "Remover {label}". */
@Component({
  selector: '[fewTagClose]',
  host: {
    class: 'few-tag-close', type: 'button',
    '[attr.aria-label]': 'resolvedAriaLabel()',
    '(click)': 'remove.emit()',
  },
  template: `<ng-content><span aria-hidden="true">×</span></ng-content>`,
})
export class FewTagClose {
  /** Texto da tag, usado no aria-label padrão ("Remover {label}") quando `aria-label` não é passado. */
  readonly label = input<string>();
  readonly ariaLabel = input<string>(undefined, { alias: 'aria-label' });
  readonly remove = output<void>();
  protected readonly resolvedAriaLabel = computed(() => this.ariaLabel() ?? (this.label() ? `Remover ${this.label()}` : 'Remover'));
}

/** Importe tudo de uma vez: `imports: [FEW_TAG]`. */
export const FEW_TAG = [FewTag, FewTagLabel, FewTagIcon, FewTagClose] as const;
