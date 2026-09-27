"use client";
import { useRef, type ChangeEvent, type ClipboardEvent, type ComponentProps, type KeyboardEvent, type MutableRefObject } from 'react';
import { distributePin, nextPinIndex } from '@fewcompany/core';
import { Slot } from '../../lib/slot.js';
import { createContext } from '../../lib/context.js';
import { useControllableState } from '../../lib/use-controllable-state.js';
import { cx, dataAttr } from '../../lib/cx.js';

interface PinInputContextValue {
  length: number; value: string; disabled?: boolean; mask?: boolean;
  setChar: (index: number, char: string) => void; setMany: (index: number, text: string) => void;
  refs: MutableRefObject<Array<HTMLInputElement | null>>;
}
const [PinInputProvider, usePinInput] = createContext<PinInputContextValue>('PinInput');

export interface PinInputProps extends Omit<ComponentProps<'div'>, 'onChange'> {
  asChild?: boolean;
  length?: number;
  value?: string; defaultValue?: string; onValueChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  mask?: boolean; disabled?: boolean;
}
function PinInputRoot({ asChild, length = 4, value, defaultValue = '', onValueChange, onComplete, mask, disabled, className, ...props }: PinInputProps) {
  const [current, setCurrent] = useControllableState({ value, defaultValue, onChange: onValueChange });
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  function commit(next: string) {
    setCurrent(next);
    if (next.length === length && !next.includes('')) onComplete?.(next);
  }
  function setChar(index: number, char: string) {
    // Não usa distributePin aqui: com texto vazio (limpar 1 casa no Backspace) ele não escreve nada
    // (''.split('') === []), então a escrita de uma única casa é feita diretamente.
    const chars = current.split('');
    while (chars.length < length) chars.push('');
    chars[index] = char;
    commit(chars.slice(0, length).join(''));
    if (char && index + 1 < length) refs.current[index + 1]?.focus();
  }
  function setMany(index: number, text: string) {
    const digits = text.replace(/\s/g, '');
    const chars = distributePin(current.split(''), digits, index, length);
    commit(chars.join(''));
    refs.current[nextPinIndex(index, digits.length, length)]?.focus();
  }
  const Comp = asChild ? Slot : 'div';
  return (
    <PinInputProvider value={{ length, value: current, disabled, mask, setChar, setMany, refs }}>
      <Comp {...props} role="group" className={cx('few-pin-input', className)} data-disabled={dataAttr(disabled)} />
    </PinInputProvider>
  );
}

export interface PinInputFieldProps extends Omit<ComponentProps<'input'>, 'value' | 'defaultValue'> { index: number }
function PinInputInput({ index, className, onKeyDown, onChange, onPaste, disabled, ...props }: PinInputFieldProps) {
  const { length, value, disabled: ctxDisabled, mask, setChar, setMany, refs } = usePinInput('PinInput.Input');
  const isDisabled = disabled ?? ctxDisabled;
  const char = value[index] ?? '';
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange?.(event);
    const raw = event.currentTarget.value;
    const last = raw.slice(-1);
    setChar(index, /[a-zA-Z0-9]/.test(last) ? last : '');
  }
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === 'Backspace' && !char && index > 0) { event.preventDefault(); setChar(index - 1, ''); refs.current[index - 1]?.focus(); }
    else if (event.key === 'ArrowLeft' && index > 0) { event.preventDefault(); refs.current[index - 1]?.focus(); }
    else if (event.key === 'ArrowRight' && index + 1 < length) { event.preventDefault(); refs.current[index + 1]?.focus(); }
  }
  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    onPaste?.(event);
    event.preventDefault();
    setMany(index, event.clipboardData.getData('text'));
  }
  return (
    <input
      {...props}
      ref={(el) => { refs.current[index] = el; }}
      type={mask ? 'password' : 'text'}
      inputMode="numeric"
      autoComplete={index === 0 ? 'one-time-code' : 'off'}
      maxLength={1}
      disabled={isDisabled}
      value={char}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      className={cx('few-input', 'few-pin-input-field', className)}
      aria-label={props['aria-label'] ?? `Dígito ${index + 1} de ${length}`}
    />
  );
}

/** PinInput composto: <PinInput length={4} onComplete={...}>{Array.from({length:4}).map((_, i) => <PinInput.Input key={i} index={i}/>)}</PinInput> */
export const PinInput = Object.assign(PinInputRoot, { Root: PinInputRoot, Input: PinInputInput });
export { PinInputRoot, PinInputInput };
