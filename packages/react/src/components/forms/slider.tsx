"use client";
import { useRef, type ComponentProps, type CSSProperties, type KeyboardEvent, type PointerEvent, type RefObject } from 'react';
import type { Orientation } from '@fewcompany/core';
import { closestThumbIndex, percentFromValue, valueFromPercent } from '@fewcompany/core';
import { Slot } from '../../lib/slot.js';
import { createContext } from '../../lib/context.js';
import { useControllableState } from '../../lib/use-controllable-state.js';
import { cx, dataAttr } from '../../lib/cx.js';

interface SliderContextValue {
  values: number[]; setValues: (next: number[], commit?: boolean) => void;
  min: number; max: number; step: number; orientation: Orientation; disabled?: boolean;
  trackRef: RefObject<HTMLDivElement | null>;
}
const [SliderProvider, useSlider] = createContext<SliderContextValue>('Slider');

function percentFromPointer(event: PointerEvent, rect: DOMRect, orientation: Orientation): number {
  return orientation === 'horizontal'
    ? ((event.clientX - rect.left) / rect.width) * 100
    : (1 - (event.clientY - rect.top) / rect.height) * 100;
}

export interface SliderProps extends Omit<ComponentProps<'div'>, 'defaultValue'> {
  asChild?: boolean;
  value?: number[]; defaultValue?: number[]; onValueChange?: (value: number[]) => void; onValueCommit?: (value: number[]) => void;
  min?: number; max?: number; step?: number; orientation?: Orientation; disabled?: boolean;
}
function SliderRoot({ asChild, value, defaultValue = [0], onValueChange, onValueCommit, min = 0, max = 100, step = 1, orientation = 'horizontal', disabled, className, ...props }: SliderProps) {
  const [current, setCurrent] = useControllableState<number[]>({ value, defaultValue, onChange: onValueChange });
  const trackRef = useRef<HTMLDivElement>(null);
  function setValues(next: number[], commit = false) {
    const bounded = next.map(item => valueFromPercent(percentFromValue(item, min, max), min, max, step));
    setCurrent(bounded);
    if (commit) onValueCommit?.(bounded);
  }
  const Comp = asChild ? Slot : 'div';
  return (
    <SliderProvider value={{ values: current, setValues, min, max, step, orientation, disabled, trackRef }}>
      <Comp {...props} data-orientation={orientation} data-disabled={dataAttr(disabled)} className={cx('few-slider', className)} />
    </SliderProvider>
  );
}

export interface SliderTrackProps extends ComponentProps<'div'> { asChild?: boolean }
function SliderTrack({ asChild, className, onPointerDown, ...props }: SliderTrackProps) {
  const { values, setValues, min, max, step, orientation, disabled, trackRef } = useSlider('Slider.Track');
  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    onPointerDown?.(event);
    if (event.defaultPrevented || disabled) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const target = valueFromPercent(percentFromPointer(event, rect, orientation), min, max, step);
    const index = closestThumbIndex(values, target);
    const next = values.slice();
    next[index] = target;
    setValues(next, true);
  }
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} ref={trackRef} data-orientation={orientation} className={cx('few-slider-track', className)} onPointerDown={handlePointerDown} />;
}

export interface SliderRangeProps extends ComponentProps<'div'> { asChild?: boolean }
function SliderRange({ asChild, className, style, ...props }: SliderRangeProps) {
  const { values, min, max } = useSlider('Slider.Range');
  const numbers = values.length ? values : [min];
  const start = percentFromValue(Math.min(...numbers), min, max);
  const end = percentFromValue(Math.max(...numbers), min, max);
  const Comp = asChild ? Slot : 'div';
  return (
    <Comp
      {...props}
      className={cx('few-slider-range', className)}
      style={{ ...style, '--few-slider-start': `${start}%`, '--few-slider-end': `${end}%` } as CSSProperties}
    />
  );
}

export interface SliderThumbProps extends ComponentProps<'div'> { asChild?: boolean; index: number }
function SliderThumb({ asChild, index, className, style, onKeyDown, onPointerDown, onPointerMove, ...props }: SliderThumbProps) {
  const { values, setValues, min, max, step, orientation, disabled, trackRef } = useSlider('Slider.Thumb');
  const value = values[index] ?? min;
  const percent = percentFromValue(value, min, max);
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented || disabled) return;
    let next: number | null = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = value + step;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = value - step;
    else if (event.key === 'PageUp') next = value + step * 10;
    else if (event.key === 'PageDown') next = value - step * 10;
    else if (event.key === 'Home') next = min;
    else if (event.key === 'End') next = max;
    if (next === null) return;
    event.preventDefault();
    const updated = values.slice();
    updated[index] = next;
    setValues(updated, true);
  }
  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    onPointerDown?.(event);
    if (disabled) return;
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    onPointerMove?.(event);
    if (disabled || !trackRef.current || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const rect = trackRef.current.getBoundingClientRect();
    const target = valueFromPercent(percentFromPointer(event, rect, orientation), min, max, step);
    const updated = values.slice();
    updated[index] = target;
    setValues(updated);
  }
  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setValues(values, true);
  }
  const Comp = asChild ? Slot : 'div';
  return (
    <Comp
      {...props}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={props['aria-valuetext'] ?? String(value)}
      aria-orientation={orientation}
      aria-disabled={disabled || undefined}
      data-orientation={orientation}
      data-disabled={dataAttr(disabled)}
      style={{ ...style, '--few-slider-percent': `${percent}%` } as CSSProperties}
      className={cx('few-slider-thumb', className)}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    />
  );
}

/** Slider composto: <Slider value={[30]} onValueChange={..}><Slider.Track><Slider.Range/><Slider.Thumb index={0}/></Slider.Track></Slider> */
export const Slider = Object.assign(SliderRoot, { Root: SliderRoot, Track: SliderTrack, Range: SliderRange, Thumb: SliderThumb });
export { SliderRoot, SliderTrack, SliderRange, SliderThumb };
