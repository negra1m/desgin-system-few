// Toolbar: ver docs/composition-vue.md. Roving focus imperativo sobre [data-few-toolbar-item].
import { computed, defineComponent, mergeProps, onMounted, onScopeDispose, ref, type PropType } from 'vue';
import type { Orientation } from '@fewcompany/core';
import { createContext } from '../../lib/context.js';
import { dataAttr, renderPrimitive } from '../../lib/primitive.js';
import { focusableItems, moveFocus } from '../../lib/roving.js';

interface ToolbarContextValue { orientation: () => Orientation }
const [provideToolbar, useToolbarContext] = createContext<ToolbarContextValue>('FewToolbar');

export const FewToolbar = defineComponent({
  name: 'FewToolbar',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    orientation: { type: String as PropType<Orientation>, default: 'horizontal' },
    /** aria-label obrigatório: a toolbar não tem rótulo visível próprio. */
    label: { type: String, required: true },
    loop: { type: Boolean, default: true },
  },
  setup(props, { slots, attrs }) {
    provideToolbar({ orientation: () => props.orientation });
    const host = ref<HTMLElement | null>(null);
    const items = () => focusableItems(host.value, '[data-few-toolbar-item]');
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      if (!target.hasAttribute('data-few-toolbar-item')) return;
      items().forEach(item => { item.tabIndex = item === target ? 0 : -1; });
    };
    onMounted(() => {
      items().forEach((item, index) => { item.tabIndex = index === 0 ? 0 : -1; });
      host.value?.addEventListener('focusin', onFocusIn);
    });
    onScopeDispose(() => host.value?.removeEventListener('focusin', onFocusIn));
    const onKeydown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      const target = moveFocus(host.value, '[data-few-toolbar-item]', event.key, { orientation: props.orientation, loop: props.loop });
      if (target) event.preventDefault();
    };
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, {
      ref: host, role: 'toolbar', 'aria-label': props.label, 'aria-orientation': props.orientation, 'data-orientation': props.orientation, class: 'few-toolbar', onKeydown,
    }), slots);
  },
});

export const FewToolbarButton = defineComponent({
  name: 'FewToolbarButton',
  inheritAttrs: false,
  props: { asChild: Boolean, disabled: Boolean },
  setup(props, { slots, attrs }) {
    useToolbarContext('FewToolbarButton');
    return () => renderPrimitive('button', props.asChild, mergeProps(attrs, {
      type: 'button', 'data-few-toolbar-item': '', disabled: props.disabled || undefined, 'data-disabled': dataAttr(props.disabled), class: 'few-toolbar-button',
    }), slots);
  },
});

export const FewToolbarLink = defineComponent({
  name: 'FewToolbarLink',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    useToolbarContext('FewToolbarLink');
    return () => renderPrimitive('a', props.asChild, mergeProps(attrs, { 'data-few-toolbar-item': '', class: 'few-toolbar-link' }), slots);
  },
});

export const FewToolbarSeparator = defineComponent({
  name: 'FewToolbarSeparator',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const toolbar = useToolbarContext('FewToolbarSeparator');
    const cross = computed(() => (toolbar.orientation() === 'horizontal' ? 'vertical' : 'horizontal'));
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { role: 'separator', 'aria-orientation': cross.value, 'data-orientation': cross.value, class: 'few-toolbar-separator' }), slots);
  },
});

export const FewToolbarGroup = defineComponent({
  name: 'FewToolbarGroup',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { role: 'group', class: 'few-toolbar-group' }), slots);
  },
});
