// Combobox: Input de texto que filtra opções (contains, sem acento) via filterOptions do core.
// O foco permanece no Input; a opção "ativa" é sinalizada por aria-activedescendant (não move foco real).
// Fonte da verdade: packages/react/src/components/pickers/combobox.tsx. Ver docs/composition-angular.md.
import {
  Component, Directive, DestroyRef, ElementRef, afterNextRender, booleanAttribute, computed, inject, input, model, signal,
} from '@angular/core';
import { filterOptions, nextIndex, type FloatingAlign, type FloatingSide } from '@fewcompany/core';
import { fewId } from '../../lib/ids.js';
import { setupDismiss } from '../../lib/dismiss.js';
import { setupPosition } from '../../lib/position.js';
import { setupTopLayer } from '../../lib/top-layer.js';
import { dataAttr, dataState } from '../../lib/attrs.js';

interface ComboboxItemData { value: string; label: string; disabled?: boolean }

/** Raiz: `<div fewCombobox [(value)]="valor" [(inputValue)]="texto">`. */
@Directive({ selector: '[fewCombobox]', exportAs: 'fewCombobox', host: { class: 'few-combobox', '[attr.data-disabled]': 'dataAttr(disabled())' } })
export class FewCombobox {
  readonly value = model<string>('');
  readonly inputValue = model<string>('');
  readonly open = model(false);
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Permite confirmar (Enter) um texto que não corresponde a nenhuma opção. */
  readonly allowCustomValue = input(false, { transform: booleanAttribute });
  readonly baseId = fewId('combobox');
  protected readonly dataAttr = dataAttr;

  private readonly activeValueState = signal<string | null>(null);
  readonly activeValue = this.activeValueState.asReadonly();
  private readonly itemsState = signal<ComboboxItemData[]>([]);
  readonly items = this.itemsState.asReadonly();
  private readonly inputElementState = signal<HTMLInputElement | null>(null);
  readonly visibleValues = computed(() => new Set(filterOptions(this.items(), this.inputValue(), item => item.label).map(item => item.value)));

  get contentId(): string { return `${this.baseId}-content`; }
  get inputId(): string { return `${this.baseId}-input`; }
  setValue(value: string): void { this.value.set(value); }
  setInputValue(value: string): void { this.inputValue.set(value); }
  setOpen(open: boolean): void { this.open.set(open); }
  setActiveValue(value: string | null): void { this.activeValueState.set(value); }
  registerItem(item: ComboboxItemData): void { this.itemsState.update(prev => [...prev.filter(i => i.value !== item.value), item]); }
  unregisterItem(value: string): void { this.itemsState.update(prev => prev.filter(i => i.value !== value)); }
  setInputElement(element: HTMLInputElement): void { this.inputElementState.set(element); }
  inputElement(): HTMLInputElement | null { return this.inputElementState(); }
  focusInput(): void { this.inputElementState()?.focus(); }
}

@Directive({
  selector: 'input[fewComboboxInput]',
  host: {
    class: 'few-combobox-input', type: 'text', role: 'combobox', autocomplete: 'off',
    '[id]': 'combobox.inputId', '[attr.aria-autocomplete]': "'list'", '[attr.aria-expanded]': 'combobox.open()',
    '[attr.aria-controls]': 'combobox.contentId', '[attr.aria-activedescendant]': 'activeDescendant()',
    '[attr.disabled]': 'isDisabled() ? "" : null', '[value]': 'combobox.inputValue()', '[attr.data-state]': 'dataState(combobox.open())',
    '(focus)': 'onFocus()', '(input)': 'onInput($event)', '(keydown)': 'onKeydown($event)',
  },
})
export class FewComboboxInput {
  protected readonly combobox = inject(FewCombobox);
  private readonly el = inject<ElementRef<HTMLInputElement>>(ElementRef);
  /** Sobrepõe o `disabled` do Root quando definido. */
  readonly disabled = input<boolean>();
  protected readonly dataState = dataState;
  protected readonly isDisabled = computed(() => this.disabled() ?? this.combobox.disabled());
  protected readonly activeDescendant = computed(() => {
    const active = this.combobox.activeValue();
    return active ? `${this.combobox.baseId}-item-${active}` : null;
  });
  constructor() { this.combobox.setInputElement(this.el.nativeElement); }
  protected onFocus(): void { if (!this.isDisabled()) this.combobox.setOpen(true); }
  protected onInput(event: Event): void {
    this.combobox.setInputValue((event.target as HTMLInputElement).value);
    this.combobox.setOpen(true);
    this.combobox.setActiveValue(null);
  }
  protected onKeydown(event: KeyboardEvent): void {
    if (event.defaultPrevented || this.isDisabled()) return;
    const navigable = this.combobox.items().filter(item => this.combobox.visibleValues().has(item.value) && !item.disabled);
    const currentIndex = navigable.findIndex(item => item.value === this.combobox.activeValue());
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      this.combobox.setOpen(true);
      const idx = nextIndex(event.key, currentIndex, navigable.length, { orientation: 'vertical', loop: false });
      if (idx !== null && navigable[idx]) this.combobox.setActiveValue(navigable[idx].value);
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      const active = navigable.find(item => item.value === this.combobox.activeValue());
      if (active) { this.combobox.setValue(active.value); this.combobox.setInputValue(active.label); this.combobox.setOpen(false); }
      else if (this.combobox.allowCustomValue() && this.combobox.inputValue()) { this.combobox.setValue(this.combobox.inputValue()); this.combobox.setOpen(false); }
    }
  }
}

/** Botão decorativo que alterna o painel e devolve o foco ao Input; sem conteúdo projetado, mostra "▾". */
@Component({
  selector: '[fewComboboxTrigger]',
  host: { class: 'few-combobox-trigger', type: 'button', tabindex: '-1', 'aria-hidden': 'true', '[attr.disabled]': 'combobox.disabled() ? "" : null', '(click)': 'onClick()' },
  template: `<ng-content />@if (noContent()) {<span>▾</span>}`,
})
export class FewComboboxTrigger {
  protected readonly combobox = inject(FewCombobox);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly noContent = signal(false);
  ngAfterContentInit(): void { this.noContent.set(!this.el.nativeElement.textContent?.trim()); }
  protected onClick(): void { this.combobox.setOpen(!this.combobox.open()); this.combobox.focusInput(); }
}

@Directive({
  selector: '[fewComboboxContent]',
  host: {
    class: 'few-combobox-content', role: 'listbox', popover: 'manual',
    '[id]': 'combobox.contentId', '[attr.aria-labelledby]': 'combobox.inputId',
    '[attr.data-state]': 'dataState(combobox.open())', '[attr.data-side]': 'position().side',
    '[style.position]': "'fixed'", '[style.top.px]': 'position().top', '[style.left.px]': 'position().left', '[style.width.px]': 'position().width',
  },
})
export class FewComboboxContent {
  protected readonly combobox = inject(FewCombobox);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly side = input<FloatingSide>('bottom');
  readonly align = input<FloatingAlign>('start');
  protected readonly dataState = dataState;
  protected readonly position = setupPosition(
    this.combobox.open, () => this.combobox.inputElement(), () => this.el.nativeElement,
    () => ({ side: this.side(), align: this.align(), matchWidth: true }),
  );
  constructor() {
    setupTopLayer(this.combobox.open, () => this.el.nativeElement);
    setupDismiss(this.combobox.open, () => this.combobox.setOpen(false), () => [this.combobox.inputElement(), this.el.nativeElement]);
  }
}

@Directive({ selector: '[fewComboboxGroup]', host: { class: 'few-combobox-group', role: 'group' } })
export class FewComboboxGroup {}

@Directive({ selector: '[fewComboboxLabel]', host: { class: 'few-combobox-label' } })
export class FewComboboxLabel {}

@Directive({
  selector: '[fewComboboxItem]',
  host: {
    class: 'few-combobox-item', role: 'option',
    '[id]': 'id', '[hidden]': '!visible()',
    '[attr.aria-selected]': 'selected()', '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.data-state]': 'selected() ? "checked" : "unchecked"', '[attr.data-highlighted]': 'dataAttr(highlighted())', '[attr.data-disabled]': 'dataAttr(disabled())', '[attr.data-value]': 'value()',
    '(pointermove)': 'onPointerMove()', '(click)': 'onClick()',
  },
})
export class FewComboboxItem {
  private readonly combobox = inject(FewCombobox);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly value = input.required<string>();
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly textValue = input<string>();
  protected readonly dataAttr = dataAttr;
  readonly selected = computed(() => this.combobox.value() === this.value());
  protected readonly visible = computed(() => this.combobox.visibleValues().has(this.value()));
  protected readonly highlighted = computed(() => this.combobox.activeValue() === this.value());
  protected get id(): string { return `${this.combobox.baseId}-item-${this.value()}`; }

  constructor() {
    afterNextRender(() => this.combobox.registerItem({ value: this.value(), label: this.textValue() ?? this.el.nativeElement.textContent ?? this.value(), disabled: this.disabled() }));
    inject(DestroyRef).onDestroy(() => this.combobox.unregisterItem(this.value()));
  }

  protected onPointerMove(): void { if (!this.disabled()) this.combobox.setActiveValue(this.value()); }
  protected onClick(): void {
    if (this.disabled()) return;
    this.combobox.setValue(this.value());
    this.combobox.setInputValue(this.textValue() ?? this.el.nativeElement.textContent ?? this.value());
    this.combobox.setOpen(false);
    this.combobox.focusInput();
  }
}

@Directive({ selector: '[fewComboboxItemText]', host: { class: 'few-combobox-item-text' } })
export class FewComboboxItemText {}

/** Só visível quando o Item pai está selecionado, salvo `forceMount`. Sem conteúdo projetado, mostra "✓". */
@Component({
  selector: '[fewComboboxItemIndicator]',
  host: { class: 'few-combobox-item-indicator', 'aria-hidden': 'true', '[hidden]': '!item.selected() && !forceMount()' },
  template: `<ng-content />@if (noContent()) {<span>✓</span>}`,
})
export class FewComboboxItemIndicator {
  protected readonly item = inject(FewComboboxItem);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly forceMount = input(false, { transform: booleanAttribute });
  protected readonly noContent = signal(false);
  ngAfterContentInit(): void { this.noContent.set(!this.el.nativeElement.textContent?.trim()); }
}

/** Mensagem de nenhum resultado; fica oculta enquanto houver itens registrados e algum visível. */
@Directive({ selector: '[fewComboboxEmpty]', host: { class: 'few-combobox-empty', role: 'status', '[hidden]': 'hasVisibleItems()' } })
export class FewComboboxEmpty {
  private readonly combobox = inject(FewCombobox);
  protected readonly hasVisibleItems = computed(() => this.combobox.items().length > 0 && this.combobox.visibleValues().size > 0);
}

/** Importe tudo de uma vez: `imports: [FEW_COMBOBOX]`. */
export const FEW_COMBOBOX = [
  FewCombobox, FewComboboxInput, FewComboboxTrigger, FewComboboxContent,
  FewComboboxGroup, FewComboboxLabel, FewComboboxItem, FewComboboxItemText, FewComboboxItemIndicator, FewComboboxEmpty,
] as const;
