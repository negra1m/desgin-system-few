// Stack: ver docs/composition-vue.md. Renderiza flex com gap resolvido pelo headless (@fewcompany/core).
import { defineComponent, mergeProps, type CSSProperties, type PropType } from 'vue';
import { resolveGap, type Gap } from '@fewcompany/core';
import { renderPrimitive } from '../../lib/primitive.js';

export type StackDirection = 'row' | 'column';
type StackDirectionProp = StackDirection | { base: StackDirection; md?: StackDirection };

export const FewStack = defineComponent({
  name: 'FewStack',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    /** 'row' | 'column', ou responsivo: { base: 'column', md: 'row' } (troca em 768px). */
    direction: { type: [String, Object] as PropType<StackDirectionProp>, default: 'column' },
    /** Token da escala (1,2,3,4,6,8,12,16) ou valor CSS cru (ex.: '2rem'). */
    gap: { type: [String, Number] as PropType<Gap>, default: undefined },
    align: { type: String as PropType<CSSProperties['alignItems']>, default: undefined },
    justify: { type: String as PropType<CSSProperties['justifyContent']>, default: undefined },
    wrap: Boolean,
  },
  setup(props, { slots, attrs }) {
    return () => {
      const responsive = typeof props.direction === 'object';
      const base = responsive ? (props.direction as { base: StackDirection }).base : (props.direction as StackDirection);
      const md = responsive ? (props.direction as { md?: StackDirection }).md : undefined;
      const vars = {
        '--few-stack-direction': base,
        ...(md ? { '--few-stack-direction-md': md } : {}),
        '--few-stack-gap': resolveGap(props.gap, '0px'),
      } as CSSProperties;
      return renderPrimitive('div', props.asChild, mergeProps(attrs, {
        class: 'few-stack',
        'data-responsive': md ? '' : undefined,
        style: { ...vars, alignItems: props.align, justifyContent: props.justify, flexWrap: props.wrap ? 'wrap' : undefined } as CSSProperties,
      }), slots);
    };
  },
});
