"use client";
import { useId, useLayoutEffect, useRef, type ComponentProps, type KeyboardEvent, type MouseEvent, type RefObject } from 'react';
import type { Size } from '@fewcompany/core';
import { Slot, Slottable } from '../../lib/slot.js';
import { createContext } from '../../lib/context.js';
import { useControllableState } from '../../lib/use-controllable-state.js';
import { cx, dataAttr } from '../../lib/cx.js';
import { moveFocus, focusableItems } from '../../lib/roving.js';
import { usePosition } from '../../lib/use-position.js';
import { useTopLayer } from '../../lib/use-top-layer.js';
import { useDismiss } from '../../lib/use-dismiss.js';
import type { ButtonVariant } from './button.js';

interface SplitButtonContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
  baseId: string;
  variant: ButtonVariant;
  size: Size;
}
const [SplitButtonProvider, useSplitButton] = createContext<SplitButtonContextValue>('SplitButton');

export interface SplitButtonProps extends ComponentProps<'div'> {
  asChild?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  variant?: ButtonVariant;
  size?: Size;
}
function SplitButtonRoot({ asChild, open: openProp, defaultOpen = false, onOpenChange, variant = 'primary', size = 'md', className, ...props }: SplitButtonProps) {
  const baseId = useId();
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  useDismiss(open, () => setOpen(false), [triggerRef, contentRef]);
  const Comp = asChild ? Slot : 'div';
  return (
    <SplitButtonProvider value={{ open, setOpen, triggerRef, contentRef, baseId, variant, size }}>
      <Comp {...props} className={cx('few-split-button', className)} data-state={open ? 'open' : 'closed'} />
    </SplitButtonProvider>
  );
}

export interface SplitButtonActionProps extends ComponentProps<'button'> { asChild?: boolean; loading?: boolean }
function SplitButtonAction({ asChild, loading = false, disabled, className, type = 'button', children, ...props }: SplitButtonActionProps) {
  const { variant, size } = useSplitButton('SplitButton.Action');
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx('few-split-button-action', `few-split-button-action--${variant}`, `few-split-button-action--${size}`, className)}
    >
      {loading && <span className="few-spinner" aria-hidden="true" />}
      <Slottable>{children}</Slottable>
    </Comp>
  );
}

export interface SplitButtonTriggerProps extends ComponentProps<'button'> { asChild?: boolean }
function SplitButtonTrigger({ asChild, className, 'aria-label': ariaLabel = 'Mais ações', onClick, onKeyDown, ...props }: SplitButtonTriggerProps) {
  const { open, setOpen, triggerRef, baseId, variant, size } = useSplitButton('SplitButton.Trigger');
  const Comp = asChild ? Slot : 'button';
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    setOpen(!open);
  }
  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setOpen(true); }
  }
  return (
    <Comp
      {...props}
      ref={triggerRef}
      type="button"
      aria-label={ariaLabel}
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={`${baseId}-menu`}
      data-state={open ? 'open' : 'closed'}
      className={cx('few-split-button-trigger', `few-split-button-trigger--${variant}`, `few-split-button-trigger--${size}`, className)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <span aria-hidden="true" className="few-split-button-caret" />
    </Comp>
  );
}

export interface SplitButtonContentProps extends ComponentProps<'div'> { asChild?: boolean }
function SplitButtonContent({ asChild, className, onKeyDown, children, ...props }: SplitButtonContentProps) {
  const { open, setOpen, triggerRef, contentRef, baseId } = useSplitButton('SplitButton.Content');
  const position = usePosition(triggerRef, contentRef, { side: 'bottom', align: 'end', open });
  useTopLayer(contentRef, open);

  useLayoutEffect(() => {
    if (!open) return;
    focusableItems(contentRef.current, '[role="menuitem"]')[0]?.focus();
  }, [open]);

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); return; }
    const target = moveFocus(contentRef.current, '[role="menuitem"]', event.key, { orientation: 'vertical' });
    if (target) event.preventDefault();
  }

  const Comp = asChild ? Slot : 'div';
  return (
    <Comp
      {...props}
      ref={contentRef}
      id={`${baseId}-menu`}
      role="menu"
      popover="manual"
      style={position.style}
      data-side={position.side}
      className={cx('few-split-button-content', className)}
      onKeyDown={handleKeyDown}
    >
      {children}
    </Comp>
  );
}

export interface SplitButtonItemProps extends ComponentProps<'button'> { asChild?: boolean }
function SplitButtonItem({ asChild, className, disabled, onClick, ...props }: SplitButtonItemProps) {
  const { setOpen, triggerRef } = useSplitButton('SplitButton.Item');
  const Comp = asChild ? Slot : 'button';
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (event.defaultPrevented || disabled) return;
    setOpen(false);
    triggerRef.current?.focus();
  }
  return (
    <Comp
      {...props}
      type={asChild ? undefined : 'button'}
      role="menuitem"
      tabIndex={-1}
      disabled={disabled}
      data-disabled={dataAttr(disabled)}
      className={cx('few-split-button-item', className)}
      onClick={handleClick}
    />
  );
}

/**
 * Ação principal + gatilho que abre uma lista de ações secundárias (role=menu).
 * `<SplitButton><SplitButton.Action>Salvar</SplitButton.Action><SplitButton.Trigger /><SplitButton.Content><SplitButton.Item>…</SplitButton.Item></SplitButton.Content></SplitButton>`
 * Foco volta ao Trigger ao fechar por Escape ou seleção de item.
 */
export const SplitButton = Object.assign(SplitButtonRoot, { Root: SplitButtonRoot, Action: SplitButtonAction, Trigger: SplitButtonTrigger, Content: SplitButtonContent, Item: SplitButtonItem });
export { SplitButtonRoot, SplitButtonAction, SplitButtonTrigger, SplitButtonContent, SplitButtonItem };
