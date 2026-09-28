// List: lista genérica composta (ver docs/composition-angular.md). Fonte da verdade: packages/react/src/components/data/list.tsx.
// Sem prop `ordered`: o consumidor escreve `<ul fewList>` ou `<ol fewList>` diretamente (mais idiomático em Angular).
import { Directive, booleanAttribute, computed, input } from '@angular/core';
import { dataAttr } from '../../lib/attrs.js';

export type FewListVariant = 'plain' | 'divided' | 'card';

@Directive({
  selector: 'ul[fewList], ol[fewList]',
  host: { class: 'few-list', '[class]': 'variantClass()', '[attr.data-interactive]': 'dataAttr(interactive())' },
})
export class FewList {
  readonly variant = input<FewListVariant>('plain');
  readonly interactive = input(false, { transform: booleanAttribute });
  protected readonly variantClass = computed(() => `few-list--${this.variant()}`);
  protected readonly dataAttr = dataAttr;
}

@Directive({
  selector: 'li[fewListItem]',
  host: {
    class: 'few-list-item',
    '[attr.data-state]': 'selected() ? "selected" : null',
    '[attr.data-disabled]': 'dataAttr(disabled())',
    '[attr.aria-disabled]': 'disabled() || null',
  },
})
export class FewListItem {
  readonly selected = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  protected readonly dataAttr = dataAttr;
}

@Directive({ selector: '[fewListItemIcon]', host: { class: 'few-list-item-icon', 'aria-hidden': 'true' } })
export class FewListItemIcon {}

@Directive({ selector: '[fewListItemContent]', host: { class: 'few-list-item-content' } })
export class FewListItemContent {}

@Directive({ selector: '[fewListItemTitle]', host: { class: 'few-list-item-title' } })
export class FewListItemTitle {}

@Directive({ selector: '[fewListItemDescription]', host: { class: 'few-list-item-description few-muted' } })
export class FewListItemDescription {}

@Directive({ selector: '[fewListItemAction]', host: { class: 'few-list-item-action' } })
export class FewListItemAction {}

/** Importe tudo de uma vez: `imports: [FEW_LIST]`. */
export const FEW_LIST = [FewList, FewListItem, FewListItemIcon, FewListItemContent, FewListItemTitle, FewListItemDescription, FewListItemAction] as const;
