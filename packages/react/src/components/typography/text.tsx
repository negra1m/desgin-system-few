"use client";
import type { ComponentProps, CSSProperties } from 'react';
import { Slot } from '../../lib/slot.js';
import { cx, dataAttr } from '../../lib/cx.js';

export type TextAs = 'p' | 'span' | 'div' | 'label';
export type TextSize = 'xs' | 'sm' | 'md' | 'lg';
export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';
export type TextAlign = 'left' | 'center' | 'right';
export type TextTone = 'ink' | 'muted' | 'brand' | 'success' | 'warning' | 'danger' | 'info';

export interface TextProps extends Omit<ComponentProps<'span'>, 'color' | 'ref'> {
  asChild?: boolean;
  /** Tag renderizada. Padrão span. */
  as?: TextAs;
  size?: TextSize;
  weight?: TextWeight;
  tone?: TextTone;
  align?: TextAlign;
  /** Trunca em 1 linha (ellipsis). Ignorado quando `lineClamp` é informado. */
  truncate?: boolean;
  /** Trunca em N linhas via -webkit-line-clamp. */
  lineClamp?: number;
  /** font-variant-numeric: tabular-nums, para alinhar números em coluna/tabela. */
  tabular?: boolean;
}

/** Text: texto de corpo com tag flexível (`as`), truncamento por linha ou por N linhas, e tom semântico. */
function Text({ asChild, as = 'span', size = 'md', weight = 'regular', tone = 'ink', align, truncate, lineClamp, tabular, className, style, ...props }: TextProps) {
  const Comp = asChild ? Slot : as;
  const clamped = typeof lineClamp === 'number' && lineClamp > 0;
  const mergedStyle: CSSProperties | undefined = clamped
    ? ({ ...style, '--few-line-clamp': lineClamp } as CSSProperties)
    : style;
  return <Comp
    {...props}
    className={cx('few-text', className)}
    data-size={size}
    data-weight={weight}
    data-tone={tone}
    data-align={align}
    data-truncate={dataAttr(truncate && !clamped)}
    data-clamp={dataAttr(clamped)}
    data-tabular={dataAttr(tabular)}
    style={mergedStyle}
  />;
}

export { Text };
