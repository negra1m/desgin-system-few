// Tooltip: popover="manual" + useTopLayer (top layer nativo) em vez de Portal, posicionado com usePosition.
// Provider (opcional) compartilha o "skip delay": depois que um tooltip abre, os próximos abrem sem esperar
// o delay se o ponteiro migrar de um trigger para outro dentro de `skipDelayDuration`. Fonte da verdade:
// React packages/react/src/components/overlays/tooltip.tsx.
import { defineComponent, mergeProps, onScopeDispose, ref, watch, type PropType, type Ref } from 'vue';
import type { FloatingAlign, FloatingSide } from '@fewcompany/core';
import { createContext } from '../../lib/context.js';
import { useControllable } from '../../lib/use-controllable.js';
import { useId } from '../../lib/ids.js';
import { renderPrimitive, dataState } from '../../lib/primitive.js';
import { useDismiss } from '../../lib/use-dismiss.js';
import { usePosition } from '../../lib/use-position.js';
import { useTopLayer } from '../../lib/use-top-layer.js';

interface TooltipProviderContext { delayDuration: number; isSkipping: () => boolean; onOpen: () => void; onClose: () => void }
const [provideTooltipProvider, , useOptionalTooltipProvider] = createContext<TooltipProviderContext>('FewTooltipProvider');

/** Compartilha o delay de abertura entre vários FewTooltip (opcional). */
export const FewTooltipProvider = defineComponent({
  name: 'FewTooltipProvider',
  props: { delayDuration: { type: Number, default: 700 }, skipDelayDuration: { type: Number, default: 300 } },
  setup(props, { slots }) {
    let skipping = false;
    let skipTimer: ReturnType<typeof setTimeout> | undefined;
    provideTooltipProvider({
      delayDuration: props.delayDuration,
      isSkipping: () => skipping,
      onOpen: () => { skipping = true; clearTimeout(skipTimer); },
      onClose: () => { clearTimeout(skipTimer); skipTimer = setTimeout(() => { skipping = false; }, props.skipDelayDuration); },
    });
    onScopeDispose(() => clearTimeout(skipTimer));
    return () => slots.default?.() ?? null;
  },
});

interface TooltipContext {
  open: () => boolean; contentId: string;
  triggerRef: Ref<HTMLElement | null>; contentRef: Ref<HTMLElement | null>;
  requestOpen: (immediate?: boolean) => void; requestClose: () => void;
  side: () => FloatingSide; setSide: (side: FloatingSide) => void;
}
const [provideTooltip, useTooltip] = createContext<TooltipContext>('FewTooltip');

export const FewTooltip = defineComponent({
  name: 'FewTooltip',
  props: {
    open: { type: Boolean, default: undefined }, defaultOpen: { type: Boolean, default: false },
    delay: { type: Number, default: undefined },
  },
  emits: { 'update:open': (open: boolean) => typeof open === 'boolean' },
  setup(props, { slots, emit }) {
    const [open, setOpen] = useControllable(() => props.open, props.defaultOpen, v => emit('update:open', v));
    const baseId = useId('tooltip');
    const provider = useOptionalTooltipProvider();
    const side = ref<FloatingSide>('top');
    const triggerRef = ref<HTMLElement | null>(null);
    const contentRef = ref<HTMLElement | null>(null);
    let openTimer: ReturnType<typeof setTimeout> | undefined;
    const effectiveDelay = () => props.delay ?? provider?.delayDuration ?? 700;
    function requestOpen(immediate = false) {
      clearTimeout(openTimer);
      if (immediate || provider?.isSkipping()) { provider?.onOpen(); setOpen(true); return; }
      openTimer = setTimeout(() => { provider?.onOpen(); setOpen(true); }, effectiveDelay());
    }
    function requestClose() {
      clearTimeout(openTimer);
      provider?.onClose();
      setOpen(false);
    }
    onScopeDispose(() => clearTimeout(openTimer));
    provideTooltip({
      open: () => open.value, contentId: `${baseId}-tooltip`, triggerRef, contentRef, requestOpen, requestClose,
      side: () => side.value, setSide: v => { side.value = v; },
    });
    return () => slots.default?.() ?? null;
  },
});

/** Abre no hover (com delay) e no foco (imediato); fecha no blur, pointerleave, pointerdown ou Escape (via useDismiss). Não abre se `disabled`. */
export const FewTooltipTrigger = defineComponent({
  name: 'FewTooltipTrigger',
  inheritAttrs: false,
  props: { asChild: Boolean, disabled: Boolean },
  setup(props, { slots, attrs }) {
    const tooltip = useTooltip('FewTooltipTrigger');
    return () => renderPrimitive('button', props.asChild, mergeProps(attrs, {
      ref: tooltip.triggerRef, type: 'button', disabled: props.disabled || undefined, 'aria-describedby': tooltip.contentId, class: 'few-tooltip-trigger',
      onPointerenter: (event: PointerEvent) => { if (!event.defaultPrevented && !props.disabled && event.pointerType !== 'touch') tooltip.requestOpen(); },
      onPointerleave: (event: PointerEvent) => { if (!event.defaultPrevented) tooltip.requestClose(); },
      onPointerdown: (event: PointerEvent) => { if (!event.defaultPrevented) tooltip.requestClose(); },
      onFocus: (event: FocusEvent) => { if (!event.defaultPrevented && !props.disabled) tooltip.requestOpen(true); },
      onBlur: (event: FocusEvent) => { if (!event.defaultPrevented) tooltip.requestClose(); },
    }), slots);
  },
});

export interface TooltipContentProps { side?: FloatingSide; align?: FloatingAlign; offset?: number }
export const FewTooltipContent = defineComponent({
  name: 'FewTooltipContent',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    side: { type: String as PropType<FloatingSide>, default: 'top' },
    align: { type: String as PropType<FloatingAlign>, default: 'center' },
    offset: { type: Number, default: 6 },
  },
  setup(props, { slots, attrs }) {
    const tooltip = useTooltip('FewTooltipContent');
    const position = usePosition(tooltip.open, tooltip.triggerRef, tooltip.contentRef, () => ({ side: props.side, align: props.align, offset: props.offset }));
    useTopLayer(tooltip.open, tooltip.contentRef);
    useDismiss(tooltip.open, tooltip.requestClose, () => [tooltip.triggerRef.value, tooltip.contentRef.value], { outside: false });
    watch(() => position.value.side, side => tooltip.setSide(side));
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, {
      ref: tooltip.contentRef, id: tooltip.contentId, role: 'tooltip', popover: 'manual',
      'data-state': dataState(tooltip.open()), 'data-side': position.value.side, class: 'few-tooltip',
      style: { position: 'fixed', top: `${position.value.top}px`, left: `${position.value.left}px`, ...(position.value.width !== undefined ? { width: `${position.value.width}px` } : {}) },
    }), slots);
  },
});

export const FewTooltipArrow = defineComponent({
  name: 'FewTooltipArrow',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const tooltip = useTooltip('FewTooltipArrow');
    return () => renderPrimitive('span', props.asChild, mergeProps(attrs, { 'aria-hidden': 'true', 'data-side': tooltip.side(), class: 'few-tooltip-arrow' }), slots);
  },
});
