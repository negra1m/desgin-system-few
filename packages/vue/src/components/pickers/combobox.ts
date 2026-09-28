// Combobox: Input de texto que filtra opções (contains, sem acento) via filterOptions do core.
// O foco permanece no Input; a opção "ativa" é sinalizada por aria-activedescendant (não move foco real).
// Fonte da verdade: packages/react/src/components/pickers/combobox.tsx.
import { computed, defineComponent, mergeProps, ref, watch, type PropType, type Slots, type VNodeArrayChildren } from 'vue';
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

interface ComboboxItemData { value: string; label: string; disabled?: boolean }
interface ComboboxContext {
  baseId: string;
  value: () => string; setValue: (value: string) => void;
  inputValue: () => string; setInputValue: (value: string) => void;
  open: () => boolean; setOpen: (open: boolean) => void;
  disabled: () => boolean | undefined; allowCustomValue: () => boolean;
  activeValue: () => string | null; setActiveValue: (value: string | null) => void;
  items: () => ComboboxItemData[];
  registerItem: (item: ComboboxItemData) => void;
  unregisterItem: (value: string) => void;
  visibleValues: () => Set<string>;
  inputRef: import('vue').Ref<HTMLInputElement | null>;
  contentRef: import('vue').Ref<HTMLDivElement | null>;
}
const [provideCombobox, useCombobox] = createContext<ComboboxContext>('FewCombobox');
interface ComboboxItemState { selected: () => boolean; disabled: () => boolean | undefined }
const [provideComboboxItem, useComboboxItem] = createContext<ComboboxItemState>('FewComboboxItem');

/** Raiz: `<FewCombobox v-model:value="v" v-model:input-value="text">`. `allowCustomValue` aceita Enter num texto sem opção correspondente. */
export const FewCombobox = defineComponent({
  name: 'FewCombobox',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    value: { type: String, default: undefined },
    defaultValue: { type: String, default: '' },
    inputValue: { type: String, default: undefined },
    defaultInputValue: { type: String, default: '' },
    open: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: false },
    disabled: Boolean,
    allowCustomValue: Boolean,
  },
  emits: {
    'update:value': (value: string) => typeof value === 'string',
    'update:inputValue': (value: string) => typeof value === 'string',
    'update:open': (open: boolean) => typeof open === 'boolean',
  },
  setup(props, { slots, attrs, emit }) {
    const baseId = useId('combobox');
    const [value, setValue] = useControllable(() => props.value, props.defaultValue, v => emit('update:value', v));
    const [inputValue, setInputValue] = useControllable(() => props.inputValue, props.defaultInputValue, v => emit('update:inputValue', v));
    const [open, setOpen] = useControllable(() => props.open, props.defaultOpen, v => emit('update:open', v));
    const activeValue = ref<string | null>(null);
    const items = ref<ComboboxItemData[]>([]);
    const registerItem = (item: ComboboxItemData) => { items.value = [...items.value.filter(i => i.value !== item.value), item]; };
    const unregisterItem = (itemValue: string) => { items.value = items.value.filter(i => i.value !== itemValue); };
    const visibleValues = computed(() => new Set(filterOptions(items.value, inputValue.value, item => item.label).map(item => item.value)));
    provideCombobox({
      baseId, value: () => value.value, setValue, inputValue: () => inputValue.value, setInputValue,
      open: () => open.value, setOpen, disabled: () => props.disabled, allowCustomValue: () => props.allowCustomValue,
      activeValue: () => activeValue.value, setActiveValue: (v: string | null) => { activeValue.value = v; },
      items: () => items.value, registerItem, unregisterItem, visibleValues: () => visibleValues.value,
      inputRef: ref<HTMLInputElement | null>(null), contentRef: ref<HTMLDivElement | null>(null),
    });
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { class: 'few-combobox', 'data-disabled': dataAttr(props.disabled) }), slots);
  },
});

export const FewComboboxInput = defineComponent({
  name: 'FewComboboxInput',
  inheritAttrs: false,
  props: { asChild: Boolean, disabled: { type: Boolean, default: undefined } },
  setup(props, { slots, attrs }) {
    const ctx = useCombobox('FewComboboxInput');
    const disabled = computed(() => props.disabled ?? ctx.disabled());
    return () => renderPrimitive('input', props.asChild, mergeProps(attrs, {
      ref: ctx.inputRef, type: 'text', role: 'combobox', id: `${ctx.baseId}-input`, autocomplete: 'off',
      'aria-autocomplete': 'list', 'aria-expanded': ctx.open(), 'aria-controls': `${ctx.baseId}-content`,
      'aria-activedescendant': ctx.activeValue() ? `${ctx.baseId}-item-${ctx.activeValue()}` : undefined,
      disabled: disabled.value || undefined, value: ctx.inputValue(), 'data-state': dataState(ctx.open()),
      class: 'few-combobox-input',
      onFocus: () => { if (!disabled.value) ctx.setOpen(true); },
      onInput: (event: Event) => { ctx.setInputValue((event.target as HTMLInputElement).value); ctx.setOpen(true); ctx.setActiveValue(null); },
      onKeydown: (event: KeyboardEvent) => {
        if (event.defaultPrevented || disabled.value) return;
        const navigable = ctx.items().filter(item => ctx.visibleValues().has(item.value) && !item.disabled);
        const currentIndex = navigable.findIndex(item => item.value === ctx.activeValue());
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
          event.preventDefault();
          ctx.setOpen(true);
          const idx = nextIndex(event.key, currentIndex, navigable.length, { orientation: 'vertical', loop: false });
          if (idx !== null && navigable[idx]) ctx.setActiveValue(navigable[idx].value);
          return;
        }
        if (event.key === 'Enter') {
          event.preventDefault();
          const active = navigable.find(item => item.value === ctx.activeValue());
          if (active) { ctx.setValue(active.value); ctx.setInputValue(active.label); ctx.setOpen(false); }
          else if (ctx.allowCustomValue() && ctx.inputValue()) { ctx.setValue(ctx.inputValue()); ctx.setOpen(false); }
        }
      },
    }), slots);
  },
});

export const FewComboboxTrigger = defineComponent({
  name: 'FewComboboxTrigger',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const ctx = useCombobox('FewComboboxTrigger');
    return () => renderPrimitive('button', props.asChild, mergeProps(attrs, {
      type: 'button', tabindex: -1, 'aria-hidden': 'true', disabled: ctx.disabled() || undefined, class: 'few-combobox-trigger',
      onClick: () => { ctx.setOpen(!ctx.open()); ctx.inputRef.value?.focus(); },
    }), withDefault(slots, () => ['▾']));
  },
});

export const FewComboboxContent = defineComponent({
  name: 'FewComboboxContent',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    side: { type: String as PropType<FloatingSide>, default: 'bottom' },
    align: { type: String as PropType<FloatingAlign>, default: 'start' },
  },
  setup(props, { slots, attrs }) {
    const ctx = useCombobox('FewComboboxContent');
    const position = usePosition(() => ctx.open(), ctx.inputRef, ctx.contentRef, () => ({ side: props.side, align: props.align, matchWidth: true }));
    useTopLayer(() => ctx.open(), ctx.contentRef);
    useDismiss(() => ctx.open(), () => ctx.setOpen(false), () => [ctx.inputRef.value, ctx.contentRef.value]);
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, {
      ref: ctx.contentRef, popover: 'manual', role: 'listbox', id: `${ctx.baseId}-content`, 'aria-labelledby': `${ctx.baseId}-input`,
      'data-state': dataState(ctx.open()), 'data-side': position.value.side, class: 'few-combobox-content',
      style: { position: 'fixed', top: `${position.value.top}px`, left: `${position.value.left}px`, width: position.value.width !== undefined ? `${position.value.width}px` : undefined },
    }), slots);
  },
});

export const FewComboboxGroup = defineComponent({
  name: 'FewComboboxGroup',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) { return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { role: 'group', class: 'few-combobox-group' }), slots); },
});

export const FewComboboxLabel = defineComponent({
  name: 'FewComboboxLabel',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) { return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { class: 'few-combobox-label' }), slots); },
});

export const FewComboboxItem = defineComponent({
  name: 'FewComboboxItem',
  inheritAttrs: false,
  props: { asChild: Boolean, value: { type: String, required: true }, disabled: Boolean, textValue: { type: String, default: undefined } },
  setup(props, { slots, attrs }) {
    const ctx = useCombobox('FewComboboxItem');
    const host = ref<HTMLElement | null>(null);
    watch([() => props.value, () => props.textValue, () => props.disabled], ([value, textValue, disabled], _old, onCleanup) => {
      ctx.registerItem({ value, label: textValue ?? host.value?.textContent ?? value, disabled });
      onCleanup(() => ctx.unregisterItem(value));
    }, { immediate: true, flush: 'post' });
    const visible = computed(() => ctx.visibleValues().has(props.value));
    const selected = computed(() => ctx.value() === props.value);
    const highlighted = computed(() => ctx.activeValue() === props.value);
    provideComboboxItem({ selected: () => selected.value, disabled: () => props.disabled });
    return () => {
      if (!visible.value) return null;
      return renderPrimitive('div', props.asChild, mergeProps(attrs, {
        ref: host, role: 'option', id: `${ctx.baseId}-item-${props.value}`, 'aria-selected': selected.value, 'aria-disabled': props.disabled,
        'data-state': selected.value ? 'checked' : 'unchecked', 'data-highlighted': dataAttr(highlighted.value), 'data-disabled': dataAttr(props.disabled), 'data-value': props.value,
        class: 'few-combobox-item',
        onPointermove: () => { if (!props.disabled) ctx.setActiveValue(props.value); },
        onClick: () => {
          if (props.disabled) return;
          ctx.setValue(props.value);
          ctx.setInputValue(props.textValue ?? host.value?.textContent ?? props.value);
          ctx.setOpen(false);
          ctx.inputRef.value?.focus();
        },
      }), slots);
    };
  },
});

export const FewComboboxItemText = defineComponent({
  name: 'FewComboboxItemText',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) { return () => renderPrimitive('span', props.asChild, mergeProps(attrs, { class: 'few-combobox-item-text' }), slots); },
});

export const FewComboboxItemIndicator = defineComponent({
  name: 'FewComboboxItemIndicator',
  inheritAttrs: false,
  props: { asChild: Boolean, forceMount: Boolean },
  setup(props, { slots, attrs }) {
    const item = useComboboxItem('FewComboboxItemIndicator');
    return () => {
      if (!item.selected() && !props.forceMount) return null;
      return renderPrimitive('span', props.asChild, mergeProps(attrs, { 'aria-hidden': 'true', class: 'few-combobox-item-indicator' }), withDefault(slots, () => ['✓']));
    };
  },
});

export const FewComboboxEmpty = defineComponent({
  name: 'FewComboboxEmpty',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const ctx = useCombobox('FewComboboxEmpty');
    return () => {
      if (ctx.items().length > 0 && ctx.visibleValues().size > 0) return null;
      return renderPrimitive('div', props.asChild, mergeProps(attrs, { role: 'status', class: 'few-combobox-empty' }), slots);
    };
  },
});
