// Menubar: barra horizontal de menus (Arquivo, Editar…). Roving focus horizontal entre Triggers; ArrowLeft/
// Right troca o menu aberto; hover troca quando algum já está aberto. Núcleo reusado de menu-core.ts.
// Simplificação assumida (igual à referência React): todo Trigger fica com tabindex 0 (toolbar simples) em
// vez do único tab-stop do roving-tabindex "estrito" — teclado permanece 100% operável. Fonte da verdade:
// React packages/react/src/components/overlays/menubar.tsx.
import { computed, defineComponent, h, mergeProps, ref, type PropType, type Ref } from 'vue';
import type { FloatingAlign, FloatingSide } from '@fewcompany/core';
import { createContext } from '../../lib/context.js';
import { useControllable } from '../../lib/use-controllable.js';
import { useId } from '../../lib/ids.js';
import { renderPrimitive, dataState } from '../../lib/primitive.js';
import { moveFocus } from '../../lib/roving.js';
import {
  MenuContentCore, MenuItemCore, MenuCheckboxItemCore, MenuRadioGroupCore, MenuRadioItemCore, MenuItemIndicatorCore,
  MenuLabelCore, MenuGroupCore, MenuSeparatorCore, MenuShortcutCore,
} from './menu-core.js';

const TRIGGER_SELECTOR = ':scope > [role="menuitem"]';

interface MenubarRootContext { openValue: () => string | null; setOpenValue: (value: string | null) => void }
const [provideMenubarRoot, useMenubarRoot] = createContext<MenubarRootContext>('FewMenubar');
interface MenubarMenuContext { value: string; triggerRef: Ref<HTMLElement | null>; contentId: string }
const [provideMenubarMenu, useMenubarMenu] = createContext<MenubarMenuContext>('FewMenubarMenu');

export const FewMenubar = defineComponent({
  name: 'FewMenubar',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    value: { type: String as PropType<string | null>, default: undefined },
    defaultValue: { type: String as PropType<string | null>, default: null },
  },
  emits: { 'update:value': (value: string | null) => true },
  setup(props, { slots, attrs, emit }) {
    const [openValue, setOpenValue] = useControllable<string | null>(() => props.value, props.defaultValue, v => emit('update:value', v));
    const host = ref<HTMLElement | null>(null);
    provideMenubarRoot({ openValue: () => openValue.value, setOpenValue });
    function handleKeydown(event: KeyboardEvent) {
      if (event.defaultPrevented) return;
      const target = moveFocus(host.value, TRIGGER_SELECTOR, event.key, { orientation: 'horizontal', loop: true });
      if (!target) return;
      event.preventDefault();
      if (openValue.value !== null) setOpenValue(target.dataset['menubarValue'] ?? null);
    }
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { ref: host, role: 'menubar', class: 'few-menubar', onKeydown: handleKeydown }), slots);
  },
});

/** Menubar.Menu: só contexto (identifica o menu para o Trigger e o Content). */
export const FewMenubarMenu = defineComponent({
  name: 'FewMenubarMenu',
  props: { value: { type: String, required: true } },
  setup(props, { slots }) {
    const baseId = useId('menubar-menu');
    const triggerRef = ref<HTMLElement | null>(null);
    provideMenubarMenu({ value: props.value, triggerRef, contentId: `${baseId}-menubar-menu` });
    return () => slots.default?.() ?? null;
  },
});

export const FewMenubarTrigger = defineComponent({
  name: 'FewMenubarTrigger',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const root = useMenubarRoot('FewMenubarTrigger');
    const menu = useMenubarMenu('FewMenubarTrigger');
    const open = computed(() => root.openValue() === menu.value);
    return () => renderPrimitive('button', props.asChild, mergeProps(attrs, {
      ref: menu.triggerRef, type: 'button', role: 'menuitem', tabindex: 0, 'data-menubar-value': menu.value,
      'aria-haspopup': 'menu', 'aria-expanded': open.value, 'aria-controls': open.value ? menu.contentId : undefined, 'data-state': dataState(open.value),
      class: 'few-menubar-trigger',
      onClick: (event: MouseEvent) => { if (!event.defaultPrevented) root.setOpenValue(open.value ? null : menu.value); },
      onMouseenter: (event: MouseEvent) => { if (!event.defaultPrevented && root.openValue() !== null && root.openValue() !== menu.value) root.setOpenValue(menu.value); },
    }), slots);
  },
});

export interface MenubarContentProps { side?: FloatingSide; align?: FloatingAlign; offset?: number; loop?: boolean }
export const FewMenubarContent = defineComponent({
  name: 'FewMenubarContent',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    side: { type: String as PropType<FloatingSide>, default: 'bottom' },
    align: { type: String as PropType<FloatingAlign>, default: 'start' },
    offset: { type: Number, default: 4 },
    loop: { type: Boolean, default: true },
  },
  setup(props, { slots, attrs }) {
    const root = useMenubarRoot('FewMenubarContent');
    const menu = useMenubarMenu('FewMenubarContent');
    const open = computed(() => root.openValue() === menu.value);
    return () => {
      const id = (attrs.id as string | undefined) ?? menu.contentId;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- mergeProps() devolve um bag genérico; h() com componente + props dinâmicas não infere P.
      return h(MenuContentCore, mergeProps(attrs, {
        id, open: open.value, onOpenChange: (next: boolean) => root.setOpenValue(next ? menu.value : null), anchorRef: menu.triggerRef,
        asChild: props.asChild, side: props.side, align: props.align, offset: props.offset, loop: props.loop, class: 'few-menubar-menu',
      }) as any, slots);
    };
  },
});

export const FewMenubarItem = MenuItemCore;
export const FewMenubarCheckboxItem = MenuCheckboxItemCore;
export const FewMenubarRadioGroup = MenuRadioGroupCore;
export const FewMenubarRadioItem = MenuRadioItemCore;
export const FewMenubarItemIndicator = MenuItemIndicatorCore;
export const FewMenubarLabel = MenuLabelCore;
export const FewMenubarGroup = MenuGroupCore;
export const FewMenubarSeparator = MenuSeparatorCore;
export const FewMenubarShortcut = MenuShortcutCore;
