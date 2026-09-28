// Implementação Vue de Toggle (ver docs/composition-vue.md). Fonte da verdade: packages/react/src/components/actions/toggle.tsx.
import { defineComponent, mergeProps, type PropType } from 'vue';
import type { Size } from '@fewcompany/core';
import { useControllable } from '../../lib/use-controllable.js';
import { renderPrimitive, dataAttr } from '../../lib/primitive.js';

export type ToggleVariant = 'primary' | 'secondary';

/** Botão de dois estados (pressionado/solto). `<FewToggle v-model:pressed="bold">N</FewToggle>` */
export const FewToggle = defineComponent({
  name: 'FewToggle',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    pressed: { type: Boolean, default: undefined },
    defaultPressed: { type: Boolean, default: false },
    size: { type: String as PropType<Size>, default: 'md' },
    variant: { type: String as PropType<ToggleVariant>, default: 'secondary' },
    disabled: { type: Boolean, default: false },
    type: { type: String, default: 'button' },
  },
  emits: { 'update:pressed': (pressed: boolean) => typeof pressed === 'boolean' },
  setup(props, { slots, attrs, emit }) {
    const [pressed, setPressed] = useControllable(() => props.pressed, props.defaultPressed, v => emit('update:pressed', v));
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || props.disabled) return;
      setPressed(!pressed.value);
    };
    return () => renderPrimitive('button', props.asChild, mergeProps(attrs, {
      type: props.type,
      'aria-pressed': pressed.value,
      disabled: props.disabled || undefined,
      'data-state': pressed.value ? 'on' : 'off',
      'data-disabled': dataAttr(props.disabled),
      class: ['few-toggle', `few-toggle--${props.variant}`, `few-toggle--${props.size}`],
      onClick,
    }), slots);
  },
});
