// Ver docs/composition-vue.md. Fonte da verdade: packages/react/src/components/forms/input-group.tsx
import { defineComponent, h, mergeProps } from 'vue';
import { renderPrimitive, dataAttr } from '../../lib/primitive.js';
import { FewInput } from './input.js';

/** Raiz que unifica a borda de addons, elementos e o input; a ordem dos filhos decide o lado (start/end). */
export const FewInputGroup = defineComponent({
  name: 'FewInputGroup',
  inheritAttrs: false,
  props: { asChild: Boolean, invalid: { type: Boolean, default: undefined } },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, {
      class: 'few-input-group', 'data-invalid': dataAttr(props.invalid), 'data-disabled': dataAttr(attrs['aria-disabled']),
    }), slots);
  },
});

/** Prefixo/sufixo textual, com sua própria área (soma-se à largura do grupo). */
export const FewInputGroupAddon = defineComponent({
  name: 'FewInputGroupAddon',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('span', props.asChild, mergeProps(attrs, { class: 'few-input-group-addon' }), slots);
  },
});

/** Ícone ou botão dentro do grupo. `side` só afeta a borda; a posição real é a ordem no slot. */
export const FewInputGroupElement = defineComponent({
  name: 'FewInputGroupElement',
  inheritAttrs: false,
  props: { asChild: Boolean, side: { type: String as () => 'start' | 'end', default: 'end' } },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('span', props.asChild, mergeProps(attrs, {
      'data-side': props.side, class: 'few-input-group-element',
    }), slots);
  },
});

export const FewInputGroupInput = defineComponent({
  name: 'FewInputGroupInput',
  inheritAttrs: false,
  setup(_props, { attrs }) {
    return () => h(FewInput, mergeProps(attrs, { class: 'few-input-group-input' }));
  },
});
