"use client";
// Toast: fila de notificações efêmeras. Sem âncora/trigger — o Viewport é quem empilha (fixed, aria-live);
// Toast.Root fica dentro dele (sem Portal: evita a corrida de "container ainda null no 1º render" e mantém o tema
// herdado do contêiner). Fila (máximo visível, ordem) vem do headless: enqueueToast/dismissToast/orderToasts
// em packages/core/src/headless/overlays.ts.
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { enqueueToast, dismissToast, orderToasts, type ToastTone } from '@fewcompany/core';
import { createContext } from '../../lib/context.js';
import { Slot } from '../../lib/slot.js';
import { useControllableState } from '../../lib/use-controllable-state.js';
import { cx } from '../../lib/cx.js';

export type { ToastTone };

/** Item da fila do lado React: mais rico que o ToastRecord do headless (title/description/action podem ser nós React). */
interface ToastQueueItem { id: string; title?: ReactNode; description?: ReactNode; tone?: ToastTone; duration?: number; action?: ReactNode }

interface ToastProviderContextValue {
  duration: number;
  queue: ToastQueueItem[];
  toast: (input: { title?: ReactNode; description?: ReactNode; tone?: ToastTone; duration?: number; action?: ReactNode }) => string;
  dismiss: (id: string) => void;
}
const [ToastProviderRoot, useToastProviderContext] = createContext<ToastProviderContextValue>('Toast.Provider');

export interface ToastProviderProps {
  children?: ReactNode;
  /** Duração padrão (ms) de cada toast; Root pode sobrescrever por instância. */
  duration?: number;
  /** Reservado para paridade com Radix (direção do swipe-to-dismiss); hoje só documental (sem gesto implementado). */
  swipeDirection?: 'up' | 'down' | 'left' | 'right';
  /** Máximo de toasts visíveis simultaneamente na fila interna (usada por `useToast()`). */
  maxVisible?: number;
}
function ToastProvider({ children, duration = 5000, maxVisible = 3 }: ToastProviderProps) {
  const [queue, setQueue] = useState<ToastQueueItem[]>([]);
  const counter = useRef(0);
  const dismiss = useCallback((id: string) => setQueue(current => dismissToast(current, id)), []);
  const toast = useCallback((input: { title?: ReactNode; description?: ReactNode; tone?: ToastTone; duration?: number; action?: ReactNode }) => {
    const id = `toast-${++counter.current}`;
    setQueue(current => enqueueToast(current, { id, ...input }, maxVisible));
    return id;
  }, [maxVisible]);
  const value = useMemo<ToastProviderContextValue>(() => ({ duration, queue, toast, dismiss }), [duration, queue, toast, dismiss]);
  return <ToastProviderRoot value={value}>{children}</ToastProviderRoot>;
}

/** `toast({ title, description, tone, action })` imperativo + `dismiss(id)`. Requer <Toast.Provider>. */
function useToast() {
  const { toast, dismiss } = useToastProviderContext('useToast()');
  return { toast, dismiss };
}

export type ToastViewportPosition = 'top-right' | 'bottom-right' | 'bottom-center';
export interface ToastViewportProps extends ComponentProps<'div'> { position?: ToastViewportPosition }
/**
 * Região aria-live=polite onde os toasts aparecem. Atalho F8 foca o viewport (padrão Radix Toast).
 * Renderiza a fila de `useToast()` automaticamente; toasts compostos manualmente com `<Toast.Root>` também
 * podem ficar aqui dentro (como children) para herdar o posicionamento fixo.
 */
function ToastViewport({ position = 'bottom-right', className, children, ...props }: ToastViewportProps) {
  const { queue, duration, dismiss } = useToastProviderContext('Toast.Viewport');
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) { if (event.key === 'F8') { event.preventDefault(); ref.current?.focus(); } }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);
  return (
    <div {...props} ref={ref} role="region" aria-live="polite" aria-label="Notificações" tabIndex={-1} data-position={position} className={cx('few-toast-viewport', className)}>
      {orderToasts(queue).map(item => (
        <ToastRoot key={item.id} defaultOpen duration={item.duration ?? duration} tone={item.tone} onOpenChange={(open) => { if (!open) dismiss(item.id); }}>
          {item.title !== undefined && <ToastTitle>{item.title}</ToastTitle>}
          {item.description !== undefined && <ToastDescription>{item.description}</ToastDescription>}
          {item.action}
          <ToastClose aria-label="Fechar notificação">×</ToastClose>
        </ToastRoot>
      ))}
      {children}
    </div>
  );
}

interface ToastContextValue { open: boolean; setOpen: (open: boolean) => void }
const [ToastRootValueProvider, useToastRoot] = createContext<ToastContextValue>('Toast');

export interface ToastProps {
  children?: ReactNode;
  open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void;
  duration?: number;
  tone?: ToastTone;
  className?: string;
}
/** Toast.Root: auto-dismiss por `duration`, pausado no hover/foco. Fica dentro de um Toast.Viewport. */
function ToastRoot({ children, open: openProp, defaultOpen = false, onOpenChange, duration, tone = 'neutral', className }: ToastProps) {
  const provider = useToastProviderContext('Toast.Root');
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const [paused, setPaused] = useState(false);
  const effectiveDuration = duration ?? provider.duration;
  useEffect(() => {
    if (!open || paused || effectiveDuration === Infinity) return;
    const timer = setTimeout(() => setOpen(false), effectiveDuration);
    return () => clearTimeout(timer);
  }, [open, paused, effectiveDuration, setOpen]);
  if (!open) return null;
  return (
    <ToastRootValueProvider value={{ open, setOpen }}>
      <div role={tone === 'danger' || tone === 'warning' ? 'alert' : 'status'} data-state={open ? 'open' : 'closed'} data-tone={tone} className={cx('few-toast', `few-tone--${tone}`, className)}
        onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
        {children}
      </div>
    </ToastRootValueProvider>
  );
}

export interface ToastTitleProps extends ComponentProps<'div'> { asChild?: boolean }
function ToastTitle({ asChild, className, ...props }: ToastTitleProps) {
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} className={cx('few-toast-title', className)} />;
}

export interface ToastDescriptionProps extends ComponentProps<'div'> { asChild?: boolean }
function ToastDescription({ asChild, className, ...props }: ToastDescriptionProps) {
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} className={cx('few-toast-description', 'few-muted', className)} />;
}

export interface ToastActionProps extends ComponentProps<'button'> {
  asChild?: boolean;
  /** Texto alternativo para leitores de tela, quando o rótulo visível não é suficiente (ex.: ação com ícone). */
  altText?: string;
}
function ToastAction({ asChild, altText, className, ...props }: ToastActionProps) {
  const Comp = asChild ? Slot : 'button';
  return <Comp {...props} type="button" aria-label={altText} className={cx('few-toast-action', className)} />;
}

export interface ToastCloseProps extends ComponentProps<'button'> { asChild?: boolean }
function ToastClose({ asChild, className, onClick, ...props }: ToastCloseProps) {
  const { setOpen } = useToastRoot('Toast.Close');
  const Comp = asChild ? Slot : 'button';
  return <Comp {...props} type="button" className={cx('few-toast-close', className)}
    onClick={(event) => { onClick?.(event); if (!event.defaultPrevented) setOpen(false); }} />;
}

/** Toast composto: <Toast.Provider><Toast.Viewport/></Toast.Provider>; use `useToast()` para disparar, ou componha <Toast.Root> manualmente dentro do Viewport. */
export const Toast = Object.assign(ToastRoot, { Provider: ToastProvider, Viewport: ToastViewport, Root: ToastRoot, Title: ToastTitle, Description: ToastDescription, Action: ToastAction, Close: ToastClose });
export { ToastProvider, ToastViewport, ToastRoot, ToastTitle, ToastDescription, ToastAction, ToastClose, useToast };
