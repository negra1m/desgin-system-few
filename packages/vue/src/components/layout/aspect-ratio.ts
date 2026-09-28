// AspectRatio: ver docs/composition-vue.md. Padrão Radix: wrapper externo fixo (padding-bottom) + conteúdo absoluto asChild-ável.
import { defineComponent, h, mergeProps, type CSSProperties } from 'vue';
import { renderPrimitive } from '../../lib/primitive.js';

export const FewAspectRatio = defineComponent({
  name: 'FewAspectRatio',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    /** Largura / altura. Padrão 16/9. */
    ratio: { type: Number, default: 16 / 9 },
  },
  setup(props, { slots, attrs }) {
    return () => h('div', { class: 'few-aspect-ratio', style: { position: 'relative', width: '100%', paddingBottom: `${100 / props.ratio}%` } }, [
      renderPrimitive('div', props.asChild, mergeProps(attrs, { class: 'few-aspect-ratio-content', style: { position: 'absolute', inset: 0 } as CSSProperties }), slots),
    ]);
  },
});
