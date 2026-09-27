"use client";
// Dialog modal, sobre <dialog> nativo (ver docs/composition.md #8). Migra o Dialog de packages/ui/src/index.tsx (git show HEAD).
import { useEffect, useId, useRef, useState, type ComponentProps, type ReactNode, type RefObject } from 'react';
import { createContext } from '../../lib/context.js';
import { Slot } from '../../lib/slot.js';
import { useControllableState } from '../../lib/use-controllable-state.js';
import { cx } from '../../lib/cx.js';
import { setRef } from '../../lib/compose-refs.js';

export type DialogSize = 'sm' | 'md' | 'lg' | 'full';

interface DialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
  hasDescription: boolean;
  setHasDescription: (value: boolean) => void;
  contentRef: RefObject<HTMLDialogElement | null>;
  triggerRef: RefObject<HTMLElement | null>;
}
const [DialogProvider, useDialog] = createContext<DialogContextValue>('Dialog');

export interface DialogProps {
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Reservado para paridade com Radix; o Dialog do Few é sempre modal (usa showModal()). */
  modal?: true;
}
/** Dialog.Root: só contexto, não renderiza elemento (Trigger e Content ficam em pontos diferentes da árvore). */
function DialogRoot({ children, open: openProp, defaultOpen = false, onOpenChange }: DialogProps) {
  const baseId = useId();
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const [hasDescription, setHasDescription] = useState(false);
  const contentRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement>(null);
  return (
    <DialogProvider value={{ open, setOpen, titleId: `${baseId}-title`, descriptionId: `${baseId}-description`, hasDescription, setHasDescription, contentRef, triggerRef }}>
      {children}
    </DialogProvider>
  );
}

export interface DialogTriggerProps extends ComponentProps<'button'> { asChild?: boolean }
function DialogTrigger({ asChild, className, onClick, ...props }: DialogTriggerProps) {
  const { open, setOpen, triggerRef } = useDialog('Dialog.Trigger');
  const Comp = asChild ? Slot : 'button';
  return <Comp {...props} ref={(node: HTMLElement | null) => setRef(triggerRef, node)} type="button" aria-haspopup="dialog" aria-expanded={open} className={cx('few-dialog-trigger', className)}
    onClick={(event) => { onClick?.(event); if (!event.defaultPrevented) setOpen(true); }} />;
}

export interface DialogContentProps extends Omit<ComponentProps<'dialog'>, 'onCancel' | 'onClose' | 'open'> {
  size?: DialogSize;
  /** Fecha ao clicar fora do conteúdo (na ::backdrop). Padrão true; AlertDialog usa false. */
  dismissOnOutsideClick?: boolean;
}
/** Content não suporta asChild: depende do elemento <dialog> nativo (showModal, ::backdrop, focus trap, foco inicial). */
function DialogContent({ size = 'md', dismissOnOutsideClick = true, className, children, ...props }: DialogContentProps) {
  const { open, setOpen, titleId, descriptionId, hasDescription, contentRef, triggerRef } = useDialog('Dialog.Content');
  useEffect(() => {
    const dialog = contentRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open, contentRef]);
  return (
    <dialog {...props} ref={contentRef} className={cx('few-dialog', className)} data-size={size}
      aria-labelledby={titleId} aria-describedby={hasDescription ? descriptionId : undefined}
      onCancel={(event) => { event.preventDefault(); setOpen(false); }}
      onClose={() => { setOpen(false); triggerRef.current?.focus(); }}
      onClick={(event) => { if (dismissOnOutsideClick && event.target === contentRef.current) setOpen(false); }}>
      {children}
    </dialog>
  );
}

export interface DialogTitleProps extends ComponentProps<'h2'> { asChild?: boolean }
function DialogTitle({ asChild, className, ...props }: DialogTitleProps) {
  const { titleId } = useDialog('Dialog.Title');
  const Comp = asChild ? Slot : 'h2';
  return <Comp {...props} id={titleId} className={cx('few-dialog-title', className)} />;
}

export interface DialogDescriptionProps extends ComponentProps<'p'> { asChild?: boolean }
function DialogDescription({ asChild, className, ...props }: DialogDescriptionProps) {
  const { descriptionId, setHasDescription } = useDialog('Dialog.Description');
  useEffect(() => { setHasDescription(true); return () => setHasDescription(false); }, [setHasDescription]);
  const Comp = asChild ? Slot : 'p';
  return <Comp {...props} id={descriptionId} className={cx('few-dialog-description', 'few-muted', className)} />;
}

export interface DialogCloseProps extends ComponentProps<'button'> { asChild?: boolean }
function DialogClose({ asChild, className, onClick, ...props }: DialogCloseProps) {
  const { setOpen } = useDialog('Dialog.Close');
  const Comp = asChild ? Slot : 'button';
  return <Comp {...props} type="button" className={cx('few-dialog-close', className)}
    onClick={(event) => { onClick?.(event); if (!event.defaultPrevented) setOpen(false); }} />;
}

/** Dialog composto: <Dialog><Dialog.Trigger/><Dialog.Content><Dialog.Title/><Dialog.Description/><Dialog.Close/></Dialog.Content></Dialog> */
export const Dialog = Object.assign(DialogRoot, { Root: DialogRoot, Trigger: DialogTrigger, Content: DialogContent, Title: DialogTitle, Description: DialogDescription, Close: DialogClose });
export { DialogRoot, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose };
