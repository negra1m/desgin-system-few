// Ver docs/composition-vue.md. Fonte da verdade: packages/react/src/components/typography/heading.tsx.
import { defineComponent, mergeProps, type PropType } from 'vue';
import { renderPrimitive, dataAttr } from '../../lib/primitive.js';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
export type HeadingWeight = 'medium' | 'semibold' | 'bold';
export type HeadingAlign = 'left' | 'center' | 'right';
export type HeadingTone = 'ink' | 'muted' | 'brand' | 'gradient';

/** Heading: título semântico. `level` escolhe a tag (h1-h6); `size` escolhe a escala visual, de forma independente. */
export const FewHeading = defineComponent({
  name: 'FewHeading',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    /** Define a tag renderizada (h1..h6). Não altera o tamanho visual — use `size` para isso. */
    level: { type: Number as PropType<HeadingLevel>, default: 2 },
    size: { type: String as PropType<HeadingSize>, default: 'lg' },
    weight: { type: String as PropType<HeadingWeight>, default: 'semibold' },
    align: { type: String as PropType<HeadingAlign>, default: undefined },
    /** Trunca em 1 linha (ellipsis). */
    truncate: Boolean,
    tone: { type: String as PropType<HeadingTone>, default: 'ink' },
  },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive(`h${props.level}`, props.asChild, mergeProps(attrs, {
      class: 'few-heading',
      'data-size': props.size,
      'data-weight': props.weight,
      'data-align': props.align,
      'data-truncate': dataAttr(props.truncate),
      'data-tone': props.tone,
    }), slots);
  },
});
