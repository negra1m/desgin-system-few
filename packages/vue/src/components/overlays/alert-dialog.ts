// AlertDialog: mesma base do Dialog (<dialog> nativo), role=alertdialog, sem fechar no clique fora,
// Cancel/Action em vez de Close, foco inicial no Cancel (autofocus nativo). Fonte da verdade: React
// packages/react/src/components/overlays/alert-dialog.tsx.
import { defineComponent, h, mergeProps, onScopeDispose, ref, watch, type Ref } from 'vue';
import { createContext } from '../../lib/context.js';
import { useControllable } from '../../lib/use-controllable.js';
import { useId } from '../../lib/ids.js';
import { renderPrimitive } from '../../lib/primitive.js';

interface AlertDialogContext {
  open: () => boolean; setOpen: (open: boolean) => void;
  titleId: string; descriptionId: string;
  hasDescription: () => boolean; setHasDescription: (value: boolean) => void;
  contentRef: Ref<HTMLDialogElement | null>; triggerRef: Ref<HTMLElement | null>;
}
const [provideAlertDialog, useAlertDialog] = createContext<AlertDialogContext>('FewAlertDialog');

/** Raiz: só contexto (sempre modal, sem fechar clicando fora). */
export const FewAlertDialog = defineComponent({
  name: 'FewAlertDialog',
  props: { open: { type: Boolean, default: undefined }, defaultOpen: { type: Boolean, default: false } },
  emits: { 'update:open': (open: boolean) => typeof open === 'boolean' },
  setup(props, { slots, emit }) {
    const [open, setOpen] = useControllable(() => props.open, props.defaultOpen, v => emit('update:open', v));
    const baseId = useId('alert-dialog');
    const hasDescription = ref(false);
    const contentRef = ref<HTMLDialogElement | null>(null);
    const triggerRef = ref<HTMLElement | null>(null);
    provideAlertDialog({
      open: () => open.value, setOpen, titleId: `${baseId}-title`, descriptionId: `${baseId}-description`,
      hasDescription: () => hasDescription.value, setHasDescription: v => { hasDescription.value = v; },
      contentRef, triggerRef,
    });
    return () => slots.default?.() ?? null;
  },
});

export const FewAlertDialogTrigger = defineComponent({
  name: 'FewAlertDialogTrigger',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const dialog = useAlertDialog('FewAlertDialogTrigger');
    return () => renderPrimitive('button', props.asChild, mergeProps(attrs, {
      ref: dialog.triggerRef, type: 'button', 'aria-haspopup': 'dialog', 'aria-expanded': dialog.open(), class: 'few-alert-dialog-trigger',
      onClick: (event: MouseEvent) => { if (!event.defaultPrevented) dialog.setOpen(true); },
    }), slots);
  },
});

/** Content não suporta asChild: depende do <dialog> nativo. Sem fechar no clique fora — só Cancel/Action/Escape. */
export const FewAlertDialogContent = defineComponent({
  name: 'FewAlertDialogContent',
  inheritAttrs: false,
  props: {},
  setup(_props, { slots, attrs }) {
    const dialog = useAlertDialog('FewAlertDialogContent');
    watch([dialog.open, dialog.contentRef], ([open, el]) => {
      if (!el) return;
      if (open && !el.open) el.showModal();
      if (!open && el.open) el.close();
    }, { flush: 'post', immediate: true });
    return () => h('dialog', mergeProps(attrs, {
      ref: dialog.contentRef, role: 'alertdialog', class: 'few-alert-dialog',
      'aria-labelledby': dialog.titleId, 'aria-describedby': dialog.hasDescription() ? dialog.descriptionId : undefined,
      onCancel: (event: Event) => { event.preventDefault(); dialog.setOpen(false); },
      onClose: () => { dialog.setOpen(false); dialog.triggerRef.value?.focus(); },
    }), slots.default?.());
  },
});

export const FewAlertDialogTitle = defineComponent({
  name: 'FewAlertDialogTitle',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const dialog = useAlertDialog('FewAlertDialogTitle');
    return () => renderPrimitive('h2', props.asChild, mergeProps(attrs, { id: dialog.titleId, class: 'few-alert-dialog-title' }), slots);
  },
});

export const FewAlertDialogDescription = defineComponent({
  name: 'FewAlertDialogDescription',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const dialog = useAlertDialog('FewAlertDialogDescription');
    dialog.setHasDescription(true);
    onScopeDispose(() => dialog.setHasDescription(false));
    return () => renderPrimitive('p', props.asChild, mergeProps(attrs, { id: dialog.descriptionId, class: 'few-alert-dialog-description few-muted' }), slots);
  },
});

/** Recebe o foco inicial (autofocus nativo lido pelo showModal() a cada abertura). */
export const FewAlertDialogCancel = defineComponent({
  name: 'FewAlertDialogCancel',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const dialog = useAlertDialog('FewAlertDialogCancel');
    return () => renderPrimitive('button', props.asChild, mergeProps(attrs, {
      type: 'button', autofocus: true, class: 'few-alert-dialog-cancel',
      onClick: (event: MouseEvent) => { if (!event.defaultPrevented) dialog.setOpen(false); },
    }), slots);
  },
});

/** Ação principal: executa o clique do consumidor e fecha o diálogo. */
export const FewAlertDialogAction = defineComponent({
  name: 'FewAlertDialogAction',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const dialog = useAlertDialog('FewAlertDialogAction');
    return () => renderPrimitive('button', props.asChild, mergeProps(attrs, {
      type: 'button', class: 'few-alert-dialog-action',
      onClick: (event: MouseEvent) => { if (!event.defaultPrevented) dialog.setOpen(false); },
    }), slots);
  },
});
