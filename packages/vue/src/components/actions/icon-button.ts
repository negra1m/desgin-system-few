// Implementação Vue de IconButton (ver docs/composition-vue.md). Fonte da verdade: packages/react/src/components/actions/icon-button.tsx.
import { computed, defineComponent, h, mergeProps, type PropType, type VNodeArrayChildren } from 'vue';
import type { Size } from '@fewcompany/core';
import { renderPrimitive, dataAttr } from '../../lib/primitive.js';
import { useButtonGroupOptionalContext } from './button-group.js';
import type { ButtonVariant } from './button.js';

/** Botão só com ícone. `aria-label` é obrigatório porque não há texto visível. `<FewIconButton aria-label="Fechar">×</FewIconButton>` */
export const FewIconButton = defineComponent({
  name: 'FewIconButton',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    variant: { type: String as PropType<ButtonVariant>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
    shape: { type: String as PropType<'round' | 'square'>, default: 'round' },
    /** Substitui o conteúdo pelo spinner e marca aria-busy. */
    loading: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    type: { type: String, default: 'button' },
    'aria-label': { type: String, required: true },
  },
  setup(props, { slots, attrs }) {
    const group = useButtonGroupOptionalContext();
    const variant = computed(() => props.variant ?? group?.variant() ?? 'primary');
    const size = computed(() => props.size ?? group?.size() ?? 'md');
    const wrap = (children: VNodeArrayChildren): VNodeArrayChildren =>
      props.loading ? [h('span', { class: 'few-spinner', 'aria-hidden': 'true' })] : children;
    return () => renderPrimitive('button', props.asChild, mergeProps(attrs, {
      type: props.type,
      disabled: props.disabled || props.loading || undefined,
      'aria-busy': props.loading || undefined,
      'aria-label': props['aria-label'],
      'data-loading': dataAttr(props.loading),
      class: ['few-icon-button', `few-icon-button--${variant.value}`, `few-icon-button--${size.value}`, `few-icon-button--${props.shape}`],
    }), slots, wrap);
  },
});
