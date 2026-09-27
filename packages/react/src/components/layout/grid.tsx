"use client";
// Grid: ver docs/composition.md. grid-template-columns/span resolvidos pelo headless (@fewcompany/core).
import type { ComponentProps, CSSProperties } from 'react';
import { resolveGap, resolveGridColumns, resolveGridSpan, type Gap, type GridColumns } from '@fewcompany/core';
import { Slot } from '../../lib/slot.js';
import { cx } from '../../lib/cx.js';

export interface GridProps extends ComponentProps<'div'> {
  asChild?: boolean;
  /** Número de colunas iguais, ou 'auto' (usa `minChildWidth` com minmax/auto-fit). Padrão 'auto'. */
  columns?: GridColumns;
  minChildWidth?: string;
  gap?: Gap;
  rowGap?: Gap;
  align?: CSSProperties['alignItems'];
}
function GridRoot({ asChild, columns = 'auto', minChildWidth = '200px', gap, rowGap, align, style, className, ...props }: GridProps) {
  const Comp = asChild ? Slot : 'div';
  return (
    <Comp
      {...props}
      className={cx('few-grid', className)}
      style={{
        gridTemplateColumns: resolveGridColumns(columns, minChildWidth),
        gap: resolveGap(gap, '0px'),
        rowGap: rowGap !== undefined ? resolveGap(rowGap) : undefined,
        alignItems: align,
        ...style,
      }}
    />
  );
}

export interface GridItemProps extends ComponentProps<'div'> { asChild?: boolean; colSpan?: number; rowSpan?: number }
function GridItem({ asChild, colSpan, rowSpan, style, className, ...props }: GridItemProps) {
  const Comp = asChild ? Slot : 'div';
  return (
    <Comp
      {...props}
      className={cx('few-grid-item', className)}
      style={{ gridColumn: resolveGridSpan(colSpan), gridRow: resolveGridSpan(rowSpan), ...style }}
    />
  );
}

/** Grid composto: <Grid columns="auto" minChildWidth="220px" gap={4}><Grid.Item colSpan={2}>…</Grid.Item></Grid> */
export const Grid = Object.assign(GridRoot, { Root: GridRoot, Item: GridItem });
export { GridRoot, GridItem };
