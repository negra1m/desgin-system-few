"use client";
import type { ComponentProps, MouseEvent } from 'react';
import type { Size } from '@fewcompany/core';
import { Slot, Slottable } from '../../lib/slot.js';
import { useControllableState } from '../../lib/use-controllable-state.js';
import { cx, dataAttr } from '../../lib/cx.js';

export type ToggleVariant = 'primary' | 'secondary';

export interface ToggleProps extends ComponentProps<'button'> {
  asChild?: boolean;
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  size?: Size;
  variant?: ToggleVariant;
}

/** Botão de dois estados (pressionado/solto). `<Toggle pressed={bold} onPressedChange={setBold}>N</Toggle>` */
export function Toggle({ asChild, pressed: pressedProp, defaultPressed = false, onPressedChange, size = 'md', variant = 'secondary', disabled, className, type = 'button', onClick, children, ...props }: ToggleProps) {
  const [pressed, setPressed] = useControllableState({ value: pressedProp, defaultValue: defaultPressed, onChange: onPressedChange });
  const Comp = asChild ? Slot : 'button';
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (event.defaultPrevented || disabled) return;
    setPressed(!pressed);
  }
  return (
    <Comp
      {...props}
      type={type}
      aria-pressed={pressed}
      disabled={disabled}
      data-state={pressed ? 'on' : 'off'}
      data-disabled={dataAttr(disabled)}
      className={cx('few-toggle', `few-toggle--${variant}`, `few-toggle--${size}`, className)}
      onClick={handleClick}
    >
      <Slottable>{children}</Slottable>
    </Comp>
  );
}
