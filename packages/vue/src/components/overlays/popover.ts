// Popover: não modal, sobre popover="manual" + useTopLayer (top layer nativo, herda tema) em vez de Portal.
// Posiciona com usePosition, fecha com useDismiss. Fonte da verdade: React
// packages/react/src/components/overlays/popover.tsx.
import { defineComponent, mergeProps, ref, watch, type ComponentPublicInstance, type PropType, type Ref } from 'vue';
import type { FloatingAlign, FloatingSide } from '@fewcompany/core';
import { createContext } from '../../lib/context.js';
import { useControllable } from '../../lib/use-controllable.js';
import { useId } from '../../lib/ids.js';
import { renderPrimitive, dataState } from '../../lib/primitive.js';
import { useDismiss } from '../../lib/use-dismiss.js';
import { usePosition } from '../../lib/use-position.js';
import { useTopLayer } from '../../lib/use-top-layer.js';
import { focusableItems } from '../../lib/roving.js';

interface PopoverContext {
  open: () => boolean; setOpen: (open: boolean) => void; contentId: string;
  anchorRef: Ref<Element | null>; triggerRef: Ref<HTMLElement | null>; contentRef: Ref<HTMLElement | null>;
  side: () => FloatingSide; setSide: (side: FloatingSide) => void;
}
const [providePopover, usePopover] = createContext<PopoverContext>('FewPopover');

/** Raiz: só contexto (não modal — não bloqueia o resto da página). */
export const FewPopover = defineComponent({
  name: 'FewPopover',
  props: { open: { type: Boolean, default: undefined }, defaultOpen: { type: Boolean, default: false } },
  emits: { 'update:open': (open: boolean) => typeof open === 'boolean' },
  setup(props, { slots, emit }) {
    const [open, setOpen] = useControllable(() => props.open, props.defaultOpen, v => emit('update:open', v));
    const baseId = useId('popover');
    const side = ref<FloatingSide>('bottom');
    const anchorRef = ref<Element | null>(null);
    const triggerRef = ref<HTMLElement | null>(null);
    const contentRef = ref<HTMLElement | null>(null);
    providePopover({
      open: () => open.value, setOpen, contentId: `${baseId}-popover`, anchorRef, triggerRef, contentRef,
      side: () => side.value, setSide: v => { side.value = v; },
    });
    return () => slots.default?.() ?? null;
  },
});

/** Ancora o posicionamento em outro elemento que não o Trigger (opcional). */
export const FewPopoverAnchor = defineComponent({
  name: 'FewPopoverAnchor',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const popover = usePopover('FewPopoverAnchor');
    return () => renderPrimitive('span', props.asChild, mergeProps(attrs, { ref: popover.anchorRef, class: 'few-popover-anchor' }), slots);
  },
});

export const FewPopoverTrigger = defineComponent({
  name: 'FewPopoverTrigger',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const popover = usePopover('FewPopoverTrigger');
    const setRefs = (node: Element | ComponentPublicInstance | null) => {
      const el = node as HTMLElement | null;
      popover.triggerRef.value = el;
      if (!popover.anchorRef.value) popover.anchorRef.value = el;
    };
    return () => renderPrimitive('button', props.asChild, mergeProps(attrs, {
      ref: setRefs, type: 'button', 'aria-haspopup': 'dialog', 'aria-expanded': popover.open(),
      'aria-controls': popover.open() ? popover.contentId : undefined, class: 'few-popover-trigger',
      onClick: (event: MouseEvent) => { if (!event.defaultPrevented) popover.setOpen(!popover.open()); },
    }), slots);
  },
});

export interface PopoverContentProps { side?: FloatingSide; align?: FloatingAlign; offset?: number }
export const FewPopoverContent = defineComponent({
  name: 'FewPopoverContent',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    side: { type: String as PropType<FloatingSide>, default: 'bottom' },
    align: { type: String as PropType<FloatingAlign>, default: 'center' },
    offset: { type: Number, default: 8 },
  },
  setup(props, { slots, attrs }) {
    const popover = usePopover('FewPopoverContent');
    const position = usePosition(popover.open, popover.anchorRef, popover.contentRef, () => ({ side: props.side, align: props.align, offset: props.offset }));
    useTopLayer(popover.open, popover.contentRef);
    useDismiss(popover.open, () => popover.setOpen(false), () => [popover.contentRef.value, popover.anchorRef.value]);
    watch(() => position.value.side, side => popover.setSide(side));
    watch([popover.open, popover.contentRef], ([open, el]) => {
      if (!open || typeof document === 'undefined') return;
      const target = focusableItems(el, 'a[href],button,input,textarea,select,[tabindex]')[0] ?? el;
      target?.focus();
    }, { flush: 'post', immediate: true });
    watch([popover.open, popover.triggerRef], ([open, trigger]) => { if (!open) trigger?.focus(); }, { flush: 'post' });
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, {
      ref: popover.contentRef, popover: 'manual', id: popover.contentId, role: 'dialog', tabindex: -1,
      'data-state': dataState(popover.open()), 'data-side': position.value.side, class: 'few-popover',
      style: { position: 'fixed', top: `${position.value.top}px`, left: `${position.value.left}px`, ...(position.value.width !== undefined ? { width: `${position.value.width}px` } : {}) },
      onKeydown: (event: KeyboardEvent) => { if (!event.defaultPrevented && event.key === 'Escape') { event.preventDefault(); popover.setOpen(false); } },
    }), slots);
  },
});

export const FewPopoverClose = defineComponent({
  name: 'FewPopoverClose',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const popover = usePopover('FewPopoverClose');
    return () => renderPrimitive('button', props.asChild, mergeProps(attrs, {
      type: 'button', class: 'few-popover-close',
      onClick: (event: MouseEvent) => { if (!event.defaultPrevented) popover.setOpen(false); },
    }), slots);
  },
});

/** Seta decorativa; a direção é lida em CSS via `data-side` (herdado do Content). */
export const FewPopoverArrow = defineComponent({
  name: 'FewPopoverArrow',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const popover = usePopover('FewPopoverArrow');
    return () => renderPrimitive('span', props.asChild, mergeProps(attrs, { 'aria-hidden': 'true', 'data-side': popover.side(), class: 'few-popover-arrow' }), slots);
  },
});
