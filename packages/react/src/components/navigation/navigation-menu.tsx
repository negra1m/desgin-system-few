"use client";
import { useId, useLayoutEffect, useRef, useState, type ComponentProps, type FocusEvent, type KeyboardEvent, type MouseEvent, type RefObject } from 'react';
import { Slot } from '../../lib/slot.js';
import { createContext } from '../../lib/context.js';
import { useControllableState } from '../../lib/use-controllable-state.js';
import { cx, dataAttr } from '../../lib/cx.js';
import { moveFocus } from '../../lib/roving.js';
import { useDismiss } from '../../lib/use-dismiss.js';
import { usePosition } from '../../lib/use-position.js';
import { useTopLayer } from '../../lib/use-top-layer.js';

interface NavigationMenuContextValue {
  baseId: string;
  value: string | null;
  setValue: (value: string | null) => void;
  triggers: Map<string, HTMLElement>;
}
const [NavigationMenuProvider, useNavigationMenu] = createContext<NavigationMenuContextValue>('NavigationMenu');

interface NavigationMenuItemContextValue { value: string; open: boolean; triggerId: string; contentId: string; triggerRef: RefObject<HTMLElement | null> }
const [NavigationMenuItemProvider, useNavigationMenuItem] = createContext<NavigationMenuItemContextValue>('NavigationMenu.Item');

export interface NavigationMenuProps extends Omit<ComponentProps<'nav'>, 'defaultValue'> {
  asChild?: boolean;
  value?: string | null; defaultValue?: string | null; onValueChange?: (value: string | null) => void;
}
function NavigationMenuRoot({ asChild, value: valueProp, defaultValue = null, onValueChange, className, 'aria-label': ariaLabel = 'Menu principal', ...props }: NavigationMenuProps) {
  const baseId = useId();
  const [value, setValue] = useControllableState<string | null>({ value: valueProp, defaultValue, onChange: onValueChange });
  const triggers = useRef(new Map<string, HTMLElement>()).current;
  const Comp = asChild ? Slot : 'nav';
  return <NavigationMenuProvider value={{ baseId, value, setValue, triggers }}>
    <Comp {...props} aria-label={ariaLabel} className={cx('few-navigation-menu', className)} />
  </NavigationMenuProvider>;
}

/** Lista dos triggers, com roving horizontal (setas/Home/End) entre eles. */
export interface NavigationMenuListProps extends ComponentProps<'ul'> { asChild?: boolean }
function NavigationMenuList({ asChild, className, onKeyDown, ...props }: NavigationMenuListProps) {
  const ref = useRef<HTMLUListElement>(null);
  const Comp = asChild ? Slot : 'ul';
  function handleKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const target = moveFocus(ref.current, '[data-few-navmenu-trigger]', event.key, { orientation: 'horizontal' });
    if (target) event.preventDefault();
  }
  return <Comp {...props} ref={ref} className={cx('few-navigation-menu-list', className)} onKeyDown={handleKeyDown} />;
}

export interface NavigationMenuItemProps extends ComponentProps<'li'> { asChild?: boolean; value: string }
function NavigationMenuItem({ asChild, value, className, ...props }: NavigationMenuItemProps) {
  const { baseId, value: openValue } = useNavigationMenu('NavigationMenu.Item');
  const triggerRef = useRef<HTMLElement>(null);
  const open = openValue === value;
  const triggerId = `${baseId}-trigger-${value}`;
  const contentId = `${baseId}-content-${value}`;
  const Comp = asChild ? Slot : 'li';
  return <NavigationMenuItemProvider value={{ value, open, triggerId, contentId, triggerRef }}>
    <Comp {...props} data-state={open ? 'open' : 'closed'} className={cx('few-navigation-menu-item', className)} />
  </NavigationMenuItemProvider>;
}

/** Abre no hover, foco ou Enter/ArrowDown; fecha com Escape ou ao abrir outro item. */
export interface NavigationMenuTriggerProps extends ComponentProps<'button'> { asChild?: boolean }
function NavigationMenuTrigger({ asChild, className, onClick, onKeyDown, onFocus, onMouseEnter, ...props }: NavigationMenuTriggerProps) {
  const { setValue, triggers } = useNavigationMenu('NavigationMenu.Trigger');
  const { value, open, triggerId, contentId, triggerRef } = useNavigationMenuItem('NavigationMenu.Trigger');
  const Comp = asChild ? Slot : 'button';
  function refCallback(node: HTMLElement | null) {
    triggerRef.current = node;
    if (node) triggers.set(value, node); else triggers.delete(value);
  }
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    setValue(open ? null : value);
  }
  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === 'Escape' && open) { event.preventDefault(); setValue(null); }
    else if (event.key === 'ArrowDown' && !open) { event.preventDefault(); setValue(value); }
  }
  function handleFocus(event: FocusEvent<HTMLButtonElement>) { onFocus?.(event); setValue(value); }
  function handleMouseEnter(event: MouseEvent<HTMLButtonElement>) { onMouseEnter?.(event); setValue(value); }
  return <Comp {...props} ref={refCallback} type="button" id={triggerId} data-few-navmenu-trigger="" data-state={open ? 'open' : 'closed'}
    aria-expanded={open} aria-controls={contentId}
    className={cx('few-navigation-menu-trigger', className)}
    onClick={handleClick} onKeyDown={handleKeyDown} onFocus={handleFocus} onMouseEnter={handleMouseEnter} />;
}

/** Flyout posicionado com usePosition + top layer nativo (popover="manual"); fecha com Escape e clique fora. */
export interface NavigationMenuContentProps extends ComponentProps<'div'> { asChild?: boolean }
function NavigationMenuContent({ asChild, className, onKeyDown, style, ...props }: NavigationMenuContentProps) {
  const { setValue } = useNavigationMenu('NavigationMenu.Content');
  const { open, contentId, triggerId, triggerRef } = useNavigationMenuItem('NavigationMenu.Content');
  const ref = useRef<HTMLDivElement>(null);
  useTopLayer(ref, open);
  const position = usePosition(triggerRef, ref, { side: 'bottom', align: 'start', open });
  useDismiss(open, () => setValue(null), [triggerRef, ref]);
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === 'Escape') { event.preventDefault(); setValue(null); }
  }
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} ref={ref} popover="manual" id={contentId} role="group" aria-labelledby={triggerId}
    data-state={open ? 'open' : 'closed'} style={{ ...position.style, ...style }}
    className={cx('few-navigation-menu-content', className)} onKeyDown={handleKeyDown} />;
}

export interface NavigationMenuLinkProps extends ComponentProps<'a'> { asChild?: boolean; active?: boolean }
function NavigationMenuLink({ asChild, active, className, ...props }: NavigationMenuLinkProps) {
  const Comp = asChild ? Slot : 'a';
  return <Comp {...props} aria-current={active ? 'page' : undefined} data-active={dataAttr(active)} className={cx('few-navigation-menu-link', className)} />;
}

/** Indicador que acompanha a posição do trigger aberto (renderize dentro de List). */
export interface NavigationMenuIndicatorProps extends ComponentProps<'div'> { asChild?: boolean }
function NavigationMenuIndicator({ asChild, className, style, ...props }: NavigationMenuIndicatorProps) {
  const { value, triggers } = useNavigationMenu('NavigationMenu.Indicator');
  const [rect, setRect] = useState<{ left: number; width: number } | null>(null);
  useLayoutEffect(() => {
    const trigger = value ? triggers.get(value) : undefined;
    if (trigger) setRect({ left: trigger.offsetLeft, width: trigger.offsetWidth });
  }, [value, triggers]);
  if (!value || !rect) return null;
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} aria-hidden="true" data-state="visible" style={{ ...style, transform: `translateX(${rect.left}px)`, width: `${rect.width}px` }} className={cx('few-navigation-menu-indicator', className)} />;
}

/** NavigationMenu composto: <NavigationMenu><NavigationMenu.List><NavigationMenu.Item value="produtos"><NavigationMenu.Trigger>Produtos</NavigationMenu.Trigger><NavigationMenu.Content><NavigationMenu.Link href="/a">Produto A</NavigationMenu.Link></NavigationMenu.Content></NavigationMenu.Item></NavigationMenu.List></NavigationMenu> */
export const NavigationMenu = Object.assign(NavigationMenuRoot, { Root: NavigationMenuRoot, List: NavigationMenuList, Item: NavigationMenuItem, Trigger: NavigationMenuTrigger, Content: NavigationMenuContent, Link: NavigationMenuLink, Indicator: NavigationMenuIndicator });
export { NavigationMenuRoot, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink, NavigationMenuIndicator };
