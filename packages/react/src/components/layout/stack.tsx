"use client";
// Stack: ver docs/composition.md. Renderiza flex com gap resolvido pelo headless (@fewcompany/core).
import type { ComponentProps, CSSProperties } from 'react';
import { resolveGap, type Gap } from '@fewcompany/core';
import { Slot } from '../../lib/slot.js';
import { cx } from '../../lib/cx.js';

export type StackDirection = 'row' | 'column';
export interface StackProps extends ComponentProps<'div'> {
  asChild?: boolean;
  /** 'row' | 'column', ou responsivo: { base: 'column', md: 'row' } (troca em 768px). */
  direction?: StackDirection | { base: StackDirection; md?: StackDirection };
  /** Token da escala (1,2,3,4,6,8,12,16) ou valor CSS cru (ex.: '2rem'). */
  gap?: Gap;
  align?: CSSProperties['alignItems'];
  justify?: CSSProperties['justifyContent'];
  wrap?: boolean;
}
function Stack({ asChild, direction = 'column', gap, align, justify, wrap, style, className, ...props }: StackProps) {
  const responsive = typeof direction === 'object';
  const base = responsive ? direction.base : direction;
  const md = responsive ? direction.md : undefined;
  const Comp = asChild ? Slot : 'div';
  const vars = {
    '--few-stack-direction': base,
    ...(md ? { '--few-stack-direction-md': md } : {}),
    '--few-stack-gap': resolveGap(gap, '0px'),
  } as CSSProperties;
  return (
    <Comp
      {...props}
      className={cx('few-stack', className)}
      data-responsive={md ? '' : undefined}
      style={{ ...vars, alignItems: align, justifyContent: justify, flexWrap: wrap ? 'wrap' : undefined, ...style }}
    />
  );
}

export { Stack };
