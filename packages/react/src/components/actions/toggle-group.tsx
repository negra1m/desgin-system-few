"use client";
import { useLayoutEffect, useRef, useState, type ComponentProps, type FocusEvent, type KeyboardEvent, type MouseEvent } from 'react';
import type { Orientation, Size } from '@fewcompany/core';
import { toggleGroupValue, isToggleGroupItemSelected, type ToggleGroupType, type ToggleGroupValue } from '@fewcompany/core';
import { Slot } from '../../lib/slot.js';
import { createContext } from '../../lib/context.js';
import { useControllableState } from '../../lib/use-controllable-state.js';
import { cx, dataAttr } from '../../lib/cx.js';
import { moveFocus, focusableItems } from '../../lib/roving.js';
import type { ToggleVariant } from './toggle.js';

interface ToggleGroupContextValue {
  type: ToggleGroupType;
  isSelected: (value: string) => boolean;
  toggle: (value: string) => void;
  disabled?: boolean;
  variant?: ToggleVariant;
  size?: Size;
  orientation: Orientation;
  rovingFocus: boolean;
  activeValue: string | null;
  setActiveValue: (value: string) => void;
}
const [ToggleGroupProvider, useToggleGroup] = createContext<ToggleGroupContextValue>('ToggleGroup');

interface ToggleGroupSharedProps extends ComponentProps<'div'> {
  asChild?: boolean;
  orientation?: Orientation;
  disabled?: boolean;
  /** Setas movem e focam o item (roving tabindex). Padrão true. */
  rovingFocus?: boolean;
  loop?: boolean;
  size?: Size;
  variant?: ToggleVariant;
}
export type ToggleGroupProps = ToggleGroupSharedProps & (
  | { type: 'single'; value?: string; defaultValue?: string; onValueChange?: (value: string) => void }
  | { type: 'multiple'; value?: string[]; defaultValue?: string[]; onValueChange?: (value: string[]) => void }
);
type ToggleGroupInternalProps = ToggleGroupSharedProps & { type: ToggleGroupType; value?: ToggleGroupValue; defaultValue?: ToggleGroupValue; onValueChange?: (value: ToggleGroupValue) => void };

function ToggleGroupRoot(allProps: ToggleGroupProps) {
  const { asChild, type, orientation = 'horizontal', disabled, rovingFocus = true, loop = true, size, variant, className, value, defaultValue, onValueChange, onKeyDown, ...props } = allProps as ToggleGroupInternalProps;
  const empty: ToggleGroupValue = type === 'multiple' ? [] : '';
  const [current, setCurrent] = useControllableState<ToggleGroupValue>({ value, defaultValue: defaultValue ?? empty, onChange: onValueChange });
  const [activeValue, setActiveValue] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Item selecionado é o padrão de foco; sem seleção, cai no primeiro item (roving focus).
  useLayoutEffect(() => {
    if (activeValue !== null) return;
    const items = focusableItems(ref.current, '[data-few-toggle-item]');
    const preferred = items.find(item => item.dataset.state === 'on') ?? items[0];
    if (preferred?.dataset.value !== undefined) setActiveValue(preferred.dataset.value);
  }, [activeValue]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented || !rovingFocus) return;
    const target = moveFocus(ref.current, '[data-few-toggle-item]', event.key, { orientation, loop });
    if (target) event.preventDefault();
  }

  const Comp = asChild ? Slot : 'div';
  return (
    <ToggleGroupProvider value={{
      type, disabled, variant, size, orientation, rovingFocus, activeValue, setActiveValue,
      isSelected: itemValue => isToggleGroupItemSelected(type, current, itemValue),
      toggle: itemValue => setCurrent(toggleGroupValue(type, current, itemValue)),
    }}>
      <Comp
        {...props}
        ref={ref}
        role={type === 'single' ? 'radiogroup' : 'group'}
        aria-orientation={orientation}
        data-orientation={orientation}
        data-disabled={dataAttr(disabled)}
        className={cx('few-toggle-group', className)}
        onKeyDown={handleKeyDown}
      />
    </ToggleGroupProvider>
  );
}

export interface ToggleGroupItemProps extends ComponentProps<'button'> { asChild?: boolean; value: string }
function ToggleGroupItem({ asChild, value, disabled: itemDisabled, className, onClick, onFocus, ...props }: ToggleGroupItemProps) {
  const ctx = useToggleGroup('ToggleGroup.Item');
  const selected = ctx.isSelected(value);
  const disabled = ctx.disabled || itemDisabled;
  const tabbable = ctx.rovingFocus ? ctx.activeValue === value : true;
  const Comp = asChild ? Slot : 'button';

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (event.defaultPrevented || disabled) return;
    ctx.toggle(value);
    ctx.setActiveValue(value);
  }
  function handleFocus(event: FocusEvent<HTMLButtonElement>) {
    onFocus?.(event);
    if (ctx.rovingFocus) ctx.setActiveValue(value);
  }

  return (
    <Comp
      {...props}
      data-few-toggle-item=""
      type={asChild ? undefined : 'button'}
      role={ctx.type === 'single' ? 'radio' : undefined}
      aria-checked={ctx.type === 'single' ? selected : undefined}
      aria-pressed={ctx.type === 'multiple' ? selected : undefined}
      tabIndex={tabbable ? 0 : -1}
      disabled={disabled}
      data-state={selected ? 'on' : 'off'}
      data-disabled={dataAttr(disabled)}
      data-value={value}
      className={cx('few-toggle-group-item', ctx.variant && `few-toggle-group-item--${ctx.variant}`, ctx.size && `few-toggle-group-item--${ctx.size}`, className)}
      onClick={handleClick}
      onFocus={handleFocus}
    />
  );
}

/** Conjunto de opções alternáveis. single = radiogroup/radio, multiple = botões independentes com aria-pressed. Roving focus por setas. */
export const ToggleGroup = Object.assign(ToggleGroupRoot, { Root: ToggleGroupRoot, Item: ToggleGroupItem });
export { ToggleGroupRoot, ToggleGroupItem };
