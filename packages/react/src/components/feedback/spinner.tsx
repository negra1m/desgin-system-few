"use client";
import type { ComponentProps } from 'react';
import type { Tone, Size } from '@fewcompany/core';
import { Slot } from '../../lib/slot.js';
import { VisuallyHidden } from '../../lib/visually-hidden.js';
import { cx } from '../../lib/cx.js';

export interface SpinnerProps extends ComponentProps<'span'> {
  asChild?: boolean;
  size?: Size;
  tone?: Tone;
  /** Texto sr-only anunciado pelo leitor de tela. */
  label?: string;
}
/** Componente simples: <Spinner label="Carregando pedidos" />. role="status" já anuncia o label sr-only. */
export function Spinner({ asChild, size = 'md', tone = 'neutral', label = 'Carregando', className, ...props }: SpinnerProps) {
  const Comp = asChild ? Slot : 'span';
  return (
    <Comp {...props} role="status" className={cx('few-spinner-root', `few-spinner-root--${size}`, `few-tone--${tone}`, className)}>
      <span className="few-spinner" aria-hidden="true" />
      <VisuallyHidden>{label}</VisuallyHidden>
    </Comp>
  );
}
