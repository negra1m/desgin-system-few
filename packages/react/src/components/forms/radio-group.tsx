"use client";
import { useId, useRef, type ComponentProps, type KeyboardEvent, type ReactNode } from 'react';
import type { Orientation } from '@fewcompany/core';
import { Slot } from '../../lib/slot.js';
import { createContext } from '../../lib/context.js';
import { useControllableState } from '../../lib/use-controllable-state.js';
import { cx, dataAttr } from '../../lib/cx.js';
import { moveFocus } from '../../lib/roving.js';

interface RadioGroupContextValue { value: string; setValue: (value: string) => void; name: string; disabled?: boolean; orientation: Orientation }
const [RadioGroupProvider, useRadioGroup] = createContext<RadioGroupContextValue>('RadioGroup');

export interface RadioGroupProps extends Omit<ComponentProps<'div'>, 'defaultValue'> {
  asChild?: boolean;
  value?: string; defaultValue?: string; onValueChange?: (value: string) => void;
  name?: string; disabled?: boolean; required?: boolean; orientation?: Orientation; loop?: boolean;
}
function RadioGroupRoot({ asChild, value, defaultValue = '', onValueChange, name, disabled, required, orientation = 'vertical', loop = true, className, onKeyDown, ...props }: RadioGroupProps) {
  const baseId = useId();
  const groupName = name ?? baseId;
  const [current, setCurrent] = useControllableState({ value, defaultValue, onChange: onValueChange });
  const ref = useRef<HTMLDivElement>(null);
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const target = moveFocus(ref.current, 'input[type="radio"]:not(:disabled)', event.key, { orientation, loop });
    if (!target) return;
    event.preventDefault();
    setCurrent((target as HTMLInputElement).value);
  }
  const Comp = asChild ? Slot : 'div';
  return (
    <RadioGroupProvider value={{ value: current, setValue: setCurrent, name: groupName, disabled, orientation }}>
      <Comp {...props} ref={ref} role="radiogroup" aria-orientation={orientation} aria-required={required || undefined} data-orientation={orientation} className={cx('few-radio-group', className)} onKeyDown={handleKeyDown} />
    </RadioGroupProvider>
  );
}

type RadioItemState = 'checked' | 'unchecked';
interface RadioItemContextValue { state: RadioItemState }
const [RadioItemProvider, useRadioItemState] = createContext<RadioItemContextValue>('RadioGroup.Item');

export interface RadioGroupItemProps extends Omit<ComponentProps<'input'>, 'type' | 'checked' | 'defaultChecked' | 'onChange'> { value: string; children?: ReactNode }
function RadioGroupItem({ value, disabled, className, children, ...inputProps }: RadioGroupItemProps) {
  const ctx = useRadioGroup('RadioGroup.Item');
  const checked = ctx.value === value;
  const isDisabled = disabled ?? ctx.disabled;
  const state: RadioItemState = checked ? 'checked' : 'unchecked';
  return (
    <label className={cx('few-radio-group-item', className)} data-state={state} data-disabled={dataAttr(isDisabled)}>
      <input
        {...inputProps}
        type="radio"
        name={ctx.name}
        value={value}
        checked={checked}
        disabled={isDisabled}
        className="few-sr-only"
        onChange={() => ctx.setValue(value)}
      />
      <RadioItemProvider value={{ state }}>{children}</RadioItemProvider>
    </label>
  );
}

export interface RadioGroupIndicatorProps extends ComponentProps<'span'> { asChild?: boolean; forceMount?: boolean }
function RadioGroupIndicator({ asChild, forceMount, className, ...props }: RadioGroupIndicatorProps) {
  const { state } = useRadioItemState('RadioGroup.Indicator');
  if (state === 'unchecked' && !forceMount) return null;
  const Comp = asChild ? Slot : 'span';
  return <Comp {...props} aria-hidden="true" data-state={state} className={cx('few-radio-group-indicator', className)} />;
}

/** RadioGroup composto: <RadioGroup value={..} onValueChange={..}><RadioGroup.Item value="a"><RadioGroup.Indicator/> A</RadioGroup.Item></RadioGroup> */
export const RadioGroup = Object.assign(RadioGroupRoot, { Root: RadioGroupRoot, Item: RadioGroupItem, Indicator: RadioGroupIndicator });
export { RadioGroupRoot, RadioGroupItem, RadioGroupIndicator };
