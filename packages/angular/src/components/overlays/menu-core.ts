// Núcleo interno compartilhado por DropdownMenu, ContextMenu e Menubar (não é exportado no barrel da categoria
// overlays/index.ts — só dropdown-menu.ts reexporta estas peças, que assim ficam acessíveis via FEW_DROPDOWN_MENU).
// Espelha packages/react/src/components/overlays/menu-core.tsx: Content/Item/CheckboxItem/RadioGroup/RadioItem/
// ItemIndicator/Label/Group/Separator/Shortcut. Cada menu "público" (dropdown-menu.ts/context-menu.ts/menubar.ts)
// só implementa seu próprio Root/Trigger/Content (âncora e estado de abertura diferem); Content reaproveita
// `setupMenuContent` (posição, top layer, dismiss, roving focus, typeahead, Tab fecha, foco no 1º item) e injeta
// `FewMenuContent` (fornecido pelo próprio Content concreto) para fechar o menu ao selecionar um item.
import { Directive, DestroyRef, booleanAttribute, computed, effect, forwardRef, inject, input, model, output, signal, type Signal } from '@angular/core';
import { typeaheadIndex, type FloatingAlign, type FloatingSide } from '@fewcompany/core';
import { fewId } from '../../lib/ids.js';
import { moveFocus, focusableItems } from '../../lib/roving.js';
import { setupDismiss } from '../../lib/dismiss.js';
import { setupPosition, type PositionOptions, type PositionState } from '../../lib/position.js';
import { setupTopLayer } from '../../lib/top-layer.js';
import { dataAttr } from '../../lib/attrs.js';

const ITEM_SELECTOR = '[role^="menuitem"]';

/** Fornecido pelo Content concreto (Dropdown/Context/Menubar); os itens injetam para fechar o menu ao selecionar. */
export abstract class FewMenuContent {
  abstract close(): void;
}

export interface MenuContentOptions extends PositionOptions {
  loop?: boolean;
}

/**
 * Lógica de conteúdo de menu: popover manual (aplicado via host do Content concreto), posição, top layer, dismiss,
 * roving focus (setas/Home/End), typeahead e Tab fecha. Chame no construtor do Content concreto (contexto de injeção).
 */
export function setupMenuContent(config: {
  open: Signal<boolean>;
  anchor: () => Element | null | undefined;
  element: () => HTMLElement | null;
  onDismiss: () => void;
  options?: () => MenuContentOptions;
}): { position: Signal<PositionState>; onKeyDown: (event: KeyboardEvent) => void } {
  const { open, anchor, element, onDismiss, options = (): MenuContentOptions => ({}) } = config;
  const position = setupPosition(open, anchor, element, options);
  setupTopLayer(open, element);
  setupDismiss(open, onDismiss, () => [element(), anchor()]);
  let typed = '';
  let typedTimer: ReturnType<typeof setTimeout> | undefined;
  inject(DestroyRef).onDestroy(() => clearTimeout(typedTimer));
  effect(() => {
    if (!open() || typeof document === 'undefined') return;
    queueMicrotask(() => { focusableItems(element(), ITEM_SELECTOR)[0]?.focus(); });
  });
  function onKeyDown(event: KeyboardEvent): void {
    if (event.defaultPrevented) return;
    if (event.key === 'Tab') { onDismiss(); return; }
    const moved = moveFocus(element(), ITEM_SELECTOR, event.key, { orientation: 'vertical', loop: options().loop ?? true });
    if (moved) { event.preventDefault(); return; }
    if (event.key.length === 1 && event.key !== ' ') {
      clearTimeout(typedTimer);
      typed += event.key;
      typedTimer = setTimeout(() => { typed = ''; }, 500);
      const items = focusableItems(element(), ITEM_SELECTOR);
      const labels = items.map(item => item.textContent?.trim() ?? '');
      const current = items.indexOf(document.activeElement as HTMLElement);
      const index = typeaheadIndex(labels, typed, current < 0 ? 0 : current);
      if (index !== null) { items[index]?.focus(); event.preventDefault(); }
    }
  }
  return { position, onKeyDown };
}

export interface FewMenuSelectEvent { readonly defaultPrevented: boolean; preventDefault(): void }

/** `<div fewMenuItem>`: role=menuitem, fecha o menu ao selecionar (Enter/Espaço/clique) salvo `preventDefault()`. */
@Directive({
  selector: '[fewMenuItem]',
  host: {
    class: 'few-menu-item', role: 'menuitem', '[attr.tabindex]': '-1',
    '[attr.aria-disabled]': 'disabled() || null', '[attr.data-disabled]': 'dataAttr(disabled())',
    '(mouseenter)': 'onMouseEnter($event)', '(click)': 'activate()', '(keydown)': 'onKeydown($event)',
  },
})
export class FewMenuItem {
  private readonly menu = inject(FewMenuContent);
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Chame `event.preventDefault()` para manter o menu aberto após selecionar. */
  readonly select = output<FewMenuSelectEvent>();
  protected readonly dataAttr = dataAttr;
  protected onMouseEnter(event: MouseEvent): void { if (!this.disabled()) (event.currentTarget as HTMLElement).focus(); }
  protected activate(): void {
    if (this.disabled()) return;
    let prevented = false;
    const event: FewMenuSelectEvent = { get defaultPrevented() { return prevented; }, preventDefault() { prevented = true; } };
    this.select.emit(event);
    if (!prevented) this.menu.close();
  }
  protected onKeydown(event: KeyboardEvent): void {
    if (event.defaultPrevented || this.disabled()) return;
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); this.activate(); }
  }
}

/** Contrato lido pelo `fewMenuItemIndicator` mais próximo (fornecido por CheckboxItem ou RadioItem). */
export abstract class FewMenuCheckedItem {
  abstract readonly checked: Signal<boolean>;
}

@Directive({
  selector: '[fewMenuCheckboxItem]',
  providers: [{ provide: FewMenuCheckedItem, useExisting: forwardRef(() => FewMenuCheckboxItem) }],
  host: {
    class: 'few-menu-item', role: 'menuitemcheckbox', '[attr.tabindex]': '-1',
    '[attr.aria-checked]': 'checked()', '[attr.aria-disabled]': 'disabled() || null', '[attr.data-disabled]': 'dataAttr(disabled())',
    '[attr.data-state]': 'checked() ? "checked" : "unchecked"',
    '(mouseenter)': 'onMouseEnter($event)', '(click)': 'toggle()', '(keydown)': 'onKeydown($event)',
  },
})
export class FewMenuCheckboxItem implements FewMenuCheckedItem {
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly checked = model(false);
  protected readonly dataAttr = dataAttr;
  protected onMouseEnter(event: MouseEvent): void { if (!this.disabled()) (event.currentTarget as HTMLElement).focus(); }
  protected toggle(): void { if (!this.disabled()) this.checked.set(!this.checked()); }
  protected onKeydown(event: KeyboardEvent): void {
    if (event.defaultPrevented || this.disabled()) return;
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); this.toggle(); }
  }
}

/** Raiz do grupo de rádio dentro de um menu: `<div fewMenuRadioGroup [(value)]="tema">`. */
@Directive({ selector: '[fewMenuRadioGroup]', exportAs: 'fewMenuRadioGroup', host: { class: 'few-menu-group', role: 'group' } })
export class FewMenuRadioGroup {
  readonly value = model('');
  select(value: string): void { this.value.set(value); }
}

@Directive({
  selector: '[fewMenuRadioItem]',
  providers: [{ provide: FewMenuCheckedItem, useExisting: forwardRef(() => FewMenuRadioItem) }],
  host: {
    class: 'few-menu-item', role: 'menuitemradio', '[attr.tabindex]': '-1',
    '[attr.aria-checked]': 'checked()', '[attr.aria-disabled]': 'disabled() || null', '[attr.data-disabled]': 'dataAttr(disabled())',
    '[attr.data-state]': 'checked() ? "checked" : "unchecked"',
    '(mouseenter)': 'onMouseEnter($event)', '(click)': 'select()', '(keydown)': 'onKeydown($event)',
  },
})
export class FewMenuRadioItem implements FewMenuCheckedItem {
  private readonly group = inject(FewMenuRadioGroup);
  readonly value = input.required<string>();
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly checked = computed(() => this.group.value() === this.value());
  protected readonly dataAttr = dataAttr;
  protected onMouseEnter(event: MouseEvent): void { if (!this.disabled()) (event.currentTarget as HTMLElement).focus(); }
  protected select(): void { if (!this.disabled()) this.group.select(this.value()); }
  protected onKeydown(event: KeyboardEvent): void {
    if (event.defaultPrevented || this.disabled()) return;
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); this.select(); }
  }
}

/** Só fica visível (`hidden` removido) quando o CheckboxItem/RadioItem pai está marcado, salvo `forceMount`. */
@Directive({
  selector: '[fewMenuItemIndicator]',
  host: { class: 'few-menu-item-indicator', 'aria-hidden': 'true', '[hidden]': '!checked() && !forceMount()', '[attr.data-state]': 'checked() ? "checked" : "unchecked"' },
})
export class FewMenuItemIndicator {
  private readonly item = inject(FewMenuCheckedItem);
  readonly forceMount = input(false, { transform: booleanAttribute });
  protected readonly checked = this.item.checked;
}

@Directive({ selector: '[fewMenuGroup]', exportAs: 'fewMenuGroup', host: { class: 'few-menu-group', role: 'group', '[attr.aria-labelledby]': 'labelId()' } })
export class FewMenuGroup {
  private readonly labelIdState = signal<string | undefined>(undefined);
  readonly labelId = this.labelIdState.asReadonly();
  setLabelId(id: string): void { this.labelIdState.set(id); }
}

@Directive({ selector: '[fewMenuLabel]', host: { class: 'few-menu-label', '[id]': 'id' } })
export class FewMenuLabel {
  private readonly group = inject(FewMenuGroup, { optional: true });
  readonly id = fewId('menu-label');
  constructor() { this.group?.setLabelId(this.id); }
}

@Directive({ selector: '[fewMenuSeparator]', host: { class: 'few-menu-separator', role: 'separator', 'aria-orientation': 'horizontal' } })
export class FewMenuSeparator {}

@Directive({ selector: '[fewMenuShortcut]', host: { class: 'few-menu-shortcut' } })
export class FewMenuShortcut {}

/** Importe tudo de uma vez: `imports: [FEW_MENU_PARTS]` (junto com o Root/Trigger/Content do menu específico). */
export const FEW_MENU_PARTS = [
  FewMenuItem, FewMenuCheckboxItem, FewMenuRadioGroup, FewMenuRadioItem, FewMenuItemIndicator, FewMenuGroup, FewMenuLabel, FewMenuSeparator, FewMenuShortcut,
] as const;

export type { FloatingAlign, FloatingSide };
