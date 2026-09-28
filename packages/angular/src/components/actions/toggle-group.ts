// Conjunto de opções alternáveis. Fonte da verdade: packages/react/src/components/actions/toggle-group.tsx.
import { Directive, ElementRef, booleanAttribute, computed, effect, inject, input, model, signal } from '@angular/core';
import type { Orientation, Size, ToggleGroupType, ToggleGroupValue } from '@fewcompany/core';
import { isToggleGroupItemSelected, toggleGroupValue } from '@fewcompany/core';
import { dataAttr } from '../../lib/attrs.js';
import { focusableItems, moveFocus } from '../../lib/roving.js';
import type { ToggleVariant } from './toggle.js';

/**
 * Raiz: `<div fewToggleGroup type="single" [(value)]="align">…</div>`.
 * single = radiogroup/radio (`FewToggleGroupItem` alterna sozinho); multiple = group com aria-pressed independentes.
 * Roving focus por setas (Home/End); o item ativo é o selecionado ou, sem seleção, o primeiro.
 */
@Directive({
  selector: '[fewToggleGroup]',
  exportAs: 'fewToggleGroup',
  host: {
    class: 'few-toggle-group',
    '[attr.role]': 'type() === "single" ? "radiogroup" : "group"',
    '[attr.aria-orientation]': 'orientation()',
    '[attr.data-orientation]': 'orientation()',
    '[attr.data-disabled]': 'dataAttr(disabled())',
    '(keydown)': 'onKeydown($event)',
  },
})
export class FewToggleGroup {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly activeValue = signal<string | null>(null);

  readonly type = input<ToggleGroupType>('single');
  readonly value = model<ToggleGroupValue>('');
  readonly orientation = input<Orientation>('horizontal');
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Setas movem e focam o item (roving tabindex). Padrão true. */
  readonly rovingFocus = input(true, { transform: booleanAttribute });
  readonly loop = input(true, { transform: booleanAttribute });
  readonly size = input<Size>();
  readonly variant = input<ToggleVariant>();

  protected readonly dataAttr = dataAttr;

  constructor() {
    // Item selecionado é o padrão de foco; sem seleção, cai no primeiro item (roving focus).
    effect(() => {
      if (typeof document === 'undefined' || this.activeValue() !== null) return;
      const items = focusableItems(this.host.nativeElement, '[data-few-toggle-item]');
      const preferred = items.find(item => item.dataset['state'] === 'on') ?? items[0];
      const preferredValue = preferred?.dataset['value'];
      if (preferredValue !== undefined) this.activeValue.set(preferredValue);
    });
  }

  isSelected(itemValue: string): boolean { return isToggleGroupItemSelected(this.type(), this.value(), itemValue); }
  toggle(itemValue: string) { this.value.set(toggleGroupValue(this.type(), this.value(), itemValue)); }
  isTabbable(itemValue: string): boolean { return this.rovingFocus() ? this.activeValue() === itemValue : true; }
  setActive(itemValue: string) { this.activeValue.set(itemValue); }

  protected onKeydown(event: KeyboardEvent) {
    if (event.defaultPrevented || !this.rovingFocus()) return;
    const target = moveFocus(this.host.nativeElement, '[data-few-toggle-item]', event.key, { orientation: this.orientation(), loop: this.loop() });
    if (target) event.preventDefault();
  }
}

/** Item: `<button fewToggleGroupItem value="left">Esquerda</button>`. */
@Directive({
  selector: '[fewToggleGroupItem]',
  host: {
    class: 'few-toggle-group-item',
    'data-few-toggle-item': '',
    type: 'button',
    '[class]': 'variantClasses()',
    '[attr.role]': 'role',
    '[attr.aria-checked]': 'ariaChecked',
    '[attr.aria-pressed]': 'ariaPressed',
    '[attr.tabindex]': 'tabbable() ? 0 : -1',
    '[attr.disabled]': 'isDisabled() ? "" : null',
    '[attr.data-state]': 'selected() ? "on" : "off"',
    '[attr.data-disabled]': 'dataAttr(isDisabled())',
    '[attr.data-value]': 'value()',
    '(click)': 'handleClick()',
    '(focus)': 'handleFocus()',
  },
})
export class FewToggleGroupItem {
  private readonly group = inject(FewToggleGroup);

  readonly value = input.required<string>();
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly selected = computed(() => this.group.isSelected(this.value()));
  protected readonly isDisabled = computed(() => this.group.disabled() || this.disabled());
  protected readonly tabbable = computed(() => this.group.isTabbable(this.value()));
  protected readonly variantClasses = computed(() => {
    const variant = this.group.variant();
    const size = this.group.size();
    return [variant && `few-toggle-group-item--${variant}`, size && `few-toggle-group-item--${size}`].filter(Boolean).join(' ');
  });
  protected readonly dataAttr = dataAttr;

  protected get role(): string | null { return this.group.type() === 'single' ? 'radio' : null; }
  protected get ariaChecked(): boolean | null { return this.group.type() === 'single' ? this.selected() : null; }
  protected get ariaPressed(): boolean | null { return this.group.type() === 'multiple' ? this.selected() : null; }

  protected handleClick() {
    if (this.isDisabled()) return;
    this.group.toggle(this.value());
    this.group.setActive(this.value());
  }
  protected handleFocus() {
    if (this.group.rovingFocus()) this.group.setActive(this.value());
  }
}

/** Importe tudo de uma vez: `imports: [FEW_TOGGLE_GROUP]`. */
export const FEW_TOGGLE_GROUP = [FewToggleGroup, FewToggleGroupItem] as const;
