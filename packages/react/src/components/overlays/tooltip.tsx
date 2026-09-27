"use client";
// Tooltip: popover="manual" + useTopLayer (top layer nativo) em vez de Portal, posicionado com usePosition.
// Provider compartilha o "skip delay": depois que um tooltip abre, os próximos abrem sem esperar o delay
// se o ponteiro migrar de um trigger para outro dentro de `skipDelayDuration`.
import { useCallback, useEffect, useId, useMemo, useRef, useState, type ComponentProps, type ReactNode, type RefObject } from 'react';
import { createContext } from '../../lib/context.js';
import { Slot } from '../../lib/slot.js';
import { useControllableState } from '../../lib/use-controllable-state.js';
import { cx } from '../../lib/cx.js';
import { setRef } from '../../lib/compose-refs.js';
import { useDismiss } from '../../lib/use-dismiss.js';
import { usePosition, type Align, type Side } from '../../lib/use-position.js';
import { useTopLayer } from '../../lib/use-top-layer.js';

interface TooltipProviderContextValue { delayDuration: number; isSkipping: () => boolean; onOpen: () => void; onClose: () => void }
const [TooltipProviderRoot, , useOptionalTooltipProvider] = createContext<TooltipProviderContextValue>('Tooltip.Provider');

export interface TooltipProviderProps { children?: ReactNode; delayDuration?: number; skipDelayDuration?: number }
/** Compartilha o delay de abertura entre vários Tooltip.Root (opcional). */
function TooltipProvider({ children, delayDuration = 700, skipDelayDuration = 300 }: TooltipProviderProps) {
  const skipping = useRef(false);
  const skipTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const value = useMemo<TooltipProviderContextValue>(() => ({
    delayDuration,
    isSkipping: () => skipping.current,
    onOpen: () => { skipping.current = true; window.clearTimeout(skipTimer.current); },
    onClose: () => { window.clearTimeout(skipTimer.current); skipTimer.current = setTimeout(() => { skipping.current = false; }, skipDelayDuration); },
  }), [delayDuration, skipDelayDuration]);
  return <TooltipProviderRoot value={value}>{children}</TooltipProviderRoot>;
}

interface TooltipContextValue {
  open: boolean;
  contentId: string;
  triggerRef: RefObject<HTMLElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
  requestOpen: (immediate?: boolean) => void;
  requestClose: () => void;
  side: Side;
  setSide: (side: Side) => void;
}
const [TooltipRootProvider, useTooltip] = createContext<TooltipContextValue>('Tooltip');

export interface TooltipProps { children?: ReactNode; open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; delay?: number }
function TooltipRoot({ children, open: openProp, defaultOpen = false, onOpenChange, delay }: TooltipProps) {
  const baseId = useId();
  const provider = useOptionalTooltipProvider();
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const [side, setSide] = useState<Side>('top');
  const openTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const triggerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const effectiveDelay = delay ?? provider?.delayDuration ?? 700;
  const requestOpen = useCallback((immediate = false) => {
    window.clearTimeout(openTimer.current);
    if (immediate || provider?.isSkipping()) { provider?.onOpen(); setOpen(true); return; }
    openTimer.current = setTimeout(() => { provider?.onOpen(); setOpen(true); }, effectiveDelay);
  }, [effectiveDelay, provider, setOpen]);
  const requestClose = useCallback(() => {
    window.clearTimeout(openTimer.current);
    provider?.onClose();
    setOpen(false);
  }, [provider, setOpen]);
  useEffect(() => () => window.clearTimeout(openTimer.current), []);
  return (
    <TooltipRootProvider value={{ open, contentId: `${baseId}-tooltip`, triggerRef, contentRef, requestOpen, requestClose, side, setSide }}>
      {children}
    </TooltipRootProvider>
  );
}

export interface TooltipTriggerProps extends ComponentProps<'button'> { asChild?: boolean }
/** Abre no hover (com delay) e no foco (imediato); fecha no blur, pointerleave, pointerdown ou Escape. Não abre se `disabled`. */
function TooltipTrigger({ asChild, className, disabled, onPointerEnter, onPointerLeave, onPointerDown, onFocus, onBlur, ...props }: TooltipTriggerProps) {
  const { contentId, triggerRef, requestOpen, requestClose } = useTooltip('Tooltip.Trigger');
  const Comp = asChild ? Slot : 'button';
  return <Comp {...props} ref={(node: HTMLElement | null) => setRef(triggerRef, node)} type="button" disabled={disabled} aria-describedby={contentId} className={cx('few-tooltip-trigger', className)}
    onPointerEnter={(event) => { onPointerEnter?.(event); if (!event.defaultPrevented && !disabled && event.pointerType !== 'touch') requestOpen(); }}
    onPointerLeave={(event) => { onPointerLeave?.(event); if (!event.defaultPrevented) requestClose(); }}
    onPointerDown={(event) => { onPointerDown?.(event); if (!event.defaultPrevented) requestClose(); }}
    onFocus={(event) => { onFocus?.(event); if (!event.defaultPrevented && !disabled) requestOpen(true); }}
    onBlur={(event) => { onBlur?.(event); if (!event.defaultPrevented) requestClose(); }} />;
}

export interface TooltipContentProps extends ComponentProps<'div'> { asChild?: boolean; side?: Side; align?: Align; offset?: number }
function TooltipContent({ asChild, side = 'top', align = 'center', offset = 6, className, style, ...props }: TooltipContentProps) {
  const { open, contentId, triggerRef, contentRef, requestClose, setSide } = useTooltip('Tooltip.Content');
  const position = usePosition(triggerRef, contentRef, { side, align, offset, open });
  useTopLayer(contentRef, open);
  useDismiss(open, requestClose, [triggerRef, contentRef], { outside: false });
  useEffect(() => { setSide(position.side); }, [position.side, setSide]);
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} ref={contentRef} id={contentId} role="tooltip" popover="manual" data-state={open ? 'open' : 'closed'} data-side={position.side}
    className={cx('few-tooltip', className)} style={{ ...position.style, ...style }} />;
}

export interface TooltipArrowProps extends ComponentProps<'span'> { asChild?: boolean }
function TooltipArrow({ asChild, className, ...props }: TooltipArrowProps) {
  const { side } = useTooltip('Tooltip.Arrow');
  const Comp = asChild ? Slot : 'span';
  return <Comp {...props} aria-hidden="true" data-side={side} className={cx('few-tooltip-arrow', className)} />;
}

/** Tooltip composto: <Tooltip.Provider><Tooltip><Tooltip.Trigger/><Tooltip.Content><Tooltip.Arrow/></Tooltip.Content></Tooltip></Tooltip.Provider> */
export const Tooltip = Object.assign(TooltipRoot, { Provider: TooltipProvider, Root: TooltipRoot, Trigger: TooltipTrigger, Content: TooltipContent, Arrow: TooltipArrow });
export { TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent, TooltipArrow };
