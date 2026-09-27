"use client";
import type { ComponentProps } from 'react';
import type { Tone } from '@fewcompany/core';
import { Slot } from '../../lib/slot.js';
import { cx } from '../../lib/cx.js';

export type BadgeVariant = 'solid' | 'soft' | 'outline';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends ComponentProps<'span'> {
  asChild?: boolean;
  tone?: Tone;
  variant?: BadgeVariant;
  size?: BadgeSize;
  /** Bolinha antes do conteúdo (padrão dos badges de status do Caraminholas/iFIGHT). */
  dot?: boolean;
}
/** Componente simples (sem partes), como Radix Badge/Kbd: só asChild + className + data-*. */
export function Badge({ asChild, tone = 'neutral', variant = 'soft', size = 'md', dot = false, className, children, ...props }: BadgeProps) {
  const Comp = asChild ? Slot : 'span';
  return (
    <Comp
      {...props}
      className={cx('few-badge', `few-tone--${tone}`, `few-badge--${variant}`, `few-badge--${size}`, className)}
      data-tone={tone}
      data-variant={variant}
    >
      {dot && <span className="few-dot" aria-hidden="true" />}
      {children}
    </Comp>
  );
}
