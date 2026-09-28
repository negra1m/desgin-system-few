// Ver docs/composition-vue.md. Fonte da verdade: packages/react/src/components/feedback/skeleton.tsx.
// `asChild` aqui é literal (existe wrapper): reserva o layout do conteúdo real por baixo do esqueleto,
// não é o Slot/troca-de-tag do resto da biblioteca.
import { defineComponent, h, mergeProps, type PropType } from 'vue';
import { renderPrimitive } from '../../lib/primitive.js';

export type SkeletonVariant = 'text' | 'circle' | 'rect';

/** `<FewSkeleton variant="text" :lines="3" />` ou `<FewSkeleton asChild><Avatar /></FewSkeleton>`. */
export const FewSkeleton = defineComponent({
  name: 'FewSkeleton',
  inheritAttrs: false,
  props: {
    variant: { type: String as PropType<SkeletonVariant>, default: 'text' },
    width: { type: [String, Number], default: undefined },
    height: { type: [String, Number], default: undefined },
    /** Repete linhas de texto (só variant="text"; ignorado quando asChild). */
    lines: { type: Number, default: 1 },
    /** Anima o pulse. Desligue para um frame estático (ex.: captura de tela). */
    animate: { type: Boolean, default: true },
    asChild: Boolean,
  },
  setup(props, { slots, attrs }) {
    return () => {
      const attrStyle = (attrs.style ?? {}) as Record<string, unknown>;
      const baseStyle = { width: props.width, height: props.height, ...attrStyle };

      if (props.asChild) {
        const merged = mergeProps(attrs, { 'aria-hidden': 'true', class: 'few-skeleton-wrap' }) as Record<string, unknown>;
        merged.style = baseStyle;
        return h('span', merged, [
          h('span', { class: 'few-skeleton-content' }, slots.default?.()),
          h('span', { class: ['few-skeleton', 'few-skeleton-overlay', `few-skeleton--${props.variant}`, !props.animate && 'few-skeleton--static'] }),
        ]);
      }

      if (props.variant === 'text' && props.lines > 1) {
        const merged = mergeProps(attrs, { 'aria-hidden': 'true', class: 'few-skeleton-lines' }) as Record<string, unknown>;
        merged.style = attrStyle;
        return h('span', merged, Array.from({ length: props.lines }, (_, index) => h('span', {
          key: index,
          class: ['few-skeleton', 'few-skeleton--text', !props.animate && 'few-skeleton--static'],
          style: index === props.lines - 1 ? { ...baseStyle, width: props.width ?? '70%' } : baseStyle,
        })));
      }

      const merged = mergeProps(attrs, { 'aria-hidden': 'true', class: ['few-skeleton', `few-skeleton--${props.variant}`, !props.animate && 'few-skeleton--static'] }) as Record<string, unknown>;
      merged.style = baseStyle;
      return h('span', merged);
    };
  },
});
