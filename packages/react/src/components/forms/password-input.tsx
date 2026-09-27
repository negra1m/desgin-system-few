"use client";
import type { ComponentProps } from 'react';
import { Slot } from '../../lib/slot.js';
import { createContext } from '../../lib/context.js';
import { useControllableState } from '../../lib/use-controllable-state.js';
import { cx } from '../../lib/cx.js';
import { Input, type InputProps } from './input.js';

interface PasswordInputContextValue { visible: boolean; setVisible: (visible: boolean) => void }
const [PasswordInputProvider, usePasswordInput] = createContext<PasswordInputContextValue>('PasswordInput');

export interface PasswordInputProps extends ComponentProps<'div'> {
  asChild?: boolean;
  visible?: boolean; defaultVisible?: boolean; onVisibleChange?: (visible: boolean) => void;
}
function PasswordInputRoot({ asChild, visible, defaultVisible = false, onVisibleChange, className, ...props }: PasswordInputProps) {
  const [current, setCurrent] = useControllableState({ value: visible, defaultValue: defaultVisible, onChange: onVisibleChange });
  const Comp = asChild ? Slot : 'div';
  return (
    <PasswordInputProvider value={{ visible: current, setVisible: setCurrent }}>
      <Comp {...props} className={cx('few-input-group', 'few-password-input', className)} />
    </PasswordInputProvider>
  );
}

function PasswordInputInput({ className, ...props }: Omit<InputProps, 'type'>) {
  const { visible } = usePasswordInput('PasswordInput.Input');
  return <Input {...props} type={visible ? 'text' : 'password'} className={cx('few-input-group-input', className)} />;
}

export interface PasswordInputToggleProps extends ComponentProps<'button'> { asChild?: boolean }
function PasswordInputToggle({ asChild, className, onClick, children, ...props }: PasswordInputToggleProps) {
  const { visible, setVisible } = usePasswordInput('PasswordInput.Toggle');
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      {...props}
      type="button"
      data-side="end"
      aria-pressed={visible}
      aria-label={props['aria-label'] ?? (visible ? 'Ocultar senha' : 'Mostrar senha')}
      className={cx('few-input-group-element', 'few-password-input-toggle', className)}
      onClick={(event) => { onClick?.(event); if (!event.defaultPrevented) setVisible(!visible); }}
    >
      {children ?? (visible ? 'Ocultar' : 'Mostrar')}
    </Comp>
  );
}

/** PasswordInput composto: <PasswordInput><PasswordInput.Input/><PasswordInput.Toggle/></PasswordInput> */
export const PasswordInput = Object.assign(PasswordInputRoot, { Root: PasswordInputRoot, Input: PasswordInputInput, Toggle: PasswordInputToggle });
export { PasswordInputRoot, PasswordInputInput, PasswordInputToggle };
