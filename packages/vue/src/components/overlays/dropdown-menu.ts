// DropdownMenu: menu acionado por um botão. Núcleo de Content/Item/etc. vem de menu-core.ts (reusado por
// ContextMenu e Menubar). Fonte da verdade: React packages/react/src/components/overlays/dropdown-menu.tsx.
import { defineComponent, h, mergeProps, ref, type PropType, type Ref } from 'vue';
import type { FloatingAlign, FloatingSide } from '@fewcompany/core';
import { createContext } from '../../lib/context.js';
import { useControllable } from '../../lib/use-controllable.js';
import { useId } from '../../lib/ids.js';
import { renderPrimitive } from '../../lib/primitive.js';
import {
  MenuContentCore, MenuItemCore, MenuCheckboxItemCore, MenuRadioGroupCore, MenuRadioItemCore, MenuItemIndicatorCore,
  MenuLabelCore, MenuGroupCore, MenuSeparatorCore, MenuShortcutCore,
} from './menu-core.js';

interface DropdownMenuContext { open: () => boolean; setOpen: (open: boolean) => void; contentId: string; triggerRef: Ref<HTMLElement | null> }
const [provideDropdownMenu, useDropdownMenu] = createContext<DropdownMenuContext>('FewDropdownMenu');

/** Raiz: só contexto. */
export const FewDropdownMenu = defineComponent({
  name: 'FewDropdownMenu',
  props: { open: { type: Boolean, default: undefined }, defaultOpen: { type: Boolean, default: false } },
  emits: { 'update:open': (open: boolean) => typeof open === 'boolean' },
  setup(props, { slots, emit }) {
    const [open, setOpen] = useControllable(() => props.open, props.defaultOpen, v => emit('update:open', v));
    const baseId = useId('dropdown-menu');
    const triggerRef = ref<HTMLElement | null>(null);
    provideDropdownMenu({ open: () => open.value, setOpen, contentId: `${baseId}-menu`, triggerRef });
    return () => slots.default?.() ?? null;
  },
});

/** ArrowDown abre o menu (Enter/Espaço já funcionam nativamente, é um <button>). */
export const FewDropdownMenuTrigger = defineComponent({
  name: 'FewDropdownMenuTrigger',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const menu = useDropdownMenu('FewDropdownMenuTrigger');
    return () => renderPrimitive('button', props.asChild, mergeProps(attrs, {
      ref: menu.triggerRef, type: 'button', 'aria-haspopup': 'menu', 'aria-expanded': menu.open(),
      'aria-controls': menu.open() ? menu.contentId : undefined, class: 'few-dropdown-menu-trigger',
      onClick: (event: MouseEvent) => { if (!event.defaultPrevented) menu.setOpen(!menu.open()); },
      onKeydown: (event: KeyboardEvent) => { if (!event.defaultPrevented && event.key === 'ArrowDown') { event.preventDefault(); menu.setOpen(true); } },
    }), slots);
  },
});

export interface DropdownMenuContentProps { side?: FloatingSide; align?: FloatingAlign; offset?: number; loop?: boolean }
export const FewDropdownMenuContent = defineComponent({
  name: 'FewDropdownMenuContent',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    side: { type: String as PropType<FloatingSide>, default: 'bottom' },
    align: { type: String as PropType<FloatingAlign>, default: 'start' },
    offset: { type: Number, default: 4 },
    loop: { type: Boolean, default: true },
  },
  setup(props, { slots, attrs }) {
    const menu = useDropdownMenu('FewDropdownMenuContent');
    return () => {
      const id = (attrs.id as string | undefined) ?? menu.contentId;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- mergeProps() devolve um bag genérico; h() com componente + props dinâmicas não infere P.
      return h(MenuContentCore, mergeProps(attrs, {
        id, open: menu.open(), onOpenChange: menu.setOpen, anchorRef: menu.triggerRef,
        asChild: props.asChild, side: props.side, align: props.align, offset: props.offset, loop: props.loop, class: 'few-dropdown-menu',
      }) as any, slots);
    };
  },
});

export const FewDropdownMenuItem = MenuItemCore;
export const FewDropdownMenuCheckboxItem = MenuCheckboxItemCore;
export const FewDropdownMenuRadioGroup = MenuRadioGroupCore;
export const FewDropdownMenuRadioItem = MenuRadioItemCore;
export const FewDropdownMenuItemIndicator = MenuItemIndicatorCore;
export const FewDropdownMenuLabel = MenuLabelCore;
export const FewDropdownMenuGroup = MenuGroupCore;
export const FewDropdownMenuSeparator = MenuSeparatorCore;
export const FewDropdownMenuShortcut = MenuShortcutCore;
