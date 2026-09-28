// Indicador de etapas. Ver steps.tsx no React. Lógica pura (stepStatus) vem do core.
import { computed, defineComponent, getCurrentInstance, mergeProps, type PropType } from 'vue';
import { stepStatus, type Orientation, type StepStatus } from '@fewcompany/core';
import { createContext } from '../../lib/context.js';
import { useControllable } from '../../lib/use-controllable.js';
import { renderPrimitive, dataAttr } from '../../lib/primitive.js';

interface StepsContext { value: () => number; setValue: (value: number) => void; canInteract: () => boolean; orientation: () => Orientation }
const [provideSteps, useSteps] = createContext<StepsContext>('FewSteps');

interface StepsItemContext { index: () => number; status: () => StepStatus }
const [provideStepsItem, useStepsItem] = createContext<StepsItemContext>('FewStepsItem');

/** Raiz: `<FewSteps v-model:value="step">`. `clickable` padrão: true quando @update:value é ouvido. */
export const FewSteps = defineComponent({
  name: 'FewSteps',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    value: { type: Number, default: undefined },
    defaultValue: { type: Number, default: 0 },
    orientation: { type: String as PropType<Orientation>, default: 'horizontal' },
    clickable: { type: Boolean, default: undefined },
  },
  emits: { 'update:value': (value: number) => typeof value === 'number' },
  setup(props, { slots, attrs, emit }) {
    const instance = getCurrentInstance();
    const hasValueListener = Boolean(instance?.vnode.props?.['onUpdate:value']);
    const [value, setValue] = useControllable(() => props.value, props.defaultValue, v => emit('update:value', v));
    const canInteract = computed(() => props.clickable ?? hasValueListener);
    provideSteps({ value: () => value.value, setValue, canInteract: () => canInteract.value, orientation: () => props.orientation });
    return () => renderPrimitive('ol', props.asChild, mergeProps(attrs, { 'data-orientation': props.orientation, class: 'few-steps' }), slots);
  },
});

export const FewStepsItem = defineComponent({
  name: 'FewStepsItem',
  inheritAttrs: false,
  props: { asChild: Boolean, index: { type: Number, required: true }, disabled: Boolean },
  setup(props, { slots, attrs }) {
    const steps = useSteps('FewStepsItem');
    const status = computed(() => stepStatus(props.index, steps.value()));
    const interactive = computed(() => steps.canInteract() && !props.disabled);
    provideStepsItem({ index: () => props.index, status: () => status.value });
    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || !interactive.value) return;
      steps.setValue(props.index);
    }
    function handleKeydown(event: KeyboardEvent) {
      if (event.defaultPrevented || !interactive.value) return;
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); steps.setValue(props.index); }
    }
    return () => renderPrimitive('li', props.asChild, mergeProps(attrs, {
      'data-state': status.value, 'data-orientation': steps.orientation(), 'data-disabled': dataAttr(props.disabled),
      'aria-current': status.value === 'current' ? 'step' : undefined,
      role: interactive.value ? 'button' : undefined, tabindex: interactive.value ? 0 : undefined,
      class: 'few-steps-item', onClick: handleClick, onKeydown: handleKeydown,
    }), slots);
  },
});

export const FewStepsIndicator = defineComponent({
  name: 'FewStepsIndicator',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const item = useStepsItem('FewStepsIndicator');
    return () => renderPrimitive('span', props.asChild, mergeProps(attrs, { 'aria-hidden': 'true', 'data-state': item.status(), class: 'few-steps-indicator' }),
      slots, children => children.length ? children : [item.status() === 'complete' ? '✓' : String(item.index() + 1)]);
  },
});

export const FewStepsTitle = defineComponent({
  name: 'FewStepsTitle',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const item = useStepsItem('FewStepsTitle');
    return () => renderPrimitive('span', props.asChild, mergeProps(attrs, { 'data-state': item.status(), class: 'few-steps-title' }), slots);
  },
});

export const FewStepsDescription = defineComponent({
  name: 'FewStepsDescription',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const item = useStepsItem('FewStepsDescription');
    return () => renderPrimitive('span', props.asChild, mergeProps(attrs, { 'data-state': item.status(), class: 'few-steps-description' }), slots);
  },
});

export const FewStepsSeparator = defineComponent({
  name: 'FewStepsSeparator',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const steps = useSteps('FewStepsSeparator');
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, {
      role: 'presentation', 'aria-hidden': 'true', 'data-orientation': steps.orientation(), class: 'few-steps-separator',
    }), slots);
  },
});
