// Ver docs/composition-vue.md. Fonte da verdade: packages/react/src/components/forms/radio-group.tsx
import { defineComponent, h, mergeProps, ref, type PropType } from 'vue';
import type { Orientation } from '@fewcompany/core';
import { createContext } from '../../lib/context.js';
import { useControllable } from '../../lib/use-controllable.js';
import { useId } from '../../lib/ids.js';
import { moveFocus } from '../../lib/roving.js';
import { renderPrimitive, dataAttr } from '../../lib/primitive.js';

interface RadioGroupContextValue {
  value: () => string; setValue: (value: string) => void; name: string; disabled: () => boolean | undefined;
}
const [provideRadioGroup, useRadioGroup] = createContext<RadioGroupContextValue>('FewRadioGroup');

export const FewRadioGroup = defineComponent({
  name: 'FewRadioGroup',
  inheritAttrs: false,
  props: {
    asChild: Boolean, value: { type: String, default: undefined }, defaultValue: { type: String, default: '' },
    name: { type: String, default: undefined }, disabled: Boolean, required: Boolean,
    orientation: { type: String as PropType<Orientation>, default: 'vertical' }, loop: { type: Boolean, default: true },
  },
  emits: { 'update:value': (_value: string) => true },
  setup(props, { slots, attrs, emit }) {
    const baseId = useId('radio-group');
    const groupName = props.name ?? baseId;
    const [current, setCurrent] = useControllable(() => props.value, props.defaultValue, v => emit('update:value', v));
    const host = ref<HTMLElement | null>(null);
    provideRadioGroup({ value: () => current.value, setValue: setCurrent, name: groupName, disabled: () => props.disabled });
    function handleKeydown(event: KeyboardEvent) {
      if (event.defaultPrevented) return;
      const target = moveFocus(host.value, 'input[type="radio"]:not(:disabled)', event.key, { orientation: props.orientation, loop: props.loop });
      if (!target) return;
      event.preventDefault();
      setCurrent((target as HTMLInputElement).value);
    }
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, {
      ref: host, role: 'radiogroup', 'aria-orientation': props.orientation, 'aria-required': props.required || undefined,
      'data-orientation': props.orientation, class: 'few-radio-group', onKeydown: handleKeydown,
    }), slots);
  },
});

type RadioItemState = 'checked' | 'unchecked';
interface RadioItemContextValue { state: () => RadioItemState }
const [provideRadioItem, useRadioItemState] = createContext<RadioItemContextValue>('FewRadioGroupItem');

export const FewRadioGroupItem = defineComponent({
  name: 'FewRadioGroupItem',
  inheritAttrs: false,
  props: { value: { type: String, required: true }, disabled: { type: Boolean, default: undefined } },
  setup(props, { slots, attrs }) {
    const group = useRadioGroup('FewRadioGroupItem');
    const checked = () => group.value() === props.value;
    const isDisabled = () => props.disabled ?? group.disabled();
    provideRadioItem({ state: () => checked() ? 'checked' : 'unchecked' });
    return () => h('label', { class: 'few-radio-group-item', 'data-state': checked() ? 'checked' : 'unchecked', 'data-disabled': dataAttr(isDisabled()) }, [
      h('input', mergeProps(attrs, {
        type: 'radio', name: group.name, value: props.value, checked: checked(), disabled: isDisabled() || undefined,
        class: 'few-sr-only', onChange: () => group.setValue(props.value),
      })),
      slots.default?.() ?? [],
    ]);
  },
});

export const FewRadioGroupIndicator = defineComponent({
  name: 'FewRadioGroupIndicator',
  inheritAttrs: false,
  props: { asChild: Boolean, forceMount: Boolean },
  setup(props, { slots, attrs }) {
    const item = useRadioItemState('FewRadioGroupIndicator');
    return () => {
      const state = item.state();
      if (state === 'unchecked' && !props.forceMount) return null;
      return renderPrimitive('span', props.asChild, mergeProps(attrs, {
        'aria-hidden': 'true', 'data-state': state, class: 'few-radio-group-indicator',
      }), slots);
    };
  },
});
