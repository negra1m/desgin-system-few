"use client";
// Separator: ver docs/composition.md. Componente simples (sem contexto), como Badge/Kbd.
import type { ComponentProps, ReactNode } from 'react';
import type { Orientation } from '@fewcompany/core';
import { Slot } from '../../lib/slot.js';
import { cx } from '../../lib/cx.js';

export interface SeparatorProps extends ComponentProps<'div'> {
  asChild?: boolean;
  orientation?: Orientation;
  /** Puramente visual (role="none"): use quando já existe separação semântica por outro elemento (ex.: <hr> dentro de <ul>). */
  decorative?: boolean;
  /** Rótulo centralizado (ex.: "ou"). Quando presente, ignora `asChild` — a estrutura vira linha+rótulo+linha. */
  label?: ReactNode;
}
function Separator({ asChild, orientation = 'horizontal', decorative = false, label, className, ...props }: SeparatorProps) {
  const a11yProps = decorative
    ? { role: 'none' as const }
    : { role: 'separator' as const, 'aria-orientation': orientation === 'vertical' ? ('vertical' as const) : undefined };
  if (label !== undefined) {
    return (
      <div {...props} className={cx('few-separator few-separator-labeled', className)} data-orientation={orientation} {...a11yProps}>
        <span className="few-separator-line" aria-hidden="true" />
        <span className="few-separator-label">{label}</span>
        <span className="few-separator-line" aria-hidden="true" />
      </div>
    );
  }
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} className={cx('few-separator', className)} data-orientation={orientation} {...a11yProps} />;
}

export { Separator };
