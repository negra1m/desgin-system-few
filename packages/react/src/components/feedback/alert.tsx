"use client";
import type { ComponentProps } from 'react';
import type { Tone } from '@fewcompany/core';
import { Slot } from '../../lib/slot.js';
import { createContext } from '../../lib/context.js';
import { cx } from '../../lib/cx.js';

export type AlertVariant = 'soft' | 'outline';
interface AlertContextValue { tone: Tone; variant: AlertVariant }
const [AlertProvider, useAlert] = createContext<AlertContextValue>('Alert');

const DEFAULT_ICON: Record<Tone, string> = { neutral: '•', success: '✓', warning: '!', danger: '!', info: 'i' };

export interface AlertProps extends ComponentProps<'div'> {
  asChild?: boolean;
  tone?: Tone;
  /** soft: fundo tintado. outline: só borda colorida. */
  variant?: AlertVariant;
}
function AlertRoot({ asChild, tone = 'info', variant = 'soft', className, ...props }: AlertProps) {
  const Comp = asChild ? Slot : 'div';
  return (
    <AlertProvider value={{ tone, variant }}>
      <Comp
        {...props}
        role={tone === 'danger' ? 'alert' : 'status'}
        className={cx('few-alert', `few-tone--${tone}`, `few-alert--${variant}`, className)}
        data-tone={tone}
        data-variant={variant}
      />
    </AlertProvider>
  );
}

export interface AlertIconProps extends ComponentProps<'span'> { asChild?: boolean }
function AlertIcon({ asChild, className, children, ...props }: AlertIconProps) {
  const { tone } = useAlert('Alert.Icon');
  const Comp = asChild ? Slot : 'span';
  return <Comp {...props} aria-hidden="true" className={cx('few-alert-icon', className)}>{children ?? DEFAULT_ICON[tone]}</Comp>;
}

export interface AlertTitleProps extends ComponentProps<'strong'> { asChild?: boolean }
function AlertTitle({ asChild, className, ...props }: AlertTitleProps) {
  const Comp = asChild ? Slot : 'strong';
  return <Comp {...props} className={cx('few-alert-title', className)} />;
}

export interface AlertDescriptionProps extends ComponentProps<'div'> { asChild?: boolean }
function AlertDescription({ asChild, className, ...props }: AlertDescriptionProps) {
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} className={cx('few-alert-description', className)} />;
}

export interface AlertActionProps extends ComponentProps<'div'> { asChild?: boolean }
function AlertAction({ asChild, className, ...props }: AlertActionProps) {
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} className={cx('few-alert-action', className)} />;
}

export interface AlertCloseProps extends ComponentProps<'button'> { asChild?: boolean; onDismiss?: () => void }
function AlertClose({ asChild, className, children, onClick, onDismiss, 'aria-label': ariaLabel = 'Fechar', ...props }: AlertCloseProps) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      {...props}
      type="button"
      aria-label={ariaLabel}
      className={cx('few-alert-close', className)}
      onClick={(event) => { onClick?.(event); if (!event.defaultPrevented) onDismiss?.(); }}
    >
      {children ?? <span aria-hidden="true">×</span>}
    </Comp>
  );
}

/** Alert composto: <Alert tone="success"><Alert.Icon /><Alert.Title>Ok</Alert.Title><Alert.Description>…</Alert.Description><Alert.Close onDismiss={...} /></Alert> */
export const Alert = Object.assign(AlertRoot, { Root: AlertRoot, Icon: AlertIcon, Title: AlertTitle, Description: AlertDescription, Action: AlertAction, Close: AlertClose });
export { AlertRoot, AlertIcon, AlertTitle, AlertDescription, AlertAction, AlertClose };
