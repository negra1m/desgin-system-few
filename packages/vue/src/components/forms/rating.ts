// Ver docs/composition-vue.md. Fonte da verdade: packages/react/src/components/forms/rating.tsx
import { defineComponent, h, mergeProps, ref } from 'vue';
import { nextIndex } from '@fewcompany/core';
import { createContext } from '../../lib/context.js';
import { useControllable } from '../../lib/use-controllable.js';
import { renderPrimitive, dataAttr } from '../../lib/primitive.js';

interface RatingContextValue {
  value: () => number; setValue: (value: number) => void; setHoverValue: (value: number | null) => void;
  max: () => number; readOnly: () => boolean | undefined; disabled: () => boolean | undefined;
}
const [provideRating, useRating] = createContext<RatingContextValue>('FewRating');

function starIcon(filled: boolean) {
  return h('svg', { viewBox: '0 0 20 20', width: '20', height: '20', 'aria-hidden': 'true' }, [
    h('path', {
      d: 'M10 1.6l2.6 5.4 5.9.7-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.7z',
      fill: filled ? 'currentColor' : 'none', stroke: 'currentColor', 'stroke-width': '1.3', 'stroke-linejoin': 'round',
    }),
  ]);
}

export const FewRating = defineComponent({
  name: 'FewRating',
  inheritAttrs: false,
  props: {
    asChild: Boolean, value: { type: Number, default: undefined }, defaultValue: { type: Number, default: 0 },
    max: { type: Number, default: 5 }, readOnly: Boolean, disabled: Boolean,
  },
  emits: { 'update:value': (_value: number) => true },
  setup(props, { slots, attrs, emit }) {
    const [current, setCurrent] = useControllable<number>(() => props.value, props.defaultValue, v => emit('update:value', v));
    const hoverValue = ref<number | null>(null);
    provideRating({
      value: () => hoverValue.value ?? current.value, setValue: setCurrent,
      setHoverValue: (v: number | null) => { hoverValue.value = v; },
      max: () => props.max, readOnly: () => props.readOnly, disabled: () => props.disabled,
    });
    function handleKeydown(event: KeyboardEvent) {
      if (event.defaultPrevented || props.readOnly || props.disabled) return;
      const index = Math.max(0, current.value - 1);
      const next = nextIndex(event.key, index, props.max, { orientation: 'horizontal' });
      if (next === null) return;
      event.preventDefault();
      setCurrent(next + 1);
    }
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, {
      role: 'radiogroup', 'aria-label': (attrs['aria-label'] as string | undefined) ?? 'Avaliação',
      'data-disabled': dataAttr(props.disabled), 'data-readonly': dataAttr(props.readOnly), class: 'few-rating',
      onKeydown: handleKeydown, onPointerleave: () => { hoverValue.value = null; },
    }), slots);
  },
});

export const FewRatingItem = defineComponent({
  name: 'FewRatingItem',
  inheritAttrs: false,
  props: { asChild: Boolean, value: { type: Number, required: true } },
  setup(props, { slots, attrs }) {
    const ctx = useRating('FewRatingItem');
    return () => {
      const filled = props.value <= ctx.value();
      const current = Math.max(1, Math.round(ctx.value()));
      const content = props.asChild ? slots : { default: () => { const c = slots.default?.() ?? []; return c.length ? c : [starIcon(filled)]; } };
      return renderPrimitive('button', props.asChild, mergeProps(attrs, {
        type: 'button', role: 'radio', 'aria-checked': props.value === current,
        'aria-label': (attrs['aria-label'] as string | undefined) ?? `${props.value} de ${ctx.max()}`,
        tabindex: props.value === current ? 0 : -1, disabled: ctx.disabled() || undefined,
        'data-state': filled ? 'filled' : 'empty', class: 'few-rating-item',
        onPointerenter: () => { if (!ctx.readOnly() && !ctx.disabled()) ctx.setHoverValue(props.value); },
        onClick: () => { if (!ctx.readOnly() && !ctx.disabled()) ctx.setValue(props.value); },
      }), content);
    };
  },
});
