// Implementação Vue de SplitButton (ver docs/composition-vue.md). Fonte da verdade: packages/react/src/components/actions/split-button.tsx.
import { defineComponent, h, mergeProps, ref, watchEffect, type PropType, type Ref, type VNodeArrayChildren } from 'vue';
import type { Size } from '@fewcompany/core';
import { createContext } from '../../lib/context.js';
import { useControllable } from '../../lib/use-controllable.js';
import { useId } from '../../lib/ids.js';
import { renderPrimitive, dataAttr } from '../../lib/primitive.js';
import { moveFocus, focusableItems } from '../../lib/roving.js';
import { usePosition } from '../../lib/use-position.js';
import { useTopLayer } from '../../lib/use-top-layer.js';
import { useDismiss } from '../../lib/use-dismiss.js';
import type { ButtonVariant } from './button.js';

interface SplitButtonContext {
  open: () => boolean;
  setOpen: (open: boolean) => void;
  triggerRef: Ref<HTMLButtonElement | null>;
  contentRef: Ref<HTMLElement | null>;
  baseId: string;
  variant: () => ButtonVariant;
  size: () => Size;
}
const [provideSplitButton, useSplitButton] = createContext<SplitButtonContext>('FewSplitButton');

/**
 * Ação principal + gatilho que abre uma lista de ações secundárias (role=menu).
 * `<FewSplitButton><FewSplitButtonAction>Salvar</FewSplitButtonAction><FewSplitButtonTrigger/><FewSplitButtonContent><FewSplitButtonItem>…</FewSplitButtonItem></FewSplitButtonContent></FewSplitButton>`
 * Foco volta ao Trigger ao fechar por Escape ou seleção de item.
 */
export const FewSplitButton = defineComponent({
  name: 'FewSplitButton',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    open: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: false },
    variant: { type: String as PropType<ButtonVariant>, default: 'primary' },
    size: { type: String as PropType<Size>, default: 'md' },
  },
  emits: { 'update:open': (open: boolean) => typeof open === 'boolean' },
  setup(props, { slots, attrs, emit }) {
    const baseId = useId('split-button');
    const [open, setOpen] = useControllable(() => props.open, props.defaultOpen, v => emit('update:open', v));
    const triggerRef = ref<HTMLButtonElement | null>(null);
    const contentRef = ref<HTMLElement | null>(null);
    useDismiss(() => open.value, () => setOpen(false), () => [triggerRef.value, contentRef.value]);
    provideSplitButton({ open: () => open.value, setOpen, triggerRef, contentRef, baseId, variant: () => props.variant, size: () => props.size });
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, {
      class: 'few-split-button',
      'data-state': open.value ? 'open' : 'closed',
    }), slots);
  },
});

/** Ação principal (botão comum). */
export const FewSplitButtonAction = defineComponent({
  name: 'FewSplitButtonAction',
  inheritAttrs: false,
  props: { asChild: Boolean, loading: { type: Boolean, default: false }, disabled: { type: Boolean, default: false }, type: { type: String, default: 'button' } },
  setup(props, { slots, attrs }) {
    const ctx = useSplitButton('FewSplitButtonAction');
    const wrap = (children: VNodeArrayChildren): VNodeArrayChildren =>
      props.loading ? [h('span', { class: 'few-spinner', 'aria-hidden': 'true' }), ...children] : children;
    return () => renderPrimitive('button', props.asChild, mergeProps(attrs, {
      type: props.type,
      disabled: props.disabled || props.loading || undefined,
      'aria-busy': props.loading || undefined,
      class: ['few-split-button-action', `few-split-button-action--${ctx.variant()}`, `few-split-button-action--${ctx.size()}`],
    }), slots, wrap);
  },
});

/** Gatilho (seta) que abre o menu de ações secundárias. */
export const FewSplitButtonTrigger = defineComponent({
  name: 'FewSplitButtonTrigger',
  inheritAttrs: false,
  props: { asChild: Boolean, 'aria-label': { type: String, default: 'Mais ações' } },
  setup(props, { slots, attrs }) {
    const ctx = useSplitButton('FewSplitButtonTrigger');
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      ctx.setOpen(!ctx.open());
    };
    const onKeydown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') { event.preventDefault(); ctx.setOpen(true); }
    };
    const caret = (): VNodeArrayChildren => [h('span', { 'aria-hidden': 'true', class: 'few-split-button-caret' })];
    return () => renderPrimitive('button', props.asChild, mergeProps(attrs, {
      ref: ctx.triggerRef,
      type: 'button',
      'aria-label': props['aria-label'],
      'aria-haspopup': 'menu',
      'aria-expanded': ctx.open(),
      'aria-controls': `${ctx.baseId}-menu`,
      'data-state': ctx.open() ? 'open' : 'closed',
      class: ['few-split-button-trigger', `few-split-button-trigger--${ctx.variant()}`, `few-split-button-trigger--${ctx.size()}`],
      onClick,
      onKeydown,
    }), slots, caret);
  },
});

/** Popover manual com as ações secundárias (role=menu). */
export const FewSplitButtonContent = defineComponent({
  name: 'FewSplitButtonContent',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const ctx = useSplitButton('FewSplitButtonContent');
    const position = usePosition(ctx.open, ctx.triggerRef, ctx.contentRef, () => ({ side: 'bottom', align: 'end' }));
    useTopLayer(ctx.open, ctx.contentRef);

    watchEffect(() => {
      if (!ctx.open() || typeof document === 'undefined') return;
      focusableItems(ctx.contentRef.value, '[role="menuitem"]')[0]?.focus();
    }, { flush: 'post' });

    function close() {
      ctx.setOpen(false);
      ctx.triggerRef.value?.focus();
    }
    const onKeydown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); return; }
      const target = moveFocus(ctx.contentRef.value, '[role="menuitem"]', event.key, { orientation: 'vertical' });
      if (target) event.preventDefault();
    };

    return () => {
      const pos = position.value;
      return renderPrimitive('div', props.asChild, mergeProps(attrs, {
        ref: ctx.contentRef,
        id: `${ctx.baseId}-menu`,
        role: 'menu',
        popover: 'manual',
        style: { position: 'fixed', top: `${pos.top}px`, left: `${pos.left}px`, ...(pos.width !== undefined ? { width: `${pos.width}px` } : {}) },
        'data-side': pos.side,
        class: 'few-split-button-content',
        onKeydown,
      }), slots);
    };
  },
});

/** Item do menu de ações secundárias. */
export const FewSplitButtonItem = defineComponent({
  name: 'FewSplitButtonItem',
  inheritAttrs: false,
  props: { asChild: Boolean, disabled: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    const ctx = useSplitButton('FewSplitButtonItem');
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || props.disabled) return;
      ctx.setOpen(false);
      ctx.triggerRef.value?.focus();
    };
    return () => renderPrimitive('button', props.asChild, mergeProps(attrs, {
      type: props.asChild ? undefined : 'button',
      role: 'menuitem',
      tabindex: -1,
      disabled: props.disabled || undefined,
      'data-disabled': dataAttr(props.disabled),
      class: 'few-split-button-item',
      onClick,
    }), slots);
  },
});
