// ContextMenu: menu na posição do ponteiro (botão direito ou toque longo). Âncora virtual: um <span> de
// tamanho zero posicionado fixed em x/y. Núcleo reusado de menu-core.ts. Fonte da verdade: React
// packages/react/src/components/overlays/context-menu.tsx.
import { defineComponent, h, mergeProps, onScopeDispose, ref, type PropType, type Ref } from 'vue';
import type { FloatingAlign, FloatingSide } from '@fewcompany/core';
import { createContext } from '../../lib/context.js';
import { useControllable } from '../../lib/use-controllable.js';
import { useId } from '../../lib/ids.js';
import {
  MenuContentCore, MenuItemCore, MenuCheckboxItemCore, MenuRadioGroupCore, MenuRadioItemCore, MenuItemIndicatorCore,
  MenuLabelCore, MenuGroupCore, MenuSeparatorCore, MenuShortcutCore,
} from './menu-core.js';
import { renderPrimitive } from '../../lib/primitive.js';

interface Point { x: number; y: number }
interface ContextMenuContext {
  open: () => boolean; setOpen: (open: boolean) => void; contentId: string;
  point: () => Point; setPoint: (point: Point) => void; anchorRef: Ref<HTMLElement | null>;
}
const [provideContextMenu, useContextMenu] = createContext<ContextMenuContext>('FewContextMenu');

/** Raiz: só contexto. */
export const FewContextMenu = defineComponent({
  name: 'FewContextMenu',
  props: { open: { type: Boolean, default: undefined }, defaultOpen: { type: Boolean, default: false } },
  emits: { 'update:open': (open: boolean) => typeof open === 'boolean' },
  setup(props, { slots, emit }) {
    const [open, setOpen] = useControllable(() => props.open, props.defaultOpen, v => emit('update:open', v));
    const baseId = useId('context-menu');
    const point = ref<Point>({ x: 0, y: 0 });
    const anchorRef = ref<HTMLElement | null>(null);
    provideContextMenu({ open: () => open.value, setOpen, contentId: `${baseId}-context-menu`, point: () => point.value, setPoint: p => { point.value = p; }, anchorRef });
    return () => slots.default?.() ?? null;
  },
});

/** Área que escuta o clique com botão direito (e, opcionalmente, toque longo) para abrir o menu na posição do ponteiro. */
export const FewContextMenuTrigger = defineComponent({
  name: 'FewContextMenuTrigger',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    /** Toque longo (mobile) também abre o menu. Padrão true. */
    longPress: { type: Boolean, default: true },
  },
  setup(props, { slots, attrs }) {
    const menu = useContextMenu('FewContextMenuTrigger');
    let timer: ReturnType<typeof setTimeout> | undefined;
    function openAt(x: number, y: number) { menu.setPoint({ x, y }); menu.setOpen(true); }
    onScopeDispose(() => clearTimeout(timer));
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, {
      tabindex: (attrs.tabindex as string | number | undefined) ?? 0, class: 'few-context-menu-trigger',
      onContextmenu: (event: MouseEvent) => { if (event.defaultPrevented) return; event.preventDefault(); openAt(event.clientX, event.clientY); },
      onPointerdown: (event: PointerEvent) => {
        if (!props.longPress || event.pointerType !== 'touch') return;
        const { clientX, clientY } = event;
        timer = setTimeout(() => openAt(clientX, clientY), 500);
      },
      onPointerup: () => clearTimeout(timer),
      onPointerleave: () => clearTimeout(timer),
    }), slots);
  },
});

export interface ContextMenuContentProps { side?: FloatingSide; align?: FloatingAlign; offset?: number; loop?: boolean }
export const FewContextMenuContent = defineComponent({
  name: 'FewContextMenuContent',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    side: { type: String as PropType<FloatingSide>, default: 'bottom' },
    align: { type: String as PropType<FloatingAlign>, default: 'start' },
    offset: { type: Number, default: 2 },
    loop: { type: Boolean, default: true },
  },
  setup(props, { slots, attrs }) {
    const menu = useContextMenu('FewContextMenuContent');
    return () => {
      const id = (attrs.id as string | undefined) ?? menu.contentId;
      const point = menu.point();
      return [
        h('span', { ref: menu.anchorRef, 'aria-hidden': 'true', class: 'few-context-menu-anchor', style: { position: 'fixed', left: `${point.x}px`, top: `${point.y}px`, width: '0px', height: '0px' } }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- mergeProps() devolve um bag genérico; h() com componente + props dinâmicas não infere P.
        h(MenuContentCore, mergeProps(attrs, {
          id, open: menu.open(), onOpenChange: menu.setOpen, anchorRef: menu.anchorRef,
          asChild: props.asChild, side: props.side, align: props.align, offset: props.offset, loop: props.loop, class: 'few-context-menu',
        }) as any, slots),
      ];
    };
  },
});

export const FewContextMenuItem = MenuItemCore;
export const FewContextMenuCheckboxItem = MenuCheckboxItemCore;
export const FewContextMenuRadioGroup = MenuRadioGroupCore;
export const FewContextMenuRadioItem = MenuRadioItemCore;
export const FewContextMenuItemIndicator = MenuItemIndicatorCore;
export const FewContextMenuLabel = MenuLabelCore;
export const FewContextMenuGroup = MenuGroupCore;
export const FewContextMenuSeparator = MenuSeparatorCore;
export const FewContextMenuShortcut = MenuShortcutCore;
