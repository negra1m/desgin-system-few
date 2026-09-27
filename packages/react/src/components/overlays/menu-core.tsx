"use client";
// Núcleo interno compartilhado por DropdownMenu, ContextMenu e Menubar (não é exportado no barrel da categoria).
// Content/Item/CheckboxItem/RadioGroup/RadioItem/ItemIndicator/Label/Group/Separator/Shortcut.
// Cada componente "público" (dropdown-menu.tsx, context-menu.tsx, menubar.tsx) tem seu próprio contexto de
// abertura/âncora e só reaproveita estas peças de renderização + teclado.
import { useEffect, useId, useRef, useState, type ComponentProps, type KeyboardEvent, type ReactNode, type RefObject } from 'react';
import { typeaheadIndex } from '@fewcompany/core';
import { Slot } from '../../lib/slot.js';
import { createContext } from '../../lib/context.js';
import { useControllableState } from '../../lib/use-controllable-state.js';
import { cx, dataAttr } from '../../lib/cx.js';
import { useDismiss } from '../../lib/use-dismiss.js';
import { usePosition, type Align, type Side } from '../../lib/use-position.js';
import { useTopLayer } from '../../lib/use-top-layer.js';
import { moveFocus, focusableItems } from '../../lib/roving.js';

const ITEM_SELECTOR = '[role^="menuitem"]';

interface MenuContentContextValue { close: () => void }
const [MenuContentProvider, useMenuContent] = createContext<MenuContentContextValue>('Menu.Content (interno)');

export interface MenuContentCoreProps extends ComponentProps<'div'> {
  asChild?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  anchorRef: RefObject<Element | null>;
  dismissRefs?: Array<RefObject<Element | null>>;
  side?: Side; align?: Align; offset?: number; loop?: boolean;
}
/** Conteúdo flutuante de menu (role=menu): popover manual, posicionamento, dismiss, roving focus (setas/Home/End), typeahead, Tab fecha. */
export function MenuContentCore({ asChild, open, onOpenChange, anchorRef, dismissRefs, side = 'bottom', align = 'start', offset = 4, loop = true, className, children, onKeyDown, style, ...props }: MenuContentCoreProps) {
  const ref = useRef<HTMLDivElement>(null);
  const typedRef = useRef('');
  const typedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const position = usePosition(anchorRef, ref, { side, align, offset, open });
  useTopLayer(ref, open);
  useDismiss(open, () => onOpenChange(false), [ref, anchorRef, ...(dismissRefs ?? [])]);
  useEffect(() => {
    if (!open) return;
    const first = focusableItems(ref.current, ITEM_SELECTOR)[0];
    first?.focus();
  }, [open]);
  useEffect(() => () => window.clearTimeout(typedTimer.current), []);
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === 'Tab') { onOpenChange(false); return; }
    const moved = moveFocus(ref.current, ITEM_SELECTOR, event.key, { orientation: 'vertical', loop });
    if (moved) { event.preventDefault(); return; }
    if (event.key.length === 1 && event.key !== ' ') {
      window.clearTimeout(typedTimer.current);
      typedRef.current += event.key;
      typedTimer.current = setTimeout(() => { typedRef.current = ''; }, 500);
      const items = focusableItems(ref.current, ITEM_SELECTOR);
      const labels = items.map(item => item.textContent?.trim() ?? '');
      const current = items.indexOf(document.activeElement as HTMLElement);
      const index = typeaheadIndex(labels, typedRef.current, current < 0 ? 0 : current);
      if (index !== null) { items[index]?.focus(); event.preventDefault(); }
    }
  }
  const Comp = asChild ? Slot : 'div';
  return (
    <MenuContentProvider value={{ close: () => onOpenChange(false) }}>
      <Comp {...props} ref={ref} popover="manual" role="menu" data-state={open ? 'open' : 'closed'} data-side={position.side}
        className={cx('few-menu', className)} style={{ ...position.style, ...style }} onKeyDown={handleKeyDown}>
        {children}
      </Comp>
    </MenuContentProvider>
  );
}

export interface MenuItemCoreProps extends ComponentProps<'div'> {
  asChild?: boolean; disabled?: boolean;
  /** Chame `event.preventDefault()` para manter o menu aberto após selecionar. */
  onSelect?: (event: { preventDefault: () => void; defaultPrevented: boolean }) => void;
}
export function MenuItemCore({ asChild, disabled, onSelect, className, onClick, onKeyDown, onMouseEnter, ...props }: MenuItemCoreProps) {
  const { close } = useMenuContent('Menu.Item');
  const Comp = asChild ? Slot : 'div';
  function select() {
    if (disabled) return;
    let prevented = false;
    onSelect?.({ preventDefault: () => { prevented = true; }, get defaultPrevented() { return prevented; } });
    if (!prevented) close();
  }
  return <Comp {...props} role="menuitem" tabIndex={-1} aria-disabled={disabled || undefined} data-disabled={dataAttr(disabled)} className={cx('few-menu-item', className)}
    onMouseEnter={(event) => { onMouseEnter?.(event); if (!disabled) (event.currentTarget as HTMLElement).focus(); }}
    onClick={(event) => { onClick?.(event); if (!event.defaultPrevented) select(); }}
    onKeyDown={(event) => { onKeyDown?.(event); if (!event.defaultPrevented && !disabled && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); select(); } }} />;
}

interface MenuItemCheckedContextValue { checked: boolean }
const [MenuItemCheckedProvider, useMenuItemChecked] = createContext<MenuItemCheckedContextValue>('Menu.CheckboxItem/RadioItem');

export interface MenuCheckboxItemCoreProps extends ComponentProps<'div'> {
  asChild?: boolean; disabled?: boolean; checked?: boolean; defaultChecked?: boolean; onCheckedChange?: (checked: boolean) => void;
}
export function MenuCheckboxItemCore({ asChild, disabled, checked: checkedProp, defaultChecked = false, onCheckedChange, className, onClick, onKeyDown, onMouseEnter, children, ...props }: MenuCheckboxItemCoreProps) {
  const [checked, setChecked] = useControllableState({ value: checkedProp, defaultValue: defaultChecked, onChange: onCheckedChange });
  const Comp = asChild ? Slot : 'div';
  function toggle() { if (!disabled) setChecked(!checked); }
  return (
    <MenuItemCheckedProvider value={{ checked }}>
      <Comp {...props} role="menuitemcheckbox" aria-checked={checked} tabIndex={-1} aria-disabled={disabled || undefined} data-disabled={dataAttr(disabled)}
        data-state={checked ? 'checked' : 'unchecked'} className={cx('few-menu-item', className)}
        onMouseEnter={(event) => { onMouseEnter?.(event); if (!disabled) (event.currentTarget as HTMLElement).focus(); }}
        onClick={(event) => { onClick?.(event); if (!event.defaultPrevented) toggle(); }}
        onKeyDown={(event) => { onKeyDown?.(event); if (!event.defaultPrevented && !disabled && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); toggle(); } }}>
        {children}
      </Comp>
    </MenuItemCheckedProvider>
  );
}

interface MenuRadioGroupContextValue { value: string; setValue: (value: string) => void }
const [MenuRadioGroupProvider, useMenuRadioGroup] = createContext<MenuRadioGroupContextValue>('Menu.RadioGroup');

export interface MenuRadioGroupCoreProps extends ComponentProps<'div'> { asChild?: boolean; value?: string; defaultValue?: string; onValueChange?: (value: string) => void }
export function MenuRadioGroupCore({ asChild, value: valueProp, defaultValue = '', onValueChange, className, ...props }: MenuRadioGroupCoreProps) {
  const [value, setValue] = useControllableState({ value: valueProp, defaultValue, onChange: onValueChange });
  const Comp = asChild ? Slot : 'div';
  return <MenuRadioGroupProvider value={{ value, setValue }}><Comp {...props} role="group" className={cx('few-menu-group', className)} /></MenuRadioGroupProvider>;
}

export interface MenuRadioItemCoreProps extends ComponentProps<'div'> { asChild?: boolean; disabled?: boolean; value: string }
export function MenuRadioItemCore({ asChild, disabled, value, className, onClick, onKeyDown, onMouseEnter, children, ...props }: MenuRadioItemCoreProps) {
  const { value: selected, setValue } = useMenuRadioGroup('Menu.RadioItem');
  const checked = selected === value;
  const Comp = asChild ? Slot : 'div';
  function select() { if (!disabled) setValue(value); }
  return (
    <MenuItemCheckedProvider value={{ checked }}>
      <Comp {...props} role="menuitemradio" aria-checked={checked} tabIndex={-1} aria-disabled={disabled || undefined} data-disabled={dataAttr(disabled)}
        data-state={checked ? 'checked' : 'unchecked'} className={cx('few-menu-item', className)}
        onMouseEnter={(event) => { onMouseEnter?.(event); if (!disabled) (event.currentTarget as HTMLElement).focus(); }}
        onClick={(event) => { onClick?.(event); if (!event.defaultPrevented) select(); }}
        onKeyDown={(event) => { onKeyDown?.(event); if (!event.defaultPrevented && !disabled && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); select(); } }}>
        {children}
      </Comp>
    </MenuItemCheckedProvider>
  );
}

export interface MenuItemIndicatorCoreProps extends ComponentProps<'span'> { asChild?: boolean; forceMount?: boolean }
/** Só renderiza quando o CheckboxItem/RadioItem pai está marcado (ou sempre, com `forceMount`). */
export function MenuItemIndicatorCore({ asChild, forceMount, className, ...props }: MenuItemIndicatorCoreProps) {
  const { checked } = useMenuItemChecked('Menu.ItemIndicator');
  if (!checked && !forceMount) return null;
  const Comp = asChild ? Slot : 'span';
  return <Comp {...props} aria-hidden="true" data-state={checked ? 'checked' : 'unchecked'} className={cx('few-menu-item-indicator', className)} />;
}

interface MenuGroupContextValue { labelId: string | undefined; setLabelId: (id: string) => void }
const [MenuGroupProvider, , useOptionalMenuGroup] = createContext<MenuGroupContextValue>('Menu.Group (interno)');

export interface MenuGroupCoreProps extends ComponentProps<'div'> { asChild?: boolean }
export function MenuGroupCore({ asChild, className, ...props }: MenuGroupCoreProps) {
  const [labelId, setLabelId] = useState<string>();
  const Comp = asChild ? Slot : 'div';
  return <MenuGroupProvider value={{ labelId, setLabelId }}><Comp {...props} role="group" aria-labelledby={labelId} className={cx('few-menu-group', className)} /></MenuGroupProvider>;
}

export interface MenuLabelCoreProps extends ComponentProps<'div'> { asChild?: boolean }
export function MenuLabelCore({ asChild, className, ...props }: MenuLabelCoreProps) {
  const id = useId();
  const group = useOptionalMenuGroup();
  useEffect(() => { group?.setLabelId(id); }, [group, id]);
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} id={id} className={cx('few-menu-label', className)} />;
}

export interface MenuSeparatorCoreProps extends ComponentProps<'div'> { asChild?: boolean }
export function MenuSeparatorCore({ asChild, className, ...props }: MenuSeparatorCoreProps) {
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} role="separator" aria-orientation="horizontal" className={cx('few-menu-separator', className)} />;
}

export interface MenuShortcutCoreProps extends ComponentProps<'kbd'> { asChild?: boolean; children?: ReactNode }
export function MenuShortcutCore({ asChild, className, ...props }: MenuShortcutCoreProps) {
  const Comp = asChild ? Slot : 'kbd';
  return <Comp {...props} className={cx('few-menu-shortcut', className)} />;
}
