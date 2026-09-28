// Ver docs/composition-vue.md. Fonte da verdade: packages/react/src/components/forms/checkbox.tsx
import { defineComponent, h, mergeProps, ref, watchEffect, type PropType } from 'vue';
import { createContext } from '../../lib/context.js';
import { useControllable } from '../../lib/use-controllable.js';
import { renderPrimitive, dataAttr } from '../../lib/primitive.js';

export type CheckedState = boolean | 'indeterminate';
type CheckboxState = 'checked' | 'unchecked' | 'indeterminate';
interface CheckboxContextValue { state: () => CheckboxState }
const [provideCheckbox, useCheckboxState] = createContext<CheckboxContextValue>('FewCheckbox');

/**
 * Root: input nativo type=checkbox visualmente oculto (few-sr-only, permanece focável e acessível) dentro de um
 * <label>, que também recebe id/aria-* injetados por FewFieldControl. O slot (Indicator + texto) forma o rótulo.
 */
export const FewCheckbox = defineComponent({
  name: 'FewCheckbox',
  inheritAttrs: false,
  props: {
    checked: { type: [Boolean, String] as PropType<CheckedState>, default: undefined },
    defaultChecked: { type: [Boolean, String] as PropType<CheckedState>, default: false },
    disabled: Boolean, required: Boolean,
  },
  emits: { 'update:checked': (_value: CheckedState) => true },
  setup(props, { slots, attrs, emit }) {
    const [current, setCurrent] = useControllable<CheckedState>(() => props.checked, props.defaultChecked, v => emit('update:checked', v));
    const state = (): CheckboxState => current.value === 'indeterminate' ? 'indeterminate' : current.value ? 'checked' : 'unchecked';
    provideCheckbox({ state });
    const host = ref<HTMLInputElement | null>(null);
    watchEffect(() => { if (host.value) host.value.indeterminate = current.value === 'indeterminate'; }, { flush: 'post' });
    return () => h('label', { class: 'few-checkbox', 'data-state': state(), 'data-disabled': dataAttr(props.disabled) }, [
      h('input', mergeProps(attrs, {
        ref: host,
        type: 'checkbox',
        checked: current.value === true,
        'aria-checked': state() === 'indeterminate' ? 'mixed' : current.value === true,
        disabled: props.disabled || undefined,
        required: props.required || undefined,
        class: 'few-sr-only',
        onChange: (event: Event) => setCurrent((event.currentTarget as HTMLInputElement).checked),
      })),
      slots.default?.() ?? [],
    ]);
  },
});

export const FewCheckboxIndicator = defineComponent({
  name: 'FewCheckboxIndicator',
  inheritAttrs: false,
  props: { asChild: Boolean, forceMount: Boolean },
  setup(props, { slots, attrs }) {
    const checkbox = useCheckboxState('FewCheckboxIndicator');
    return () => {
      const state = checkbox.state();
      if (state === 'unchecked' && !props.forceMount) return null;
      const fallback = state === 'indeterminate'
        ? h('svg', { viewBox: '0 0 16 16', width: '10', height: '10' }, [h('path', { d: 'M3 8h10', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round' })])
        : h('svg', { viewBox: '0 0 16 16', width: '10', height: '10' }, [h('path', { d: 'M2.5 8.5l3.2 3.2 7.3-8', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })]);
      const content = props.asChild ? slots : { default: () => { const c = slots.default?.() ?? []; return c.length ? c : [fallback]; } };
      return renderPrimitive('span', props.asChild, mergeProps(attrs, {
        'aria-hidden': 'true', 'data-state': state, class: 'few-checkbox-indicator',
      }), content);
    };
  },
});
