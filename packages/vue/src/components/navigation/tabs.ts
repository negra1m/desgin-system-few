// Implementação de referência do padrão composto em Vue (ver docs/composition-vue.md).
import { computed, defineComponent, mergeProps, ref, type PropType } from 'vue';
import type { Orientation } from '@fewcompany/core';
import { createContext } from '../../lib/context.js';
import { useControllable } from '../../lib/use-controllable.js';
import { useId } from '../../lib/ids.js';
import { moveFocus } from '../../lib/roving.js';
import { renderPrimitive, dataAttr } from '../../lib/primitive.js';

interface TabsContext { baseId: string; value: () => string; setValue: (value: string) => void; orientation: () => Orientation; activation: () => 'automatic' | 'manual' }
const [provideTabs, useTabs] = createContext<TabsContext>('FewTabs');

/** Raiz: `<FewTabs v-model:value="tab">`. Sem `value`, o estado é interno (`defaultValue`). */
export const FewTabs = defineComponent({
  name: 'FewTabs',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    value: { type: String, default: undefined },
    defaultValue: { type: String, default: '' },
    orientation: { type: String as PropType<Orientation>, default: 'horizontal' },
    /** automatic: seta seleciona; manual: seta só move o foco, Enter/Espaço seleciona. */
    activation: { type: String as PropType<'automatic' | 'manual'>, default: 'automatic' },
  },
  emits: { 'update:value': (value: string) => typeof value === 'string' },
  setup(props, { slots, attrs, emit }) {
    const [value, setValue] = useControllable(() => props.value, props.defaultValue, v => emit('update:value', v));
    const baseId = useId('tabs');
    provideTabs({ baseId, value: () => value.value, setValue, orientation: () => props.orientation, activation: () => props.activation });
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { class: 'few-tabs', 'data-orientation': props.orientation }), slots);
  },
});

export const FewTabsList = defineComponent({
  name: 'FewTabsList',
  inheritAttrs: false,
  props: { asChild: Boolean, loop: { type: Boolean, default: true } },
  setup(props, { slots, attrs }) {
    const tabs = useTabs('FewTabsList');
    const host = ref<HTMLElement | null>(null);
    const onKeydown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      const target = moveFocus(host.value, '[role="tab"]', event.key, { orientation: tabs.orientation(), loop: props.loop });
      if (!target) return;
      event.preventDefault();
      if (tabs.activation() === 'automatic' && target.dataset['value'] !== undefined) tabs.setValue(target.dataset['value']);
    };
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { ref: host, role: 'tablist', 'aria-orientation': tabs.orientation(), class: 'few-tabs-list', 'data-orientation': tabs.orientation(), onKeydown }), slots);
  },
});

export const FewTabsTrigger = defineComponent({
  name: 'FewTabsTrigger',
  inheritAttrs: false,
  props: { asChild: Boolean, value: { type: String, required: true }, disabled: Boolean },
  setup(props, { slots, attrs }) {
    const tabs = useTabs('FewTabsTrigger');
    const active = computed(() => tabs.value() === props.value);
    return () => renderPrimitive('button', props.asChild, mergeProps(attrs, {
      type: 'button', role: 'tab', id: `${tabs.baseId}-tab-${props.value}`, 'aria-selected': active.value, 'aria-controls': `${tabs.baseId}-panel-${props.value}`,
      tabindex: active.value ? 0 : -1, disabled: props.disabled || undefined, 'data-state': active.value ? 'active' : 'inactive', 'data-value': props.value, 'data-disabled': dataAttr(props.disabled),
      class: 'few-tabs-trigger', onClick: () => { if (!props.disabled) tabs.setValue(props.value); },
    }), slots);
  },
});

/** Painel: desmonta quando inativo, salvo `forceMount` (fica com `hidden`). */
export const FewTabsContent = defineComponent({
  name: 'FewTabsContent',
  inheritAttrs: false,
  props: { asChild: Boolean, value: { type: String, required: true }, forceMount: Boolean },
  setup(props, { slots, attrs }) {
    const tabs = useTabs('FewTabsContent');
    const active = computed(() => tabs.value() === props.value);
    return () => {
      if (!active.value && !props.forceMount) return null;
      return renderPrimitive('div', props.asChild, mergeProps(attrs, {
        role: 'tabpanel', id: `${tabs.baseId}-panel-${props.value}`, 'aria-labelledby': `${tabs.baseId}-tab-${props.value}`, hidden: !active.value, tabindex: 0,
        'data-state': active.value ? 'active' : 'inactive', class: 'few-tabs-content',
      }), slots);
    };
  },
});
