// Collapsible: par trigger/conteúdo mostra-esconde (ver docs/composition-angular.md). Fonte da verdade: packages/react/src/components/data/collapsible.tsx.
import { Directive, booleanAttribute, computed, inject, input, model } from '@angular/core';
import { fewId } from '../../lib/ids.js';
import { dataAttr } from '../../lib/attrs.js';

@Directive({
  selector: '[fewCollapsible]',
  exportAs: 'fewCollapsible',
  host: { class: 'few-collapsible', '[attr.data-state]': 'open() ? "open" : "closed"', '[attr.data-disabled]': 'dataAttr(disabled())' },
})
export class FewCollapsible {
  protected readonly dataAttr = dataAttr;
  readonly baseId = fewId('collapsible');
  readonly open = model(false);
  readonly disabled = input(false, { transform: booleanAttribute });
}

@Directive({
  selector: 'button[fewCollapsibleTrigger]',
  host: {
    class: 'few-collapsible-trigger',
    type: 'button',
    '[attr.aria-expanded]': 'collapsible.open()',
    '[attr.aria-controls]': 'contentId',
    '[disabled]': 'isDisabled()',
    '[attr.data-state]': 'collapsible.open() ? "open" : "closed"',
    '[attr.data-disabled]': 'dataAttr(isDisabled())',
    '(click)': 'onClick()',
  },
})
export class FewCollapsibleTrigger {
  protected readonly collapsible = inject(FewCollapsible);
  readonly disabled = input(false, { transform: booleanAttribute });
  protected readonly isDisabled = computed(() => this.disabled() || this.collapsible.disabled());
  protected readonly dataAttr = dataAttr;
  protected get contentId() { return `${this.collapsible.baseId}-content`; }
  protected onClick() { if (!this.isDisabled()) this.collapsible.open.set(!this.collapsible.open()); }
}

/** Fica no DOM com `[hidden]` quando fechado (equivale a `forceMount`); consumidor usa `@if` para desmontar de fato. */
@Directive({
  selector: '[fewCollapsibleContent]',
  host: {
    class: 'few-collapsible-content',
    '[id]': 'id',
    '[hidden]': '!collapsible.open()',
    '[attr.data-state]': 'collapsible.open() ? "open" : "closed"',
  },
})
export class FewCollapsibleContent {
  protected readonly collapsible = inject(FewCollapsible);
  protected get id() { return `${this.collapsible.baseId}-content`; }
}

/** Importe tudo de uma vez: `imports: [FEW_COLLAPSIBLE]`. */
export const FEW_COLLAPSIBLE = [FewCollapsible, FewCollapsibleTrigger, FewCollapsibleContent] as const;
