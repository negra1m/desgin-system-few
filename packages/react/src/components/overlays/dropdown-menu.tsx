"use client";
// DropdownMenu: menu acionado por um botão. Núcleo de Content/Item/etc. vem de menu-core.tsx (reusado por
// ContextMenu e Menubar). Ver docs/composition.md #8 (popover manual + useTopLayer no lugar de Portal).
import { useId, useRef, type ComponentProps, type ReactNode, type RefObject } from 'react';
import { createContext } from '../../lib/context.js';
import { Slot } from '../../lib/slot.js';
import { useControllableState } from '../../lib/use-controllable-state.js';
import { cx } from '../../lib/cx.js';
import { setRef } from '../../lib/compose-refs.js';
import type { Align, Side } from '../../lib/use-position.js';
import {
  MenuContentCore, MenuItemCore, MenuCheckboxItemCore, MenuRadioGroupCore, MenuRadioItemCore, MenuItemIndicatorCore,
  MenuLabelCore, MenuGroupCore, MenuSeparatorCore, MenuShortcutCore,
} from './menu-core.js';

interface DropdownMenuContextValue { open: boolean; setOpen: (open: boolean) => void; contentId: string; triggerRef: RefObject<HTMLElement | null> }
const [DropdownMenuProvider, useDropdownMenu] = createContext<DropdownMenuContextValue>('DropdownMenu');

export interface DropdownMenuProps { children?: ReactNode; open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void }
/** DropdownMenu.Root: só contexto. */
function DropdownMenuRoot({ children, open: openProp, defaultOpen = false, onOpenChange }: DropdownMenuProps) {
  const baseId = useId();
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const triggerRef = useRef<HTMLElement>(null);
  return <DropdownMenuProvider value={{ open, setOpen, contentId: `${baseId}-menu`, triggerRef }}>{children}</DropdownMenuProvider>;
}

export interface DropdownMenuTriggerProps extends ComponentProps<'button'> { asChild?: boolean }
/** ArrowDown abre o menu (Enter/Espaço já funcionam nativamente, é um <button>). */
function DropdownMenuTrigger({ asChild, className, onClick, onKeyDown, ...props }: DropdownMenuTriggerProps) {
  const { open, setOpen, contentId, triggerRef } = useDropdownMenu('DropdownMenu.Trigger');
  const Comp = asChild ? Slot : 'button';
  return <Comp {...props} ref={(node: HTMLElement | null) => setRef(triggerRef, node)} type="button" aria-haspopup="menu" aria-expanded={open} aria-controls={open ? contentId : undefined}
    className={cx('few-dropdown-menu-trigger', className)}
    onClick={(event) => { onClick?.(event); if (!event.defaultPrevented) setOpen(!open); }}
    onKeyDown={(event) => { onKeyDown?.(event); if (!event.defaultPrevented && event.key === 'ArrowDown') { event.preventDefault(); setOpen(true); } }} />;
}

export interface DropdownMenuContentProps extends ComponentProps<'div'> { asChild?: boolean; side?: Side; align?: Align; offset?: number; loop?: boolean }
function DropdownMenuContent({ side = 'bottom', align = 'start', offset = 4, id, ...props }: DropdownMenuContentProps) {
  const { open, setOpen, contentId, triggerRef } = useDropdownMenu('DropdownMenu.Content');
  return <MenuContentCore {...props} id={id ?? contentId} open={open} onOpenChange={setOpen} anchorRef={triggerRef} side={side} align={align} offset={offset} className={cx('few-dropdown-menu', props.className)} />;
}

/** DropdownMenu composto: <DropdownMenu><DropdownMenu.Trigger/><DropdownMenu.Content><DropdownMenu.Item/></DropdownMenu.Content></DropdownMenu> */
export const DropdownMenu = Object.assign(DropdownMenuRoot, {
  Root: DropdownMenuRoot, Trigger: DropdownMenuTrigger, Content: DropdownMenuContent,
  Item: MenuItemCore, CheckboxItem: MenuCheckboxItemCore, RadioGroup: MenuRadioGroupCore, RadioItem: MenuRadioItemCore,
  ItemIndicator: MenuItemIndicatorCore, Label: MenuLabelCore, Group: MenuGroupCore, Separator: MenuSeparatorCore, Shortcut: MenuShortcutCore,
});
export {
  DropdownMenuRoot, DropdownMenuTrigger, DropdownMenuContent,
  MenuItemCore as DropdownMenuItem, MenuCheckboxItemCore as DropdownMenuCheckboxItem, MenuRadioGroupCore as DropdownMenuRadioGroup,
  MenuRadioItemCore as DropdownMenuRadioItem, MenuItemIndicatorCore as DropdownMenuItemIndicator, MenuLabelCore as DropdownMenuLabel,
  MenuGroupCore as DropdownMenuGroup, MenuSeparatorCore as DropdownMenuSeparator, MenuShortcutCore as DropdownMenuShortcut,
};
