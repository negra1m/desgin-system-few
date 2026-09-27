"use client";
import { useEffect, useRef, type ComponentProps } from 'react';
import { Slot } from '../../lib/slot.js';
import { createContext } from '../../lib/context.js';
import { useControllableState } from '../../lib/use-controllable-state.js';
import { cx, dataAttr } from '../../lib/cx.js';

export type CheckedState = boolean | 'indeterminate';
type CheckboxState = 'checked' | 'unchecked' | 'indeterminate';
interface CheckboxContextValue { state: CheckboxState }
const [CheckboxProvider, useCheckboxState] = createContext<CheckboxContextValue>('Checkbox');

export interface CheckboxProps extends Omit<ComponentProps<'input'>, 'checked' | 'defaultChecked' | 'onChange' | 'type'> {
  checked?: CheckedState; defaultChecked?: CheckedState; onCheckedChange?: (checked: CheckedState) => void;
}
/**
 * Root: input nativo type=checkbox visualmente oculto (few-sr-only, permanece focável e acessível) dentro de um
 * <label>, que também recebe id/aria-* injetados por Field.Control. Children (Indicator + texto) formam o rótulo.
 */
function CheckboxRoot({ checked, defaultChecked = false, onCheckedChange, disabled, required, className, children, id, ...inputProps }: CheckboxProps) {
  const [current, setCurrent] = useControllableState<CheckedState>({ value: checked, defaultValue: defaultChecked, onChange: onCheckedChange });
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (inputRef.current) inputRef.current.indeterminate = current === 'indeterminate'; }, [current]);
  const state: CheckboxState = current === 'indeterminate' ? 'indeterminate' : current ? 'checked' : 'unchecked';
  return (
    <label className={cx('few-checkbox', className)} data-state={state} data-disabled={dataAttr(disabled)}>
      <input
        {...inputProps}
        ref={inputRef}
        id={id}
        type="checkbox"
        checked={current === true}
        aria-checked={state === 'indeterminate' ? 'mixed' : current === true}
        disabled={disabled}
        required={required}
        className="few-sr-only"
        onChange={(event) => setCurrent(event.currentTarget.checked)}
      />
      <CheckboxProvider value={{ state }}>{children}</CheckboxProvider>
    </label>
  );
}

export interface CheckboxIndicatorProps extends ComponentProps<'span'> { asChild?: boolean; forceMount?: boolean }
function CheckboxIndicator({ asChild, forceMount, className, children, ...props }: CheckboxIndicatorProps) {
  const { state } = useCheckboxState('Checkbox.Indicator');
  if (state === 'unchecked' && !forceMount) return null;
  const Comp = asChild ? Slot : 'span';
  return (
    <Comp {...props} aria-hidden="true" data-state={state} className={cx('few-checkbox-indicator', className)}>
      {children ?? (state === 'indeterminate'
        ? <svg viewBox="0 0 16 16" width="10" height="10"><path d="M3 8h10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        : <svg viewBox="0 0 16 16" width="10" height="10"><path d="M2.5 8.5l3.2 3.2 7.3-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>)}
    </Comp>
  );
}

/** Checkbox composto: <Checkbox.Root checked={..} onCheckedChange={..}><Checkbox.Indicator/> Aceito os termos</Checkbox.Root> */
export const Checkbox = Object.assign(CheckboxRoot, { Root: CheckboxRoot, Indicator: CheckboxIndicator });
export { CheckboxRoot, CheckboxIndicator };
