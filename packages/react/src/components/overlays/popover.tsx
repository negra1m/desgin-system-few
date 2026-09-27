"use client";
// Popover: não modal, sobre popover="manual" + useTopLayer (top layer nativo, herda tema) em vez de Portal
// (ver docs/composition.md #8). Posiciona com usePosition, fecha com useDismiss.
import { useEffect, useId, useRef, useState, type ComponentProps, type ReactNode, type RefObject } from 'react';
import { createContext } from '../../lib/context.js';
import { Slot } from '../../lib/slot.js';
import { useControllableState } from '../../lib/use-controllable-state.js';
import { cx } from '../../lib/cx.js';
import { setRef } from '../../lib/compose-refs.js';
import { useDismiss } from '../../lib/use-dismiss.js';
import { usePosition, type Align, type Side } from '../../lib/use-position.js';
import { useTopLayer } from '../../lib/use-top-layer.js';
import { focusableItems } from '../../lib/roving.js';

interface PopoverContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  contentId: string;
  anchorRef: RefObject<HTMLElement | null>;
  triggerRef: RefObject<HTMLElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
  side: Side;
  setSide: (side: Side) => void;
}
const [PopoverProvider, usePopover] = createContext<PopoverContextValue>('Popover');

export interface PopoverProps { children?: ReactNode; open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; modal?: false }
/** Popover.Root: só contexto (não modal — não bloqueia o resto da página). */
function PopoverRoot({ children, open: openProp, defaultOpen = false, onOpenChange }: PopoverProps) {
  const baseId = useId();
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const [side, setSide] = useState<Side>('bottom');
  const anchorRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  return (
    <PopoverProvider value={{ open, setOpen, contentId: `${baseId}-popover`, anchorRef, triggerRef, contentRef, side, setSide }}>
      {children}
    </PopoverProvider>
  );
}

export interface PopoverAnchorProps extends ComponentProps<'span'> { asChild?: boolean }
/** Ancora o posicionamento em outro elemento que não o Trigger (opcional). */
function PopoverAnchor({ asChild, className, ...props }: PopoverAnchorProps) {
  const { anchorRef } = usePopover('Popover.Anchor');
  const Comp = asChild ? Slot : 'span';
  return <Comp {...props} ref={(node: HTMLElement | null) => setRef(anchorRef, node)} className={cx('few-popover-anchor', className)} />;
}

export interface PopoverTriggerProps extends ComponentProps<'button'> { asChild?: boolean }
function PopoverTrigger({ asChild, className, onClick, ...props }: PopoverTriggerProps) {
  const { open, setOpen, contentId, anchorRef, triggerRef } = usePopover('Popover.Trigger');
  const Comp = asChild ? Slot : 'button';
  return <Comp {...props} ref={(node: HTMLElement | null) => { setRef(triggerRef, node); if (!anchorRef.current) setRef(anchorRef, node); }} type="button"
    aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? contentId : undefined} className={cx('few-popover-trigger', className)}
    onClick={(event) => { onClick?.(event); if (!event.defaultPrevented) setOpen(!open); }} />;
}

export interface PopoverContentProps extends ComponentProps<'div'> {
  asChild?: boolean; side?: Side; align?: Align; offset?: number;
}
function PopoverContent({ asChild, side = 'bottom', align = 'center', offset = 8, className, style, onKeyDown, ...props }: PopoverContentProps) {
  const { open, setOpen, contentId, anchorRef, triggerRef, contentRef, setSide } = usePopover('Popover.Content');
  const position = usePosition(anchorRef, contentRef, { side, align, offset, open });
  useTopLayer(contentRef, open);
  useDismiss(open, () => setOpen(false), [contentRef, anchorRef]);
  useEffect(() => { setSide(position.side); }, [position.side, setSide]);
  useEffect(() => {
    if (!open) return;
    const target = focusableItems(contentRef.current, 'a[href],button,input,textarea,select,[tabindex]')[0] ?? contentRef.current;
    target?.focus();
  }, [open, contentRef]);
  useEffect(() => {
    if (open) return;
    triggerRef.current?.focus();
  }, [open, triggerRef]);
  const Comp = asChild ? Slot : 'div';
  return (
    <Comp {...props} ref={contentRef} popover="manual" id={contentId} role="dialog" tabIndex={-1} data-state={open ? 'open' : 'closed'} data-side={position.side}
      className={cx('few-popover', className)} style={{ ...position.style, ...style }}
      onKeyDown={(event) => { onKeyDown?.(event); if (!event.defaultPrevented && event.key === 'Escape') { event.preventDefault(); setOpen(false); } }}>
      {props.children}
    </Comp>
  );
}

export interface PopoverCloseProps extends ComponentProps<'button'> { asChild?: boolean }
function PopoverClose({ asChild, className, onClick, ...props }: PopoverCloseProps) {
  const { setOpen } = usePopover('Popover.Close');
  const Comp = asChild ? Slot : 'button';
  return <Comp {...props} type="button" className={cx('few-popover-close', className)}
    onClick={(event) => { onClick?.(event); if (!event.defaultPrevented) setOpen(false); }} />;
}

export interface PopoverArrowProps extends ComponentProps<'span'> { asChild?: boolean }
/** Seta decorativa; a direção é lida em CSS via `data-side` (herdado do Content). */
function PopoverArrow({ asChild, className, ...props }: PopoverArrowProps) {
  const { side } = usePopover('Popover.Arrow');
  const Comp = asChild ? Slot : 'span';
  return <Comp {...props} aria-hidden="true" data-side={side} className={cx('few-popover-arrow', className)} />;
}

/** Popover composto: <Popover><Popover.Trigger/><Popover.Content><Popover.Arrow/></Popover.Content></Popover> */
export const Popover = Object.assign(PopoverRoot, { Root: PopoverRoot, Anchor: PopoverAnchor, Trigger: PopoverTrigger, Content: PopoverContent, Close: PopoverClose, Arrow: PopoverArrow });
export { PopoverRoot, PopoverAnchor, PopoverTrigger, PopoverContent, PopoverClose, PopoverArrow };
