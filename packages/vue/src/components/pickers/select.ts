// Select: Trigger tipo combobox abre um listbox posicionado (popover) com navegação por teclado completa.
// Ao abrir, o foco DOM move para a opção selecionada (ou a primeira); setas/Home/End roam entre opções,
// Enter/Espaço seleciona, Escape fecha e devolve o foco ao Trigger. Fonte da verdade: packages/react/src/components/pickers/select.tsx.
import { computed, defineComponent, h, mergeProps, ref, watch, type PropType, type Slots, type VNodeArrayChildren } from 'vue';
import type { FloatingAlign, FloatingSide } from '@fewcompany/core';
import { typeaheadIndex } from '@fewcompany/core';
import { createContext } from '../../lib/context.js';
import { useControllable } from '../../lib/use-controllable.js';
import { useId } from '../../lib/ids.js';
import { moveFocus, focusableItems } from '../../lib/roving.js';
import { useDismiss } from '../../lib/use-dismiss.js';
import { usePosition } from '../../lib/use-position.js';
import { useTopLayer } from '../../lib/use-top-layer.js';
import { renderPrimitive, dataAttr, dataState } from '../../lib/primitive.js';

/** Slot com conteúdo padrão quando o consumidor não passa filhos (ex.: ícones/indicadores '▾', '✓'). */
function withDefault(slots: Slots, fallback: () => VNodeArrayChildren): Slots {
  return { default: () => { const kids = slots.default?.() ?? []; return kids.length ? kids : fallback(); } } as unknown as Slots;
}

interface SelectItemData { value: string; label: string; disabled?: boolean }
interface SelectContext {
  baseId: string;
  value: () => string; setValue: (value: string) => void;
  open: () => boolean; setOpen: (open: boolean) => void;
  disabled: () => boolean | undefined; required: () => boolean | undefined;
  triggerRef: import('vue').Ref<HTMLButtonElement | null>;
  contentRef: import('vue').Ref<HTMLDivElement | null>;
  items: () => SelectItemData[];
  registerItem: (item: SelectItemData) => void;
  unregisterItem: (value: string) => void;
}
const [provideSelect, useSelect] = createContext<SelectContext>('FewSelect');
interface SelectItemState { selected: () => boolean; disabled: () => boolean | undefined }
const [provideSelectItem, useSelectItem] = createContext<SelectItemState>('FewSelectItem');

/** Raiz: `<FewSelect v-model:value="v">`. Com `name`, renderiza um `<select>` oculto (few-sr-only) para formulários. */
export const FewSelect = defineComponent({
  name: 'FewSelect',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    value: { type: String, default: undefined },
    defaultValue: { type: String, default: '' },
    open: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: false },
    name: { type: String, default: undefined },
    disabled: Boolean,
    required: Boolean,
  },
  emits: { 'update:value': (value: string) => typeof value === 'string', 'update:open': (open: boolean) => typeof open === 'boolean' },
  setup(props, { slots, attrs, emit }) {
    const baseId = useId('select');
    const [value, setValue] = useControllable(() => props.value, props.defaultValue, v => emit('update:value', v));
    const [open, setOpen] = useControllable(() => props.open, props.defaultOpen, v => emit('update:open', v));
    const triggerRef = ref<HTMLButtonElement | null>(null);
    const contentRef = ref<HTMLDivElement | null>(null);
    const items = ref<SelectItemData[]>([]);
    const registerItem = (item: SelectItemData) => { items.value = [...items.value.filter(i => i.value !== item.value), item]; };
    const unregisterItem = (itemValue: string) => { items.value = items.value.filter(i => i.value !== itemValue); };
    provideSelect({
      baseId, value: () => value.value, setValue, open: () => open.value, setOpen,
      disabled: () => props.disabled, required: () => props.required,
      triggerRef, contentRef, items: () => items.value, registerItem, unregisterItem,
    });
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { class: 'few-select', 'data-disabled': dataAttr(props.disabled) }), slots,
      props.name ? (children: VNodeArrayChildren) => [...children, h('select', {
        tabindex: -1, 'aria-hidden': 'true', class: 'few-sr-only', name: props.name, required: props.required || undefined,
        disabled: props.disabled || undefined, value: value.value, onChange: () => {},
      }, [h('option', { value: '' }), ...items.value.map(item => h('option', { key: item.value, value: item.value }, item.label))])] : undefined);
  },
});

export const FewSelectTrigger = defineComponent({
  name: 'FewSelectTrigger',
  inheritAttrs: false,
  props: { asChild: Boolean, disabled: { type: Boolean, default: undefined } },
  setup(props, { slots, attrs }) {
    const ctx = useSelect('FewSelectTrigger');
    const disabled = computed(() => props.disabled ?? ctx.disabled());
    return () => renderPrimitive('button', props.asChild, mergeProps(attrs, {
      ref: ctx.triggerRef, type: 'button', role: 'combobox', id: `${ctx.baseId}-trigger`,
      'aria-haspopup': 'listbox', 'aria-expanded': ctx.open(), 'aria-controls': `${ctx.baseId}-content`, 'aria-required': ctx.required(),
      disabled: disabled.value || undefined, 'data-state': dataState(ctx.open()), 'data-disabled': dataAttr(disabled.value),
      class: 'few-select-trigger',
      onClick: () => { if (!disabled.value) ctx.setOpen(!ctx.open()); },
      onKeydown: (event: KeyboardEvent) => {
        if (event.defaultPrevented || disabled.value || ctx.open()) return;
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ') { event.preventDefault(); ctx.setOpen(true); }
      },
    }), slots);
  },
});

export const FewSelectValue = defineComponent({
  name: 'FewSelectValue',
  inheritAttrs: false,
  props: { asChild: Boolean, placeholder: { type: String, default: undefined } },
  setup(props, { slots, attrs }) {
    const ctx = useSelect('FewSelectValue');
    return () => {
      if (props.asChild || slots.default) return renderPrimitive('span', props.asChild, mergeProps(attrs, { class: 'few-select-value' }), slots);
      const selectedLabel = ctx.items().find(item => item.value === ctx.value())?.label;
      return h('span', mergeProps(attrs, { class: 'few-select-value', 'data-placeholder': dataAttr(!selectedLabel) }), selectedLabel ?? props.placeholder);
    };
  },
});

export const FewSelectIcon = defineComponent({
  name: 'FewSelectIcon',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('span', props.asChild, mergeProps(attrs, { 'aria-hidden': 'true', class: 'few-select-icon' }), withDefault(slots, () => ['▾']));
  },
});

export const FewSelectContent = defineComponent({
  name: 'FewSelectContent',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    side: { type: String as PropType<FloatingSide>, default: 'bottom' },
    align: { type: String as PropType<FloatingAlign>, default: 'start' },
  },
  setup(props, { slots, attrs }) {
    const ctx = useSelect('FewSelectContent');
    let typed = '';
    let typedTimer: number | undefined;
    const position = usePosition(() => ctx.open(), ctx.triggerRef, ctx.contentRef, () => ({ side: props.side, align: props.align, matchWidth: true }));
    useTopLayer(() => ctx.open(), ctx.contentRef);
    useDismiss(() => ctx.open(), () => { ctx.setOpen(false); ctx.triggerRef.value?.focus(); }, () => [ctx.triggerRef.value, ctx.contentRef.value]);
    watch(() => ctx.open(), (isOpen) => {
      if (!isOpen) return;
      const container = ctx.contentRef.value;
      const target = container?.querySelector<HTMLElement>('[role="option"][aria-selected="true"]') ?? container?.querySelector<HTMLElement>('[role="option"]');
      target?.focus();
    }, { flush: 'post' });
    function onKeydown(event: KeyboardEvent) {
      if (event.defaultPrevented) return;
      const container = ctx.contentRef.value;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        const active = document.activeElement as HTMLElement | null;
        if (active?.getAttribute('role') === 'option' && active.dataset['value'] !== undefined) {
          ctx.setValue(active.dataset['value']);
          ctx.setOpen(false);
          ctx.triggerRef.value?.focus();
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
        window.clearTimeout(typedTimer);
        typed += event.key;
        const found = typeaheadIndex(labels, typed, current < 0 ? 0 : current);
        typedTimer = window.setTimeout(() => { typed = ''; }, 500);
        if (found !== null) { event.preventDefault(); options[found]?.focus(); }
      }
    }
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, {
      ref: ctx.contentRef, popover: 'manual', role: 'listbox', id: `${ctx.baseId}-content`, 'aria-labelledby': `${ctx.baseId}-trigger`,
      'data-state': dataState(ctx.open()), 'data-side': position.value.side, class: 'few-select-content',
      style: { position: 'fixed', top: `${position.value.top}px`, left: `${position.value.left}px`, width: position.value.width !== undefined ? `${position.value.width}px` : undefined },
      onKeydown,
    }), slots);
  },
});

export const FewSelectViewport = defineComponent({
  name: 'FewSelectViewport',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) { return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { role: 'presentation', class: 'few-select-viewport' }), slots); },
});

export const FewSelectGroup = defineComponent({
  name: 'FewSelectGroup',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) { return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { role: 'group', class: 'few-select-group' }), slots); },
});

export const FewSelectLabel = defineComponent({
  name: 'FewSelectLabel',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) { return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { class: 'few-select-label' }), slots); },
});

export const FewSelectItem = defineComponent({
  name: 'FewSelectItem',
  inheritAttrs: false,
  props: { asChild: Boolean, value: { type: String, required: true }, disabled: Boolean, textValue: { type: String, default: undefined } },
  setup(props, { slots, attrs }) {
    const ctx = useSelect('FewSelectItem');
    const host = ref<HTMLElement | null>(null);
    const selected = computed(() => ctx.value() === props.value);
    watch([() => props.value, () => props.textValue, () => props.disabled], ([value, textValue, disabled], _old, onCleanup) => {
      ctx.registerItem({ value, label: textValue ?? host.value?.textContent ?? value, disabled });
      onCleanup(() => ctx.unregisterItem(value));
    }, { immediate: true, flush: 'post' });
    provideSelectItem({ selected: () => selected.value, disabled: () => props.disabled });
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, {
      ref: host, role: 'option', id: `${ctx.baseId}-item-${props.value}`, 'aria-selected': selected.value, 'aria-disabled': props.disabled, tabindex: -1,
      'data-state': selected.value ? 'checked' : 'unchecked', 'data-disabled': dataAttr(props.disabled), 'data-value': props.value,
      class: 'few-select-item',
      onClick: () => { if (props.disabled) return; ctx.setValue(props.value); ctx.setOpen(false); ctx.triggerRef.value?.focus(); },
    }), slots);
  },
});

export const FewSelectItemText = defineComponent({
  name: 'FewSelectItemText',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) { return () => renderPrimitive('span', props.asChild, mergeProps(attrs, { class: 'few-select-item-text' }), slots); },
});

export const FewSelectItemIndicator = defineComponent({
  name: 'FewSelectItemIndicator',
  inheritAttrs: false,
  props: { asChild: Boolean, forceMount: Boolean },
  setup(props, { slots, attrs }) {
    const item = useSelectItem('FewSelectItemIndicator');
    return () => {
      if (!item.selected() && !props.forceMount) return null;
      return renderPrimitive('span', props.asChild, mergeProps(attrs, { 'aria-hidden': 'true', class: 'few-select-item-indicator' }), withDefault(slots, () => ['✓']));
    };
  },
});

export const FewSelectSeparator = defineComponent({
  name: 'FewSelectSeparator',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) { return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { role: 'separator', 'aria-orientation': 'horizontal', class: 'few-select-separator' }), slots); },
});
