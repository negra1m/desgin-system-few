// MultiSelect: Trigger abre um painel com Search (filtra via filterOptions) + Itens em checkbox visual
// (aria-selected, seleção não fecha o painel). Foco fica no Search; navegação por activedescendant,
// igual ao Combobox. Backspace no Search vazio remove o último valor.
// Fonte da verdade: packages/react/src/components/pickers/multi-select.tsx. Ver docs/composition-angular.md.
import {
  Component, Directive, DestroyRef, ElementRef, afterNextRender, booleanAttribute, computed, effect, inject, input, model, signal,
} from '@angular/core';
import { filterOptions, nextIndex, type FloatingAlign, type FloatingSide } from '@fewcompany/core';
import { fewId } from '../../lib/ids.js';
import { setupDismiss } from '../../lib/dismiss.js';
import { setupPosition } from '../../lib/position.js';
import { setupTopLayer } from '../../lib/top-layer.js';
import { dataAttr, dataState } from '../../lib/attrs.js';

interface MultiSelectItemData { value: string; label: string; disabled?: boolean }

/** Raiz: `<div fewMultiSelect [(value)]="valores">`. */
@Directive({ selector: '[fewMultiSelect]', exportAs: 'fewMultiSelect', host: { class: 'few-multi-select', '[attr.data-disabled]': 'dataAttr(disabled())' } })
export class FewMultiSelect {
  readonly value = model<string[]>([]);
  readonly open = model(false);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly baseId = fewId('multi-select');
  protected readonly dataAttr = dataAttr;

  private readonly searchState = signal('');
  readonly search = this.searchState.asReadonly();
  private readonly activeValueState = signal<string | null>(null);
  readonly activeValue = this.activeValueState.asReadonly();
  private readonly itemsState = signal<MultiSelectItemData[]>([]);
  readonly items = this.itemsState.asReadonly();
  private readonly triggerElementState = signal<HTMLElement | null>(null);
  private readonly searchElementState = signal<HTMLInputElement | null>(null);
  readonly visibleValues = computed(() => new Set(filterOptions(this.items(), this.searchState(), item => item.label).map(item => item.value)));

  get contentId(): string { return `${this.baseId}-content`; }
  setOpen(open: boolean): void { this.open.set(open); }
  setValue(value: string[]): void { this.value.set(value); }
  toggleValue(value: string): void { this.value.update(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]); }
  setSearch(search: string): void { this.searchState.set(search); }
  setActiveValue(value: string | null): void { this.activeValueState.set(value); }
  registerItem(item: MultiSelectItemData): void { this.itemsState.update(prev => [...prev.filter(i => i.value !== item.value), item]); }
  unregisterItem(value: string): void { this.itemsState.update(prev => prev.filter(i => i.value !== value)); }
  setTriggerElement(element: HTMLElement): void { this.triggerElementState.set(element); }
  triggerElement(): HTMLElement | null { return this.triggerElementState(); }
  focusTrigger(): void { this.triggerElementState()?.focus(); }
  setSearchElement(element: HTMLInputElement): void { this.searchElementState.set(element); }
  focusSearch(): void { this.searchElementState()?.focus(); }
}

@Directive({
  selector: '[fewMultiSelectTrigger]',
  host: {
    class: 'few-multi-select-trigger', type: 'button',
    '[attr.aria-haspopup]': "'listbox'", '[attr.aria-expanded]': 'multiSelect.open()', '[attr.aria-controls]': 'multiSelect.contentId',
    '[attr.disabled]': 'isDisabled() ? "" : null', '[attr.data-state]': 'dataState(multiSelect.open())', '[attr.data-disabled]': 'dataAttr(isDisabled())',
    '(click)': 'onClick()',
  },
})
export class FewMultiSelectTrigger {
  protected readonly multiSelect = inject(FewMultiSelect);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  /** Sobrepõe o `disabled` do Root quando definido. */
  readonly disabled = input<boolean>();
  protected readonly dataState = dataState;
  protected readonly dataAttr = dataAttr;
  protected readonly isDisabled = computed(() => this.disabled() ?? this.multiSelect.disabled());
  constructor() { this.multiSelect.setTriggerElement(this.el.nativeElement); }
  protected onClick(): void { if (!this.isDisabled()) this.multiSelect.setOpen(!this.multiSelect.open()); }
}

/** Mostra os valores selecionados como chips removíveis (até `maxDisplay`, com "+N" de sobra) ou o `placeholder`. */
@Component({
  selector: '[fewMultiSelectValue]',
  host: { class: 'few-multi-select-value', '[attr.data-placeholder]': 'dataAttr(selected().length === 0)' },
  template: `
    @if (selected().length === 0) {
      <ng-content />
      @if (noContent()) { <span>{{ placeholder() }}</span> }
    } @else {
      @for (item of visible(); track item.value) {
        <span class="few-multi-select-chip">
          {{ item.label }}
          <button type="button" class="few-multi-select-chip-remove" [attr.aria-label]="'Remover ' + item.label" (click)="remove($event, item.value)">×</button>
        </span>
      }
      @if (overflow() > 0) { <span class="few-multi-select-chip few-multi-select-chip--overflow">+{{ overflow() }}</span> }
    }
  `,
})
export class FewMultiSelectValue {
  private readonly multiSelect = inject(FewMultiSelect);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly placeholder = input<string>('');
  readonly maxDisplay = input<number>(Infinity);
  protected readonly dataAttr = dataAttr;
  protected readonly noContent = signal(false);
  protected readonly selected = computed(() => this.multiSelect.value()
    .map(v => this.multiSelect.items().find(item => item.value === v))
    .filter((item): item is MultiSelectItemData => Boolean(item)));
  protected readonly visible = computed(() => this.selected().slice(0, this.maxDisplay()));
  protected readonly overflow = computed(() => this.selected().length - this.visible().length);
  ngAfterContentInit(): void { this.noContent.set(!this.el.nativeElement.textContent?.trim()); }
  protected remove(event: Event, value: string): void { event.stopPropagation(); this.multiSelect.toggleValue(value); }
}

@Directive({
  selector: '[fewMultiSelectContent]',
  host: {
    class: 'few-multi-select-content', role: 'listbox', popover: 'manual', 'aria-multiselectable': 'true',
    '[id]': 'multiSelect.contentId', '[attr.data-state]': 'dataState(multiSelect.open())', '[attr.data-side]': 'position().side',
    '[style.position]': "'fixed'", '[style.top.px]': 'position().top', '[style.left.px]': 'position().left', '[style.width.px]': 'position().width',
  },
})
export class FewMultiSelectContent {
  protected readonly multiSelect = inject(FewMultiSelect);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly side = input<FloatingSide>('bottom');
  readonly align = input<FloatingAlign>('start');
  protected readonly dataState = dataState;
  protected readonly position = setupPosition(
    this.multiSelect.open, () => this.multiSelect.triggerElement(), () => this.el.nativeElement,
    () => ({ side: this.side(), align: this.align(), matchWidth: true }),
  );
  constructor() {
    setupTopLayer(this.multiSelect.open, () => this.el.nativeElement);
    setupDismiss(this.multiSelect.open, () => { this.multiSelect.setOpen(false); this.multiSelect.focusTrigger(); }, () => [this.multiSelect.triggerElement(), this.el.nativeElement]);
    effect(() => { if (this.multiSelect.open()) this.multiSelect.focusSearch(); });
  }
}

@Directive({
  selector: 'input[fewMultiSelectSearch]',
  host: {
    class: 'few-multi-select-search', type: 'text', role: 'searchbox', autocomplete: 'off',
    '[attr.aria-label]': 'ariaLabel()', '[attr.aria-activedescendant]': 'activeDescendant()', '[value]': 'multiSelect.search()',
    '(input)': 'onInput($event)', '(keydown)': 'onKeydown($event)',
  },
})
export class FewMultiSelectSearch {
  protected readonly multiSelect = inject(FewMultiSelect);
  private readonly el = inject<ElementRef<HTMLInputElement>>(ElementRef);
  readonly ariaLabel = input('Buscar opções', { alias: 'aria-label' });
  protected readonly activeDescendant = computed(() => {
    const active = this.multiSelect.activeValue();
    return active ? `${this.multiSelect.baseId}-item-${active}` : null;
  });
  constructor() { this.multiSelect.setSearchElement(this.el.nativeElement); }
  protected onInput(event: Event): void { this.multiSelect.setSearch((event.target as HTMLInputElement).value); this.multiSelect.setActiveValue(null); }
  protected onKeydown(event: KeyboardEvent): void {
    if (event.defaultPrevented) return;
    const navigable = this.multiSelect.items().filter(item => this.multiSelect.visibleValues().has(item.value) && !item.disabled);
    const currentIndex = navigable.findIndex(item => item.value === this.multiSelect.activeValue());
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const idx = nextIndex(event.key, currentIndex, navigable.length, { orientation: 'vertical', loop: false });
      if (idx !== null && navigable[idx]) this.multiSelect.setActiveValue(navigable[idx].value);
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      const active = this.multiSelect.activeValue();
      if (active) { event.preventDefault(); this.multiSelect.toggleValue(active); }
      return;
    }
    if (event.key === 'Backspace' && this.multiSelect.search() === '' && this.multiSelect.value().length > 0) {
      this.multiSelect.setValue(this.multiSelect.value().slice(0, -1));
    }
  }
}

@Directive({
  selector: '[fewMultiSelectItem]',
  host: {
    class: 'few-multi-select-item', role: 'option',
    '[id]': 'id', '[hidden]': '!visible()',
    '[attr.aria-selected]': 'checked()', '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.data-state]': 'checked() ? "checked" : "unchecked"', '[attr.data-highlighted]': 'dataAttr(highlighted())', '[attr.data-disabled]': 'dataAttr(disabled())', '[attr.data-value]': 'value()',
    '(pointermove)': 'onPointerMove()', '(click)': 'onClick()',
  },
})
export class FewMultiSelectItem {
  private readonly multiSelect = inject(FewMultiSelect);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly value = input.required<string>();
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly textValue = input<string>();
  protected readonly dataAttr = dataAttr;
  readonly checked = computed(() => this.multiSelect.value().includes(this.value()));
  protected readonly visible = computed(() => this.multiSelect.visibleValues().has(this.value()));
  protected readonly highlighted = computed(() => this.multiSelect.activeValue() === this.value());
  protected get id(): string { return `${this.multiSelect.baseId}-item-${this.value()}`; }

  constructor() {
    afterNextRender(() => this.multiSelect.registerItem({ value: this.value(), label: this.textValue() ?? this.el.nativeElement.textContent ?? this.value(), disabled: this.disabled() }));
    inject(DestroyRef).onDestroy(() => this.multiSelect.unregisterItem(this.value()));
  }

  protected onPointerMove(): void { if (!this.disabled()) this.multiSelect.setActiveValue(this.value()); }
  protected onClick(): void { if (!this.disabled()) this.multiSelect.toggleValue(this.value()); }
}

/** Só visível quando o Item pai está marcado, salvo `forceMount`. Sem conteúdo projetado, mostra "✓". */
@Component({
  selector: '[fewMultiSelectItemIndicator]',
  host: { class: 'few-multi-select-item-indicator', 'aria-hidden': 'true', '[hidden]': '!item.checked() && !forceMount()' },
  template: `<ng-content />@if (noContent()) {<span>✓</span>}`,
})
export class FewMultiSelectItemIndicator {
  protected readonly item = inject(FewMultiSelectItem);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly forceMount = input(false, { transform: booleanAttribute });
  protected readonly noContent = signal(false);
  ngAfterContentInit(): void { this.noContent.set(!this.el.nativeElement.textContent?.trim()); }
}

/** Mensagem de nenhum resultado; fica oculta enquanto houver itens registrados e algum visível. */
@Directive({ selector: '[fewMultiSelectEmpty]', host: { class: 'few-multi-select-empty', role: 'status', '[hidden]': 'hasVisibleItems()' } })
export class FewMultiSelectEmpty {
  private readonly multiSelect = inject(FewMultiSelect);
  protected readonly hasVisibleItems = computed(() => this.multiSelect.items().length > 0 && this.multiSelect.visibleValues().size > 0);
}

/** Alterna todos os itens visíveis de uma vez; sem conteúdo projetado, mostra "Selecionar todos" / "Limpar seleção". */
@Component({
  selector: '[fewMultiSelectSelectAll]',
  host: {
    class: 'few-multi-select-item few-multi-select-select-all', role: 'option',
    '[attr.aria-selected]': 'allSelected()', '[attr.data-state]': 'allSelected() ? "checked" : "unchecked"',
    '(click)': 'onClick()',
  },
  template: `<ng-content />@if (noContent()) {<span>{{ allSelected() ? 'Limpar seleção' : 'Selecionar todos' }}</span>}`,
})
export class FewMultiSelectSelectAll {
  private readonly multiSelect = inject(FewMultiSelect);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly noContent = signal(false);
  private readonly visibleItems = computed(() => this.multiSelect.items().filter(item => this.multiSelect.visibleValues().has(item.value) && !item.disabled));
  protected readonly allSelected = computed(() => {
    const items = this.visibleItems();
    return items.length > 0 && items.every(item => this.multiSelect.value().includes(item.value));
  });
  ngAfterContentInit(): void { this.noContent.set(!this.el.nativeElement.textContent?.trim()); }
  protected onClick(): void {
    const visibleValuesArr = this.visibleItems().map(item => item.value);
    const allSelected = this.allSelected();
    const current = this.multiSelect.value();
    this.multiSelect.setValue(allSelected ? current.filter(v => !visibleValuesArr.includes(v)) : Array.from(new Set([...current, ...visibleValuesArr])));
  }
}

/** Importe tudo de uma vez: `imports: [FEW_MULTI_SELECT]`. */
export const FEW_MULTI_SELECT = [
  FewMultiSelect, FewMultiSelectTrigger, FewMultiSelectValue, FewMultiSelectContent, FewMultiSelectSearch,
  FewMultiSelectItem, FewMultiSelectItemIndicator, FewMultiSelectEmpty, FewMultiSelectSelectAll,
] as const;
