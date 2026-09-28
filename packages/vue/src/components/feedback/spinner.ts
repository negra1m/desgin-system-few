// Ver docs/composition-vue.md. Fonte da verdade: packages/react/src/components/feedback/spinner.tsx.
import { defineComponent, h, mergeProps, type PropType } from 'vue';
import type { Tone, Size } from '@fewcompany/core';
import { renderPrimitive } from '../../lib/primitive.js';
import { FewVisuallyHidden } from '../utilities/visually-hidden.js';

/** Componente simples: `<FewSpinner label="Carregando pedidos" />`. `role="status"` já anuncia o label sr-only. */
export const FewSpinner = defineComponent({
  name: 'FewSpinner',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    size: { type: String as PropType<Size>, default: 'md' },
    tone: { type: String as PropType<Tone>, default: 'neutral' },
    /** Texto sr-only anunciado pelo leitor de tela. */
    label: { type: String, default: 'Carregando' },
  },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('span', props.asChild, mergeProps(attrs, {
      role: 'status',
      class: ['few-spinner-root', `few-spinner-root--${props.size}`, `few-tone--${props.tone}`],
    }), slots, () => [
      h('span', { class: 'few-spinner', 'aria-hidden': 'true' }),
      h(FewVisuallyHidden, null, () => props.label),
    ]);
  },
});
