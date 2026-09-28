// Ver docs/composition-vue.md. Fonte da verdade: packages/react/src/components/forms/switch.tsx
import { defineComponent, h, mergeProps, type PropType } from 'vue';
import type { Size } from '@fewcompany/core';
import { createContext } from '../../lib/context.js';
import { useControllable } from '../../lib/use-controllable.js';
import { renderPrimitive, dataAttr } from '../../lib/primitive.js';

interface SwitchContextValue { checked: () => boolean }
const [provideSwitch, useSwitchState] = createContext<SwitchContextValue>('FewSwitch');

/** role=switch no input nativo (checkbox + role="switch" é o padrão recomendado pela WAI-ARIA APG). */
export const FewSwitch = defineComponent({
  name: 'FewSwitch',
  inheritAttrs: false,
  props: {
    checked: { type: Boolean, default: undefined }, defaultChecked: { type: Boolean, default: false },
    size: { type: String as PropType<Size>, default: 'md' }, disabled: Boolean,
  },
  emits: { 'update:checked': (_value: boolean) => true },
  setup(props, { slots, attrs, emit }) {
    const [current, setCurrent] = useControllable<boolean>(() => props.checked, props.defaultChecked, v => emit('update:checked', v));
    provideSwitch({ checked: () => current.value });
    return () => h('label', {
      class: `few-switch few-switch--${props.size}`, 'data-state': current.value ? 'checked' : 'unchecked', 'data-disabled': dataAttr(props.disabled),
    }, [
      h('input', mergeProps(attrs, {
        type: 'checkbox', role: 'switch', checked: current.value, disabled: props.disabled || undefined,
        class: 'few-sr-only', onChange: (event: Event) => setCurrent((event.currentTarget as HTMLInputElement).checked),
      })),
      slots.default?.() ?? [],
    ]);
  },
});

export const FewSwitchThumb = defineComponent({
  name: 'FewSwitchThumb',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const switchCtx = useSwitchState('FewSwitchThumb');
    return () => renderPrimitive('span', props.asChild, mergeProps(attrs, {
      'aria-hidden': 'true', 'data-state': switchCtx.checked() ? 'checked' : 'unchecked', class: 'few-switch-thumb',
    }), slots);
  },
});
