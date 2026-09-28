// Separator: ver docs/composition-vue.md. Componente simples (sem contexto), como FewVisuallyHidden.
import { defineComponent, h, mergeProps, type PropType } from 'vue';
import type { Orientation } from '@fewcompany/core';
import { renderPrimitive } from '../../lib/primitive.js';

/**
 * FewSeparator: `orientation` + `decorative` (role="none", puramente visual) + slot `label` opcional
 * (rótulo centralizado, ex.: "ou"). Com o slot `label`, ignora `asChild` — a estrutura vira linha+rótulo+linha.
 */
export const FewSeparator = defineComponent({
  name: 'FewSeparator',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    orientation: { type: String as PropType<Orientation>, default: 'horizontal' },
    decorative: { type: Boolean, default: false },
  },
  setup(props, { slots, attrs }) {
    return () => {
      const a11y = props.decorative
        ? { role: 'none' as const }
        : { role: 'separator' as const, 'aria-orientation': props.orientation === 'vertical' ? ('vertical' as const) : undefined };
      if (slots.label) {
        return h('div', mergeProps(attrs, { class: 'few-separator few-separator-labeled', 'data-orientation': props.orientation, ...a11y }), [
          h('span', { class: 'few-separator-line', 'aria-hidden': 'true' }),
          h('span', { class: 'few-separator-label' }, slots.label()),
          h('span', { class: 'few-separator-line', 'aria-hidden': 'true' }),
        ]);
      }
      return renderPrimitive('div', props.asChild, mergeProps(attrs, { class: 'few-separator', 'data-orientation': props.orientation, ...a11y }), slots);
    };
  },
});
