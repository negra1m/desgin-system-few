"use client";
import { useRef, useState, type ComponentProps, type KeyboardEvent } from 'react';
import { nextIndex } from '@fewcompany/core';
import { Slot } from '../../lib/slot.js';
import { createContext } from '../../lib/context.js';
import { useControllableState } from '../../lib/use-controllable-state.js';
import { cx, dataAttr } from '../../lib/cx.js';

interface RatingContextValue {
  value: number; setValue: (value: number) => void; setHoverValue: (value: number | null) => void;
  max: number; readOnly?: boolean; disabled?: boolean;
}
const [RatingProvider, useRating] = createContext<RatingContextValue>('Rating');

export interface RatingProps extends Omit<ComponentProps<'div'>, 'defaultValue'> {
  asChild?: boolean;
  value?: number; defaultValue?: number; onValueChange?: (value: number) => void;
  max?: number; readOnly?: boolean; disabled?: boolean;
}
function RatingRoot({ asChild, value, defaultValue = 0, onValueChange, max = 5, readOnly, disabled, className, onKeyDown, ...props }: RatingProps) {
  const [current, setCurrent] = useControllableState({ value, defaultValue, onChange: onValueChange });
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented || readOnly || disabled) return;
    const index = Math.max(0, current - 1);
    const next = nextIndex(event.key, index, max, { orientation: 'horizontal' });
    if (next === null) return;
    event.preventDefault();
    setCurrent(next + 1);
  }
  const Comp = asChild ? Slot : 'div';
  return (
    <RatingProvider value={{ value: hoverValue ?? current, setValue: setCurrent, setHoverValue, max, readOnly, disabled }}>
      <Comp
        {...props}
        ref={ref}
        role="radiogroup"
        aria-label={props['aria-label'] ?? 'Avaliação'}
        data-disabled={dataAttr(disabled)}
        data-readonly={dataAttr(readOnly)}
        className={cx('few-rating', className)}
        onKeyDown={handleKeyDown}
        onPointerLeave={() => setHoverValue(null)}
      />
    </RatingProvider>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
      <path
        d="M10 1.6l2.6 5.4 5.9.7-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.7z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export interface RatingItemProps extends ComponentProps<'button'> { asChild?: boolean; value: number }
function RatingItem({ asChild, value, className, onClick, onPointerEnter, children, ...props }: RatingItemProps) {
  const ctx = useRating('Rating.Item');
  const filled = value <= ctx.value;
  const current = Math.max(1, Math.round(ctx.value));
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      {...props}
      type="button"
      role="radio"
      aria-checked={value === current}
      aria-label={props['aria-label'] ?? `${value} de ${ctx.max}`}
      tabIndex={value === current ? 0 : -1}
      disabled={ctx.disabled}
      data-state={filled ? 'filled' : 'empty'}
      className={cx('few-rating-item', className)}
      onPointerEnter={(event) => { onPointerEnter?.(event); if (!ctx.readOnly && !ctx.disabled) ctx.setHoverValue(value); }}
      onClick={(event) => { onClick?.(event); if (!event.defaultPrevented && !ctx.readOnly && !ctx.disabled) ctx.setValue(value); }}
    >
      {children ?? <StarIcon filled={filled} />}
    </Comp>
  );
}

/** Rating composto: <Rating value={3} onValueChange={..} max={5}>{Array.from({length:5}).map((_, i) => <Rating.Item key={i} value={i+1}/>)}</Rating> */
export const Rating = Object.assign(RatingRoot, { Root: RatingRoot, Item: RatingItem });
export { RatingRoot, RatingItem };
