"use client";
// Drawer: mesma base do Dialog (<dialog> nativo, showModal/close), lateral. Animação via CSS (@starting-style),
// movimento reduzido já é zerado em base.css. Ver docs/composition.md #8.
import { useEffect, useId, useRef, useState, type ComponentProps, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { createContext } from '../../lib/context.js';
import { Slot } from '../../lib/slot.js';
import { useControllableState } from '../../lib/use-controllable-state.js';
import { cx } from '../../lib/cx.js';
import { setRef } from '../../lib/compose-refs.js';

export type DrawerSide = 'left' | 'right' | 'top' | 'bottom';

interface DrawerContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  side: DrawerSide;
  titleId: string;
  descriptionId: string;
  hasDescription: boolean;
  setHasDescription: (value: boolean) => void;
  contentRef: RefObject<HTMLDialogElement | null>;
  triggerRef: RefObject<HTMLElement | null>;
}
const [DrawerProvider, useDrawer] = createContext<DrawerContextValue>('Drawer');

export interface DrawerProps { children?: ReactNode; open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; side?: DrawerSide }
/** Drawer.Root: só contexto. `side` fica no Root porque estiliza Handle e Content juntos. */
function DrawerRoot({ children, open: openProp, defaultOpen = false, onOpenChange, side = 'right' }: DrawerProps) {
  const baseId = useId();
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const [hasDescription, setHasDescription] = useState(false);
  const contentRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement>(null);
  return (
    <DrawerProvider value={{ open, setOpen, side, titleId: `${baseId}-title`, descriptionId: `${baseId}-description`, hasDescription, setHasDescription, contentRef, triggerRef }}>
      {children}
    </DrawerProvider>
  );
}

export interface DrawerTriggerProps extends ComponentProps<'button'> { asChild?: boolean }
function DrawerTrigger({ asChild, className, onClick, ...props }: DrawerTriggerProps) {
  const { open, setOpen, triggerRef } = useDrawer('Drawer.Trigger');
  const Comp = asChild ? Slot : 'button';
  return <Comp {...props} ref={(node: HTMLElement | null) => setRef(triggerRef, node)} type="button" aria-haspopup="dialog" aria-expanded={open} className={cx('few-drawer-trigger', className)}
    onClick={(event) => { onClick?.(event); if (!event.defaultPrevented) setOpen(true); }} />;
}

export interface DrawerContentProps extends Omit<ComponentProps<'dialog'>, 'onCancel' | 'onClose' | 'open'> {
  /** Tamanho via `--few-drawer-size` (largura em left/right, altura em top/bottom). Ex.: "420px", "70vh". */
  size?: string;
  dismissOnOutsideClick?: boolean;
}
/** Content não suporta asChild: depende do <dialog> nativo. */
function DrawerContent({ size, dismissOnOutsideClick = true, className, children, style, ...props }: DrawerContentProps) {
  const { open, setOpen, side, titleId, descriptionId, hasDescription, contentRef, triggerRef } = useDrawer('Drawer.Content');
  useEffect(() => {
    const dialog = contentRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open, contentRef]);
  return (
    <dialog {...props} ref={contentRef} className={cx('few-drawer', className)} data-side={side}
      style={size ? ({ ...style, '--few-drawer-size': size } as CSSProperties) : style}
      aria-labelledby={titleId} aria-describedby={hasDescription ? descriptionId : undefined}
      onCancel={(event) => { event.preventDefault(); setOpen(false); }}
      onClose={() => { setOpen(false); triggerRef.current?.focus(); }}
      onClick={(event) => { if (dismissOnOutsideClick && event.target === contentRef.current) setOpen(false); }}>
      {children}
    </dialog>
  );
}

export interface DrawerTitleProps extends ComponentProps<'h2'> { asChild?: boolean }
function DrawerTitle({ asChild, className, ...props }: DrawerTitleProps) {
  const { titleId } = useDrawer('Drawer.Title');
  const Comp = asChild ? Slot : 'h2';
  return <Comp {...props} id={titleId} className={cx('few-drawer-title', className)} />;
}

export interface DrawerDescriptionProps extends ComponentProps<'p'> { asChild?: boolean }
function DrawerDescription({ asChild, className, ...props }: DrawerDescriptionProps) {
  const { descriptionId, setHasDescription } = useDrawer('Drawer.Description');
  useEffect(() => { setHasDescription(true); return () => setHasDescription(false); }, [setHasDescription]);
  const Comp = asChild ? Slot : 'p';
  return <Comp {...props} id={descriptionId} className={cx('few-drawer-description', 'few-muted', className)} />;
}

export interface DrawerCloseProps extends ComponentProps<'button'> { asChild?: boolean }
function DrawerClose({ asChild, className, onClick, ...props }: DrawerCloseProps) {
  const { setOpen } = useDrawer('Drawer.Close');
  const Comp = asChild ? Slot : 'button';
  return <Comp {...props} type="button" className={cx('few-drawer-close', className)}
    onClick={(event) => { onClick?.(event); if (!event.defaultPrevented) setOpen(false); }} />;
}

export interface DrawerHandleProps extends ComponentProps<'div'> { asChild?: boolean }
/** Indicador visual de arrasto (decorativo), comum em drawers `side="bottom"`. */
function DrawerHandle({ asChild, className, ...props }: DrawerHandleProps) {
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} aria-hidden="true" className={cx('few-drawer-handle', className)} />;
}

/** Drawer composto: <Drawer side="right"><Drawer.Trigger/><Drawer.Content><Drawer.Handle/><Drawer.Title/><Drawer.Close/></Drawer.Content></Drawer> */
export const Drawer = Object.assign(DrawerRoot, { Root: DrawerRoot, Trigger: DrawerTrigger, Content: DrawerContent, Title: DrawerTitle, Description: DrawerDescription, Close: DrawerClose, Handle: DrawerHandle });
export { DrawerRoot, DrawerTrigger, DrawerContent, DrawerTitle, DrawerDescription, DrawerClose, DrawerHandle };
