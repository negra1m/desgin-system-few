// Ver docs/composition-vue.md. Fonte da verdade: packages/react/src/components/forms/checkbox-group.tsx
import { defineComponent, h, mergeProps, type PropType } from 'vue';
import type { Orientation } from '@fewcompany/core';
import { toggleValue } from '@fewcompany/core';
import { createContext } from '../../lib/context.js';
import { useControllable } from '../../lib/use-controllable.js';
import { renderPrimitive } from '../../lib/primitive.js';
import { FewCheckbox } from './checkbox.js';

interface CheckboxGroupContextValue { value: () => string[]; toggle: (value: string) => void; name: () => string | undefined; disabled: () => boolean | undefined }
const [provideCheckboxGroup, useCheckboxGroup] = createContext<CheckboxGroupContextValue>('FewCheckboxGroup');

export const FewCheckboxGroup = defineComponent({
  name: 'FewCheckboxGroup',
  inheritAttrs: false,
  props: {
    asChild: Boolean, value: { type: Array as PropType<string[]>, default: undefined }, defaultValue: { type: Array as PropType<string[]>, default: () => [] },
    name: { type: String, default: undefined }, disabled: Boolean, orientation: { type: String as PropType<Orientation>, default: 'vertical' },
  },
  emits: { 'update:value': (_value: string[]) => true },
  setup(props, { slots, attrs, emit }) {
    const [current, setCurrent] = useControllable<string[]>(() => props.value, props.defaultValue, v => emit('update:value', v));
    function toggle(item: string) { setCurrent(toggleValue(current.value, item)); }
    provideCheckboxGroup({ value: () => current.value, toggle, name: () => props.name, disabled: () => props.disabled });
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, {
      role: 'group', 'data-orientation': props.orientation, class: 'few-checkbox-group',
    }), slots);
  },
});

export const FewCheckboxGroupItem = defineComponent({
  name: 'FewCheckboxGroupItem',
  inheritAttrs: false,
  props: { value: { type: String, required: true }, disabled: { type: Boolean, default: undefined }, name: { type: String, default: undefined } },
  setup(props, { slots, attrs }) {
    const group = useCheckboxGroup('FewCheckboxGroupItem');
    const checked = () => group.value().includes(props.value);
    return () => h(FewCheckbox, mergeProps(attrs, {
      name: props.name ?? group.name(), value: props.value, checked: checked(), disabled: props.disabled ?? group.disabled(),
      'onUpdate:checked': () => group.toggle(props.value),
    }), slots);
  },
});
