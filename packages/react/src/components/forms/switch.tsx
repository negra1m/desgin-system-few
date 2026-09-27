"use client";
import type { ComponentProps, ReactNode } from 'react';
import type { Size } from '@fewcompany/core';
import { Slot } from '../../lib/slot.js';
import { createContext } from '../../lib/context.js';
import { useControllableState } from '../../lib/use-controllable-state.js';
import { cx, dataAttr } from '../../lib/cx.js';

interface SwitchContextValue { checked: boolean }
const [SwitchProvider, useSwitchState] = createContext<SwitchContextValue>('Switch');

export interface SwitchProps extends Omit<ComponentProps<'input'>, 'type' | 'checked' | 'defaultChecked' | 'onChange' | 'size'> {
  checked?: boolean; defaultChecked?: boolean; onCheckedChange?: (checked: boolean) => void;
  size?: Size; children?: ReactNode;
}
/** role=switch no input nativo (checkbox + role="switch" é o padrão recomendado pela WAI-ARIA APG). */
function SwitchRoot({ checked, defaultChecked = false, onCheckedChange, size = 'md', disabled, className, children, id, ...inputProps }: SwitchProps) {
  const [current, setCurrent] = useControllableState({ value: checked, defaultValue: defaultChecked, onChange: onCheckedChange });
  return (
    <label className={cx('few-switch', `few-switch--${size}`, className)} data-state={current ? 'checked' : 'unchecked'} data-disabled={dataAttr(disabled)}>
      <input
        {...inputProps}
        id={id}
        type="checkbox"
        role="switch"
        checked={current}
        disabled={disabled}
        className="few-sr-only"
        onChange={(event) => setCurrent(event.currentTarget.checked)}
      />
      <SwitchProvider value={{ checked: current }}>{children}</SwitchProvider>
    </label>
  );
}

export interface SwitchThumbProps extends ComponentProps<'span'> { asChild?: boolean }
function SwitchThumb({ asChild, className, ...props }: SwitchThumbProps) {
  const { checked } = useSwitchState('Switch.Thumb');
  const Comp = asChild ? Slot : 'span';
  return <Comp {...props} aria-hidden="true" data-state={checked ? 'checked' : 'unchecked'} className={cx('few-switch-thumb', className)} />;
}

/** Switch composto: <Switch.Root checked={..} onCheckedChange={..}><Switch.Thumb/></Switch.Root> */
export const Switch = Object.assign(SwitchRoot, { Root: SwitchRoot, Thumb: SwitchThumb });
export { SwitchRoot, SwitchThumb };
