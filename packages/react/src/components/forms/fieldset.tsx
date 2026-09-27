"use client";
import type { ComponentProps } from 'react';
import { Slot } from '../../lib/slot.js';
import { cx } from '../../lib/cx.js';

export interface FieldsetProps extends ComponentProps<'fieldset'> { asChild?: boolean }
/** disabled em fieldset nativo já propaga para todos os controles descendentes. */
function FieldsetRoot({ asChild, className, ...props }: FieldsetProps) {
  const Comp = asChild ? Slot : 'fieldset';
  return <Comp {...props} className={cx('few-fieldset', className)} />;
}

export interface FieldsetLegendProps extends ComponentProps<'legend'> { asChild?: boolean }
function FieldsetLegend({ asChild, className, ...props }: FieldsetLegendProps) {
  const Comp = asChild ? Slot : 'legend';
  return <Comp {...props} className={cx('few-fieldset-legend', className)} />;
}

export const Fieldset = Object.assign(FieldsetRoot, { Root: FieldsetRoot, Legend: FieldsetLegend });
export { FieldsetRoot, FieldsetLegend };
