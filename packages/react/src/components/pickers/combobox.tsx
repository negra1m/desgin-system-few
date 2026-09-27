"use client";
// Combobox: Input de texto que filtra opções (contains, sem acento) via filterOptions do core.
// O foco permanece no Input; a opção "ativa" é sinalizada por aria-activedescendant (não move foco real).
// Ver docs/composition.md.
import { useCallback, useEffect, useId, useMemo, useRef, useState, type ComponentProps, type RefObject } from 'react';
import { filterOptions, nextIndex } from '@fewcompany/core';
import { Slot } from '../../lib/slot.js';
import { createContext } from '../../lib/context.js';
import { useControllableState } from '../../lib/use-controllable-state.js';
import { cx, dataAttr } from '../../lib/cx.js';
import { useDismiss } from '../../lib/use-dismiss.js';
import { usePosition, type Side, type Align } from '../../lib/use-position.js';
import { useTopLayer } from '../../lib/use-top-layer.js';

interface ComboboxItemData { value: string; label: string; disabled?: boolean }
interface ComboboxContextValue {
  baseId: string;
  value: string; setValue: (value: string) => void;
  inputValue: string; setInputValue: (value: string) => void;
  open: boolean; setOpen: (open: boolean) => void;
  disabled?: boolean; allowCustomValue: boolean;
  activeValue: string | null; setActiveValue: (value: string | null) => void;
  items: ComboboxItemData[];
  registerItem: (item: ComboboxItemData) => void;
  unregisterItem: (value: string) => void;
  visibleValues: Set<string>;
  inputRef: RefObject<HTMLInputElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
}
const [ComboboxProvider, useCombobox] = createContext<ComboboxContextValue>('Combobox');
const [ComboboxItemProvider, useComboboxItemState] = createContext<{ selected: boolean; disabled?: boolean }>('Combobox.Item');

export interface ComboboxProps extends Omit<ComponentProps<'div'>, 'defaultValue' | 'onChange'> {
  asChild?: boolean;
  value?: string; defaultValue?: string; onValueChange?: (value: string) => void;
  inputValue?: string; defaultInputValue?: string; onInputValueChange?: (value: string) => void;
  open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  /** Permite confirmar (Enter) um texto que não corresponde a nenhuma opção. */
  allowCustomValue?: boolean;
}
function ComboboxRoot({ asChild, value: valueProp, defaultValue = '', onValueChange, inputValue: inputValueProp, defaultInputValue = '', onInputValueChange, open: openProp, defaultOpen = false, onOpenChange, disabled, allowCustomValue = false, className, children, ...props }: ComboboxProps) {
  const baseId = useId();
  const [value, setValue] = useControllableState({ value: valueProp, defaultValue, onChange: onValueChange });
  const [inputValue, setInputValue] = useControllableState({ value: inputValueProp, defaultValue: defaultInputValue, onChange: onInputValueChange });
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const [activeValue, setActiveValue] = useState<string | null>(null);
  const [items, setItems] = useState<ComboboxItemData[]>([]);
  const registerItem = useCallback((item: ComboboxItemData) => setItems(prev => [...prev.filter(i => i.value !== item.value), item]), []);
  const unregisterItem = useCallback((itemValue: string) => setItems(prev => prev.filter(i => i.value !== itemValue)), []);
  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const visibleValues = useMemo(() => new Set(filterOptions(items, inputValue, item => item.label).map(item => item.value)), [items, inputValue]);
  const Comp = asChild ? Slot : 'div';
  return (
    <ComboboxProvider value={{ baseId, value, setValue, inputValue, setInputValue, open, setOpen, disabled, allowCustomValue, activeValue, setActiveValue, items, registerItem, unregisterItem, visibleValues, inputRef, contentRef }}>
      <Comp {...props} className={cx('few-combobox', className)} data-disabled={dataAttr(disabled)}>{children}</Comp>
    </ComboboxProvider>
  );
}

export interface ComboboxInputProps extends Omit<ComponentProps<'input'>, 'value' | 'defaultValue'> { asChild?: boolean }
function ComboboxInput({ asChild, className, onChange, onKeyDown, onFocus, disabled: disabledProp, ...props }: ComboboxInputProps) {
  const ctx = useCombobox('Combobox.Input');
  const disabled = disabledProp ?? ctx.disabled;
  const Comp = asChild ? Slot : 'input';
  return (
    <Comp {...props} ref={ctx.inputRef} type="text" role="combobox" id={`${ctx.baseId}-input`} autoComplete="off"
      aria-autocomplete="list" aria-expanded={ctx.open} aria-controls={`${ctx.baseId}-content`}
      aria-activedescendant={ctx.activeValue ? `${ctx.baseId}-item-${ctx.activeValue}` : undefined}
      disabled={disabled} value={ctx.inputValue} data-state={ctx.open ? 'open' : 'closed'}
      className={cx('few-combobox-input', className)}
      onFocus={(event) => { onFocus?.(event); if (!disabled) ctx.setOpen(true); }}
      onChange={(event) => {
        onChange?.(event);
        if (event.defaultPrevented) return;
        ctx.setInputValue(event.target.value);
        ctx.setOpen(true);
        ctx.setActiveValue(null);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || disabled) return;
        const navigable = ctx.items.filter(item => ctx.visibleValues.has(item.value) && !item.disabled);
        const currentIndex = navigable.findIndex(item => item.value === ctx.activeValue);
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
          event.preventDefault();
          ctx.setOpen(true);
          const idx = nextIndex(event.key, currentIndex, navigable.length, { orientation: 'vertical', loop: false });
          if (idx !== null && navigable[idx]) ctx.setActiveValue(navigable[idx].value);
          return;
        }
        if (event.key === 'Enter') {
          event.preventDefault();
          const active = navigable.find(item => item.value === ctx.activeValue);
          if (active) { ctx.setValue(active.value); ctx.setInputValue(active.label); ctx.setOpen(false); }
          else if (ctx.allowCustomValue && ctx.inputValue) { ctx.setValue(ctx.inputValue); ctx.setOpen(false); }
        }
      }} />
  );
}

export interface ComboboxTriggerProps extends ComponentProps<'button'> { asChild?: boolean }
function ComboboxTrigger({ asChild, className, onClick, ...props }: ComboboxTriggerProps) {
  const ctx = useCombobox('Combobox.Trigger');
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp {...props} type="button" tabIndex={-1} aria-hidden="true" disabled={ctx.disabled} className={cx('few-combobox-trigger', className)}
      onClick={(event) => { onClick?.(event); if (event.defaultPrevented) return; ctx.setOpen(!ctx.open); ctx.inputRef.current?.focus(); }}>
      {props.children ?? '▾'}
    </Comp>
  );
}

export interface ComboboxContentProps extends ComponentProps<'div'> { asChild?: boolean; side?: Side; align?: Align }
function ComboboxContent({ asChild, side = 'bottom', align = 'start', className, style, ...props }: ComboboxContentProps) {
  const ctx = useCombobox('Combobox.Content');
  const position = usePosition(ctx.inputRef, ctx.contentRef, { side, align, matchWidth: true, open: ctx.open });
  useTopLayer(ctx.contentRef, ctx.open);
  useDismiss(ctx.open, () => ctx.setOpen(false), [ctx.inputRef, ctx.contentRef]);
  const Comp = asChild ? Slot : 'div';
  return (
    <Comp {...props} ref={ctx.contentRef} popover="manual" role="listbox" id={`${ctx.baseId}-content`} aria-labelledby={`${ctx.baseId}-input`}
      data-state={ctx.open ? 'open' : 'closed'} data-side={position.side} className={cx('few-combobox-content', className)}
      style={{ ...position.style, ...style }} />
  );
}

export interface ComboboxGroupProps extends ComponentProps<'div'> { asChild?: boolean }
function ComboboxGroup({ asChild, className, ...props }: ComboboxGroupProps) {
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} role="group" className={cx('few-combobox-group', className)} />;
}

export interface ComboboxLabelProps extends ComponentProps<'div'> { asChild?: boolean }
function ComboboxLabel({ asChild, className, ...props }: ComboboxLabelProps) {
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} className={cx('few-combobox-label', className)} />;
}

export interface ComboboxItemProps extends ComponentProps<'div'> { asChild?: boolean; value: string; disabled?: boolean; textValue?: string }
function ComboboxItem({ asChild, value, disabled, textValue, className, children, onClick, onPointerMove, ...props }: ComboboxItemProps) {
  const ctx = useCombobox('Combobox.Item');
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ctx.registerItem({ value, label: textValue ?? ref.current?.textContent ?? value, disabled });
    return () => ctx.unregisterItem(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, textValue, disabled]);
  const visible = ctx.visibleValues.has(value);
  const selected = ctx.value === value;
  const highlighted = ctx.activeValue === value;
  const Comp = asChild ? Slot : 'div';
  if (!visible) return null;
  return (
    <ComboboxItemProvider value={{ selected, disabled }}>
      <Comp {...props} ref={ref} role="option" id={`${ctx.baseId}-item-${value}`} aria-selected={selected} aria-disabled={disabled}
        data-state={selected ? 'checked' : 'unchecked'} data-highlighted={dataAttr(highlighted)} data-disabled={dataAttr(disabled)} data-value={value}
        className={cx('few-combobox-item', className)}
        onPointerMove={(event) => { onPointerMove?.(event); if (!disabled) ctx.setActiveValue(value); }}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented || disabled) return;
          ctx.setValue(value);
          ctx.setInputValue(textValue ?? ref.current?.textContent ?? value);
          ctx.setOpen(false);
          ctx.inputRef.current?.focus();
        }}>
        {children}
      </Comp>
    </ComboboxItemProvider>
  );
}

export interface ComboboxItemTextProps extends ComponentProps<'span'> { asChild?: boolean }
function ComboboxItemText({ asChild, className, ...props }: ComboboxItemTextProps) {
  const Comp = asChild ? Slot : 'span';
  return <Comp {...props} className={cx('few-combobox-item-text', className)} />;
}

export interface ComboboxItemIndicatorProps extends ComponentProps<'span'> { asChild?: boolean; forceMount?: boolean }
function ComboboxItemIndicator({ asChild, forceMount, className, children, ...props }: ComboboxItemIndicatorProps) {
  const item = useComboboxItemState('Combobox.ItemIndicator');
  const Comp = asChild ? Slot : 'span';
  if (!item.selected && !forceMount) return null;
  return <Comp {...props} aria-hidden="true" className={cx('few-combobox-item-indicator', className)}>{children ?? '✓'}</Comp>;
}

export interface ComboboxEmptyProps extends ComponentProps<'div'> { asChild?: boolean }
function ComboboxEmpty({ asChild, className, ...props }: ComboboxEmptyProps) {
  const ctx = useCombobox('Combobox.Empty');
  const Comp = asChild ? Slot : 'div';
  if (ctx.items.length > 0 && ctx.visibleValues.size > 0) return null;
  return <Comp {...props} role="status" className={cx('few-combobox-empty', className)} />;
}

/** Combobox composto: <Combobox><Combobox.Input/><Combobox.Content><Combobox.Item value="a">A</Combobox.Item><Combobox.Empty>Nada encontrado</Combobox.Empty></Combobox.Content></Combobox> */
export const Combobox = Object.assign(ComboboxRoot, {
  Root: ComboboxRoot, Input: ComboboxInput, Trigger: ComboboxTrigger, Content: ComboboxContent,
  Item: ComboboxItem, ItemText: ComboboxItemText, ItemIndicator: ComboboxItemIndicator, Empty: ComboboxEmpty,
  Group: ComboboxGroup, Label: ComboboxLabel,
});
export {
  ComboboxRoot, ComboboxInput, ComboboxTrigger, ComboboxContent,
  ComboboxItem, ComboboxItemText, ComboboxItemIndicator, ComboboxEmpty, ComboboxGroup, ComboboxLabel,
};
