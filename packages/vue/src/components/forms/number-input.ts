// Ver docs/composition-vue.md. Fonte da verdade: packages/react/src/components/forms/number-input.tsx
import { createTextVNode, defineComponent, h, mergeProps, ref, watch, type PropType } from 'vue';
import { clamp, roundToStep } from '@fewcompany/core';
import { createContext } from '../../lib/context.js';
import { useControllable } from '../../lib/use-controllable.js';
import { renderPrimitive, dataAttr } from '../../lib/primitive.js';

interface NumberInputContextValue {
  value: () => number | null; setValue: (next: number | null) => void; step: (delta: number) => void;
  min: () => number; max: () => number; step_: () => number; disabled: () => boolean | undefined;
}
const [provideNumberInput, useNumberInput] = createContext<NumberInputContextValue>('FewNumberInput');

export const FewNumberInput = defineComponent({
  name: 'FewNumberInput',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    value: { type: Number as PropType<number | null>, default: undefined },
    defaultValue: { type: Number as PropType<number | null>, default: null },
    min: { type: Number, default: -Infinity }, max: { type: Number, default: Infinity }, step: { type: Number, default: 1 },
    disabled: Boolean,
  },
  emits: { 'update:value': (_value: number | null) => true },
  setup(props, { slots, attrs, emit }) {
    const [current, setCurrent] = useControllable<number | null>(() => props.value, props.defaultValue, v => emit('update:value', v));
    function setValue(next: number | null) {
      if (next === null) { setCurrent(null); return; }
      const anchor = Number.isFinite(props.min) ? props.min : 0;
      setCurrent(clamp(roundToStep(next, props.step, anchor), props.min, props.max));
    }
    function stepBy(delta: number) { setValue((current.value ?? (Number.isFinite(props.min) ? props.min : 0)) + delta); }
    provideNumberInput({
      value: () => current.value, setValue, step: stepBy,
      min: () => props.min, max: () => props.max, step_: () => props.step, disabled: () => props.disabled,
    });
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, {
      class: 'few-number-input', 'data-disabled': dataAttr(props.disabled),
    }), slots);
  },
});

export const FewNumberInputInput = defineComponent({
  name: 'FewNumberInputInput',
  inheritAttrs: false,
  setup(_props, { attrs }) {
    const ctx = useNumberInput('FewNumberInputInput');
    const text = ref(ctx.value() === null ? '' : String(ctx.value()));
    watch(() => ctx.value(), (v) => { text.value = v === null ? '' : String(v); });
    const isDisabled = () => { const own = attrs['disabled']; return own !== undefined ? Boolean(own) : ctx.disabled(); };
    function commit(raw: string) {
      if (raw.trim() === '') { ctx.setValue(null); return; }
      const parsed = Number(raw);
      if (!Number.isNaN(parsed)) ctx.setValue(parsed); else text.value = ctx.value() === null ? '' : String(ctx.value());
    }
    function handleInput(event: Event) { text.value = (event.currentTarget as HTMLInputElement).value; }
    function handleBlur(event: FocusEvent) { commit((event.currentTarget as HTMLInputElement).value); }
    function handleKeydown(event: KeyboardEvent) {
      if (event.defaultPrevented || isDisabled()) return;
      if (event.key === 'ArrowUp') { event.preventDefault(); ctx.step(ctx.step_()); }
      else if (event.key === 'ArrowDown') { event.preventDefault(); ctx.step(-ctx.step_()); }
      else if (event.key === 'PageUp') { event.preventDefault(); ctx.step(ctx.step_() * 10); }
      else if (event.key === 'PageDown') { event.preventDefault(); ctx.step(-ctx.step_() * 10); }
      else if (event.key === 'Home' && Number.isFinite(ctx.min())) { event.preventDefault(); ctx.setValue(ctx.min()); }
      else if (event.key === 'End' && Number.isFinite(ctx.max())) { event.preventDefault(); ctx.setValue(ctx.max()); }
      else if (event.key === 'Enter') { commit((event.currentTarget as HTMLInputElement).value); }
    }
    return () => h('input', mergeProps(attrs, {
      type: 'text', inputmode: 'decimal', role: 'spinbutton',
      'aria-valuenow': ctx.value() ?? undefined,
      'aria-valuemin': Number.isFinite(ctx.min()) ? ctx.min() : undefined,
      'aria-valuemax': Number.isFinite(ctx.max()) ? ctx.max() : undefined,
      disabled: isDisabled() || undefined,
      value: text.value,
      class: 'few-input few-number-input-input',
      onInput: handleInput, onBlur: handleBlur, onKeydown: handleKeydown,
    }));
  },
});

export const FewNumberInputIncrement = defineComponent({
  name: 'FewNumberInputIncrement',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const ctx = useNumberInput('FewNumberInputIncrement');
    return () => {
      const value = ctx.value();
      const atMax = value !== null && Number.isFinite(ctx.max()) && value >= ctx.max();
      const content = props.asChild ? slots : { default: () => { const c = slots.default?.() ?? []; return c.length ? c : [createTextVNode('+')]; } };
      return renderPrimitive('button', props.asChild, mergeProps(attrs, {
        type: 'button', tabindex: -1, disabled: (ctx.disabled() || atMax) || undefined,
        'aria-label': (attrs['aria-label'] as string | undefined) ?? 'Aumentar', class: 'few-number-input-increment',
        onClick: () => ctx.step(ctx.step_()),
      }), content);
    };
  },
});

export const FewNumberInputDecrement = defineComponent({
  name: 'FewNumberInputDecrement',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const ctx = useNumberInput('FewNumberInputDecrement');
    return () => {
      const value = ctx.value();
      const atMin = value !== null && Number.isFinite(ctx.min()) && value <= ctx.min();
      const content = props.asChild ? slots : { default: () => { const c = slots.default?.() ?? []; return c.length ? c : [createTextVNode('−')]; } };
      return renderPrimitive('button', props.asChild, mergeProps(attrs, {
        type: 'button', tabindex: -1, disabled: (ctx.disabled() || atMin) || undefined,
        'aria-label': (attrs['aria-label'] as string | undefined) ?? 'Diminuir', class: 'few-number-input-decrement',
        onClick: () => ctx.step(-ctx.step_()),
      }), content);
    };
  },
});
