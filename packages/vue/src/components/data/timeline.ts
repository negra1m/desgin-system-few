// Timeline: sequência de eventos (ver docs/composition-vue.md).
import { defineComponent, mergeProps, type PropType } from 'vue';
import type { Orientation } from '@fewcompany/core';
import { renderPrimitive } from '../../lib/primitive.js';

export const FewTimeline = defineComponent({
  name: 'FewTimeline',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    orientation: { type: String as PropType<Orientation>, default: 'vertical' },
    align: { type: String as PropType<'left' | 'right' | 'alternate'>, default: 'left' },
  },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('ol', props.asChild, mergeProps(attrs, { class: 'few-timeline', 'data-orientation': props.orientation, 'data-align': props.align }), slots);
  },
});

export const FewTimelineItem = defineComponent({
  name: 'FewTimelineItem',
  inheritAttrs: false,
  props: { asChild: Boolean, state: { type: String as PropType<'complete' | 'current' | 'upcoming'>, default: 'upcoming' } },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('li', props.asChild, mergeProps(attrs, { class: 'few-timeline-item', 'data-state': props.state }), slots);
  },
});

export const FewTimelineIndicator = defineComponent({
  name: 'FewTimelineIndicator',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('span', props.asChild, mergeProps(attrs, { 'aria-hidden': 'true', class: 'few-timeline-indicator' }), slots);
  },
});

export const FewTimelineConnector = defineComponent({
  name: 'FewTimelineConnector',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('span', props.asChild, mergeProps(attrs, { 'aria-hidden': 'true', class: 'few-timeline-connector' }), slots);
  },
});

export const FewTimelineContent = defineComponent({
  name: 'FewTimelineContent',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { class: 'few-timeline-content' }), slots);
  },
});

export const FewTimelineTitle = defineComponent({
  name: 'FewTimelineTitle',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('p', props.asChild, mergeProps(attrs, { class: 'few-timeline-title' }), slots);
  },
});

export const FewTimelineTime = defineComponent({
  name: 'FewTimelineTime',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('time', props.asChild, mergeProps(attrs, { class: ['few-timeline-time', 'few-muted'] }), slots);
  },
});

export const FewTimelineDescription = defineComponent({
  name: 'FewTimelineDescription',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('p', props.asChild, mergeProps(attrs, { class: ['few-timeline-description', 'few-muted'] }), slots);
  },
});
