// Ver docs/composition-vue.md. Fonte da verdade: packages/react/src/components/feedback/badge.tsx.
import { defineComponent, h, mergeProps, type PropType } from 'vue';
import type { Tone } from '@fewcompany/core';
import { renderPrimitive } from '../../lib/primitive.js';

export type BadgeVariant = 'solid' | 'soft' | 'outline';
export type BadgeSize = 'sm' | 'md';

/** Componente simples (sem partes): `<FewBadge tone="success" dot>Ativo</FewBadge>`. */
export const FewBadge = defineComponent({
  name: 'FewBadge',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    tone: { type: String as PropType<Tone>, default: 'neutral' },
    variant: { type: String as PropType<BadgeVariant>, default: 'soft' },
    size: { type: String as PropType<BadgeSize>, default: 'md' },
    /** Bolinha antes do conteúdo. */
    dot: Boolean,
  },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('span', props.asChild, mergeProps(attrs, {
      class: ['few-badge', `few-tone--${props.tone}`, `few-badge--${props.variant}`, `few-badge--${props.size}`],
      'data-tone': props.tone,
      'data-variant': props.variant,
    }), slots, children => (props.dot ? [h('span', { class: 'few-dot', 'aria-hidden': 'true' }), ...children] : children));
  },
});
