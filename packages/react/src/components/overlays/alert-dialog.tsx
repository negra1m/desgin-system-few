"use client";
// AlertDialog: mesma base do Dialog (<dialog> nativo), mas role=alertdialog, sem fechar no clique fora,
// Cancel/Action em vez de Close, foco inicial no Cancel (autofocus nativo, ver docs/composition.md #8).
import { useEffect, useId, useRef, useState, type ComponentProps, type ReactNode, type RefObject } from 'react';
import { createContext } from '../../lib/context.js';
import { Slot } from '../../lib/slot.js';
import { useControllableState } from '../../lib/use-controllable-state.js';
import { cx } from '../../lib/cx.js';
import { setRef } from '../../lib/compose-refs.js';

interface AlertDialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
  hasDescription: boolean;
  setHasDescription: (value: boolean) => void;
  contentRef: RefObject<HTMLDialogElement | null>;
  triggerRef: RefObject<HTMLElement | null>;
}
const [AlertDialogProvider, useAlertDialog] = createContext<AlertDialogContextValue>('AlertDialog');

export interface AlertDialogProps { children?: ReactNode; open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void }
/** AlertDialog.Root: só contexto (sempre modal, sem fechar fora). */
function AlertDialogRoot({ children, open: openProp, defaultOpen = false, onOpenChange }: AlertDialogProps) {
  const baseId = useId();
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const [hasDescription, setHasDescription] = useState(false);
  const contentRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement>(null);
  return (
    <AlertDialogProvider value={{ open, setOpen, titleId: `${baseId}-title`, descriptionId: `${baseId}-description`, hasDescription, setHasDescription, contentRef, triggerRef }}>
      {children}
    </AlertDialogProvider>
  );
}

export interface AlertDialogTriggerProps extends ComponentProps<'button'> { asChild?: boolean }
function AlertDialogTrigger({ asChild, className, onClick, ...props }: AlertDialogTriggerProps) {
  const { open, setOpen, triggerRef } = useAlertDialog('AlertDialog.Trigger');
  const Comp = asChild ? Slot : 'button';
  return <Comp {...props} ref={(node: HTMLElement | null) => setRef(triggerRef, node)} type="button" aria-haspopup="dialog" aria-expanded={open} className={cx('few-alert-dialog-trigger', className)}
    onClick={(event) => { onClick?.(event); if (!event.defaultPrevented) setOpen(true); }} />;
}

export interface AlertDialogContentProps extends Omit<ComponentProps<'dialog'>, 'onCancel' | 'onClose' | 'open'> {}
/** Content não suporta asChild: depende do <dialog> nativo. Sem fechar no clique fora — só Cancel/Action/Escape. */
function AlertDialogContent({ className, children, ...props }: AlertDialogContentProps) {
  const { open, setOpen, titleId, descriptionId, hasDescription, contentRef, triggerRef } = useAlertDialog('AlertDialog.Content');
  useEffect(() => {
    const dialog = contentRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open, contentRef]);
  return (
    <dialog {...props} ref={contentRef} role="alertdialog" className={cx('few-alert-dialog', className)}
      aria-labelledby={titleId} aria-describedby={hasDescription ? descriptionId : undefined}
      onCancel={(event) => { event.preventDefault(); setOpen(false); }}
      onClose={() => { setOpen(false); triggerRef.current?.focus(); }}>
      {children}
    </dialog>
  );
}

export interface AlertDialogTitleProps extends ComponentProps<'h2'> { asChild?: boolean }
function AlertDialogTitle({ asChild, className, ...props }: AlertDialogTitleProps) {
  const { titleId } = useAlertDialog('AlertDialog.Title');
  const Comp = asChild ? Slot : 'h2';
  return <Comp {...props} id={titleId} className={cx('few-alert-dialog-title', className)} />;
}

export interface AlertDialogDescriptionProps extends ComponentProps<'p'> { asChild?: boolean }
function AlertDialogDescription({ asChild, className, ...props }: AlertDialogDescriptionProps) {
  const { descriptionId, setHasDescription } = useAlertDialog('AlertDialog.Description');
  useEffect(() => { setHasDescription(true); return () => setHasDescription(false); }, [setHasDescription]);
  const Comp = asChild ? Slot : 'p';
  return <Comp {...props} id={descriptionId} className={cx('few-alert-dialog-description', 'few-muted', className)} />;
}

export interface AlertDialogCancelProps extends ComponentProps<'button'> { asChild?: boolean }
/** Recebe o foco inicial (autofocus nativo lido pelo showModal() a cada abertura). */
function AlertDialogCancel({ asChild, className, onClick, ...props }: AlertDialogCancelProps) {
  const { setOpen } = useAlertDialog('AlertDialog.Cancel');
  const Comp = asChild ? Slot : 'button';
  return <Comp {...props} type="button" autoFocus className={cx('few-alert-dialog-cancel', className)}
    onClick={(event) => { onClick?.(event); if (!event.defaultPrevented) setOpen(false); }} />;
}

export interface AlertDialogActionProps extends ComponentProps<'button'> { asChild?: boolean }
/** Ação principal: executa o onClick do consumidor e fecha o diálogo (como Radix, que embrulha Close). */
function AlertDialogAction({ asChild, className, onClick, ...props }: AlertDialogActionProps) {
  const { setOpen } = useAlertDialog('AlertDialog.Action');
  const Comp = asChild ? Slot : 'button';
  return <Comp {...props} type="button" className={cx('few-alert-dialog-action', className)}
    onClick={(event) => { onClick?.(event); if (!event.defaultPrevented) setOpen(false); }} />;
}

/** AlertDialog composto: <AlertDialog><AlertDialog.Trigger/><AlertDialog.Content><AlertDialog.Title/><AlertDialog.Cancel/><AlertDialog.Action/></AlertDialog.Content></AlertDialog> */
export const AlertDialog = Object.assign(AlertDialogRoot, { Root: AlertDialogRoot, Trigger: AlertDialogTrigger, Content: AlertDialogContent, Title: AlertDialogTitle, Description: AlertDialogDescription, Cancel: AlertDialogCancel, Action: AlertDialogAction });
export { AlertDialogRoot, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction };
