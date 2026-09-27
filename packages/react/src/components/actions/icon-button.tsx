"use client";
import type { ComponentProps } from 'react';
import type { Size } from '@fewcompany/core';
import { Slot, Slottable } from '../../lib/slot.js';
import { cx, dataAttr } from '../../lib/cx.js';
import type { ButtonVariant } from './button.js';
import { useButtonGroupOptionalContext } from './button-group.js';

export interface IconButtonProps extends ComponentProps<'button'> {
  asChild?: boolean;
  variant?: ButtonVariant;
  size?: Size;
  shape?: 'round' | 'square';
  loading?: boolean;
  /** Obrigatório: o botão só tem ícone, o rótulo acessível vem daqui. */
  'aria-label': string;
}

/** Botão só com ícone. `aria-label` é obrigatório porque não há texto visível. */
export function IconButton({ asChild, variant, size, shape = 'round', loading = false, disabled, className, type = 'button', children, ...props }: IconButtonProps) {
  const group = useButtonGroupOptionalContext();
  const resolvedVariant = variant ?? group?.variant ?? 'primary';
  const resolvedSize = size ?? group?.size ?? 'md';
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-loading={dataAttr(loading)}
      className={cx('few-icon-button', `few-icon-button--${resolvedVariant}`, `few-icon-button--${resolvedSize}`, `few-icon-button--${shape}`, className)}
    >
      <Slottable>{loading ? <span className="few-spinner" aria-hidden="true" /> : children}</Slottable>
    </Comp>
  );
}
