"use client";
import type { ComponentProps } from 'react';
import { Slot } from './slot.js';
import { cx } from './cx.js';

export interface VisuallyHiddenProps extends ComponentProps<'span'> { asChild?: boolean }
/** Conteúdo só para leitores de tela. */
export function VisuallyHidden({ asChild, className, ...props }: VisuallyHiddenProps) {
  const Comp = asChild ? Slot : 'span';
  return <Comp {...props} className={cx('few-sr-only', className)} />;
}
