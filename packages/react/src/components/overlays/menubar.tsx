"use client";
// Menubar: barra horizontal de menus (Arquivo, Editar…). Roving focus horizontal entre Triggers; ArrowLeft/Right
// troca o menu aberto; hover troca quando algum já está aberto. Núcleo reusado de menu-core.tsx.
// Simplificação assumida: todo Trigger fica com tabIndex 0 (toolbar simples) em vez do único tab-stop do
// roving-tabindex "estrito" — teclado permanece 100% operável (setas, Home/End, Enter/Espaço, Escape).
import { useId, useRef, type ComponentProps, type KeyboardEvent, type ReactNode, type RefObject } from 'react';
import { createContext } from '../../lib/context.js';
import { Slot } from '../../lib/slot.js';
import { useControllableState } from '../../lib/use-controllable-state.js';
import { cx, dataState } from '../../lib/cx.js';
import { setRef } from '../../lib/compose-refs.js';
import { moveFocus } from '../../lib/roving.js';
import type { Align, Side } from '../../lib/use-position.js';
import {
  MenuContentCore, MenuItemCore, MenuCheckboxItemCore, MenuRadioGroupCore, MenuRadioItemCore, MenuItemIndicatorCore,
  MenuLabelCore, MenuGroupCore, MenuSeparatorCore, MenuShortcutCore,
} from './menu-core.js';

const TRIGGER_SELECTOR = ':scope > [role="menuitem"]';

interface MenubarRootContextValue { openValue: string | null; setOpenValue: (value: string | null) => void }
const [MenubarRootProvider, useMenubarRoot] = createContext<MenubarRootContextValue>('Menubar');

interface MenubarMenuContextValue { value: string; triggerRef: RefObject<HTMLElement | null>; contentId: string }
const [MenubarMenuProvider, useMenubarMenu] = createContext<MenubarMenuContextValue>('Menubar.Menu');

export interface MenubarProps extends Omit<ComponentProps<'div'>, 'defaultValue'> {
  asChild?: boolean;
  value?: string | null; defaultValue?: string | null; onValueChange?: (value: string | null) => void;
}
function MenubarRoot({ asChild, value: valueProp, defaultValue = null, onValueChange, className, onKeyDown, ...props }: MenubarProps) {
  const [openValue, setOpenValue] = useControllableState<string | null>({ value: valueProp, defaultValue, onChange: onValueChange });
  const ref = useRef<HTMLDivElement>(null);
  const Comp = asChild ? Slot : 'div';
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const target = moveFocus(ref.current, TRIGGER_SELECTOR, event.key, { orientation: 'horizontal', loop: true });
    if (!target) return;
    event.preventDefault();
    if (openValue !== null) setOpenValue(target.dataset.menubarValue ?? null);
  }
  return (
    <MenubarRootProvider value={{ openValue, setOpenValue }}>
      <Comp {...props} ref={ref} role="menubar" className={cx('few-menubar', className)} onKeyDown={handleKeyDown}>{props.children}</Comp>
    </MenubarRootProvider>
  );
}

export interface MenubarMenuProps { children?: ReactNode; value: string }
/** Menubar.Menu: só contexto (identifica o menu para o Trigger e o Content). */
function MenubarMenu({ children, value }: MenubarMenuProps) {
  const baseId = useId();
  const triggerRef = useRef<HTMLElement>(null);
  return <MenubarMenuProvider value={{ value, triggerRef, contentId: `${baseId}-menubar-menu` }}>{children}</MenubarMenuProvider>;
}

export interface MenubarTriggerProps extends ComponentProps<'button'> { asChild?: boolean }
function MenubarTrigger({ asChild, className, onClick, onMouseEnter, ...props }: MenubarTriggerProps) {
  const { openValue, setOpenValue } = useMenubarRoot('Menubar.Trigger');
  const { value, triggerRef, contentId } = useMenubarMenu('Menubar.Trigger');
  const open = openValue === value;
  const Comp = asChild ? Slot : 'button';
  return <Comp {...props} ref={(node: HTMLElement | null) => setRef(triggerRef, node)} type="button" role="menuitem" tabIndex={0}
    data-menubar-value={value} aria-haspopup="menu" aria-expanded={open} aria-controls={open ? contentId : undefined} data-state={dataState(open)}
    className={cx('few-menubar-trigger', className)}
    onClick={(event) => { onClick?.(event); if (!event.defaultPrevented) setOpenValue(open ? null : value); }}
    onMouseEnter={(event) => { onMouseEnter?.(event); if (!event.defaultPrevented && openValue !== null && openValue !== value) setOpenValue(value); }} />;
}

export interface MenubarContentProps extends ComponentProps<'div'> { asChild?: boolean; side?: Side; align?: Align; offset?: number; loop?: boolean }
function MenubarContent({ side = 'bottom', align = 'start', offset = 4, id, ...props }: MenubarContentProps) {
  const { openValue, setOpenValue } = useMenubarRoot('Menubar.Content');
  const { value, triggerRef, contentId } = useMenubarMenu('Menubar.Content');
  const open = openValue === value;
  return <MenuContentCore {...props} id={id ?? contentId} open={open} onOpenChange={(next) => setOpenValue(next ? value : null)} anchorRef={triggerRef} side={side} align={align} offset={offset} className={cx('few-menubar-menu', props.className)} />;
}

/** Menubar composto: <Menubar><Menubar.Menu value="file"><Menubar.Trigger/><Menubar.Content><Menubar.Item/></Menubar.Content></Menubar.Menu></Menubar> */
export const Menubar = Object.assign(MenubarRoot, {
  Root: MenubarRoot, Menu: MenubarMenu, Trigger: MenubarTrigger, Content: MenubarContent,
  Item: MenuItemCore, CheckboxItem: MenuCheckboxItemCore, RadioGroup: MenuRadioGroupCore, RadioItem: MenuRadioItemCore,
  ItemIndicator: MenuItemIndicatorCore, Label: MenuLabelCore, Group: MenuGroupCore, Separator: MenuSeparatorCore, Shortcut: MenuShortcutCore,
});
export {
  MenubarRoot, MenubarMenu, MenubarTrigger, MenubarContent,
  MenuItemCore as MenubarItem, MenuCheckboxItemCore as MenubarCheckboxItem, MenuRadioGroupCore as MenubarRadioGroup,
  MenuRadioItemCore as MenubarRadioItem, MenuItemIndicatorCore as MenubarItemIndicator, MenuLabelCore as MenubarLabel,
  MenuGroupCore as MenubarGroup, MenuSeparatorCore as MenubarSeparator, MenuShortcutCore as MenubarShortcut,
};
