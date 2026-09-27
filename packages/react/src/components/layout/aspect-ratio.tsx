"use client";
// AspectRatio: ver docs/composition.md. Padrão Radix: wrapper externo fixo (padding-bottom) + conteúdo absoluto asChild-ável.
import type { ComponentProps, CSSProperties } from 'react';
import { Slot } from '../../lib/slot.js';
import { cx } from '../../lib/cx.js';

export interface AspectRatioProps extends ComponentProps<'div'> {
  asChild?: boolean;
  /** Largura / altura. Padrão 16/9. */
  ratio?: number;
}
function AspectRatio({ asChild, ratio = 16 / 9, style, className, children, ...props }: AspectRatioProps) {
  const Comp = asChild ? Slot : 'div';
  return (
    <div className="few-aspect-ratio" style={{ position: 'relative', width: '100%', paddingBottom: `${100 / ratio}%` }}>
      <Comp {...props} className={cx('few-aspect-ratio-content', className)} style={{ ...style, position: 'absolute', inset: 0 } as CSSProperties}>
        {children}
      </Comp>
    </div>
  );
}

export { AspectRatio };
