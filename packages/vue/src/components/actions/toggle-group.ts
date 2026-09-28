// Implementação Vue de ToggleGroup (ver docs/composition-vue.md). Fonte da verdade: packages/react/src/components/actions/toggle-group.tsx.
import { computed, defineComponent, mergeProps, ref, watchEffect, type PropType } from 'vue';
import type { Orientation, Size } from '@fewcompany/core';
import { isToggleGroupItemSelected, toggleGroupValue, type ToggleGroupType, type ToggleGroupValue } from '@fewcompany/core';
import { createContext } from '../../lib/context.js';
import { useControllable } from '../../lib/use-controllable.js';
import { renderPrimitive, dataAttr } from '../../lib/primitive.js';
import { moveFocus, focusableItems } from '../../lib/roving.js';
import type { ToggleVariant } from './toggle.js';

interface ToggleGroupContext {
  type: () => ToggleGroupType;
  isSelected: (value: string) => boolean;
  toggle: (value: string) => void;
  disabled: () => boolean;
  variant: () => ToggleVariant | undefined;
  size: () => Size | undefined;
  orientation: () => Orientation;
  rovingFocus: () => boolean;
  activeValue: () => string | null;
  setActiveValue: (value: string) => void;
}
const [provideToggleGroup, useToggleGroup] = createContext<ToggleGroupContext>('FewToggleGroup');

/** Raiz do conjunto. single = radiogroup/radio, multiple = botões independentes com aria-pressed. Roving focus por setas. */
export const FewToggleGroup = defineComponent({
  name: 'FewToggleGroup',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    type: { type: String as PropType<ToggleGroupType>, required: true },
    value: { type: [String, Array] as PropType<ToggleGroupValue>, default: undefined },
    defaultValue: { type: [String, Array] as PropType<ToggleGroupValue>, default: undefined },
    orientation: { type: String as PropType<Orientation>, default: 'horizontal' },
    disabled: { type: Boolean, default: false },
    /** Setas movem e focam o item (roving tabindex). Padrão true. */
    rovingFocus: { type: Boolean, default: true },
    loop: { type: Boolean, default: true },
    size: { type: String as PropType<Size>, default: undefined },
    variant: { type: String as PropType<ToggleVariant>, default: undefined },
  },
  emits: { 'update:value': (value: ToggleGroupValue) => value !== undefined },
  setup(props, { slots, attrs, emit }) {
    const empty = computed<ToggleGroupValue>(() => (props.type === 'multiple' ? [] : ''));
    const [current, setCurrent] = useControllable<ToggleGroupValue>(() => props.value, props.defaultValue ?? empty.value, v => emit('update:value', v));
    const activeValue = ref<string | null>(null);
    const host = ref<HTMLElement | null>(null);

    // Item selecionado é o padrão de foco; sem seleção, cai no primeiro item (roving focus). Não roda em SSR.
    watchEffect(() => {
      if (activeValue.value !== null) return;
      const items = focusableItems(host.value, '[data-few-toggle-item]');
      const preferred = items.find(item => item.dataset['state'] === 'on') ?? items[0];
      if (preferred?.dataset['value'] !== undefined) activeValue.value = preferred.dataset['value'];
    }, { flush: 'post' });

    const onKeydown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || !props.rovingFocus) return;
      const target = moveFocus(host.value, '[data-few-toggle-item]', event.key, { orientation: props.orientation, loop: props.loop });
      if (target) event.preventDefault();
    };

    provideToggleGroup({
      type: () => props.type,
      disabled: () => props.disabled,
      variant: () => props.variant,
      size: () => props.size,
      orientation: () => props.orientation,
      rovingFocus: () => props.rovingFocus,
      activeValue: () => activeValue.value,
      setActiveValue: value => { activeValue.value = value; },
      isSelected: value => isToggleGroupItemSelected(props.type, current.value, value),
      toggle: value => setCurrent(toggleGroupValue(props.type, current.value, value)),
    });

    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, {
      ref: host,
      role: props.type === 'single' ? 'radiogroup' : 'group',
      'aria-orientation': props.orientation,
      'data-orientation': props.orientation,
      'data-disabled': dataAttr(props.disabled),
      class: 'few-toggle-group',
      onKeydown,
    }), slots);
  },
});

/** Item alternável do grupo. `<FewToggleGroupItem value="left">Esquerda</FewToggleGroupItem>` */
export const FewToggleGroupItem = defineComponent({
  name: 'FewToggleGroupItem',
  inheritAttrs: false,
  props: { asChild: Boolean, value: { type: String, required: true }, disabled: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    const ctx = useToggleGroup('FewToggleGroupItem');
    const selected = computed(() => ctx.isSelected(props.value));
    const disabled = computed(() => ctx.disabled() || props.disabled);
    const tabbable = computed(() => (ctx.rovingFocus() ? ctx.activeValue() === props.value : true));

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || disabled.value) return;
      ctx.toggle(props.value);
      ctx.setActiveValue(props.value);
    };
    const onFocus = () => { if (ctx.rovingFocus()) ctx.setActiveValue(props.value); };

    return () => renderPrimitive('button', props.asChild, mergeProps(attrs, {
      'data-few-toggle-item': '',
      type: props.asChild ? undefined : 'button',
      role: ctx.type() === 'single' ? 'radio' : undefined,
      'aria-checked': ctx.type() === 'single' ? selected.value : undefined,
      'aria-pressed': ctx.type() === 'multiple' ? selected.value : undefined,
      tabindex: tabbable.value ? 0 : -1,
      disabled: disabled.value || undefined,
      'data-state': selected.value ? 'on' : 'off',
      'data-disabled': dataAttr(disabled.value),
      'data-value': props.value,
      class: ['few-toggle-group-item', ctx.variant() && `few-toggle-group-item--${ctx.variant()}`, ctx.size() && `few-toggle-group-item--${ctx.size()}`],
      onClick,
      onFocus,
    }), slots);
  },
});
