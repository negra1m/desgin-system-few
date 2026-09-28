// DescriptionList: pares termo/detalhe (ver docs/composition-vue.md).
import { defineComponent, mergeProps, type PropType } from 'vue';
import { renderPrimitive } from '../../lib/primitive.js';

export const FewDescriptionList = defineComponent({
  name: 'FewDescriptionList',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    layout: { type: String as PropType<'vertical' | 'horizontal'>, default: 'vertical' },
    columns: { type: Number, default: 1 },
  },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('dl', props.asChild, mergeProps(attrs, {
      class: 'few-description-list',
      'data-layout': props.layout,
      style: props.columns > 1 ? { '--few-dl-columns': String(props.columns) } : undefined,
    }), slots);
  },
});

export const FewDescriptionListItem = defineComponent({
  name: 'FewDescriptionListItem',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { class: 'few-description-list-item' }), slots);
  },
});

export const FewDescriptionListTerm = defineComponent({
  name: 'FewDescriptionListTerm',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('dt', props.asChild, mergeProps(attrs, { class: 'few-description-list-term' }), slots);
  },
});

export const FewDescriptionListDetails = defineComponent({
  name: 'FewDescriptionListDetails',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('dd', props.asChild, mergeProps(attrs, { class: 'few-description-list-details' }), slots);
  },
});
