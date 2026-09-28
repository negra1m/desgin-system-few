// Implementação Vue de Button (ver docs/composition-vue.md). Fonte da verdade: packages/react/src/components/actions/button.tsx.
import { computed, defineComponent, h, mergeProps, type PropType, type VNodeArrayChildren } from 'vue';
import type { Size } from '@fewcompany/core';
import { renderPrimitive, dataAttr } from '../../lib/primitive.js';
import { useButtonGroupOptionalContext } from './button-group.js';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link';

/** Botão simples (sem partes). `<FewButton variant="primary">Salvar</FewButton>` ou `<FewButton asChild><a href="/">Ir</a></FewButton>`. */
export const FewButton = defineComponent({
  name: 'FewButton',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    variant: { type: String as PropType<ButtonVariant>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
    /** Mostra spinner, marca aria-busy e desabilita o botão. Com asChild, o spinner prefixa `children` no elemento filho nativo. */
    loading: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    type: { type: String, default: 'button' },
  },
  setup(props, { slots, attrs }) {
    const group = useButtonGroupOptionalContext();
    const variant = computed(() => props.variant ?? group?.variant() ?? 'primary');
    const size = computed(() => props.size ?? group?.size() ?? 'md');
    const wrap = (children: VNodeArrayChildren): VNodeArrayChildren =>
      props.loading ? [h('span', { class: 'few-spinner', 'aria-hidden': 'true' }), ...children] : children;
    return () => renderPrimitive('button', props.asChild, mergeProps(attrs, {
      type: props.type,
      disabled: props.disabled || props.loading || undefined,
      'aria-busy': props.loading || undefined,
      'data-loading': dataAttr(props.loading),
      class: ['few-button', `few-button--${variant.value}`, `few-button--${size.value}`],
    }), slots, wrap);
  },
});
