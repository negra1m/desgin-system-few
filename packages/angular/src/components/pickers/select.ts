// Select: Trigger tipo combobox abre um listbox posicionado (popover) com navegação por teclado completa.
// Ao abrir, o foco DOM move para a opção selecionada (ou a primeira); setas/Home/End roam entre opções,
// Enter/Espaço seleciona, Escape fecha e devolve o foco ao Trigger. Itens registram-se no Root (via
// afterNextRender, leitura de DOM) para alimentar Select.Value e o <select> oculto quando `name` é definido.
// Fonte da verdade: packages/react/src/components/pickers/select.tsx. Ver docs/composition-angular.md.
import {
  Component, Directive, DestroyRef, ElementRef, afterNextRender, booleanAttribute, computed, effect, inject, input, model, signal,
} from '@angular/core';
import { typeaheadIndex, type FloatingAlign, type FloatingSide } from '@fewcompany/core';
import { fewId } from '../../lib/ids.js';
import { moveFocus, focusableItems } from '../../lib/roving.js';
import { setupDismiss } from '../../lib/dismiss.js';
import { setupPosition } from '../../lib/position.js';
import { setupTopLayer } from '../../lib/top-layer.js';
import { dataAttr, dataState } from '../../lib/attrs.js';

interface SelectItemData { value: string; label: string; disabled?: boolean }

/**
 * Raiz: `<div fewSelect [(value)]="valor">`. Quando `name` é definido, renderiza um `<select>` nativo
 * oculto (few-sr-only) com as opções registradas, para participar de formulários.
 */
@Component({
  selector: '[fewSelect]',
  exportAs: 'fewSelect',
  host: { class: 'few-select', '[attr.data-disabled]': 'dataAttr(disabled())' },
  template: `
    <ng-content />
    @if (name()) {
      <select tabindex="-1" aria-hidden="true" class="few-sr-only" [name]="name()" [required]="required()" [disabled]="disabled()" [value]="value()">
        <option value=""></option>
        @for (item of items(); track item.value) {
          <option [value]="item.value">{{ item.label }}</option>
        }
      </select>
    }
  `,
})
export class FewSelect {
  readonly value = model<string>('');
  readonly open = model(false);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly name = input<string>();
  readonly baseId = fewId('select');
  protected readonly dataAttr = dataAttr;

  private readonly itemsState = signal<SelectItemData[]>([]);
  readonly items = this.itemsState.asReadonly();
  private readonly triggerElementState = signal<HTMLElement | null>(null);

  get triggerId(): string { return `${this.baseId}-trigger`; }
  get contentId(): string { return `${this.baseId}-content`; }

  select(value: string): void { this.value.set(value); }
  setOpen(open: boolean): void { this.open.set(open); }
  triggerElement(): HTMLElement | null { return this.triggerElementState(); }
  setTriggerElement(element: HTMLElement): void { this.triggerElementState.set(element); }
  focusTrigger(): void { this.triggerElementState()?.focus(); }
  registerItem(item: SelectItemData): void { this.itemsState.update(prev => [...prev.filter(i => i.value !== item.value), item]); }
  unregisterItem(value: string): void { this.itemsState.update(prev => prev.filter(i => i.value !== value)); }
}

@Directive({
  selector: '[fewSelectTrigger]',
  host: {
    class: 'few-select-trigger', type: 'button', role: 'combobox',
    '[id]': 'select.triggerId', '[attr.aria-haspopup]': "'listbox'", '[attr.aria-expanded]': 'select.open()',
    '[attr.aria-controls]': 'select.contentId', '[attr.aria-required]': 'select.required() || null',
    '[attr.disabled]': 'isDisabled() ? "" : null', '[attr.data-state]': 'dataState(select.open())', '[attr.data-disabled]': 'dataAttr(isDisabled())',
    '(click)': 'onClick()', '(keydown)': 'onKeydown($event)',
  },
})
export class FewSelectTrigger {
  protected readonly select = inject(FewSelect);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  /** Sobrepõe o `disabled` do Root quando definido. */
  readonly disabled = input<boolean>();
  protected readonly dataState = dataState;
  protected readonly dataAttr = dataAttr;
  protected readonly isDisabled = computed(() => this.disabled() ?? this.select.disabled());
  constructor() { this.select.setTriggerElement(this.el.nativeElement); }
  protected onClick(): void { if (!this.isDisabled()) this.select.setOpen(!this.select.open()); }
  protected onKeydown(event: KeyboardEvent): void {
    if (event.defaultPrevented || this.isDisabled() || this.select.open()) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ') { event.preventDefault(); this.select.setOpen(true); }
  }
}

/** Mostra o rótulo da opção selecionada (via registro de itens) ou o `placeholder`; aceita conteúdo projetado. */
@Component({
  selector: '[fewSelectValue]',
  host: { class: 'few-select-value', '[attr.data-placeholder]': 'dataAttr(!selectedLabel())' },
  template: `<ng-content />@if (noContent()) {<span>{{ selectedLabel() ?? placeholder() }}</span>}`,
})
export class FewSelectValue {
  private readonly select = inject(FewSelect);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly placeholder = input<string>('');
  protected readonly dataAttr = dataAttr;
  protected readonly noContent = signal(false);
  protected readonly selectedLabel = computed(() => this.select.items().find(item => item.value === this.select.value())?.label);
  ngAfterContentInit(): void { this.noContent.set(!this.el.nativeElement.textContent?.trim()); }
}

/** Ícone decorativo do Trigger; sem conteúdo projetado, mostra "▾". */
@Component({
  selector: '[fewSelectIcon]',
  host: { class: 'few-select-icon', 'aria-hidden': 'true' },
  template: `<ng-content />@if (noContent()) {<span>▾</span>}`,
})
export class FewSelectIcon {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly noContent = signal(false);
  ngAfterContentInit(): void { this.noContent.set(!this.el.nativeElement.textContent?.trim()); }
}

@Directive({
  selector: '[fewSelectContent]',
  host: {
    class: 'few-select-content', role: 'listbox', popover: 'manual',
    '[id]': 'select.contentId', '[attr.aria-labelledby]': 'select.triggerId',
    '[attr.data-state]': 'dataState(select.open())', '[attr.data-side]': 'position().side',
    '[style.position]': "'fixed'", '[style.top.px]': 'position().top', '[style.left.px]': 'position().left', '[style.width.px]': 'position().width',
    '(keydown)': 'onKeyDown($event)',
  },
})
export class FewSelectContent {
  protected readonly select = inject(FewSelect);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly side = input<FloatingSide>('bottom');
  readonly align = input<FloatingAlign>('start');
  protected readonly dataState = dataState;
  protected readonly position = setupPosition(
    this.select.open, () => this.select.triggerElement(), () => this.el.nativeElement,
    () => ({ side: this.side(), align: this.align(), matchWidth: true }),
  );
  private typed = '';
  private typedTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    setupTopLayer(this.select.open, () => this.el.nativeElement);
    setupDismiss(this.select.open, () => { this.select.setOpen(false); this.select.focusTrigger(); }, () => [this.el.nativeElement, this.select.triggerElement()]);
    effect(() => {
      if (!this.select.open() || typeof document === 'undefined') return;
      queueMicrotask(() => {
        const container = this.el.nativeElement;
        const target = container.querySelector<HTMLElement>('[role="option"][aria-selected="true"]') ?? container.querySelector<HTMLElement>('[role="option"]');
        target?.focus();
      });
    });
    inject(DestroyRef).onDestroy(() => clearTimeout(this.typedTimer));
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (event.defaultPrevented) return;
    const container = this.el.nativeElement;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const active = document.activeElement as HTMLElement | null;
      if (active?.getAttribute('role') === 'option' && active.dataset['value'] !== undefined) {
        this.select.select(active.dataset['value']);
        this.select.setOpen(false);
        this.select.focusTrigger();
      }
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
      const moved = moveFocus(container, '[role="option"]', event.key, { orientation: 'vertical', loop: false });
      if (moved) event.preventDefault();
      return;
    }
    if (event.key.length === 1 && event.key !== ' ') {
      const options = focusableItems(container, '[role="option"]');
      const labels = options.map(item => item.textContent ?? '');
      const current = options.indexOf(document.activeElement as HTMLElement);
      clearTimeout(this.typedTimer);
      this.typed += event.key;
      const found = typeaheadIndex(labels, this.typed, current < 0 ? 0 : current);
      this.typedTimer = setTimeout(() => { this.typed = ''; }, 500);
      if (found !== null) { event.preventDefault(); options[found]?.focus(); }
    }
  }
}

@Directive({ selector: '[fewSelectViewport]', host: { class: 'few-select-viewport', role: 'presentation' } })
export class FewSelectViewport {}

@Directive({ selector: '[fewSelectGroup]', host: { class: 'few-select-group', role: 'group' } })
export class FewSelectGroup {}

@Directive({ selector: '[fewSelectLabel]', host: { class: 'few-select-label' } })
export class FewSelectLabel {}

@Directive({
  selector: '[fewSelectItem]',
  host: {
    class: 'few-select-item', role: 'option', tabindex: '-1',
    '[id]': 'id', '[attr.aria-selected]': 'selected()', '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.data-state]': 'selected() ? "checked" : "unchecked"', '[attr.data-disabled]': 'dataAttr(disabled())', '[attr.data-value]': 'value()',
    '(click)': 'onClick()',
  },
})
export class FewSelectItem {
  private readonly select = inject(FewSelect);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly value = input.required<string>();
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly textValue = input<string>();
  protected readonly dataAttr = dataAttr;
  readonly selected = computed(() => this.select.value() === this.value());
  protected get id(): string { return `${this.select.baseId}-item-${this.value()}`; }

  constructor() {
    afterNextRender(() => this.select.registerItem({ value: this.value(), label: this.textValue() ?? this.el.nativeElement.textContent ?? this.value(), disabled: this.disabled() }));
    inject(DestroyRef).onDestroy(() => this.select.unregisterItem(this.value()));
  }

  protected onClick(): void {
    if (this.disabled()) return;
    this.select.select(this.value());
    this.select.setOpen(false);
    this.select.focusTrigger();
  }
}

@Directive({ selector: '[fewSelectItemText]', host: { class: 'few-select-item-text' } })
export class FewSelectItemText {}

/** Só visível quando o Item pai está selecionado, salvo `forceMount`. Sem conteúdo projetado, mostra "✓". */
@Component({
  selector: '[fewSelectItemIndicator]',
  host: { class: 'few-select-item-indicator', 'aria-hidden': 'true', '[hidden]': '!item.selected() && !forceMount()' },
  template: `<ng-content />@if (noContent()) {<span>✓</span>}`,
})
export class FewSelectItemIndicator {
  protected readonly item = inject(FewSelectItem);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly forceMount = input(false, { transform: booleanAttribute });
  protected readonly noContent = signal(false);
  ngAfterContentInit(): void { this.noContent.set(!this.el.nativeElement.textContent?.trim()); }
}

@Directive({ selector: '[fewSelectSeparator]', host: { class: 'few-select-separator', role: 'separator', 'aria-orientation': 'horizontal' } })
export class FewSelectSeparator {}

/** Importe tudo de uma vez: `imports: [FEW_SELECT]`. */
export const FEW_SELECT = [
  FewSelect, FewSelectTrigger, FewSelectValue, FewSelectIcon, FewSelectContent, FewSelectViewport,
  FewSelectGroup, FewSelectLabel, FewSelectItem, FewSelectItemText, FewSelectItemIndicator, FewSelectSeparator,
] as const;
