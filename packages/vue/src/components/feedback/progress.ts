// Ver docs/composition-vue.md. Fonte da verdade: packages/react/src/components/feedback/progress.tsx.
import { computed, defineComponent, mergeProps, type PropType } from 'vue';
import { clamp, progressPercent, progressValueText, type Tone, type Size } from '@fewcompany/core';
import { createContext } from '../../lib/context.js';
import { renderPrimitive } from '../../lib/primitive.js';

interface ProgressContext { percent: () => number | null }
const [provideProgress, useProgress] = createContext<ProgressContext>('FewProgress');

/** Raiz: `value={null}` = indeterminado. */
export const FewProgress = defineComponent({
  name: 'FewProgress',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    value: { type: Number as PropType<number | null>, default: 0 },
    max: { type: Number, default: 100 },
    size: { type: String as PropType<Size>, default: 'md' },
    tone: { type: String as PropType<Tone>, default: 'info' },
    /** Sobrescreve o aria-valuetext padrão ("72%"). */
    valueText: { type: String, default: undefined },
  },
  setup(props, { slots, attrs }) {
    const percent = computed(() => progressPercent(props.value, props.max));
    provideProgress({ percent: () => percent.value });
    return () => {
      const now = props.value === null ? undefined : clamp(props.value, 0, props.max);
      return renderPrimitive('div', props.asChild, mergeProps(attrs, {
        role: 'progressbar',
        'aria-valuemin': 0,
        'aria-valuemax': props.max,
        'aria-valuenow': now,
        'aria-valuetext': props.valueText ?? progressValueText(percent.value),
        class: ['few-progress', `few-tone--${props.tone}`, `few-progress--${props.size}`],
        'data-tone': props.tone,
        'data-size': props.size,
        'data-state': props.value === null ? 'indeterminate' : 'determinate',
      }), slots);
    };
  },
});

export const FewProgressTrack = defineComponent({
  name: 'FewProgressTrack',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { class: 'few-progress-track' }), slots);
  },
});

export const FewProgressIndicator = defineComponent({
  name: 'FewProgressIndicator',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const progress = useProgress('FewProgressIndicator');
    return () => {
      const percent = progress.percent();
      return renderPrimitive('div', props.asChild, mergeProps(attrs, {
        class: 'few-progress-indicator',
        'data-state': percent === null ? 'indeterminate' : 'determinate',
        style: percent === null ? {} : { width: `${percent}%` },
      }), slots);
    };
  },
});

export const FewProgressLabel = defineComponent({
  name: 'FewProgressLabel',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('span', props.asChild, mergeProps(attrs, { class: 'few-progress-label' }), slots);
  },
});

export const FewProgressValue = defineComponent({
  name: 'FewProgressValue',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const progress = useProgress('FewProgressValue');
    return () => renderPrimitive('span', props.asChild, mergeProps(attrs, { class: 'few-progress-value' }), slots,
      children => (children.length ? children : [progressValueText(progress.percent()) ?? '']));
  },
});
