// Stat: substitui o MetricCard antigo. FewMetricCard fica como atalho @deprecated (ver docs/composition-vue.md).
import { defineComponent, h, mergeProps, type PropType } from 'vue';
import type { Tone } from '@fewcompany/core';
import { renderPrimitive } from '../../lib/primitive.js';

export const FewStat = defineComponent({
  name: 'FewStat',
  inheritAttrs: false,
  props: { asChild: Boolean, tone: { type: String as PropType<Tone>, default: 'neutral' } },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { class: 'few-stat', 'data-tone': props.tone }), slots);
  },
});

export const FewStatLabel = defineComponent({
  name: 'FewStatLabel',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('p', props.asChild, mergeProps(attrs, { class: ['few-stat-label', 'few-label'] }), slots);
  },
});

export const FewStatValue = defineComponent({
  name: 'FewStatValue',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('p', props.asChild, mergeProps(attrs, { class: 'few-stat-value' }), slots);
  },
});

export const FewStatChange = defineComponent({
  name: 'FewStatChange',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    direction: { type: String as PropType<'up' | 'down' | 'flat'>, default: 'flat' },
    tone: { type: String as PropType<Tone | undefined>, default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () => {
      const resolvedTone = props.tone ?? (props.direction === 'up' ? 'success' : props.direction === 'down' ? 'danger' : 'neutral');
      const arrow = props.direction === 'up' ? '↑' : props.direction === 'down' ? '↓' : '→';
      return renderPrimitive('span', props.asChild, mergeProps(attrs, {
        class: 'few-stat-change', 'data-direction': props.direction, 'data-tone': resolvedTone,
      }), slots, (children) => [h('span', { 'aria-hidden': 'true', class: 'few-stat-change-icon' }, arrow), ...children]);
    };
  },
});

export const FewStatDescription = defineComponent({
  name: 'FewStatDescription',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('p', props.asChild, mergeProps(attrs, { class: ['few-stat-description', 'few-muted'] }), slots);
  },
});

export const FewStatIcon = defineComponent({
  name: 'FewStatIcon',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('span', props.asChild, mergeProps(attrs, { 'aria-hidden': 'true', class: 'few-stat-icon' }), slots);
  },
});

export interface MetricCardProps { label: string; value: string; change?: string; tone?: Tone }
/** @deprecated Use `FewStat` (+ FewStatLabel/FewStatValue/FewStatChange) diretamente. Mantido para compatibilidade com o MetricCard antigo. */
export const FewMetricCard = defineComponent({
  name: 'FewMetricCard',
  props: {
    label: { type: String, required: true },
    value: { type: String, required: true },
    change: { type: String, default: undefined },
    tone: { type: String as PropType<Tone>, default: 'neutral' },
  },
  setup(props) {
    return () => {
      const direction = props.tone === 'success' ? 'up' : props.tone === 'danger' ? 'down' : 'flat';
      return h(FewStat, { tone: props.tone }, () => [
        h(FewStatLabel, null, () => props.label),
        h(FewStatValue, null, () => props.value),
        ...(props.change ? [h(FewStatChange, { direction, tone: props.tone }, () => props.change)] : []),
      ]);
    };
  },
});
