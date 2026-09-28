// Dialog modal, sobre <dialog> nativo (ver docs/composition-vue.md #5). Fonte da verdade: React
// packages/react/src/components/overlays/dialog.tsx (mesmas partes, classes few-*, aria e teclado).
import { defineComponent, h, mergeProps, onScopeDispose, ref, watch, type PropType, type Ref } from 'vue';
import { createContext } from '../../lib/context.js';
import { useControllable } from '../../lib/use-controllable.js';
import { useId } from '../../lib/ids.js';
import { renderPrimitive } from '../../lib/primitive.js';

export type DialogSize = 'sm' | 'md' | 'lg' | 'full';

interface DialogContext {
  open: () => boolean; setOpen: (open: boolean) => void;
  titleId: string; descriptionId: string;
  hasDescription: () => boolean; setHasDescription: (value: boolean) => void;
  contentRef: Ref<HTMLDialogElement | null>; triggerRef: Ref<HTMLElement | null>;
}
const [provideDialog, useDialog] = createContext<DialogContext>('FewDialog');

/** Raiz: só contexto (Trigger e Content ficam em pontos diferentes da árvore, sem elemento próprio). */
export const FewDialog = defineComponent({
  name: 'FewDialog',
  props: { open: { type: Boolean, default: undefined }, defaultOpen: { type: Boolean, default: false } },
  emits: { 'update:open': (open: boolean) => typeof open === 'boolean' },
  setup(props, { slots, emit }) {
    const [open, setOpen] = useControllable(() => props.open, props.defaultOpen, v => emit('update:open', v));
    const baseId = useId('dialog');
    const hasDescription = ref(false);
    const contentRef = ref<HTMLDialogElement | null>(null);
    const triggerRef = ref<HTMLElement | null>(null);
    provideDialog({
      open: () => open.value, setOpen, titleId: `${baseId}-title`, descriptionId: `${baseId}-description`,
      hasDescription: () => hasDescription.value, setHasDescription: v => { hasDescription.value = v; },
      contentRef, triggerRef,
    });
    return () => slots.default?.() ?? null;
  },
});

export const FewDialogTrigger = defineComponent({
  name: 'FewDialogTrigger',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const dialog = useDialog('FewDialogTrigger');
    return () => renderPrimitive('button', props.asChild, mergeProps(attrs, {
      ref: dialog.triggerRef, type: 'button', 'aria-haspopup': 'dialog', 'aria-expanded': dialog.open(), class: 'few-dialog-trigger',
      onClick: (event: MouseEvent) => { if (!event.defaultPrevented) dialog.setOpen(true); },
    }), slots);
  },
});

export interface DialogContentProps {
  size?: DialogSize;
  /** Fecha ao clicar fora do conteúdo (na ::backdrop). Padrão true; AlertDialog usa false. */
  dismissOnOutsideClick?: boolean;
}
/** Content não suporta asChild: depende do <dialog> nativo (showModal, ::backdrop, focus trap, foco inicial). */
export const FewDialogContent = defineComponent({
  name: 'FewDialogContent',
  inheritAttrs: false,
  props: {
    size: { type: String as PropType<DialogSize>, default: 'md' },
    dismissOnOutsideClick: { type: Boolean, default: true },
  },
  setup(props, { slots, attrs }) {
    const dialog = useDialog('FewDialogContent');
    watch([dialog.open, dialog.contentRef], ([open, el]) => {
      if (!el) return;
      if (open && !el.open) el.showModal();
      if (!open && el.open) el.close();
    }, { flush: 'post', immediate: true });
    return () => h('dialog', mergeProps(attrs, {
      ref: dialog.contentRef, class: 'few-dialog', 'data-size': props.size,
      'aria-labelledby': dialog.titleId, 'aria-describedby': dialog.hasDescription() ? dialog.descriptionId : undefined,
      onCancel: (event: Event) => { event.preventDefault(); dialog.setOpen(false); },
      onClose: () => { dialog.setOpen(false); dialog.triggerRef.value?.focus(); },
      onClick: (event: MouseEvent) => { if (props.dismissOnOutsideClick && event.target === dialog.contentRef.value) dialog.setOpen(false); },
    }), slots.default?.());
  },
});

export const FewDialogTitle = defineComponent({
  name: 'FewDialogTitle',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const dialog = useDialog('FewDialogTitle');
    return () => renderPrimitive('h2', props.asChild, mergeProps(attrs, { id: dialog.titleId, class: 'few-dialog-title' }), slots);
  },
});

export const FewDialogDescription = defineComponent({
  name: 'FewDialogDescription',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const dialog = useDialog('FewDialogDescription');
    dialog.setHasDescription(true);
    onScopeDispose(() => dialog.setHasDescription(false));
    return () => renderPrimitive('p', props.asChild, mergeProps(attrs, { id: dialog.descriptionId, class: 'few-dialog-description few-muted' }), slots);
  },
});

export const FewDialogClose = defineComponent({
  name: 'FewDialogClose',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const dialog = useDialog('FewDialogClose');
    return () => renderPrimitive('button', props.asChild, mergeProps(attrs, {
      type: 'button', class: 'few-dialog-close',
      onClick: (event: MouseEvent) => { if (!event.defaultPrevented) dialog.setOpen(false); },
    }), slots);
  },
});
