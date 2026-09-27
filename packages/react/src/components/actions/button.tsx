"use client";
import type { ComponentProps } from 'react';
import type { Size } from '@fewcompany/core';
import { Slot, Slottable } from '../../lib/slot.js';
import { cx, dataAttr } from '../../lib/cx.js';
import { useButtonGroupOptionalContext } from './button-group.js';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link';

export interface ButtonProps extends ComponentProps<'button'> {
  asChild?: boolean;
  variant?: ButtonVariant;
  size?: Size;
  /** Mostra spinner, marca aria-busy e desabilita o botão. Com asChild, o spinner envolve `children` no elemento filho. */
  loading?: boolean;
}

/** Botão simples (sem partes). `<Button variant="primary">Salvar</Button>` ou `<Button asChild><Link href="/">Ir</Link></Button>`. */
export function Button({ asChild, variant, size, loading = false, disabled, className, type = 'button', children, ...props }: ButtonProps) {
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
      className={cx('few-button', `few-button--${resolvedVariant}`, `few-button--${resolvedSize}`, className)}
    >
      {loading && <span className="few-spinner" aria-hidden="true" />}
      <Slottable>{children}</Slottable>
    </Comp>
  );
}
