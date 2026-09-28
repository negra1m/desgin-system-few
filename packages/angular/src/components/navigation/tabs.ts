// Implementação de referência do padrão composto em Angular (ver docs/composition-angular.md).
import { Directive, ElementRef, booleanAttribute, computed, inject, input, model } from '@angular/core';
import type { Orientation } from '@fewcompany/core';
import { fewId } from '../../lib/ids.js';
import { moveFocus } from '../../lib/roving.js';
import { dataAttr } from '../../lib/attrs.js';

/** Raiz: `<div fewTabs [(value)]="tab">`. Sem binding, o estado é interno (não controlado). */
@Directive({
  selector: '[fewTabs]',
  exportAs: 'fewTabs',
  host: { class: 'few-tabs', '[attr.data-orientation]': 'orientation()' },
})
export class FewTabs {
  readonly value = model<string>('');
  readonly orientation = input<Orientation>('horizontal');
  /** automatic: seta seleciona; manual: seta só move o foco, Enter/Espaço seleciona. */
  readonly activation = input<'automatic' | 'manual'>('automatic');
  readonly baseId = fewId('tabs');
  select(value: string) { this.value.set(value); }
}

@Directive({
  selector: '[fewTabsList]',
  host: { class: 'few-tabs-list', role: 'tablist', '[attr.aria-orientation]': 'tabs.orientation()', '[attr.data-orientation]': 'tabs.orientation()', '(keydown)': 'onKeydown($event)' },
})
export class FewTabsList {
  protected readonly tabs = inject(FewTabs);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly loop = input(true, { transform: booleanAttribute });
  protected onKeydown(event: KeyboardEvent) {
    if (event.defaultPrevented) return;
    const target = moveFocus(this.host.nativeElement, '[role="tab"]', event.key, { orientation: this.tabs.orientation(), loop: this.loop() });
    if (!target) return;
    event.preventDefault();
    if (this.tabs.activation() === 'automatic' && target.dataset['value'] !== undefined) this.tabs.select(target.dataset['value']);
  }
}

@Directive({
  selector: '[fewTabsTrigger]',
  host: {
    class: 'few-tabs-trigger', role: 'tab', type: 'button',
    '[id]': 'id', '[attr.aria-selected]': 'active()', '[attr.aria-controls]': 'panelId', '[attr.tabindex]': 'active() ? 0 : -1',
    '[attr.disabled]': 'disabled() ? "" : null', '[attr.data-state]': 'active() ? "active" : "inactive"', '[attr.data-value]': 'value()', '[attr.data-disabled]': 'dataAttr(disabled())',
    '(click)': 'select()',
  },
})
export class FewTabsTrigger {
  private readonly tabs = inject(FewTabs);
  readonly value = input.required<string>();
  readonly disabled = input(false, { transform: booleanAttribute });
  protected readonly active = computed(() => this.tabs.value() === this.value());
  protected readonly dataAttr = dataAttr;
  protected get id() { return `${this.tabs.baseId}-tab-${this.value()}`; }
  protected get panelId() { return `${this.tabs.baseId}-panel-${this.value()}`; }
  protected select() { if (!this.disabled()) this.tabs.select(this.value()); }
}

/** Painel: fica no DOM com `hidden` quando inativo (equivale a forceMount). Use `@if` para desmontar. */
@Directive({
  selector: '[fewTabsContent]',
  host: {
    class: 'few-tabs-content', role: 'tabpanel', tabindex: '0',
    '[id]': 'id', '[attr.aria-labelledby]': 'tabId', '[hidden]': '!active()', '[attr.data-state]': 'active() ? "active" : "inactive"',
  },
})
export class FewTabsContent {
  private readonly tabs = inject(FewTabs);
  readonly value = input.required<string>();
  protected readonly active = computed(() => this.tabs.value() === this.value());
  protected get id() { return `${this.tabs.baseId}-panel-${this.value()}`; }
  protected get tabId() { return `${this.tabs.baseId}-tab-${this.value()}`; }
}

/** Importe tudo de uma vez: `imports: [FEW_TABS]`. */
export const FEW_TABS = [FewTabs, FewTabsList, FewTabsTrigger, FewTabsContent] as const;
