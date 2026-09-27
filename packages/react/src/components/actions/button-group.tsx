"use client";
import type { ComponentProps } from 'react';
import type { Orientation, Size } from '@fewcompany/core';
import { Slot } from '../../lib/slot.js';
import { createContext } from '../../lib/context.js';
import { cx, dataAttr } from '../../lib/cx.js';
import type { ButtonVariant } from './button.js';

interface ButtonGroupContextValue { variant?: ButtonVariant; size?: Size }
const [ButtonGroupProvider, , useButtonGroupOptionalContext] = createContext<ButtonGroupContextValue>('ButtonGroup');
export { useButtonGroupOptionalContext };

export interface ButtonGroupProps extends ComponentProps<'div'> {
  asChild?: boolean;
  orientation?: Orientation;
  /** Cola as bordas dos botões (radius só nas pontas). Padrão true. */
  attached?: boolean;
  /** Propagado por contexto para Button/IconButton filhos que não definem o próprio size. */
  size?: Size;
  /** Propagado por contexto para Button/IconButton filhos que não definem a própria variant. */
  variant?: ButtonVariant;
}

function ButtonGroupRoot({ asChild, orientation = 'horizontal', attached = true, size, variant, className, ...props }: ButtonGroupProps) {
  const Comp = asChild ? Slot : 'div';
  return (
    <ButtonGroupProvider value={{ variant, size }}>
      <Comp
        {...props}
        role="group"
        className={cx('few-button-group', className)}
        data-orientation={orientation}
        data-attached={dataAttr(attached)}
      />
    </ButtonGroupProvider>
  );
}

/** Agrupa Button/IconButton com bordas coladas. `<ButtonGroup><Button>Um</Button><Button>Dois</Button></ButtonGroup>` */
export const ButtonGroup = Object.assign(ButtonGroupRoot, { Root: ButtonGroupRoot });
export { ButtonGroupRoot };
