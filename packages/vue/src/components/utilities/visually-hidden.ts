import { defineComponent, mergeProps } from 'vue';
import { renderPrimitive } from '../../lib/primitive.js';

/** Conteúdo só para leitores de tela. */
export const FewVisuallyHidden = defineComponent({
  name: 'FewVisuallyHidden',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) { return () => renderPrimitive('span', props.asChild, mergeProps(attrs, { class: 'few-sr-only' }), slots); },
});
