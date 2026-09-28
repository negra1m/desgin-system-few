// Ver docs/composition-vue.md. Fonte da verdade: packages/react/src/components/forms/slider.tsx
import { defineComponent, mergeProps, ref, type PropType, type Ref } from 'vue';
import type { Orientation } from '@fewcompany/core';
import { closestThumbIndex, percentFromValue, valueFromPercent } from '@fewcompany/core';
import { createContext } from '../../lib/context.js';
import { useControllable } from '../../lib/use-controllable.js';
import { renderPrimitive, dataAttr } from '../../lib/primitive.js';

interface SliderContextValue {
  values: () => number[]; setValues: (next: number[], commit?: boolean) => void;
  min: () => number; max: () => number; step: () => number; orientation: () => Orientation; disabled: () => boolean | undefined;
  trackRef: Ref<HTMLElement | null>;
}
const [provideSlider, useSlider] = createContext<SliderContextValue>('FewSlider');

function percentFromPointer(event: PointerEvent, rect: DOMRect, orientation: Orientation): number {
  return orientation === 'horizontal' ? ((event.clientX - rect.left) / rect.width) * 100 : (1 - (event.clientY - rect.top) / rect.height) * 100;
}

export const FewSlider = defineComponent({
  name: 'FewSlider',
  inheritAttrs: false,
  props: {
    asChild: Boolean, value: { type: Array as PropType<number[]>, default: undefined }, defaultValue: { type: Array as PropType<number[]>, default: () => [0] },
    min: { type: Number, default: 0 }, max: { type: Number, default: 100 }, step: { type: Number, default: 1 },
    orientation: { type: String as PropType<Orientation>, default: 'horizontal' }, disabled: Boolean,
  },
  emits: { 'update:value': (_value: number[]) => true, valueCommit: (_value: number[]) => true },
  setup(props, { slots, attrs, emit }) {
    const [current, setCurrent] = useControllable<number[]>(() => props.value, props.defaultValue, v => emit('update:value', v));
    const trackRef = ref<HTMLElement | null>(null);
    function setValues(next: number[], commit = false) {
      const bounded = next.map(item => valueFromPercent(percentFromValue(item, props.min, props.max), props.min, props.max, props.step));
      setCurrent(bounded);
      if (commit) emit('valueCommit', bounded);
    }
    provideSlider({
      values: () => current.value, setValues, min: () => props.min, max: () => props.max, step: () => props.step,
      orientation: () => props.orientation, disabled: () => props.disabled, trackRef,
    });
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, {
      'data-orientation': props.orientation, 'data-disabled': dataAttr(props.disabled), class: 'few-slider',
    }), slots);
  },
});

export const FewSliderTrack = defineComponent({
  name: 'FewSliderTrack',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const ctx = useSlider('FewSliderTrack');
    function handlePointerdown(event: PointerEvent) {
      if (ctx.disabled()) return;
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const target = valueFromPercent(percentFromPointer(event, rect, ctx.orientation()), ctx.min(), ctx.max(), ctx.step());
      const values = ctx.values();
      const index = closestThumbIndex(values, target);
      const next = values.slice();
      next[index] = target;
      ctx.setValues(next, true);
    }
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, {
      ref: ctx.trackRef, 'data-orientation': ctx.orientation(), class: 'few-slider-track', onPointerdown: handlePointerdown,
    }), slots);
  },
});

export const FewSliderRange = defineComponent({
  name: 'FewSliderRange',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const ctx = useSlider('FewSliderRange');
    return () => {
      const values = ctx.values();
      const numbers = values.length ? values : [ctx.min()];
      const start = percentFromValue(Math.min(...numbers), ctx.min(), ctx.max());
      const end = percentFromValue(Math.max(...numbers), ctx.min(), ctx.max());
      return renderPrimitive('div', props.asChild, mergeProps(attrs, {
        class: 'few-slider-range', style: { '--few-slider-start': `${start}%`, '--few-slider-end': `${end}%` },
      }), slots);
    };
  },
});

export const FewSliderThumb = defineComponent({
  name: 'FewSliderThumb',
  inheritAttrs: false,
  props: { asChild: Boolean, index: { type: Number, required: true } },
  setup(props, { slots, attrs }) {
    const ctx = useSlider('FewSliderThumb');
    function handleKeydown(event: KeyboardEvent) {
      if (event.defaultPrevented || ctx.disabled()) return;
      const values = ctx.values();
      const value = values[props.index] ?? ctx.min();
      const step = ctx.step();
      let next: number | null = null;
      if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = value + step;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = value - step;
      else if (event.key === 'PageUp') next = value + step * 10;
      else if (event.key === 'PageDown') next = value - step * 10;
      else if (event.key === 'Home') next = ctx.min();
      else if (event.key === 'End') next = ctx.max();
      if (next === null) return;
      event.preventDefault();
      const updated = values.slice();
      updated[props.index] = next;
      ctx.setValues(updated, true);
    }
    function handlePointerdown(event: PointerEvent) {
      if (ctx.disabled()) return;
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    }
    function handlePointermove(event: PointerEvent) {
      const el = event.currentTarget as HTMLElement;
      if (ctx.disabled() || !ctx.trackRef.value || !el.hasPointerCapture(event.pointerId)) return;
      const rect = ctx.trackRef.value.getBoundingClientRect();
      const target = valueFromPercent(percentFromPointer(event, rect, ctx.orientation()), ctx.min(), ctx.max(), ctx.step());
      const updated = ctx.values().slice();
      updated[props.index] = target;
      ctx.setValues(updated);
    }
    function handlePointerup(event: PointerEvent) {
      const el = event.currentTarget as HTMLElement;
      if (el.hasPointerCapture(event.pointerId)) el.releasePointerCapture(event.pointerId);
      ctx.setValues(ctx.values(), true);
    }
    return () => {
      const value = ctx.values()[props.index] ?? ctx.min();
      const percent = percentFromValue(value, ctx.min(), ctx.max());
      return renderPrimitive('div', props.asChild, mergeProps(attrs, {
        role: 'slider', tabindex: ctx.disabled() ? -1 : 0,
        'aria-valuemin': ctx.min(), 'aria-valuemax': ctx.max(), 'aria-valuenow': value,
        'aria-valuetext': (attrs['aria-valuetext'] as string | undefined) ?? String(value),
        'aria-orientation': ctx.orientation(), 'aria-disabled': ctx.disabled() || undefined,
        'data-orientation': ctx.orientation(), 'data-disabled': dataAttr(ctx.disabled()),
        style: { '--few-slider-percent': `${percent}%` },
        class: 'few-slider-thumb',
        onKeydown: handleKeydown, onPointerdown: handlePointerdown, onPointermove: handlePointermove, onPointerup: handlePointerup,
      }), slots);
    };
  },
});
