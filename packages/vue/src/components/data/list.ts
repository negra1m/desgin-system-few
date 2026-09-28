// List: lista genérica composta (ver docs/composition-vue.md).
import { defineComponent, mergeProps, type PropType } from 'vue';
import { renderPrimitive, dataAttr } from '../../lib/primitive.js';

export const FewList = defineComponent({
  name: 'FewList',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    ordered: { type: Boolean, default: false },
    variant: { type: String as PropType<'plain' | 'divided' | 'card'>, default: 'plain' },
    interactive: { type: Boolean, default: false },
  },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive(props.ordered ? 'ol' : 'ul', props.asChild, mergeProps(attrs, {
      class: ['few-list', `few-list--${props.variant}`],
      'data-interactive': dataAttr(props.interactive),
    }), slots);
  },
});

export const FewListItem = defineComponent({
  name: 'FewListItem',
  inheritAttrs: false,
  props: { asChild: Boolean, selected: Boolean, disabled: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('li', props.asChild, mergeProps(attrs, {
      class: 'few-list-item',
      'data-state': props.selected ? 'selected' : undefined,
      'data-disabled': dataAttr(props.disabled),
      'aria-disabled': props.disabled || undefined,
    }), slots);
  },
});

export const FewListItemIcon = defineComponent({
  name: 'FewListItemIcon',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('span', props.asChild, mergeProps(attrs, { 'aria-hidden': 'true', class: 'few-list-item-icon' }), slots);
  },
});

export const FewListItemContent = defineComponent({
  name: 'FewListItemContent',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { class: 'few-list-item-content' }), slots);
  },
});

export const FewListItemTitle = defineComponent({
  name: 'FewListItemTitle',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('p', props.asChild, mergeProps(attrs, { class: 'few-list-item-title' }), slots);
  },
});

export const FewListItemDescription = defineComponent({
  name: 'FewListItemDescription',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('p', props.asChild, mergeProps(attrs, { class: ['few-list-item-description', 'few-muted'] }), slots);
  },
});

export const FewListItemAction = defineComponent({
  name: 'FewListItemAction',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { class: 'few-list-item-action' }), slots);
  },
});
