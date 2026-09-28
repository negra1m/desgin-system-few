// Ver docs/composition-vue.md. Fonte da verdade: packages/react/src/components/forms/label.tsx
import { defineComponent, h, mergeProps, type VNodeArrayChildren } from 'vue';
import { renderPrimitive } from '../../lib/primitive.js';

/** Label nativo com asChild. Uso solto (for manual) ou via FewFieldLabel (for automático). */
export const FewLabel = defineComponent({
  name: 'FewLabel',
  inheritAttrs: false,
  props: { asChild: Boolean, required: Boolean },
  setup(props, { slots, attrs }) {
    const wrap = (children: VNodeArrayChildren): VNodeArrayChildren =>
      props.required ? [...children, h('span', { class: 'few-form-label-required', 'aria-hidden': 'true' }, ' *')] : children;
    return () => renderPrimitive('label', props.asChild, mergeProps(attrs, { class: 'few-form-label' }), slots, wrap);
  },
});
