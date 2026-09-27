"use client";
import type { ComponentProps } from 'react';
import type { Size } from '@fewcompany/core';
import { cx, dataAttr } from '../../lib/cx.js';

export interface InputProps extends Omit<ComponentProps<'input'>, 'size'> { size?: Size; invalid?: boolean }
/** Input nativo. Sem asChild: é sempre um <input> real. */
export function Input({ size = 'md', invalid, className, 'aria-invalid': ariaInvalid, ...props }: InputProps) {
  const isInvalid = Boolean(invalid || (ariaInvalid && ariaInvalid !== 'false'));
  return (
    <input
      {...props}
      className={cx('few-input', `few-input--${size}`, className)}
      aria-invalid={isInvalid || undefined}
      data-invalid={dataAttr(isInvalid)}
    />
  );
}
