// Ver docs/composition-vue.md. Fonte da verdade: packages/react/src/components/feedback/alert.tsx.
import { defineComponent, h, mergeProps, type PropType } from 'vue';
import type { Tone } from '@fewcompany/core';
import { createContext } from '../../lib/context.js';
import { renderPrimitive } from '../../lib/primitive.js';

export type AlertVariant = 'soft' | 'outline';
interface AlertContext { tone: () => Tone; variant: () => AlertVariant }
const [provideAlert, useAlert] = createContext<AlertContext>('FewAlert');

const DEFAULT_ICON: Record<Tone, string> = { neutral: '•', success: '✓', warning: '!', danger: '!', info: 'i' };

/** Raiz: `role="alert"` quando `tone="danger"`, senão `role="status"`. */
export const FewAlert = defineComponent({
  name: 'FewAlert',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    tone: { type: String as PropType<Tone>, default: 'info' },
    variant: { type: String as PropType<AlertVariant>, default: 'soft' },
  },
  setup(props, { slots, attrs }) {
    provideAlert({ tone: () => props.tone, variant: () => props.variant });
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, {
      role: props.tone === 'danger' ? 'alert' : 'status',
      class: ['few-alert', `few-tone--${props.tone}`, `few-alert--${props.variant}`],
      'data-tone': props.tone,
      'data-variant': props.variant,
    }), slots);
  },
});

/** Ícone: usa o slot; sem conteúdo, cai no glifo padrão do tone corrente. */
export const FewAlertIcon = defineComponent({
  name: 'FewAlertIcon',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const alert = useAlert('FewAlertIcon');
    return () => renderPrimitive('span', props.asChild, mergeProps(attrs, { 'aria-hidden': 'true', class: 'few-alert-icon' }), slots,
      children => (children.length ? children : [DEFAULT_ICON[alert.tone()]]));
  },
});

export const FewAlertTitle = defineComponent({
  name: 'FewAlertTitle',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('strong', props.asChild, mergeProps(attrs, { class: 'few-alert-title' }), slots);
  },
});

export const FewAlertDescription = defineComponent({
  name: 'FewAlertDescription',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { class: 'few-alert-description' }), slots);
  },
});

export const FewAlertAction = defineComponent({
  name: 'FewAlertAction',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { class: 'few-alert-action' }), slots);
  },
});

/** Fechar: emite `remove` (`@remove`); aria-label padrão "Fechar" quando não sobrescrito via atributo. */
export const FewAlertClose = defineComponent({
  name: 'FewAlertClose',
  inheritAttrs: false,
  props: { asChild: Boolean },
  emits: ['dismiss'],
  setup(props, { slots, attrs, emit }) {
    const onCloseClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      emit('dismiss');
    };
    return () => renderPrimitive('button', props.asChild, mergeProps(attrs, {
      type: 'button',
      'aria-label': (attrs['aria-label'] as string | undefined) ?? 'Fechar',
      class: 'few-alert-close',
      onClick: onCloseClick,
    }), slots, children => (children.length ? children : [h('span', { 'aria-hidden': 'true' }, '×')]));
  },
});
