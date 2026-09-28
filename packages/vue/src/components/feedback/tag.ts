// Ver docs/composition-vue.md. Fonte da verdade: packages/react/src/components/feedback/tag.tsx.
import { defineComponent, h, mergeProps, type PropType } from 'vue';
import type { Tone } from '@fewcompany/core';
import { createContext } from '../../lib/context.js';
import { renderPrimitive, dataAttr } from '../../lib/primitive.js';

export type TagVariant = 'solid' | 'soft' | 'outline';
export type TagSize = 'sm' | 'md';
interface TagContext { tone: () => Tone; variant: () => TagVariant; size: () => TagSize }
const [provideTag] = createContext<TagContext>('FewTag');

/** Raiz (chip): interativa (role="button", Enter/Espaço) quando recebe `onClick`/`@click`. */
export const FewTag = defineComponent({
  name: 'FewTag',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    tone: { type: String as PropType<Tone>, default: 'neutral' },
    variant: { type: String as PropType<TagVariant>, default: 'soft' },
    size: { type: String as PropType<TagSize>, default: 'md' },
  },
  setup(props, { slots, attrs }) {
    provideTag({ tone: () => props.tone, variant: () => props.variant, size: () => props.size });
    const onKeydown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || attrs.onClick == null) return;
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      (attrs.onClick as (event: KeyboardEvent) => void)(event);
    };
    return () => {
      const interactive = attrs.onClick != null;
      return renderPrimitive('span', props.asChild, mergeProps(attrs, {
        class: ['few-tag', `few-tone--${props.tone}`, `few-tag--${props.variant}`, `few-tag--${props.size}`],
        'data-tone': props.tone,
        'data-variant': props.variant,
        'data-interactive': dataAttr(interactive),
        role: interactive ? 'button' : undefined,
        tabindex: interactive ? 0 : undefined,
        onKeydown,
      }), slots);
    };
  },
});

export const FewTagLabel = defineComponent({
  name: 'FewTagLabel',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('span', props.asChild, mergeProps(attrs, { class: 'few-tag-label' }), slots);
  },
});

export const FewTagIcon = defineComponent({
  name: 'FewTagIcon',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('span', props.asChild, mergeProps(attrs, { 'aria-hidden': 'true', class: 'few-tag-icon' }), slots);
  },
});

/** Fechar: emite `remove`; aria-label padrão "Remover {label}" (ou "Remover" sem `label`). */
export const FewTagClose = defineComponent({
  name: 'FewTagClose',
  inheritAttrs: false,
  props: { asChild: Boolean, label: { type: String, default: undefined } },
  emits: ['remove'],
  setup(props, { slots, attrs, emit }) {
    const onCloseClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      emit('remove');
    };
    return () => renderPrimitive('button', props.asChild, mergeProps(attrs, {
      type: 'button',
      'aria-label': (attrs['aria-label'] as string | undefined) ?? (props.label ? `Remover ${props.label}` : 'Remover'),
      class: 'few-tag-close',
      onClick: onCloseClick,
    }), slots, children => (children.length ? children : [h('span', { 'aria-hidden': 'true' }, '×')]));
  },
});
