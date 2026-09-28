// Accordion: painéis expansíveis com roving focus (ver docs/composition-angular.md). Fonte da verdade: packages/react/src/components/data/accordion.tsx.
// Adaptação documentada: `value` é sempre `string[]` (mesmo com `type="single"`), diferente da união `string | string[]`
// do React — mais simples de tipar em template Angular e consistente com o `value: string[]` de `Tree`.
// `Accordion.Header` não tem prop `level`: o consumidor escreve a tag de heading (`<h3 fewAccordionHeader>`) diretamente.
import { Component, Directive, ElementRef, booleanAttribute, computed, inject, input, model } from '@angular/core';
import type { Orientation } from '@fewcompany/core';
import { fewId } from '../../lib/ids.js';
import { moveFocus } from '../../lib/roving.js';
import { dataAttr } from '../../lib/attrs.js';

export type FewAccordionType = 'single' | 'multiple';

@Directive({
  selector: '[fewAccordion]',
  exportAs: 'fewAccordion',
  host: { class: 'few-accordion', '[attr.data-orientation]': 'orientation()' },
})
export class FewAccordion {
  readonly baseId = fewId('accordion');
  readonly type = input<FewAccordionType>('single');
  /** Só vale para `type="single"`: permite fechar o item aberto sem abrir outro. */
  readonly collapsible = input(false, { transform: booleanAttribute });
  readonly value = model<string[]>([]);
  readonly orientation = input<Orientation>('vertical');

  isOpen(itemValue: string) { return this.value().includes(itemValue); }
  toggle(itemValue: string) {
    if (this.type() === 'multiple') {
      this.value.update(list => (list.includes(itemValue) ? list.filter(v => v !== itemValue) : [...list, itemValue]));
      return;
    }
    this.value.update(current => {
      const isOpen = current.includes(itemValue);
      if (isOpen) return this.collapsible() ? [] : current;
      return [itemValue];
    });
  }
}

@Directive({
  selector: '[fewAccordionItem]',
  host: {
    class: 'few-accordion-item',
    '[attr.data-state]': 'accordion.isOpen(value()) ? "open" : "closed"',
    '[attr.data-disabled]': 'dataAttr(disabled())',
  },
})
export class FewAccordionItem {
  protected readonly accordion = inject(FewAccordion);
  readonly value = input.required<string>();
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly open = computed(() => this.accordion.isOpen(this.value()));
  protected readonly dataAttr = dataAttr;
}

/** O consumidor escreve a tag de heading (`h1`–`h6`); esta diretiva só aplica a classe. */
@Directive({ selector: '[fewAccordionHeader]', host: { class: 'few-accordion-header' } })
export class FewAccordionHeader {}

@Directive({
  selector: 'button[fewAccordionTrigger]',
  host: {
    class: 'few-accordion-trigger',
    type: 'button',
    '[id]': 'id',
    '[attr.aria-expanded]': 'item.open()',
    '[attr.aria-controls]': 'contentId',
    '[disabled]': 'isDisabled()',
    '[attr.data-state]': 'item.open() ? "open" : "closed"',
    '[attr.data-disabled]': 'dataAttr(isDisabled())',
    '(click)': 'onClick()',
    '(keydown)': 'onKeydown($event)',
  },
})
export class FewAccordionTrigger {
  private readonly accordion = inject(FewAccordion);
  protected readonly item = inject(FewAccordionItem);
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly disabled = input(false, { transform: booleanAttribute });
  protected readonly isDisabled = computed(() => this.disabled() || this.item.disabled());
  protected readonly dataAttr = dataAttr;
  protected get id() { return `${this.accordion.baseId}-trigger-${this.item.value()}`; }
  protected get contentId() { return `${this.accordion.baseId}-content-${this.item.value()}`; }

  protected onClick() { if (!this.isDisabled()) this.accordion.toggle(this.item.value()); }
  protected onKeydown(event: KeyboardEvent) {
    if (event.defaultPrevented) return;
    const container = this.hostRef.nativeElement.closest('.few-accordion');
    const target = moveFocus(container, '.few-accordion-trigger', event.key, { orientation: this.accordion.orientation() });
    if (target) event.preventDefault();
  }
}

/** `<div fewAccordionContent>`: envolve o conteúdo projetado num `.few-accordion-content-inner`, igual ao React. */
@Component({
  selector: '[fewAccordionContent]',
  host: {
    class: 'few-accordion-content',
    role: 'region',
    '[id]': 'id',
    '[attr.aria-labelledby]': 'labelledBy',
    '[attr.inert]': 'item.open() ? null : ""',
    '[attr.data-state]': 'item.open() ? "open" : "closed"',
  },
  template: `<div class="few-accordion-content-inner"><ng-content></ng-content></div>`,
})
export class FewAccordionContent {
  private readonly accordion = inject(FewAccordion);
  protected readonly item = inject(FewAccordionItem);
  protected get id() { return `${this.accordion.baseId}-content-${this.item.value()}`; }
  protected get labelledBy() { return `${this.accordion.baseId}-trigger-${this.item.value()}`; }
}

/** Importe tudo de uma vez: `imports: [FEW_ACCORDION]`. */
export const FEW_ACCORDION = [FewAccordion, FewAccordionItem, FewAccordionHeader, FewAccordionTrigger, FewAccordionContent] as const;
