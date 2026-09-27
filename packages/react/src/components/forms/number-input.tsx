"use client";
import { useEffect, useState, type ChangeEvent, type ComponentProps, type FocusEvent, type KeyboardEvent } from 'react';
import { clamp, roundToStep } from '@fewcompany/core';
import { Slot } from '../../lib/slot.js';
import { createContext } from '../../lib/context.js';
import { useControllableState } from '../../lib/use-controllable-state.js';
import { cx, dataAttr } from '../../lib/cx.js';

interface NumberInputContextValue {
  value: number | null; setValue: (next: number | null) => void; step: (delta: number) => void;
  min: number; max: number; step_: number; disabled?: boolean;
}
const [NumberInputProvider, useNumberInput] = createContext<NumberInputContextValue>('NumberInput');

export interface NumberInputProps extends Omit<ComponentProps<'div'>, 'onChange' | 'defaultValue'> {
  asChild?: boolean;
  value?: number | null; defaultValue?: number | null; onValueChange?: (value: number | null) => void;
  min?: number; max?: number; step?: number; disabled?: boolean;
}
function NumberInputRoot({ asChild, value, defaultValue = null, onValueChange, min = -Infinity, max = Infinity, step = 1, disabled, className, ...props }: NumberInputProps) {
  const [current, setCurrent] = useControllableState<number | null>({ value, defaultValue, onChange: onValueChange });
  function setValue(next: number | null) {
    if (next === null) { setCurrent(null); return; }
    const anchor = Number.isFinite(min) ? min : 0;
    setCurrent(clamp(roundToStep(next, step, anchor), min, max));
  }
  function stepBy(delta: number) { setValue((current ?? (Number.isFinite(min) ? min : 0)) + delta); }
  const Comp = asChild ? Slot : 'div';
  return (
    <NumberInputProvider value={{ value: current, setValue, step: stepBy, min, max, step_: step, disabled }}>
      <Comp {...props} className={cx('few-number-input', className)} data-disabled={dataAttr(disabled)} />
    </NumberInputProvider>
  );
}

export interface NumberInputFieldProps extends Omit<ComponentProps<'input'>, 'value' | 'defaultValue'> {}
function NumberInputInput({ className, onKeyDown, onChange, onBlur, disabled, ...props }: NumberInputFieldProps) {
  const { value, setValue, step: stepBy, min, max, step_, disabled: ctxDisabled } = useNumberInput('NumberInput.Input');
  const isDisabled = disabled ?? ctxDisabled;
  const [text, setText] = useState(value === null ? '' : String(value));
  useEffect(() => { setText(value === null ? '' : String(value)); }, [value]);
  function commit(raw: string) {
    if (raw.trim() === '') { setValue(null); return; }
    const parsed = Number(raw);
    if (!Number.isNaN(parsed)) setValue(parsed); else setText(value === null ? '' : String(value));
  }
  function handleChange(event: ChangeEvent<HTMLInputElement>) { onChange?.(event); setText(event.currentTarget.value); }
  function handleBlur(event: FocusEvent<HTMLInputElement>) { onBlur?.(event); commit(event.currentTarget.value); }
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented || isDisabled) return;
    if (event.key === 'ArrowUp') { event.preventDefault(); stepBy(step_); }
    else if (event.key === 'ArrowDown') { event.preventDefault(); stepBy(-step_); }
    else if (event.key === 'PageUp') { event.preventDefault(); stepBy(step_ * 10); }
    else if (event.key === 'PageDown') { event.preventDefault(); stepBy(-step_ * 10); }
    else if (event.key === 'Home' && Number.isFinite(min)) { event.preventDefault(); setValue(min); }
    else if (event.key === 'End' && Number.isFinite(max)) { event.preventDefault(); setValue(max); }
    else if (event.key === 'Enter') { commit(event.currentTarget.value); }
  }
  return (
    <input
      {...props}
      type="text"
      inputMode="decimal"
      role="spinbutton"
      aria-valuenow={value ?? undefined}
      aria-valuemin={Number.isFinite(min) ? min : undefined}
      aria-valuemax={Number.isFinite(max) ? max : undefined}
      disabled={isDisabled}
      value={text}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={cx('few-input', 'few-number-input-input', className)}
    />
  );
}

export interface NumberInputButtonProps extends ComponentProps<'button'> { asChild?: boolean }
function NumberInputIncrement({ asChild, className, onClick, ...props }: NumberInputButtonProps) {
  const { value, step: stepBy, step_, max, disabled } = useNumberInput('NumberInput.Increment');
  const atMax = value !== null && Number.isFinite(max) && value >= max;
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp {...props} type="button" tabIndex={-1} disabled={disabled || atMax} aria-label={props['aria-label'] ?? 'Aumentar'} className={cx('few-number-input-increment', className)}
      onClick={(event) => { onClick?.(event); if (!event.defaultPrevented) stepBy(step_); }}>
      {props.children ?? '+'}
    </Comp>
  );
}
function NumberInputDecrement({ asChild, className, onClick, ...props }: NumberInputButtonProps) {
  const { value, step: stepBy, step_, min, disabled } = useNumberInput('NumberInput.Decrement');
  const atMin = value !== null && Number.isFinite(min) && value <= min;
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp {...props} type="button" tabIndex={-1} disabled={disabled || atMin} aria-label={props['aria-label'] ?? 'Diminuir'} className={cx('few-number-input-decrement', className)}
      onClick={(event) => { onClick?.(event); if (!event.defaultPrevented) stepBy(-step_); }}>
      {props.children ?? '−'}
    </Comp>
  );
}

/** NumberInput composto: <NumberInput min={0} max={10}><NumberInput.Decrement/><NumberInput.Input/><NumberInput.Increment/></NumberInput> */
export const NumberInput = Object.assign(NumberInputRoot, { Root: NumberInputRoot, Input: NumberInputInput, Increment: NumberInputIncrement, Decrement: NumberInputDecrement });
export { NumberInputRoot, NumberInputInput, NumberInputIncrement, NumberInputDecrement };
