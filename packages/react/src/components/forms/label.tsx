"use client";
import type { ComponentProps } from 'react';
import { Slot, Slottable } from '../../lib/slot.js';
import { cx } from '../../lib/cx.js';

export interface LabelProps extends ComponentProps<'label'> {
  asChild?: boolean;
  /** Mostra um indicador (*) de campo obrigatório ao lado do texto. */
  required?: boolean;
}
/** Label nativo com asChild. Uso solto (htmlFor manual) ou via Field.Label (htmlFor automático). */
function LabelRoot({ asChild, required, className, children, ...props }: LabelProps) {
  const Comp = asChild ? Slot : 'label';
  return (
    <Comp {...props} className={cx('few-form-label', className)}>
      <Slottable>{children}</Slottable>
      {required && <span className="few-form-label-required" aria-hidden="true"> *</span>}
    </Comp>
  );
}

export const Label = Object.assign(LabelRoot, { Root: LabelRoot });
export { LabelRoot };
