"use client";
// MultiSelect: Trigger abre um painel com Search (filtra via filterOptions) + Itens em checkbox visual
// (aria-selected, seleção não fecha o painel). Foco fica no Search; navegação por activedescendant,
// igual ao Combobox. Backspace no Search vazio remove o último valor. Ver docs/composition.md.
import { useCallback, useEffect, useId, useMemo, useRef, useState, type ComponentProps, type ReactNode, type RefObject } from 'react';
import { filterOptions, nextIndex } from '@fewcompany/core';
import { Slot } from '../../lib/slot.js';
import { createContext } from '../../lib/context.js';
import { useControllableState } from '../../lib/use-controllable-state.js';
import { cx, dataAttr } from '../../lib/cx.js';
import { useDismiss } from '../../lib/use-dismiss.js';
import { usePosition, type Side, type Align } from '../../lib/use-position.js';
import { useTopLayer } from '../../lib/use-top-layer.js';

interface MultiSelectItemData { value: string; label: string; disabled?: boolean }
interface MultiSelectContextValue {
  baseId: string;
  value: string[]; setValue: (value: string[]) => void; toggleValue: (value: string) => void;
  open: boolean; setOpen: (open: boolean) => void;
  disabled?: boolean;
  search: string; setSearch: (search: string) => void;
  activeValue: string | null; setActiveValue: (value: string | null) => void;
  items: MultiSelectItemData[];
  registerItem: (item: MultiSelectItemData) => void;
  unregisterItem: (value: string) => void;
  visibleValues: Set<string>;
  triggerRef: RefObject<HTMLButtonElement | null>;
  searchRef: RefObject<HTMLInputElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
}
const [MultiSelectProvider, useMultiSelect] = createContext<MultiSelectContextValue>('MultiSelect');
const [MultiSelectItemProvider, useMultiSelectItemState] = createContext<{ checked: boolean; disabled?: boolean }>('MultiSelect.Item');

export interface MultiSelectProps extends Omit<ComponentProps<'div'>, 'defaultValue' | 'onChange'> {
  asChild?: boolean;
  value?: string[]; defaultValue?: string[]; onValueChange?: (value: string[]) => void;
  open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}
function MultiSelectRoot({ asChild, value: valueProp, defaultValue, onValueChange, open: openProp, defaultOpen = false, onOpenChange, disabled, className, children, ...props }: MultiSelectProps) {
  const baseId = useId();
  const [value, setValue] = useControllableState<string[]>({ value: valueProp, defaultValue: defaultValue ?? [], onChange: onValueChange });
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const [search, setSearch] = useState('');
  const [activeValue, setActiveValue] = useState<string | null>(null);
  const [items, setItems] = useState<MultiSelectItemData[]>([]);
  const registerItem = useCallback((item: MultiSelectItemData) => setItems(prev => [...prev.filter(i => i.value !== item.value), item]), []);
  const unregisterItem = useCallback((itemValue: string) => setItems(prev => prev.filter(i => i.value !== itemValue)), []);
  const toggleValue = useCallback((v: string) => setValue(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]), [setValue]);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const visibleValues = useMemo(() => new Set(filterOptions(items, search, item => item.label).map(item => item.value)), [items, search]);
  const Comp = asChild ? Slot : 'div';
  return (
    <MultiSelectProvider value={{ baseId, value, setValue, toggleValue, open, setOpen, disabled, search, setSearch, activeValue, setActiveValue, items, registerItem, unregisterItem, visibleValues, triggerRef, searchRef, contentRef }}>
      <Comp {...props} className={cx('few-multi-select', className)} data-disabled={dataAttr(disabled)}>{children}</Comp>
    </MultiSelectProvider>
  );
}

export interface MultiSelectTriggerProps extends ComponentProps<'button'> { asChild?: boolean }
function MultiSelectTrigger({ asChild, className, disabled: disabledProp, onClick, ...props }: MultiSelectTriggerProps) {
  const ctx = useMultiSelect('MultiSelect.Trigger');
  const disabled = disabledProp ?? ctx.disabled;
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp {...props} ref={ctx.triggerRef} type="button" aria-haspopup="listbox" aria-expanded={ctx.open} aria-controls={`${ctx.baseId}-content`}
      disabled={disabled} data-state={ctx.open ? 'open' : 'closed'} data-disabled={dataAttr(disabled)} className={cx('few-multi-select-trigger', className)}
      onClick={(event) => { onClick?.(event); if (event.defaultPrevented || disabled) return; ctx.setOpen(!ctx.open); }} />
  );
}

export interface MultiSelectValueProps extends ComponentProps<'div'> { asChild?: boolean; placeholder?: ReactNode; maxDisplay?: number }
function MultiSelectValue({ asChild, placeholder, maxDisplay = Infinity, className, children, ...props }: MultiSelectValueProps) {
  const ctx = useMultiSelect('MultiSelect.Value');
  const Comp = asChild ? Slot : 'div';
  if (asChild || children !== undefined) return <Comp {...props} className={cx('few-multi-select-value', className)}>{children}</Comp>;
  const selected = ctx.value.map(v => ctx.items.find(item => item.value === v)).filter((item): item is MultiSelectItemData => Boolean(item));
  if (selected.length === 0) return <div {...props} className={cx('few-multi-select-value', className)} data-placeholder="">{placeholder}</div>;
  const visible = selected.slice(0, maxDisplay);
  const overflow = selected.length - visible.length;
  return (
    <div {...props} className={cx('few-multi-select-value', className)}>
      {visible.map(item => (
        <span key={item.value} className="few-multi-select-chip">
          {item.label}
          <button type="button" className="few-multi-select-chip-remove" aria-label={`Remover ${item.label}`}
            onClick={(event) => { event.stopPropagation(); ctx.toggleValue(item.value); }}>×</button>
        </span>
      ))}
      {overflow > 0 && <span className="few-multi-select-chip few-multi-select-chip--overflow">+{overflow}</span>}
    </div>
  );
}

export interface MultiSelectContentProps extends ComponentProps<'div'> { asChild?: boolean; side?: Side; align?: Align }
function MultiSelectContent({ asChild, side = 'bottom', align = 'start', className, style, ...props }: MultiSelectContentProps) {
  const ctx = useMultiSelect('MultiSelect.Content');
  const position = usePosition(ctx.triggerRef, ctx.contentRef, { side, align, matchWidth: true, open: ctx.open });
  useTopLayer(ctx.contentRef, ctx.open);
  useDismiss(ctx.open, () => { ctx.setOpen(false); ctx.triggerRef.current?.focus(); }, [ctx.triggerRef, ctx.contentRef]);
  useEffect(() => { if (ctx.open) ctx.searchRef.current?.focus(); }, [ctx.open, ctx.searchRef]);
  const Comp = asChild ? Slot : 'div';
  return (
    <Comp {...props} ref={ctx.contentRef} popover="manual" role="listbox" aria-multiselectable="true" id={`${ctx.baseId}-content`}
      data-state={ctx.open ? 'open' : 'closed'} data-side={position.side} className={cx('few-multi-select-content', className)}
      style={{ ...position.style, ...style }} />
  );
}

export interface MultiSelectSearchProps extends Omit<ComponentProps<'input'>, 'value' | 'defaultValue'> { asChild?: boolean }
function MultiSelectSearch({ asChild, className, onChange, onKeyDown, 'aria-label': ariaLabel, ...props }: MultiSelectSearchProps) {
  const ctx = useMultiSelect('MultiSelect.Search');
  const Comp = asChild ? Slot : 'input';
  return (
    <Comp {...props} ref={ctx.searchRef} type="text" role="searchbox" aria-label={ariaLabel ?? 'Buscar opções'} autoComplete="off"
      aria-activedescendant={ctx.activeValue ? `${ctx.baseId}-item-${ctx.activeValue}` : undefined}
      value={ctx.search} className={cx('few-multi-select-search', className)}
      onChange={(event) => { onChange?.(event); if (event.defaultPrevented) return; ctx.setSearch(event.target.value); ctx.setActiveValue(null); }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        const navigable = ctx.items.filter(item => ctx.visibleValues.has(item.value) && !item.disabled);
        const currentIndex = navigable.findIndex(item => item.value === ctx.activeValue);
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
          event.preventDefault();
          const idx = nextIndex(event.key, currentIndex, navigable.length, { orientation: 'vertical', loop: false });
          if (idx !== null && navigable[idx]) ctx.setActiveValue(navigable[idx].value);
          return;
        }
        if (event.key === 'Enter' || event.key === ' ') {
          if (ctx.activeValue) { event.preventDefault(); ctx.toggleValue(ctx.activeValue); }
          return;
        }
        if (event.key === 'Backspace' && ctx.search === '' && ctx.value.length > 0) {
          ctx.setValue(ctx.value.slice(0, -1));
        }
      }} />
  );
}

export interface MultiSelectItemProps extends ComponentProps<'div'> { asChild?: boolean; value: string; disabled?: boolean; textValue?: string }
function MultiSelectItem({ asChild, value, disabled, textValue, className, children, onClick, onPointerMove, ...props }: MultiSelectItemProps) {
  const ctx = useMultiSelect('MultiSelect.Item');
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ctx.registerItem({ value, label: textValue ?? ref.current?.textContent ?? value, disabled });
    return () => ctx.unregisterItem(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, textValue, disabled]);
  const visible = ctx.visibleValues.has(value);
  const checked = ctx.value.includes(value);
  const highlighted = ctx.activeValue === value;
  const Comp = asChild ? Slot : 'div';
  if (!visible) return null;
  return (
    <MultiSelectItemProvider value={{ checked, disabled }}>
      <Comp {...props} ref={ref} role="option" id={`${ctx.baseId}-item-${value}`} aria-selected={checked} aria-disabled={disabled}
        data-state={checked ? 'checked' : 'unchecked'} data-highlighted={dataAttr(highlighted)} data-disabled={dataAttr(disabled)} data-value={value}
        className={cx('few-multi-select-item', className)}
        onPointerMove={(event) => { onPointerMove?.(event); if (!disabled) ctx.setActiveValue(value); }}
        onClick={(event) => { onClick?.(event); if (event.defaultPrevented || disabled) return; ctx.toggleValue(value); }}>
        {children}
      </Comp>
    </MultiSelectItemProvider>
  );
}

export interface MultiSelectItemIndicatorProps extends ComponentProps<'span'> { asChild?: boolean; forceMount?: boolean }
function MultiSelectItemIndicator({ asChild, forceMount, className, children, ...props }: MultiSelectItemIndicatorProps) {
  const item = useMultiSelectItemState('MultiSelect.ItemIndicator');
  const Comp = asChild ? Slot : 'span';
  if (!item.checked && !forceMount) return null;
  return <Comp {...props} aria-hidden="true" className={cx('few-multi-select-item-indicator', className)}>{children ?? '✓'}</Comp>;
}

export interface MultiSelectEmptyProps extends ComponentProps<'div'> { asChild?: boolean }
function MultiSelectEmpty({ asChild, className, ...props }: MultiSelectEmptyProps) {
  const ctx = useMultiSelect('MultiSelect.Empty');
  const Comp = asChild ? Slot : 'div';
  if (ctx.items.length > 0 && ctx.visibleValues.size > 0) return null;
  return <Comp {...props} role="status" className={cx('few-multi-select-empty', className)} />;
}

/** Parte opcional (fora da lista mínima de partes): alterna todos os itens visíveis de uma vez. */
export interface MultiSelectSelectAllProps extends ComponentProps<'div'> { asChild?: boolean }
function MultiSelectSelectAll({ asChild, className, children, onClick, ...props }: MultiSelectSelectAllProps) {
  const ctx = useMultiSelect('MultiSelect.SelectAll');
  const visibleItems = ctx.items.filter(item => ctx.visibleValues.has(item.value) && !item.disabled);
  const allSelected = visibleItems.length > 0 && visibleItems.every(item => ctx.value.includes(item.value));
  const Comp = asChild ? Slot : 'div';
  return (
    <Comp {...props} role="option" aria-selected={allSelected} data-state={allSelected ? 'checked' : 'unchecked'}
      className={cx('few-multi-select-item few-multi-select-select-all', className)}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        const visibleValuesArr = visibleItems.map(item => item.value);
        ctx.setValue(allSelected ? ctx.value.filter(v => !visibleValuesArr.includes(v)) : Array.from(new Set([...ctx.value, ...visibleValuesArr])));
      }}>
      {children ?? (allSelected ? 'Limpar seleção' : 'Selecionar todos')}
    </Comp>
  );
}

/** MultiSelect composto: <MultiSelect value={[]} onValueChange={...}><MultiSelect.Trigger><MultiSelect.Value placeholder="…"/></MultiSelect.Trigger><MultiSelect.Content><MultiSelect.Search/><MultiSelect.Item value="a">A</MultiSelect.Item></MultiSelect.Content></MultiSelect> */
export const MultiSelect = Object.assign(MultiSelectRoot, {
  Root: MultiSelectRoot, Trigger: MultiSelectTrigger, Value: MultiSelectValue, Content: MultiSelectContent, Search: MultiSelectSearch,
  Item: MultiSelectItem, ItemIndicator: MultiSelectItemIndicator, Empty: MultiSelectEmpty, SelectAll: MultiSelectSelectAll,
});
export {
  MultiSelectRoot, MultiSelectTrigger, MultiSelectValue, MultiSelectContent, MultiSelectSearch,
  MultiSelectItem, MultiSelectItemIndicator, MultiSelectEmpty, MultiSelectSelectAll,
};
