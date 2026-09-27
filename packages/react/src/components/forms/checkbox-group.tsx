"use client";
import type { ComponentProps } from 'react';
import type { Orientation } from '@fewcompany/core';
import { toggleValue } from '@fewcompany/core';
import { Slot } from '../../lib/slot.js';
import { createContext } from '../../lib/context.js';
import { useControllableState } from '../../lib/use-controllable-state.js';
import { cx } from '../../lib/cx.js';
import { CheckboxRoot, type CheckboxProps } from './checkbox.js';

interface CheckboxGroupContextValue { value: string[]; toggle: (value: string) => void; name?: string; disabled?: boolean }
const [CheckboxGroupProvider, useCheckboxGroup] = createContext<CheckboxGroupContextValue>('CheckboxGroup');

export interface CheckboxGroupProps extends Omit<ComponentProps<'div'>, 'defaultValue'> {
  asChild?: boolean;
  value?: string[]; defaultValue?: string[]; onValueChange?: (value: string[]) => void;
  name?: string; disabled?: boolean; orientation?: Orientation;
}
function CheckboxGroupRoot({ asChild, value, defaultValue = [], onValueChange, name, disabled, orientation = 'vertical', className, ...props }: CheckboxGroupProps) {
  const [current, setCurrent] = useControllableState({ value, defaultValue, onChange: onValueChange });
  function toggle(item: string) { setCurrent(toggleValue(current, item)); }
  const Comp = asChild ? Slot : 'div';
  return (
    <CheckboxGroupProvider value={{ value: current, toggle, name, disabled }}>
      <Comp {...props} role="group" data-orientation={orientation} className={cx('few-checkbox-group', className)} />
    </CheckboxGroupProvider>
  );
}

export interface CheckboxGroupItemProps extends Omit<CheckboxProps, 'checked' | 'defaultChecked' | 'onCheckedChange' | 'value'> { value: string }
function CheckboxGroupItem({ value, disabled, name, children, ...props }: CheckboxGroupItemProps) {
  const ctx = useCheckboxGroup('CheckboxGroup.Item');
  const checked = ctx.value.includes(value);
  return (
    <CheckboxRoot {...props} name={name ?? ctx.name} value={value} checked={checked} disabled={disabled ?? ctx.disabled} onCheckedChange={() => ctx.toggle(value)}>
      {children}
    </CheckboxRoot>
  );
}

/** CheckboxGroup composto: <CheckboxGroup value={[...]} onValueChange={...}><CheckboxGroup.Item value="a"><Checkbox.Indicator/> A</CheckboxGroup.Item></CheckboxGroup> */
export const CheckboxGroup = Object.assign(CheckboxGroupRoot, { Root: CheckboxGroupRoot, Item: CheckboxGroupItem });
export { CheckboxGroupRoot, CheckboxGroupItem };
