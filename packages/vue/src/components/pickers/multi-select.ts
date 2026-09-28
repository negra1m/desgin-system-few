// MultiSelect: Trigger abre um painel com Search (filtra via filterOptions) + Itens em checkbox visual
// (aria-selected, seleção não fecha o painel). Foco fica no Search; navegação por activedescendant,
// igual ao Combobox. Backspace no Search vazio remove o último valor. Fonte da verdade: packages/react/src/components/pickers/multi-select.tsx.
import { computed, defineComponent, h, mergeProps, ref, watch, type PropType, type Slots, type VNodeArrayChildren } from 'vue';
import type { FloatingAlign, FloatingSide } from '@fewcompany/core';
import { filterOptions, nextIndex } from '@fewcompany/core';
import { createContext } from '../../lib/context.js';
import { useControllable } from '../../lib/use-controllable.js';
import { useId } from '../../lib/ids.js';
import { useDismiss } from '../../lib/use-dismiss.js';
import { usePosition } from '../../lib/use-position.js';
import { useTopLayer } from '../../lib/use-top-layer.js';
import { renderPrimitive, dataAttr, dataState } from '../../lib/primitive.js';

function withDefault(slots: Slots, fallback: () => VNodeArrayChildren): Slots {
  return { default: () => { const kids = slots.default?.() ?? []; return kids.length ? kids : fallback(); } } as unknown as Slots;
}

interface MultiSelectItemData { value: string; label: string; disabled?: boolean }
interface MultiSelectContext {
  baseId: string;
  value: () => string[]; setValue: (value: string[]) => void; toggleValue: (value: string) => void;
  open: () => boolean; setOpen: (open: boolean) => void;
  disabled: () => boolean | undefined;
  search: () => string; setSearch: (search: string) => void;
  activeValue: () => string | null; setActiveValue: (value: string | null) => void;
  items: () => MultiSelectItemData[];
  registerItem: (item: MultiSelectItemData) => void;
  unregisterItem: (value: string) => void;
  visibleValues: () => Set<string>;
  triggerRef: import('vue').Ref<HTMLButtonElement | null>;
  searchRef: import('vue').Ref<HTMLInputElement | null>;
  contentRef: import('vue').Ref<HTMLDivElement | null>;
}
const [provideMultiSelect, useMultiSelect] = createContext<MultiSelectContext>('FewMultiSelect');
interface MultiSelectItemState { checked: () => boolean; disabled: () => boolean | undefined }
const [provideMultiSelectItem, useMultiSelectItem] = createContext<MultiSelectItemState>('FewMultiSelectItem');

/** Raiz: `<FewMultiSelect v-model:value="values">` (array de strings). */
export const FewMultiSelect = defineComponent({
  name: 'FewMultiSelect',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    value: { type: Array as PropType<string[]>, default: undefined },
    defaultValue: { type: Array as PropType<string[]>, default: () => [] },
    open: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: false },
    disabled: Boolean,
  },
  emits: { 'update:value': (value: string[]) => Array.isArray(value), 'update:open': (open: boolean) => typeof open === 'boolean' },
  setup(props, { slots, attrs, emit }) {
    const baseId = useId('multi-select');
    const [value, setValue] = useControllable<string[]>(() => props.value, props.defaultValue, v => emit('update:value', v));
    const [open, setOpen] = useControllable(() => props.open, props.defaultOpen, v => emit('update:open', v));
    const search = ref('');
    const activeValue = ref<string | null>(null);
    const items = ref<MultiSelectItemData[]>([]);
    const registerItem = (item: MultiSelectItemData) => { items.value = [...items.value.filter(i => i.value !== item.value), item]; };
    const unregisterItem = (itemValue: string) => { items.value = items.value.filter(i => i.value !== itemValue); };
    const toggleValue = (v: string) => setValue(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
    const visibleValues = computed(() => new Set(filterOptions(items.value, search.value, item => item.label).map(item => item.value)));
    provideMultiSelect({
      baseId, value: () => value.value, setValue, toggleValue, open: () => open.value, setOpen, disabled: () => props.disabled,
      search: () => search.value, setSearch: (s: string) => { search.value = s; },
      activeValue: () => activeValue.value, setActiveValue: (v: string | null) => { activeValue.value = v; },
      items: () => items.value, registerItem, unregisterItem, visibleValues: () => visibleValues.value,
      triggerRef: ref<HTMLButtonElement | null>(null), searchRef: ref<HTMLInputElement | null>(null), contentRef: ref<HTMLDivElement | null>(null),
    });
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { class: 'few-multi-select', 'data-disabled': dataAttr(props.disabled) }), slots);
  },
});

export const FewMultiSelectTrigger = defineComponent({
  name: 'FewMultiSelectTrigger',
  inheritAttrs: false,
  props: { asChild: Boolean, disabled: { type: Boolean, default: undefined } },
  setup(props, { slots, attrs }) {
    const ctx = useMultiSelect('FewMultiSelectTrigger');
    const disabled = computed(() => props.disabled ?? ctx.disabled());
    return () => renderPrimitive('button', props.asChild, mergeProps(attrs, {
      ref: ctx.triggerRef, type: 'button', 'aria-haspopup': 'listbox', 'aria-expanded': ctx.open(), 'aria-controls': `${ctx.baseId}-content`,
      disabled: disabled.value || undefined, 'data-state': dataState(ctx.open()), 'data-disabled': dataAttr(disabled.value), class: 'few-multi-select-trigger',
      onClick: () => { if (!disabled.value) ctx.setOpen(!ctx.open()); },
    }), slots);
  },
});

export const FewMultiSelectValue = defineComponent({
  name: 'FewMultiSelectValue',
  inheritAttrs: false,
  props: { asChild: Boolean, placeholder: { type: String, default: undefined }, maxDisplay: { type: Number, default: undefined } },
  setup(props, { slots, attrs }) {
    const ctx = useMultiSelect('FewMultiSelectValue');
    return () => {
      if (props.asChild || slots.default) return renderPrimitive('div', props.asChild, mergeProps(attrs, { class: 'few-multi-select-value' }), slots);
      const selected = ctx.value().map(v => ctx.items().find(item => item.value === v)).filter((item): item is MultiSelectItemData => Boolean(item));
      if (selected.length === 0) return h('div', mergeProps(attrs, { class: 'few-multi-select-value', 'data-placeholder': '' }), props.placeholder);
      const maxDisplay = props.maxDisplay ?? Infinity;
      const visible = selected.slice(0, maxDisplay);
      const overflow = selected.length - visible.length;
      return h('div', mergeProps(attrs, { class: 'few-multi-select-value' }), [
        ...visible.map(item => h('span', { key: item.value, class: 'few-multi-select-chip' }, [
          item.label,
          h('button', {
            type: 'button', class: 'few-multi-select-chip-remove', 'aria-label': `Remover ${item.label}`,
            onClick: (event: MouseEvent) => { event.stopPropagation(); ctx.toggleValue(item.value); },
          }, '×'),
        ])),
        overflow > 0 ? h('span', { class: 'few-multi-select-chip few-multi-select-chip--overflow' }, `+${overflow}`) : null,
      ]);
    };
  },
});

export const FewMultiSelectContent = defineComponent({
  name: 'FewMultiSelectContent',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    side: { type: String as PropType<FloatingSide>, default: 'bottom' },
    align: { type: String as PropType<FloatingAlign>, default: 'start' },
  },
  setup(props, { slots, attrs }) {
    const ctx = useMultiSelect('FewMultiSelectContent');
    const position = usePosition(() => ctx.open(), ctx.triggerRef, ctx.contentRef, () => ({ side: props.side, align: props.align, matchWidth: true }));
    useTopLayer(() => ctx.open(), ctx.contentRef);
    useDismiss(() => ctx.open(), () => { ctx.setOpen(false); ctx.triggerRef.value?.focus(); }, () => [ctx.triggerRef.value, ctx.contentRef.value]);
    watch(() => ctx.open(), (isOpen) => { if (isOpen) ctx.searchRef.value?.focus(); }, { flush: 'post' });
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, {
      ref: ctx.contentRef, popover: 'manual', role: 'listbox', 'aria-multiselectable': 'true', id: `${ctx.baseId}-content`,
      'data-state': dataState(ctx.open()), 'data-side': position.value.side, class: 'few-multi-select-content',
      style: { position: 'fixed', top: `${position.value.top}px`, left: `${position.value.left}px`, width: position.value.width !== undefined ? `${position.value.width}px` : undefined },
    }), slots);
  },
});

export const FewMultiSelectSearch = defineComponent({
  name: 'FewMultiSelectSearch',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const ctx = useMultiSelect('FewMultiSelectSearch');
    return () => renderPrimitive('input', props.asChild, mergeProps(attrs, {
      ref: ctx.searchRef, type: 'text', role: 'searchbox', 'aria-label': (attrs['aria-label'] as string | undefined) ?? 'Buscar opções', autocomplete: 'off',
      'aria-activedescendant': ctx.activeValue() ? `${ctx.baseId}-item-${ctx.activeValue()}` : undefined,
      value: ctx.search(), class: 'few-multi-select-search',
      onInput: (event: Event) => { ctx.setSearch((event.target as HTMLInputElement).value); ctx.setActiveValue(null); },
      onKeydown: (event: KeyboardEvent) => {
        if (event.defaultPrevented) return;
        const navigable = ctx.items().filter(item => ctx.visibleValues().has(item.value) && !item.disabled);
        const currentIndex = navigable.findIndex(item => item.value === ctx.activeValue());
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
          event.preventDefault();
          const idx = nextIndex(event.key, currentIndex, navigable.length, { orientation: 'vertical', loop: false });
          if (idx !== null && navigable[idx]) ctx.setActiveValue(navigable[idx].value);
          return;
        }
        if (event.key === 'Enter' || event.key === ' ') {
          const active = ctx.activeValue();
          if (active) { event.preventDefault(); ctx.toggleValue(active); }
          return;
        }
        if (event.key === 'Backspace' && ctx.search() === '' && ctx.value().length > 0) ctx.setValue(ctx.value().slice(0, -1));
      },
    }), slots);
  },
});

export const FewMultiSelectItem = defineComponent({
  name: 'FewMultiSelectItem',
  inheritAttrs: false,
  props: { asChild: Boolean, value: { type: String, required: true }, disabled: Boolean, textValue: { type: String, default: undefined } },
  setup(props, { slots, attrs }) {
    const ctx = useMultiSelect('FewMultiSelectItem');
    const host = ref<HTMLElement | null>(null);
    watch([() => props.value, () => props.textValue, () => props.disabled], ([value, textValue, disabled], _old, onCleanup) => {
      ctx.registerItem({ value, label: textValue ?? host.value?.textContent ?? value, disabled });
      onCleanup(() => ctx.unregisterItem(value));
    }, { immediate: true, flush: 'post' });
    const visible = computed(() => ctx.visibleValues().has(props.value));
    const checked = computed(() => ctx.value().includes(props.value));
    const highlighted = computed(() => ctx.activeValue() === props.value);
    provideMultiSelectItem({ checked: () => checked.value, disabled: () => props.disabled });
    return () => {
      if (!visible.value) return null;
      return renderPrimitive('div', props.asChild, mergeProps(attrs, {
        ref: host, role: 'option', id: `${ctx.baseId}-item-${props.value}`, 'aria-selected': checked.value, 'aria-disabled': props.disabled,
        'data-state': checked.value ? 'checked' : 'unchecked', 'data-highlighted': dataAttr(highlighted.value), 'data-disabled': dataAttr(props.disabled), 'data-value': props.value,
        class: 'few-multi-select-item',
        onPointermove: () => { if (!props.disabled) ctx.setActiveValue(props.value); },
        onClick: () => { if (!props.disabled) ctx.toggleValue(props.value); },
      }), slots);
    };
  },
});

export const FewMultiSelectItemIndicator = defineComponent({
  name: 'FewMultiSelectItemIndicator',
  inheritAttrs: false,
  props: { asChild: Boolean, forceMount: Boolean },
  setup(props, { slots, attrs }) {
    const item = useMultiSelectItem('FewMultiSelectItemIndicator');
    return () => {
      if (!item.checked() && !props.forceMount) return null;
      return renderPrimitive('span', props.asChild, mergeProps(attrs, { 'aria-hidden': 'true', class: 'few-multi-select-item-indicator' }), withDefault(slots, () => ['✓']));
    };
  },
});

export const FewMultiSelectEmpty = defineComponent({
  name: 'FewMultiSelectEmpty',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const ctx = useMultiSelect('FewMultiSelectEmpty');
    return () => {
      if (ctx.items().length > 0 && ctx.visibleValues().size > 0) return null;
      return renderPrimitive('div', props.asChild, mergeProps(attrs, { role: 'status', class: 'few-multi-select-empty' }), slots);
    };
  },
});

/** Parte opcional: alterna todos os itens visíveis de uma vez. */
export const FewMultiSelectSelectAll = defineComponent({
  name: 'FewMultiSelectSelectAll',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const ctx = useMultiSelect('FewMultiSelectSelectAll');
    return () => {
      const visibleItems = ctx.items().filter(item => ctx.visibleValues().has(item.value) && !item.disabled);
      const allSelected = visibleItems.length > 0 && visibleItems.every(item => ctx.value().includes(item.value));
      return renderPrimitive('div', props.asChild, mergeProps(attrs, {
        role: 'option', 'aria-selected': allSelected, 'data-state': allSelected ? 'checked' : 'unchecked', class: 'few-multi-select-item few-multi-select-select-all',
        onClick: () => {
          const visibleValuesArr = visibleItems.map(item => item.value);
          ctx.setValue(allSelected ? ctx.value().filter(v => !visibleValuesArr.includes(v)) : Array.from(new Set([...ctx.value(), ...visibleValuesArr])));
        },
      }), withDefault(slots, () => [allSelected ? 'Limpar seleção' : 'Selecionar todos']));
    };
  },
});
