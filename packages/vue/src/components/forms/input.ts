// Ver docs/composition-vue.md. Fonte da verdade: packages/react/src/components/forms/input.tsx
import { defineComponent, h, mergeProps, type PropType } from 'vue';
import type { Size } from '@fewcompany/core';
import { dataAttr } from '../../lib/primitive.js';

/** Input nativo. Sem asChild: é sempre um <input> real. */
export const FewInput = defineComponent({
  name: 'FewInput',
  inheritAttrs: false,
  props: { size: { type: String as PropType<Size>, default: 'md' }, invalid: { type: Boolean, default: false } },
  setup(props, { attrs }) {
    return () => {
      const ariaInvalid = attrs['aria-invalid'];
      const isInvalid = Boolean(props.invalid || (ariaInvalid && ariaInvalid !== 'false'));
      return h('input', mergeProps(attrs, {
        class: `few-input few-input--${props.size}`,
        'aria-invalid': isInvalid || undefined,
        'data-invalid': dataAttr(isInvalid),
      }));
    };
  },
});
