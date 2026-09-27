"use client";
// Select: Trigger tipo combobox abre um listbox posicionado (popover) com navegação por teclado completa.
// Ao abrir, o foco DOM move para a opção selecionada (ou a primeira); setas/Home/End roam entre opções,
// Enter/Espaço seleciona, Escape fecha e devolve o foco ao Trigger. Ver docs/composition.md.
import { useCallback, useEffect, useId, useRef, useState, type ComponentProps, type KeyboardEvent, type ReactNode, type RefObject } from 'react';
import { typeaheadIndex } from '@fewcompany/core';
import { Slot } from '../../lib/slot.js';
import { createContext } from '../../lib/context.js';
import { useControllableState } from '../../lib/use-controllable-state.js';
import { cx, dataAttr } from '../../lib/cx.js';
import { moveFocus, focusableItems } from '../../lib/roving.js';
import { useDismiss } from '../../lib/use-dismiss.js';
import { usePosition, type Side, type Align } from '../../lib/use-position.js';
import { useTopLayer } from '../../lib/use-top-layer.js';

interface SelectItemData { value: string; label: string; disabled?: boolean }
interface SelectContextValue {
  baseId: string;
  value: string; setValue: (value: string) => void;
  open: boolean; setOpen: (open: boolean) => void;
  disabled?: boolean; required?: boolean;
  triggerRef: RefObject<HTMLButtonElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
  items: SelectItemData[];
  registerItem: (item: SelectItemData) => void;
  unregisterItem: (value: string) => void;
}
const [SelectProvider, useSelect] = createContext<SelectContextValue>('Select');
const [SelectItemProvider, useSelectItemState] = createContext<{ selected: boolean; disabled?: boolean }>('Select.Item');

export interface SelectProps extends Omit<ComponentProps<'div'>, 'defaultValue' | 'onChange'> {
  asChild?: boolean;
  value?: string; defaultValue?: string; onValueChange?: (value: string) => void;
  open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void;
  /** Quando definido, renderiza um <select> nativo oculto (few-sr-only) para participar de formulários. */
  name?: string; disabled?: boolean; required?: boolean;
}
function SelectRoot({ asChild, value: valueProp, defaultValue = '', onValueChange, open: openProp, defaultOpen = false, onOpenChange, name, disabled, required, className, children, ...props }: SelectProps) {
  const baseId = useId();
  const [value, setValue] = useControllableState({ value: valueProp, defaultValue, onChange: onValueChange });
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<SelectItemData[]>([]);
  const registerItem = useCallback((item: SelectItemData) => setItems(prev => [...prev.filter(i => i.value !== item.value), item]), []);
  const unregisterItem = useCallback((itemValue: string) => setItems(prev => prev.filter(i => i.value !== itemValue)), []);
  const Comp = asChild ? Slot : 'div';
  return (
    <SelectProvider value={{ baseId, value, setValue, open, setOpen, disabled, required, triggerRef, contentRef, items, registerItem, unregisterItem }}>
      <Comp {...props} className={cx('few-select', className)} data-disabled={dataAttr(disabled)}>
        {children}
        {name && (
          <select tabIndex={-1} aria-hidden="true" className="few-sr-only" name={name} required={required} disabled={disabled} value={value} onChange={() => {}}>
            <option value="" />
            {items.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        )}
      </Comp>
    </SelectProvider>
  );
}

export interface SelectTriggerProps extends ComponentProps<'button'> { asChild?: boolean }
function SelectTrigger({ asChild, className, disabled: disabledProp, onClick, onKeyDown, ...props }: SelectTriggerProps) {
  const ctx = useSelect('Select.Trigger');
  const disabled = disabledProp ?? ctx.disabled;
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp {...props} ref={ctx.triggerRef} type="button" role="combobox" id={`${ctx.baseId}-trigger`}
      aria-haspopup="listbox" aria-expanded={ctx.open} aria-controls={`${ctx.baseId}-content`} aria-required={ctx.required}
      disabled={disabled} data-state={ctx.open ? 'open' : 'closed'} data-disabled={dataAttr(disabled)}
      className={cx('few-select-trigger', className)}
      onClick={(event) => { onClick?.(event); if (event.defaultPrevented || disabled) return; ctx.setOpen(!ctx.open); }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || disabled || ctx.open) return;
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ') { event.preventDefault(); ctx.setOpen(true); }
      }} />
  );
}

export interface SelectValueProps extends ComponentProps<'span'> { asChild?: boolean; placeholder?: ReactNode }
function SelectValue({ asChild, placeholder, className, children, ...props }: SelectValueProps) {
  const ctx = useSelect('Select.Value');
  const Comp = asChild ? Slot : 'span';
  if (asChild || children !== undefined) return <Comp {...props} className={cx('few-select-value', className)}>{children}</Comp>;
  const selectedLabel = ctx.items.find(item => item.value === ctx.value)?.label;
  return <span {...props} className={cx('few-select-value', className)} data-placeholder={dataAttr(!selectedLabel)}>{selectedLabel ?? placeholder}</span>;
}

export interface SelectIconProps extends ComponentProps<'span'> { asChild?: boolean }
function SelectIcon({ asChild, className, children, ...props }: SelectIconProps) {
  const Comp = asChild ? Slot : 'span';
  return <Comp {...props} aria-hidden="true" className={cx('few-select-icon', className)}>{children ?? '▾'}</Comp>;
}

export interface SelectContentProps extends ComponentProps<'div'> { asChild?: boolean; side?: Side; align?: Align }
function SelectContent({ asChild, side = 'bottom', align = 'start', className, style, onKeyDown, children, ...props }: SelectContentProps) {
  const ctx = useSelect('Select.Content');
  const typedRef = useRef('');
  const typedTimer = useRef<number | undefined>(undefined);
  const position = usePosition(ctx.triggerRef, ctx.contentRef, { side, align, matchWidth: true, open: ctx.open });
  useTopLayer(ctx.contentRef, ctx.open);
  useDismiss(ctx.open, () => { ctx.setOpen(false); ctx.triggerRef.current?.focus(); }, [ctx.triggerRef, ctx.contentRef]);
  useEffect(() => {
    if (!ctx.open) return;
    const container = ctx.contentRef.current;
    const target = container?.querySelector<HTMLElement>('[role="option"][aria-selected="true"]') ?? container?.querySelector<HTMLElement>('[role="option"]');
    target?.focus();
  }, [ctx.open]);
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const container = ctx.contentRef.current;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const active = document.activeElement as HTMLElement | null;
      if (active?.getAttribute('role') === 'option' && active.dataset.value !== undefined) {
        ctx.setValue(active.dataset.value);
        ctx.setOpen(false);
        ctx.triggerRef.current?.focus();
      }
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
      const moved = moveFocus(container, '[role="option"]', event.key, { orientation: 'vertical', loop: false });
      if (moved) event.preventDefault();
      return;
    }
    if (event.key.length === 1 && event.key !== ' ') {
      const options = focusableItems(container, '[role="option"]');
      const labels = options.map(item => item.textContent ?? '');
      const current = options.indexOf(document.activeElement as HTMLElement);
      window.clearTimeout(typedTimer.current);
      typedRef.current += event.key;
      const found = typeaheadIndex(labels, typedRef.current, current < 0 ? 0 : current);
      typedTimer.current = window.setTimeout(() => { typedRef.current = ''; }, 500);
      if (found !== null) { event.preventDefault(); options[found]?.focus(); }
    }
  }
  const Comp = asChild ? Slot : 'div';
  return (
    <Comp {...props} ref={ctx.contentRef} popover="manual" role="listbox" id={`${ctx.baseId}-content`} aria-labelledby={`${ctx.baseId}-trigger`}
      data-state={ctx.open ? 'open' : 'closed'} data-side={position.side} className={cx('few-select-content', className)}
      style={{ ...position.style, ...style }} onKeyDown={handleKeyDown}>
      {children}
    </Comp>
  );
}

export interface SelectViewportProps extends ComponentProps<'div'> { asChild?: boolean }
function SelectViewport({ asChild, className, ...props }: SelectViewportProps) {
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} role="presentation" className={cx('few-select-viewport', className)} />;
}

export interface SelectGroupProps extends ComponentProps<'div'> { asChild?: boolean }
function SelectGroup({ asChild, className, ...props }: SelectGroupProps) {
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} role="group" className={cx('few-select-group', className)} />;
}

export interface SelectLabelProps extends ComponentProps<'div'> { asChild?: boolean }
function SelectLabel({ asChild, className, ...props }: SelectLabelProps) {
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} className={cx('few-select-label', className)} />;
}

export interface SelectItemProps extends ComponentProps<'div'> { asChild?: boolean; value: string; disabled?: boolean; textValue?: string }
function SelectItem({ asChild, value, disabled, textValue, className, children, onClick, ...props }: SelectItemProps) {
  const ctx = useSelect('Select.Item');
  const selected = ctx.value === value;
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ctx.registerItem({ value, label: textValue ?? ref.current?.textContent ?? value, disabled });
    return () => ctx.unregisterItem(value);
    // registerItem/unregisterItem são estáveis (useCallback com deps vazias); reagir só ao conteúdo do item.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, textValue, disabled]);
  const Comp = asChild ? Slot : 'div';
  return (
    <SelectItemProvider value={{ selected, disabled }}>
      <Comp {...props} ref={ref} role="option" id={`${ctx.baseId}-item-${value}`} aria-selected={selected} aria-disabled={disabled} tabIndex={-1}
        data-state={selected ? 'checked' : 'unchecked'} data-disabled={dataAttr(disabled)} data-value={value}
        className={cx('few-select-item', className)}
        onClick={(event) => { onClick?.(event); if (event.defaultPrevented || disabled) return; ctx.setValue(value); ctx.setOpen(false); ctx.triggerRef.current?.focus(); }}>
        {children}
      </Comp>
    </SelectItemProvider>
  );
}

export interface SelectItemTextProps extends ComponentProps<'span'> { asChild?: boolean }
function SelectItemText({ asChild, className, ...props }: SelectItemTextProps) {
  const Comp = asChild ? Slot : 'span';
  return <Comp {...props} className={cx('few-select-item-text', className)} />;
}

export interface SelectItemIndicatorProps extends ComponentProps<'span'> { asChild?: boolean; forceMount?: boolean }
function SelectItemIndicator({ asChild, forceMount, className, children, ...props }: SelectItemIndicatorProps) {
  const item = useSelectItemState('Select.ItemIndicator');
  const Comp = asChild ? Slot : 'span';
  if (!item.selected && !forceMount) return null;
  return <Comp {...props} aria-hidden="true" className={cx('few-select-item-indicator', className)}>{children ?? '✓'}</Comp>;
}

export interface SelectSeparatorProps extends ComponentProps<'div'> { asChild?: boolean }
function SelectSeparator({ asChild, className, ...props }: SelectSeparatorProps) {
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} role="separator" aria-orientation="horizontal" className={cx('few-select-separator', className)} />;
}

/** Select composto: <Select><Select.Trigger><Select.Value placeholder="…"/><Select.Icon/></Select.Trigger><Select.Content><Select.Viewport><Select.Item value="a"><Select.ItemText>A</Select.ItemText></Select.Item></Select.Viewport></Select.Content></Select> */
export const Select = Object.assign(SelectRoot, {
  Root: SelectRoot, Trigger: SelectTrigger, Value: SelectValue, Icon: SelectIcon, Content: SelectContent, Viewport: SelectViewport,
  Group: SelectGroup, Label: SelectLabel, Item: SelectItem, ItemText: SelectItemText, ItemIndicator: SelectItemIndicator, Separator: SelectSeparator,
});
export {
  SelectRoot, SelectTrigger, SelectValue, SelectIcon, SelectContent, SelectViewport,
  SelectGroup, SelectLabel, SelectItem, SelectItemText, SelectItemIndicator, SelectSeparator,
};
