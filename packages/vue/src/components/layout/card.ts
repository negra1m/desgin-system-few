// Card: ver docs/composition-vue.md. Fonte da verdade: packages/react/src/components/layout/card.tsx.
import { defineComponent, h, mergeProps, type PropType } from 'vue';
import { renderPrimitive } from '../../lib/primitive.js';

export type CardVariant = 'elevated' | 'outlined' | 'soft';
export type CardPadding = 'sm' | 'md' | 'lg';

/** Card (Root): use asChild com <a>/<button> para um cartão clicável — hover e foco vêm do CSS por seletor de tag. */
export const FewCard = defineComponent({
  name: 'FewCard',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    variant: { type: String as PropType<CardVariant>, default: 'outlined' },
    padding: { type: String as PropType<CardPadding>, default: 'md' },
  },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { class: 'few-card', 'data-variant': props.variant, 'data-padding': props.padding }), slots);
  },
});

/**
 * FewCardHeaderPart: contêiner de Title/Description/Action (few-card-header). Action se alinha à direita via CSS (:has).
 * Nome reservado (não `FewCardHeader`): esse export plano é o atalho deprecated abaixo.
 */
export const FewCardHeaderPart = defineComponent({
  name: 'FewCardHeaderPart',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { class: 'few-card-header' }), slots);
  },
});

export const FewCardTitle = defineComponent({
  name: 'FewCardTitle',
  inheritAttrs: false,
  props: { asChild: Boolean, level: { type: Number as PropType<1 | 2 | 3 | 4 | 5 | 6>, default: 3 } },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive(`h${props.level}`, props.asChild, mergeProps(attrs, { class: 'few-card-title' }), slots);
  },
});

export const FewCardDescription = defineComponent({
  name: 'FewCardDescription',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('p', props.asChild, mergeProps(attrs, { class: 'few-card-description' }), slots);
  },
});

/** FewCardAction: some dentro de FewCardHeaderPart e se alinha à direita (grid-column 2, span das duas linhas). */
export const FewCardAction = defineComponent({
  name: 'FewCardAction',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { class: 'few-card-action' }), slots);
  },
});

export const FewCardContent = defineComponent({
  name: 'FewCardContent',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { class: 'few-card-content' }), slots);
  },
});

export const FewCardFooter = defineComponent({
  name: 'FewCardFooter',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { class: 'few-card-footer' }), slots);
  },
});

/**
 * @deprecated Migre para as partes: `h(FewCardHeaderPart, null, () => [h(FewCardTitle, ...), h(FewCardDescription, ...)])`.
 * Atalho por slots (`title`/`description`/`action`) mantido só para compatibilidade com o Card antigo, como o React.
 * Sem `asChild`: repassa os attrs para o FewCardHeaderPart interno.
 */
export const FewCardHeader = defineComponent({
  name: 'FewCardHeader',
  inheritAttrs: false,
  setup(_props, { slots, attrs }) {
    return () => h(FewCardHeaderPart, attrs, () => [
      h(FewCardTitle, null, slots.title),
      slots.description ? h(FewCardDescription, null, slots.description) : null,
      slots.action ? h(FewCardAction, null, slots.action) : null,
    ]);
  },
});
