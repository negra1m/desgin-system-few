// Ver docs/composition-vue.md. Fonte da verdade: packages/react/src/components/typography/text.tsx.
import { defineComponent, mergeProps, type PropType } from 'vue';
import { renderPrimitive, dataAttr } from '../../lib/primitive.js';

export type TextAs = 'p' | 'span' | 'div' | 'label';
export type TextSize = 'xs' | 'sm' | 'md' | 'lg';
export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';
export type TextAlign = 'left' | 'center' | 'right';
export type TextTone = 'ink' | 'muted' | 'brand' | 'success' | 'warning' | 'danger' | 'info';

/** Text: texto de corpo com tag flexível (`as`), truncamento por linha ou por N linhas, e tom semântico. */
export const FewText = defineComponent({
  name: 'FewText',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    /** Tag renderizada. Padrão span. */
    as: { type: String as PropType<TextAs>, default: 'span' },
    size: { type: String as PropType<TextSize>, default: 'md' },
    weight: { type: String as PropType<TextWeight>, default: 'regular' },
    tone: { type: String as PropType<TextTone>, default: 'ink' },
    align: { type: String as PropType<TextAlign>, default: undefined },
    /** Trunca em 1 linha (ellipsis). Ignorado quando `lineClamp` é informado. */
    truncate: Boolean,
    /** Trunca em N linhas via -webkit-line-clamp. */
    lineClamp: { type: Number, default: undefined },
    /** font-variant-numeric: tabular-nums, para alinhar números em coluna/tabela. */
    tabular: Boolean,
  },
  setup(props, { slots, attrs }) {
    return () => {
      const clamped = typeof props.lineClamp === 'number' && props.lineClamp > 0;
      const extra: Record<string, unknown> = {
        class: 'few-text',
        'data-size': props.size,
        'data-weight': props.weight,
        'data-tone': props.tone,
        'data-align': props.align,
        'data-truncate': dataAttr(props.truncate && !clamped),
        'data-clamp': dataAttr(clamped),
        'data-tabular': dataAttr(props.tabular),
      };
      if (clamped) extra.style = { '--few-line-clamp': String(props.lineClamp) };
      return renderPrimitive(props.as, props.asChild, mergeProps(attrs, extra), slots);
    };
  },
});
