// Ver docs/composition-vue.md. Fonte da verdade: packages/react/src/components/feedback/empty-state.tsx.
import { defineComponent, mergeProps, type PropType } from 'vue';
import type { Size } from '@fewcompany/core';
import { renderPrimitive } from '../../lib/primitive.js';

export const FewEmptyState = defineComponent({
  name: 'FewEmptyState',
  inheritAttrs: false,
  props: { asChild: Boolean, size: { type: String as PropType<Size>, default: 'md' } },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, {
      class: ['few-empty', `few-empty--${props.size}`],
      'data-size': props.size,
    }), slots);
  },
});

/** Ícone: usa o slot; sem conteúdo, cai no glifo padrão "↗". */
export const FewEmptyStateIcon = defineComponent({
  name: 'FewEmptyStateIcon',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('span', props.asChild, mergeProps(attrs, { 'aria-hidden': 'true', class: 'few-empty-icon' }), slots,
      children => (children.length ? children : ['↗']));
  },
});

export const FewEmptyStateTitle = defineComponent({
  name: 'FewEmptyStateTitle',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('h3', props.asChild, mergeProps(attrs, { class: 'few-empty-title' }), slots);
  },
});

export const FewEmptyStateDescription = defineComponent({
  name: 'FewEmptyStateDescription',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('p', props.asChild, mergeProps(attrs, { class: ['few-empty-description', 'few-muted'] }), slots);
  },
});

export const FewEmptyStateActions = defineComponent({
  name: 'FewEmptyStateActions',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { class: 'few-empty-actions' }), slots);
  },
});
