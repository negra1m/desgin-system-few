"use client";
// ContextMenu: menu na posição do ponteiro (botão direito ou toque longo). Âncora virtual: um <span> de
// tamanho zero posicionado fixed em x/y (ver docs/composition.md #8). Núcleo reusado de menu-core.tsx.
import { useId, useRef, useState, type ComponentProps, type ReactNode, type RefObject } from 'react';
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

interface Point { x: number; y: number }
interface ContextMenuContextValue { open: boolean; setOpen: (open: boolean) => void; contentId: string; point: Point; setPoint: (point: Point) => void; anchorRef: RefObject<HTMLElement | null> }
const [ContextMenuProvider, useContextMenu] = createContext<ContextMenuContextValue>('ContextMenu');

export interface ContextMenuProps { children?: ReactNode; open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void }
/** ContextMenu.Root: só contexto. */
function ContextMenuRoot({ children, open: openProp, defaultOpen = false, onOpenChange }: ContextMenuProps) {
  const baseId = useId();
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const [point, setPoint] = useState<Point>({ x: 0, y: 0 });
  const anchorRef = useRef<HTMLElement>(null);
  return <ContextMenuProvider value={{ open, setOpen, contentId: `${baseId}-context-menu`, point, setPoint, anchorRef }}>{children}</ContextMenuProvider>;
}

export interface ContextMenuTriggerProps extends ComponentProps<'div'> {
  asChild?: boolean;
  /** Toque longo (mobile) também abre o menu. Padrão true. */
  longPress?: boolean;
}
/** Área que escuta o clique com botão direito (e, opcionalmente, toque longo) para abrir o menu na posição do ponteiro. */
function ContextMenuTrigger({ asChild, longPress = true, className, onContextMenu, onPointerDown, onPointerUp, onPointerLeave, ...props }: ContextMenuTriggerProps) {
  const { setOpen, setPoint } = useContextMenu('ContextMenu.Trigger');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  function openAt(x: number, y: number) { setPoint({ x, y }); setOpen(true); }
  const Comp = asChild ? Slot : 'div';
  // tabIndex garante que o teclado alcance a área (Menu/Shift+F10 disparam "contextmenu" nativo no elemento focado).
  return <Comp {...props} tabIndex={props.tabIndex ?? 0} className={cx('few-context-menu-trigger', className)}
    onContextMenu={(event) => { onContextMenu?.(event); if (event.defaultPrevented) return; event.preventDefault(); openAt(event.clientX, event.clientY); }}
    onPointerDown={(event) => {
      onPointerDown?.(event);
      if (!longPress || event.pointerType !== 'touch') return;
      const { clientX, clientY } = event;
      timer.current = setTimeout(() => openAt(clientX, clientY), 500);
    }}
    onPointerUp={(event) => { onPointerUp?.(event); window.clearTimeout(timer.current); }}
    onPointerLeave={(event) => { onPointerLeave?.(event); window.clearTimeout(timer.current); }} />;
}

export interface ContextMenuContentProps extends ComponentProps<'div'> { asChild?: boolean; side?: Side; align?: Align; offset?: number; loop?: boolean }
function ContextMenuContent({ side = 'bottom', align = 'start', offset = 2, id, ...props }: ContextMenuContentProps) {
  const { open, setOpen, contentId, point, anchorRef } = useContextMenu('ContextMenu.Content');
  return (
    <>
      <span ref={(node: HTMLSpanElement | null) => setRef(anchorRef, node)} aria-hidden="true" className="few-context-menu-anchor" style={{ position: 'fixed', left: point.x, top: point.y, width: 0, height: 0 }} />
      <MenuContentCore {...props} id={id ?? contentId} open={open} onOpenChange={setOpen} anchorRef={anchorRef} side={side} align={align} offset={offset} className={cx('few-context-menu', props.className)} />
    </>
  );
}

/** ContextMenu composto: <ContextMenu><ContextMenu.Trigger><div>área</div></ContextMenu.Trigger><ContextMenu.Content><ContextMenu.Item/></ContextMenu.Content></ContextMenu> */
export const ContextMenu = Object.assign(ContextMenuRoot, {
  Root: ContextMenuRoot, Trigger: ContextMenuTrigger, Content: ContextMenuContent,
  Item: MenuItemCore, CheckboxItem: MenuCheckboxItemCore, RadioGroup: MenuRadioGroupCore, RadioItem: MenuRadioItemCore,
  ItemIndicator: MenuItemIndicatorCore, Label: MenuLabelCore, Group: MenuGroupCore, Separator: MenuSeparatorCore, Shortcut: MenuShortcutCore,
});
export {
  ContextMenuRoot, ContextMenuTrigger, ContextMenuContent,
  MenuItemCore as ContextMenuItem, MenuCheckboxItemCore as ContextMenuCheckboxItem, MenuRadioGroupCore as ContextMenuRadioGroup,
  MenuRadioItemCore as ContextMenuRadioItem, MenuItemIndicatorCore as ContextMenuItemIndicator, MenuLabelCore as ContextMenuLabel,
  MenuGroupCore as ContextMenuGroup, MenuSeparatorCore as ContextMenuSeparator, MenuShortcutCore as ContextMenuShortcut,
};
