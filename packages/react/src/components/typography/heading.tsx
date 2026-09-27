"use client";
import type { ComponentProps } from 'react';
import { Slot } from '../../lib/slot.js';
import { cx, dataAttr } from '../../lib/cx.js';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
export type HeadingWeight = 'medium' | 'semibold' | 'bold';
export type HeadingAlign = 'left' | 'center' | 'right';
export type HeadingTone = 'ink' | 'muted' | 'brand' | 'gradient';

export interface HeadingProps extends Omit<ComponentProps<'h1'>, 'color'> {
  asChild?: boolean;
  /** Define a tag renderizada (h1..h6). Não altera o tamanho visual — use `size` para isso. */
  level?: HeadingLevel;
  size?: HeadingSize;
  weight?: HeadingWeight;
  align?: HeadingAlign;
  /** Trunca em 1 linha (ellipsis). */
  truncate?: boolean;
  tone?: HeadingTone;
}

/** Heading: título semântico. `level` escolhe a tag (h1–h6); `size` escolhe a escala visual, de forma independente. */
function Heading({ asChild, level = 2, size = 'lg', weight = 'semibold', align, truncate, tone = 'ink', className, ...props }: HeadingProps) {
  const Tag = `h${level}` as const;
  const Comp = asChild ? Slot : Tag;
  return <Comp
    {...props}
    className={cx('few-heading', className)}
    data-size={size}
    data-weight={weight}
    data-align={align}
    data-truncate={dataAttr(truncate)}
    data-tone={tone}
  />;
}

export { Heading };
