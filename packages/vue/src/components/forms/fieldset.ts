// Ver docs/composition-vue.md. Fonte da verdade: packages/react/src/components/forms/fieldset.tsx
import { defineComponent, mergeProps } from 'vue';
import { renderPrimitive } from '../../lib/primitive.js';

/** disabled em fieldset nativo já propaga para todos os controles descendentes. */
export const FewFieldset = defineComponent({
  name: 'FewFieldset',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('fieldset', props.asChild, mergeProps(attrs, { class: 'few-fieldset' }), slots);
  },
});

export const FewFieldsetLegend = defineComponent({
  name: 'FewFieldsetLegend',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('legend', props.asChild, mergeProps(attrs, { class: 'few-fieldset-legend' }), slots);
  },
});
