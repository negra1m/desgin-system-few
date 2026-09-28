// Drawer: mesma base do Dialog (<dialog> nativo, showModal/close), lateral. Fonte da verdade: React
// packages/react/src/components/overlays/drawer.tsx. Animação e movimento reduzido ficam no CSS do core.
import { defineComponent, h, mergeProps, onScopeDispose, ref, watch, type PropType, type Ref } from 'vue';
import { createContext } from '../../lib/context.js';
import { useControllable } from '../../lib/use-controllable.js';
import { useId } from '../../lib/ids.js';
import { renderPrimitive } from '../../lib/primitive.js';

export type DrawerSide = 'left' | 'right' | 'top' | 'bottom';

interface DrawerContext {
  open: () => boolean; setOpen: (open: boolean) => void; side: DrawerSide;
  titleId: string; descriptionId: string;
  hasDescription: () => boolean; setHasDescription: (value: boolean) => void;
  contentRef: Ref<HTMLDialogElement | null>; triggerRef: Ref<HTMLElement | null>;
}
const [provideDrawer, useDrawer] = createContext<DrawerContext>('FewDrawer');

/** Raiz: só contexto. `side` fica no Root porque estiliza Handle e Content juntos. */
export const FewDrawer = defineComponent({
  name: 'FewDrawer',
  props: {
    open: { type: Boolean, default: undefined }, defaultOpen: { type: Boolean, default: false },
    side: { type: String as PropType<DrawerSide>, default: 'right' },
  },
  emits: { 'update:open': (open: boolean) => typeof open === 'boolean' },
  setup(props, { slots, emit }) {
    const [open, setOpen] = useControllable(() => props.open, props.defaultOpen, v => emit('update:open', v));
    const baseId = useId('drawer');
    const hasDescription = ref(false);
    const contentRef = ref<HTMLDialogElement | null>(null);
    const triggerRef = ref<HTMLElement | null>(null);
    provideDrawer({
      open: () => open.value, setOpen, side: props.side, titleId: `${baseId}-title`, descriptionId: `${baseId}-description`,
      hasDescription: () => hasDescription.value, setHasDescription: v => { hasDescription.value = v; },
      contentRef, triggerRef,
    });
    return () => slots.default?.() ?? null;
  },
});

export const FewDrawerTrigger = defineComponent({
  name: 'FewDrawerTrigger',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const drawer = useDrawer('FewDrawerTrigger');
    return () => renderPrimitive('button', props.asChild, mergeProps(attrs, {
      ref: drawer.triggerRef, type: 'button', 'aria-haspopup': 'dialog', 'aria-expanded': drawer.open(), class: 'few-drawer-trigger',
      onClick: (event: MouseEvent) => { if (!event.defaultPrevented) drawer.setOpen(true); },
    }), slots);
  },
});

export interface DrawerContentProps {
  /** Tamanho via `--few-drawer-size` (largura em left/right, altura em top/bottom). Ex.: "420px", "70vh". */
  size?: string;
  dismissOnOutsideClick?: boolean;
}
/** Content não suporta asChild: depende do <dialog> nativo. */
export const FewDrawerContent = defineComponent({
  name: 'FewDrawerContent',
  inheritAttrs: false,
  props: { size: { type: String, default: undefined }, dismissOnOutsideClick: { type: Boolean, default: true } },
  setup(props, { slots, attrs }) {
    const drawer = useDrawer('FewDrawerContent');
    watch([drawer.open, drawer.contentRef], ([open, el]) => {
      if (!el) return;
      if (open && !el.open) el.showModal();
      if (!open && el.open) el.close();
    }, { flush: 'post', immediate: true });
    return () => h('dialog', mergeProps(attrs, {
      ref: drawer.contentRef, class: 'few-drawer', 'data-side': drawer.side,
      style: props.size ? { '--few-drawer-size': props.size } : undefined,
      'aria-labelledby': drawer.titleId, 'aria-describedby': drawer.hasDescription() ? drawer.descriptionId : undefined,
      onCancel: (event: Event) => { event.preventDefault(); drawer.setOpen(false); },
      onClose: () => { drawer.setOpen(false); drawer.triggerRef.value?.focus(); },
      onClick: (event: MouseEvent) => { if (props.dismissOnOutsideClick && event.target === drawer.contentRef.value) drawer.setOpen(false); },
    }), slots.default?.());
  },
});

export const FewDrawerTitle = defineComponent({
  name: 'FewDrawerTitle',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const drawer = useDrawer('FewDrawerTitle');
    return () => renderPrimitive('h2', props.asChild, mergeProps(attrs, { id: drawer.titleId, class: 'few-drawer-title' }), slots);
  },
});

export const FewDrawerDescription = defineComponent({
  name: 'FewDrawerDescription',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const drawer = useDrawer('FewDrawerDescription');
    drawer.setHasDescription(true);
    onScopeDispose(() => drawer.setHasDescription(false));
    return () => renderPrimitive('p', props.asChild, mergeProps(attrs, { id: drawer.descriptionId, class: 'few-drawer-description few-muted' }), slots);
  },
});

export const FewDrawerClose = defineComponent({
  name: 'FewDrawerClose',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const drawer = useDrawer('FewDrawerClose');
    return () => renderPrimitive('button', props.asChild, mergeProps(attrs, {
      type: 'button', class: 'few-drawer-close',
      onClick: (event: MouseEvent) => { if (!event.defaultPrevented) drawer.setOpen(false); },
    }), slots);
  },
});

/** Indicador visual de arrasto (decorativo), comum em drawers `side="bottom"`. */
export const FewDrawerHandle = defineComponent({
  name: 'FewDrawerHandle',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { 'aria-hidden': 'true', class: 'few-drawer-handle' }), slots);
  },
});
