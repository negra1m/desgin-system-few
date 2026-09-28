// Collapsible: par trigger/conteúdo mostra-esconde (ver docs/composition-vue.md, padrão Radix Collapsible).
import { computed, defineComponent, mergeProps } from 'vue';
import { createContext } from '../../lib/context.js';
import { useControllable } from '../../lib/use-controllable.js';
import { useId } from '../../lib/ids.js';
import { renderPrimitive, dataAttr } from '../../lib/primitive.js';

interface CollapsibleContextValue { baseId: string; open: () => boolean; setOpen: (open: boolean) => void; disabled: () => boolean }
const [provideCollapsible, useCollapsible] = createContext<CollapsibleContextValue>('FewCollapsible');

/** Raiz: `<FewCollapsible v-model:open="open">`. Sem `open`, o estado é interno (`defaultOpen`). */
export const FewCollapsible = defineComponent({
  name: 'FewCollapsible',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    open: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  },
  emits: { 'update:open': (open: boolean) => typeof open === 'boolean' },
  setup(props, { slots, attrs, emit }) {
    const baseId = useId('collapsible');
    const [isOpen, setIsOpen] = useControllable<boolean>(() => props.open, props.defaultOpen, v => emit('update:open', v));
    provideCollapsible({ baseId, open: () => isOpen.value, setOpen: setIsOpen, disabled: () => props.disabled });
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, {
      class: 'few-collapsible', 'data-state': isOpen.value ? 'open' : 'closed', 'data-disabled': dataAttr(props.disabled),
    }), slots);
  },
});

export const FewCollapsibleTrigger = defineComponent({
  name: 'FewCollapsibleTrigger',
  inheritAttrs: false,
  props: { asChild: Boolean, disabled: { type: Boolean, default: undefined } },
  setup(props, { slots, attrs }) {
    const collapsible = useCollapsible('FewCollapsible.Trigger');
    const isDisabled = computed(() => props.disabled || collapsible.disabled());
    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || isDisabled.value) return;
      collapsible.setOpen(!collapsible.open());
    }
    return () => renderPrimitive('button', props.asChild, mergeProps(attrs, {
      type: 'button', 'aria-expanded': collapsible.open(), 'aria-controls': `${collapsible.baseId}-content`,
      disabled: isDisabled.value || undefined, 'data-state': collapsible.open() ? 'open' : 'closed',
      'data-disabled': dataAttr(isDisabled.value), class: 'few-collapsible-trigger', onClick: handleClick,
    }), slots);
  },
});

export const FewCollapsibleContent = defineComponent({
  name: 'FewCollapsibleContent',
  inheritAttrs: false,
  props: { asChild: Boolean, forceMount: Boolean },
  setup(props, { slots, attrs }) {
    const collapsible = useCollapsible('FewCollapsible.Content');
    return () => {
      if (!collapsible.open() && !props.forceMount) return null;
      return renderPrimitive('div', props.asChild, mergeProps(attrs, {
        id: `${collapsible.baseId}-content`, hidden: !collapsible.open(),
        'data-state': collapsible.open() ? 'open' : 'closed', class: 'few-collapsible-content',
      }), slots);
    };
  },
});
