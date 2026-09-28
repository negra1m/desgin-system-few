// Accordion: painéis expansíveis com roving focus (ver docs/composition-vue.md, padrão Radix Accordion).
import { computed, defineComponent, h, mergeProps, ref, type PropType } from 'vue';
import type { Orientation } from '@fewcompany/core';
import { createContext } from '../../lib/context.js';
import { useControllable } from '../../lib/use-controllable.js';
import { useId } from '../../lib/ids.js';
import { moveFocus } from '../../lib/roving.js';
import { renderPrimitive, dataAttr } from '../../lib/primitive.js';

interface AccordionContextValue { baseId: string; type: () => 'single' | 'multiple'; values: () => string[]; toggle: (value: string) => void; orientation: () => Orientation }
const [provideAccordion, useAccordion] = createContext<AccordionContextValue>('FewAccordion');
interface AccordionItemContextValue { value: string; open: () => boolean; disabled: () => boolean }
const [provideAccordionItem, useAccordionItem] = createContext<AccordionItemContextValue>('FewAccordion.Item');

/** Raiz: `<FewAccordion type="single" collapsible v-model:value="open">`. `type="multiple"` usa array em `value`/`defaultValue`. */
export const FewAccordion = defineComponent({
  name: 'FewAccordion',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    type: { type: String as PropType<'single' | 'multiple'>, default: 'single' },
    /** Só vale para `type="single"`: permite fechar o item aberto sem abrir outro. */
    collapsible: { type: Boolean, default: false },
    value: { type: [String, Array] as PropType<string | string[] | undefined>, default: undefined },
    defaultValue: { type: [String, Array] as PropType<string | string[] | undefined>, default: undefined },
    orientation: { type: String as PropType<Orientation>, default: 'vertical' },
  },
  emits: { 'update:value': (value: string | string[]) => typeof value === 'string' || Array.isArray(value) },
  setup(props, { slots, attrs, emit }) {
    const baseId = useId('accordion');
    const resolvedDefault = props.defaultValue ?? (props.type === 'multiple' ? [] : '');
    const [raw, setRaw] = useControllable<string | string[]>(() => props.value, resolvedDefault, v => emit('update:value', v));
    const values = computed(() => (Array.isArray(raw.value) ? raw.value : raw.value ? [raw.value] : []));
    function toggle(itemValue: string) {
      if (props.type === 'multiple') {
        setRaw(current => {
          const list = Array.isArray(current) ? current : [];
          return list.includes(itemValue) ? list.filter(v => v !== itemValue) : [...list, itemValue];
        });
      } else {
        setRaw(current => (current === itemValue ? (props.collapsible ? '' : current) : itemValue));
      }
    }
    provideAccordion({ baseId, type: () => props.type, values: () => values.value, toggle, orientation: () => props.orientation });
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { class: 'few-accordion', 'data-orientation': props.orientation }), slots);
  },
});

export const FewAccordionItem = defineComponent({
  name: 'FewAccordionItem',
  inheritAttrs: false,
  props: { asChild: Boolean, value: { type: String, required: true }, disabled: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    const accordion = useAccordion('FewAccordion.Item');
    const open = computed(() => accordion.values().includes(props.value));
    provideAccordionItem({ value: props.value, open: () => open.value, disabled: () => props.disabled });
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, {
      class: 'few-accordion-item', 'data-state': open.value ? 'open' : 'closed', 'data-disabled': dataAttr(props.disabled),
    }), slots);
  },
});

export const FewAccordionHeader = defineComponent({
  name: 'FewAccordionHeader',
  inheritAttrs: false,
  props: { asChild: Boolean, level: { type: Number as PropType<1 | 2 | 3 | 4 | 5 | 6>, default: 3 } },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive(`h${props.level}`, props.asChild, mergeProps(attrs, { class: 'few-accordion-header' }), slots);
  },
});

export const FewAccordionTrigger = defineComponent({
  name: 'FewAccordionTrigger',
  inheritAttrs: false,
  props: { asChild: Boolean, disabled: { type: Boolean, default: undefined } },
  setup(props, { slots, attrs }) {
    const accordion = useAccordion('FewAccordion.Trigger');
    const item = useAccordionItem('FewAccordion.Trigger');
    const host = ref<HTMLElement | null>(null);
    const isDisabled = computed(() => props.disabled || item.disabled());
    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || isDisabled.value) return;
      accordion.toggle(item.value);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented) return;
      const container = host.value?.closest('.few-accordion') ?? null;
      const target = moveFocus(container, '.few-accordion-trigger', event.key, { orientation: accordion.orientation() });
      if (target) event.preventDefault();
    }
    return () => renderPrimitive('button', props.asChild, mergeProps(attrs, {
      ref: host, type: 'button', id: `${accordion.baseId}-trigger-${item.value}`, 'aria-expanded': item.open(),
      'aria-controls': `${accordion.baseId}-content-${item.value}`, disabled: isDisabled.value || undefined,
      'data-state': item.open() ? 'open' : 'closed', 'data-disabled': dataAttr(isDisabled.value),
      class: 'few-accordion-trigger', onClick: handleClick, onKeydown: handleKeyDown,
    }), slots);
  },
});

export const FewAccordionContent = defineComponent({
  name: 'FewAccordionContent',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const accordion = useAccordion('FewAccordion.Content');
    const item = useAccordionItem('FewAccordion.Content');
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, {
      role: 'region', id: `${accordion.baseId}-content-${item.value}`, 'aria-labelledby': `${accordion.baseId}-trigger-${item.value}`,
      inert: item.open() ? undefined : true,
      'data-state': item.open() ? 'open' : 'closed', class: 'few-accordion-content',
    }), slots, (children) => [h('div', { class: 'few-accordion-content-inner' }, children)]);
  },
});
