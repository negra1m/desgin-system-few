"use client";
// Toolbar: ver docs/composition.md. Roving focus imperativo (como Radix RovingFocusGroup) sobre [data-few-toolbar-item].
import { useEffect, useRef, type ComponentProps, type KeyboardEvent } from 'react';
import type { Orientation } from '@fewcompany/core';
import { Slot } from '../../lib/slot.js';
import { createContext } from '../../lib/context.js';
import { cx, dataAttr } from '../../lib/cx.js';
import { moveFocus, focusableItems } from '../../lib/roving.js';

interface ToolbarContextValue { orientation: Orientation }
const [ToolbarProvider, useToolbarContext] = createContext<ToolbarContextValue>('Toolbar');

export interface ToolbarProps extends ComponentProps<'div'> {
  asChild?: boolean;
  orientation?: Orientation;
  /** aria-label obrigatório: a toolbar não tem rótulo visível próprio. */
  label: string;
  loop?: boolean;
}
function ToolbarRoot({ asChild, orientation = 'horizontal', label, loop = true, className, onKeyDown, ...props }: ToolbarProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const items = () => focusableItems(el, '[data-few-toolbar-item]');
    items().forEach((item, index) => { item.tabIndex = index === 0 ? 0 : -1; });
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      if (!target.hasAttribute('data-few-toolbar-item')) return;
      items().forEach(item => { item.tabIndex = item === target ? 0 : -1; });
    };
    el.addEventListener('focusin', onFocusIn);
    return () => el.removeEventListener('focusin', onFocusIn);
  }, []);
  const Comp = asChild ? Slot : 'div';
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const target = moveFocus(ref.current, '[data-few-toolbar-item]', event.key, { orientation, loop });
    if (target) event.preventDefault();
  }
  return (
    <ToolbarProvider value={{ orientation }}>
      <Comp {...props} ref={ref} role="toolbar" aria-label={label} aria-orientation={orientation} data-orientation={orientation} className={cx('few-toolbar', className)} onKeyDown={handleKeyDown} />
    </ToolbarProvider>
  );
}

export interface ToolbarButtonProps extends ComponentProps<'button'> { asChild?: boolean }
function ToolbarButton({ asChild, className, disabled, ...props }: ToolbarButtonProps) {
  useToolbarContext('Toolbar.Button');
  const Comp = asChild ? Slot : 'button';
  return <Comp {...props} type="button" data-few-toolbar-item="" disabled={disabled} data-disabled={dataAttr(disabled)} className={cx('few-toolbar-button', className)} />;
}

export interface ToolbarLinkProps extends ComponentProps<'a'> { asChild?: boolean }
function ToolbarLink({ asChild, className, ...props }: ToolbarLinkProps) {
  useToolbarContext('Toolbar.Link');
  const Comp = asChild ? Slot : 'a';
  return <Comp {...props} data-few-toolbar-item="" className={cx('few-toolbar-link', className)} />;
}

export interface ToolbarSeparatorProps extends ComponentProps<'div'> { asChild?: boolean }
function ToolbarSeparator({ asChild, className, ...props }: ToolbarSeparatorProps) {
  const { orientation } = useToolbarContext('Toolbar.Separator');
  const crossOrientation = orientation === 'horizontal' ? 'vertical' : 'horizontal';
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} role="separator" aria-orientation={crossOrientation} data-orientation={crossOrientation} className={cx('few-toolbar-separator', className)} />;
}

export interface ToolbarGroupProps extends ComponentProps<'div'> { asChild?: boolean }
function ToolbarGroup({ asChild, className, ...props }: ToolbarGroupProps) {
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} role="group" className={cx('few-toolbar-group', className)} />;
}

/** Toolbar composto: <Toolbar label="Formatação"><Toolbar.Button>B</Toolbar.Button><Toolbar.Separator/><Toolbar.Link href="#">Link</Toolbar.Link></Toolbar> */
export const Toolbar = Object.assign(ToolbarRoot, { Root: ToolbarRoot, Button: ToolbarButton, Link: ToolbarLink, Separator: ToolbarSeparator, Group: ToolbarGroup });
export { ToolbarRoot, ToolbarButton, ToolbarLink, ToolbarSeparator, ToolbarGroup };
