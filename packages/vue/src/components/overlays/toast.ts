// Toast: fila de notificações efêmeras em estado de módulo, compartilhada entre useToast() e o Viewport
// (sem provide/inject) — só uma fila por app. Sem âncora/trigger — o Viewport é quem empilha (fixed,
// aria-live); Toast.Root fica dentro dele. Sem Portal: sem corrida de "container ainda null" e mantém o
// tema herdado do contêiner. Fila (máximo visível, ordem) vem do headless: enqueueToast/dismissToast/
// orderToasts em @fewcompany/core. Fonte da verdade: React packages/react/src/components/overlays/toast.tsx.
import { defineComponent, h, mergeProps, onMounted, onScopeDispose, reactive, ref, watch, type PropType, type VNode } from 'vue';
import { enqueueToast, dismissToast, orderToasts, type ToastTone } from '@fewcompany/core';
import { createContext } from '../../lib/context.js';
import { useControllable } from '../../lib/use-controllable.js';
import { renderPrimitive, dataState } from '../../lib/primitive.js';

export type { ToastTone };

export interface ToastInput {
  title?: string | VNode;
  description?: string | VNode;
  tone?: ToastTone;
  duration?: number;
  action?: VNode;
}
interface ToastQueueItem extends ToastInput { id: string }

// Estado de módulo: uma fila só, compartilhada por toda a aplicação (ver docs/composition-vue.md).
const queue = reactive<ToastQueueItem[]>([]);
const settings = reactive({ duration: 5000, maxVisible: 3 });
let counter = 0;

/** `toast({ title, description, tone, duration, action })` imperativo + `dismiss(id)`. Fila em estado de módulo (funciona com ou sem `<FewToastProvider>`). */
export function useToast() {
  function toast(input: ToastInput): string {
    const id = `few-toast-${++counter}`;
    const next = enqueueToast(queue, { id, ...input }, settings.maxVisible);
    queue.splice(0, queue.length, ...next);
    return id;
  }
  function dismiss(id: string) {
    const next = dismissToast(queue, id);
    queue.splice(0, queue.length, ...next);
  }
  return { toast, dismiss };
}

export interface ToastProviderProps {
  /** Duração padrão (ms) de cada toast; Root pode sobrescrever por instância. */
  duration?: number;
  /** Máximo de toasts visíveis simultaneamente na fila de `useToast()`. */
  maxVisible?: number;
  /** Reservado para paridade com Radix (direção do swipe-to-dismiss); hoje só documental (sem gesto implementado). */
  swipeDirection?: 'up' | 'down' | 'left' | 'right';
}
/** Ajusta a configuração (duration/maxVisible) da fila de módulo enquanto estiver montado. */
export const FewToastProvider = defineComponent({
  name: 'FewToastProvider',
  props: {
    duration: { type: Number, default: 5000 },
    maxVisible: { type: Number, default: 3 },
    swipeDirection: { type: String as PropType<'up' | 'down' | 'left' | 'right'>, default: undefined },
  },
  setup(props, { slots }) {
    watch([() => props.duration, () => props.maxVisible], ([duration, maxVisible]) => { settings.duration = duration; settings.maxVisible = maxVisible; }, { immediate: true });
    return () => slots.default?.() ?? null;
  },
});

interface ToastRootContext { setOpen: (open: boolean) => void }
const [provideToastRoot, useToastRoot] = createContext<ToastRootContext>('FewToastRoot');

export interface ToastRootProps { open?: boolean; defaultOpen?: boolean; duration?: number; tone?: ToastTone }
/** Auto-dismiss por `duration`, pausado no hover/foco. Fica dentro de um FewToastViewport. */
export const FewToastRoot = defineComponent({
  name: 'FewToastRoot',
  inheritAttrs: false,
  props: {
    open: { type: Boolean, default: undefined }, defaultOpen: { type: Boolean, default: false },
    duration: { type: Number, default: undefined }, tone: { type: String as PropType<ToastTone>, default: 'neutral' },
  },
  emits: { 'update:open': (open: boolean) => typeof open === 'boolean' },
  setup(props, { slots, attrs, emit }) {
    const [open, setOpen] = useControllable(() => props.open, props.defaultOpen, v => emit('update:open', v));
    const paused = ref(false);
    let timer: ReturnType<typeof setTimeout> | undefined;
    watch([open, paused, () => props.duration ?? settings.duration], ([isOpen, isPaused, duration]) => {
      clearTimeout(timer);
      if (!isOpen || isPaused || duration === Infinity) return;
      timer = setTimeout(() => setOpen(false), duration);
    }, { flush: 'post', immediate: true });
    onScopeDispose(() => clearTimeout(timer));
    provideToastRoot({ setOpen });
    return () => {
      if (!open.value) return null;
      return h('div', mergeProps(attrs, {
        role: props.tone === 'danger' || props.tone === 'warning' ? 'alert' : 'status',
        'data-state': dataState(open.value), 'data-tone': props.tone, class: `few-toast few-tone--${props.tone}`,
        onMouseenter: () => { paused.value = true; }, onMouseleave: () => { paused.value = false; },
        onFocus: () => { paused.value = true; }, onBlur: () => { paused.value = false; },
      }), slots.default?.());
    };
  },
});

export const FewToastTitle = defineComponent({
  name: 'FewToastTitle',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) { return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { class: 'few-toast-title' }), slots); },
});

export const FewToastDescription = defineComponent({
  name: 'FewToastDescription',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) { return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { class: 'few-toast-description few-muted' }), slots); },
});

export interface ToastActionProps {
  /** Texto alternativo para leitores de tela, quando o rótulo visível não é suficiente (ex.: ação com ícone). */
  altText?: string;
}
export const FewToastAction = defineComponent({
  name: 'FewToastAction',
  inheritAttrs: false,
  props: { asChild: Boolean, altText: { type: String, default: undefined } },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('button', props.asChild, mergeProps(attrs, { type: 'button', 'aria-label': props.altText, class: 'few-toast-action' }), slots);
  },
});

export const FewToastClose = defineComponent({
  name: 'FewToastClose',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const toastRoot = useToastRoot('FewToastClose');
    return () => renderPrimitive('button', props.asChild, mergeProps(attrs, {
      type: 'button', class: 'few-toast-close',
      onClick: (event: MouseEvent) => { if (!event.defaultPrevented) toastRoot.setOpen(false); },
    }), slots);
  },
});

export type ToastViewportPosition = 'top-right' | 'bottom-right' | 'bottom-center';
export interface ToastViewportProps { position?: ToastViewportPosition }
/**
 * Região aria-live=polite onde os toasts aparecem. Atalho F8 foca o viewport (padrão Radix Toast).
 * Renderiza a fila de `useToast()` automaticamente; toasts compostos manualmente com `<FewToastRoot>` (via
 * slot default) também podem ficar aqui dentro para herdar o posicionamento fixo.
 */
export const FewToastViewport = defineComponent({
  name: 'FewToastViewport',
  inheritAttrs: false,
  props: { position: { type: String as PropType<ToastViewportPosition>, default: 'bottom-right' } },
  setup(props, { slots, attrs }) {
    const host = ref<HTMLElement | null>(null);
    const { dismiss } = useToast();
    function onKeydown(event: KeyboardEvent) { if (event.key === 'F8') { event.preventDefault(); host.value?.focus(); } }
    onMounted(() => { if (typeof document !== 'undefined') document.addEventListener('keydown', onKeydown); });
    onScopeDispose(() => { if (typeof document !== 'undefined') document.removeEventListener('keydown', onKeydown); });
    return () => h('div', mergeProps(attrs, {
      ref: host, role: 'region', 'aria-live': 'polite', 'aria-label': 'Notificações', tabindex: -1, 'data-position': props.position, class: 'few-toast-viewport',
    }), [
      ...orderToasts(queue).map(item => h(FewToastRoot, {
        key: item.id, defaultOpen: true, duration: item.duration, tone: item.tone,
        'onUpdate:open': (open: boolean) => { if (!open) dismiss(item.id); },
      }, () => [
        item.title !== undefined ? h(FewToastTitle, null, () => item.title!) : null,
        item.description !== undefined ? h(FewToastDescription, null, () => item.description!) : null,
        item.action ?? null,
        h(FewToastClose, { 'aria-label': 'Fechar notificação' }, () => '×'),
      ])),
      ...(slots.default?.() ?? []),
    ]);
  },
});
