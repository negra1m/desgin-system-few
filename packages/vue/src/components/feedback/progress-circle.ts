// Ver docs/composition-vue.md. Fonte da verdade: packages/react/src/components/feedback/progress-circle.tsx.
import { computed, defineComponent, h, mergeProps, type PropType } from 'vue';
import { clamp, progressPercent, progressValueText, type Tone, type Size } from '@fewcompany/core';
import { createContext } from '../../lib/context.js';
import { renderPrimitive } from '../../lib/primitive.js';

const SIZE_PX: Record<Size, number> = { sm: 32, md: 48, lg: 64 };
const THICKNESS_PX: Record<Size, number> = { sm: 3, md: 4, lg: 5 };

interface ProgressCircleContext { percent: () => number | null; size: () => number; thickness: () => number }
const [provideProgressCircle, useProgressCircle] = createContext<ProgressCircleContext>('FewProgressCircle');

/** Raiz: `value={null}` = indeterminado (gira sem valor conhecido). */
export const FewProgressCircle = defineComponent({
  name: 'FewProgressCircle',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    value: { type: Number as PropType<number | null>, default: 0 },
    max: { type: Number, default: 100 },
    size: { type: [String, Number] as unknown as PropType<Size | number>, default: 'md' },
    /** Espessura do traço em px. Padrão calculado a partir do size. */
    thickness: { type: Number, default: undefined },
    tone: { type: String as PropType<Tone>, default: 'info' },
    valueText: { type: String, default: undefined },
  },
  setup(props, { slots, attrs }) {
    const percent = computed(() => progressPercent(props.value, props.max));
    const resolvedSize = computed(() => (typeof props.size === 'number' ? props.size : SIZE_PX[props.size]));
    const resolvedThickness = computed(() => props.thickness ?? (
      typeof props.size === 'number' ? Math.max(2, Math.round(resolvedSize.value / 12)) : THICKNESS_PX[props.size]
    ));
    provideProgressCircle({ percent: () => percent.value, size: () => resolvedSize.value, thickness: () => resolvedThickness.value });
    return () => {
      const now = props.value === null ? undefined : clamp(props.value, 0, props.max);
      return renderPrimitive('div', props.asChild, mergeProps(attrs, {
        role: 'progressbar',
        'aria-valuemin': 0,
        'aria-valuemax': props.max,
        'aria-valuenow': now,
        'aria-valuetext': props.valueText ?? progressValueText(percent.value),
        class: ['few-progress-circle', `few-tone--${props.tone}`],
        'data-tone': props.tone,
        'data-state': props.value === null ? 'indeterminate' : 'determinate',
        style: { width: `${resolvedSize.value}px`, height: `${resolvedSize.value}px` },
      }), slots);
    };
  },
});

/** SVG interno. Sem `asChild`: é sempre `<svg>`, a troca de tag fica na raiz. */
export const FewProgressCircleCircle = defineComponent({
  name: 'FewProgressCircleCircle',
  inheritAttrs: false,
  setup(_props, { attrs }) {
    const circle = useProgressCircle('FewProgressCircleCircle');
    return () => {
      const percent = circle.percent();
      const size = circle.size();
      const thickness = circle.thickness();
      const radius = (size - thickness) / 2;
      const circumference = 2 * Math.PI * radius;
      const indeterminate = percent === null;
      const dash = indeterminate ? circumference * 0.25 : (circumference * (percent as number)) / 100;
      const center = size / 2;
      return h('svg', mergeProps(attrs, {
        viewBox: `0 0 ${size} ${size}`,
        width: size,
        height: size,
        'aria-hidden': 'true',
        class: 'few-progress-circle-svg',
        'data-state': indeterminate ? 'indeterminate' : 'determinate',
      }), [
        h('circle', { class: 'few-progress-circle-track', cx: center, cy: center, r: radius, 'stroke-width': thickness, fill: 'none' }),
        h('circle', {
          class: 'few-progress-circle-indicator',
          cx: center,
          cy: center,
          r: radius,
          'stroke-width': thickness,
          fill: 'none',
          'stroke-linecap': 'round',
          'stroke-dasharray': `${dash} ${circumference - dash}`,
          transform: `rotate(-90 ${center} ${center})`,
        }),
      ]);
    };
  },
});

export const FewProgressCircleLabel = defineComponent({
  name: 'FewProgressCircleLabel',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const circle = useProgressCircle('FewProgressCircleLabel');
    return () => renderPrimitive('span', props.asChild, mergeProps(attrs, { class: 'few-progress-circle-label' }), slots,
      children => (children.length ? children : [progressValueText(circle.percent()) ?? '']));
  },
});
