"use client";
import { useCallback, useRef, useState } from 'react';

export interface ControllableOptions<T> { value?: T; defaultValue: T; onChange?: (value: T) => void }

/**
 * Estado controlado ou não controlado (padrão value/defaultValue/onValueChange do Radix).
 * `onChange` só dispara quando o valor muda de fato.
 */
export function useControllableState<T>({ value, defaultValue, onChange }: ControllableOptions<T>): [T, (next: T | ((previous: T) => T)) => void] {
  const [internal, setInternal] = useState(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? (value as T) : internal;
  const currentRef = useRef(current); currentRef.current = current;
  const onChangeRef = useRef(onChange); onChangeRef.current = onChange;
  const setValue = useCallback((next: T | ((previous: T) => T)) => {
    const resolved = typeof next === 'function' ? (next as (previous: T) => T)(currentRef.current) : next;
    if (Object.is(resolved, currentRef.current)) return;
    if (!controlled) { currentRef.current = resolved; setInternal(resolved); }
    onChangeRef.current?.(resolved);
  }, [controlled]);
  return [current, setValue];
}
