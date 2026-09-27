"use client";
// Collapsible: par trigger/conteúdo mostra-esconde (ver docs/composition.md, padrão Radix Collapsible).
import { useId, type ComponentProps } from 'react';
import { Slot } from '../../lib/slot.js';
import { createContext } from '../../lib/context.js';
import { useControllableState } from '../../lib/use-controllable-state.js';
import { cx, dataAttr } from '../../lib/cx.js';

interface CollapsibleContextValue { baseId: string; open: boolean; setOpen: (open: boolean) => void; disabled: boolean }
const [CollapsibleProvider, useCollapsibleCtx] = createContext<CollapsibleContextValue>('Collapsible');

export interface CollapsibleProps extends ComponentProps<'div'> { asChild?: boolean; open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; disabled?: boolean }
function CollapsibleRoot({ asChild, open, defaultOpen = false, onOpenChange, disabled = false, className, ...props }: CollapsibleProps) {
  const baseId = useId();
  const [isOpen, setIsOpen] = useControllableState({ value: open, defaultValue: defaultOpen, onChange: onOpenChange });
  const Comp = asChild ? Slot : 'div';
  return <CollapsibleProvider value={{ baseId, open: isOpen, setOpen: setIsOpen, disabled }}>
    <Comp {...props} className={cx('few-collapsible', className)} data-state={isOpen ? 'open' : 'closed'} data-disabled={dataAttr(disabled)} />
  </CollapsibleProvider>;
}

export interface CollapsibleTriggerProps extends ComponentProps<'button'> { asChild?: boolean }
function CollapsibleTrigger({ asChild, className, disabled, onClick, ...props }: CollapsibleTriggerProps) {
  const { baseId, open, setOpen, disabled: rootDisabled } = useCollapsibleCtx('Collapsible.Trigger');
  const isDisabled = disabled || rootDisabled;
  const Comp = asChild ? Slot : 'button';
  return <Comp {...props} type="button" aria-expanded={open} aria-controls={`${baseId}-content`} disabled={isDisabled}
    data-state={open ? 'open' : 'closed'} data-disabled={dataAttr(isDisabled)} className={cx('few-collapsible-trigger', className)}
    onClick={(event) => { onClick?.(event); if (!event.defaultPrevented && !isDisabled) setOpen(!open); }} />;
}

export interface CollapsibleContentProps extends ComponentProps<'div'> { asChild?: boolean; forceMount?: boolean }
function CollapsibleContent({ asChild, forceMount, className, ...props }: CollapsibleContentProps) {
  const { baseId, open } = useCollapsibleCtx('Collapsible.Content');
  if (!open && !forceMount) return null;
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} id={`${baseId}-content`} hidden={!open} data-state={open ? 'open' : 'closed'} className={cx('few-collapsible-content', className)} />;
}

/** Collapsible composto: <Collapsible><Collapsible.Trigger/><Collapsible.Content/></Collapsible> */
export const Collapsible = Object.assign(CollapsibleRoot, { Root: CollapsibleRoot, Trigger: CollapsibleTrigger, Content: CollapsibleContent });
export { CollapsibleRoot, CollapsibleTrigger, CollapsibleContent };
