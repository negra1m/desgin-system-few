// Menu de navegação com flyout. Ver navigation-menu.tsx no React.
import { computed, defineComponent, mergeProps, ref, watch, type ComponentPublicInstance, type PropType, type Ref } from 'vue';
import { createContext } from '../../lib/context.js';
import { useControllable } from '../../lib/use-controllable.js';
import { useId } from '../../lib/ids.js';
import { moveFocus } from '../../lib/roving.js';
import { useDismiss } from '../../lib/use-dismiss.js';
import { usePosition } from '../../lib/use-position.js';
import { useTopLayer } from '../../lib/use-top-layer.js';
import { renderPrimitive, dataAttr } from '../../lib/primitive.js';

interface NavigationMenuContext { baseId: string; value: () => string | null; setValue: (value: string | null) => void; triggers: Map<string, HTMLElement> }
const [provideNavigationMenu, useNavigationMenu] = createContext<NavigationMenuContext>('FewNavigationMenu');

interface NavigationMenuItemContext { value: string; open: () => boolean; triggerId: string; contentId: string; triggerRef: Ref<HTMLElement | null> }
const [provideNavigationMenuItem, useNavigationMenuItem] = createContext<NavigationMenuItemContext>('FewNavigationMenuItem');

/** Raiz: `<FewNavigationMenu v-model:value="open">`. */
export const FewNavigationMenu = defineComponent({
  name: 'FewNavigationMenu',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    value: { type: String as PropType<string | null>, default: undefined },
    defaultValue: { type: String as PropType<string | null>, default: null },
  },
  emits: { 'update:value': (value: string | null) => value === null || typeof value === 'string' },
  setup(props, { slots, attrs, emit }) {
    const baseId = useId('navmenu');
    const [value, setValue] = useControllable<string | null>(() => props.value, props.defaultValue, v => emit('update:value', v));
    const triggers = new Map<string, HTMLElement>();
    provideNavigationMenu({ baseId, value: () => value.value, setValue, triggers });
    return () => renderPrimitive('nav', props.asChild, mergeProps(attrs, {
      'aria-label': (attrs['aria-label'] as string | undefined) ?? 'Menu principal', class: 'few-navigation-menu',
    }), slots);
  },
});

/** Lista dos triggers, com roving horizontal (setas/Home/End) entre eles. */
export const FewNavigationMenuList = defineComponent({
  name: 'FewNavigationMenuList',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const host = ref<HTMLElement | null>(null);
    function handleKeydown(event: KeyboardEvent) {
      if (event.defaultPrevented) return;
      const target = moveFocus(host.value, '[data-few-navmenu-trigger]', event.key, { orientation: 'horizontal' });
      if (target) event.preventDefault();
    }
    return () => renderPrimitive('ul', props.asChild, mergeProps(attrs, { ref: host, class: 'few-navigation-menu-list', onKeydown: handleKeydown }), slots);
  },
});

export const FewNavigationMenuItem = defineComponent({
  name: 'FewNavigationMenuItem',
  inheritAttrs: false,
  props: { asChild: Boolean, value: { type: String, required: true } },
  setup(props, { slots, attrs }) {
    const menu = useNavigationMenu('FewNavigationMenuItem');
    const triggerRef = ref<HTMLElement | null>(null);
    const open = computed(() => menu.value() === props.value);
    const triggerId = `${menu.baseId}-trigger-${props.value}`;
    const contentId = `${menu.baseId}-content-${props.value}`;
    provideNavigationMenuItem({ value: props.value, open: () => open.value, triggerId, contentId, triggerRef });
    return () => renderPrimitive('li', props.asChild, mergeProps(attrs, { 'data-state': open.value ? 'open' : 'closed', class: 'few-navigation-menu-item' }), slots);
  },
});

/** Abre no hover, foco ou Enter/ArrowDown; fecha com Escape ou ao abrir outro item. */
export const FewNavigationMenuTrigger = defineComponent({
  name: 'FewNavigationMenuTrigger',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const menu = useNavigationMenu('FewNavigationMenuTrigger');
    const item = useNavigationMenuItem('FewNavigationMenuTrigger');
    function setRef(node: Element | ComponentPublicInstance | null) {
      const el = node as HTMLElement | null;
      item.triggerRef.value = el;
      if (el) menu.triggers.set(item.value, el); else menu.triggers.delete(item.value);
    }
    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented) return;
      menu.setValue(item.open() ? null : item.value);
    }
    function handleKeydown(event: KeyboardEvent) {
      if (event.defaultPrevented) return;
      if (event.key === 'Escape' && item.open()) { event.preventDefault(); menu.setValue(null); }
      else if (event.key === 'ArrowDown' && !item.open()) { event.preventDefault(); menu.setValue(item.value); }
    }
    function handleFocus() { menu.setValue(item.value); }
    function handleMouseenter() { menu.setValue(item.value); }
    return () => renderPrimitive('button', props.asChild, mergeProps(attrs, {
      ref: setRef, type: 'button', id: item.triggerId, 'data-few-navmenu-trigger': '', 'data-state': item.open() ? 'open' : 'closed',
      'aria-expanded': item.open(), 'aria-controls': item.contentId,
      class: 'few-navigation-menu-trigger', onClick: handleClick, onKeydown: handleKeydown, onFocus: handleFocus, onMouseenter: handleMouseenter,
    }), slots);
  },
});

/** Flyout posicionado com usePosition + top layer nativo (popover="manual"); fecha com Escape e clique fora. */
export const FewNavigationMenuContent = defineComponent({
  name: 'FewNavigationMenuContent',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const menu = useNavigationMenu('FewNavigationMenuContent');
    const item = useNavigationMenuItem('FewNavigationMenuContent');
    const host = ref<HTMLElement | null>(null);
    useTopLayer(() => item.open(), host);
    const position = usePosition(() => item.open(), item.triggerRef, host, () => ({ side: 'bottom', align: 'start' }));
    useDismiss(() => item.open(), () => menu.setValue(null), () => [item.triggerRef.value, host.value]);
    function handleKeydown(event: KeyboardEvent) {
      if (event.defaultPrevented) return;
      if (event.key === 'Escape') { event.preventDefault(); menu.setValue(null); }
    }
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, {
      ref: host, popover: 'manual', id: item.contentId, role: 'group', 'aria-labelledby': item.triggerId,
      'data-state': item.open() ? 'open' : 'closed', 'data-side': position.value.side,
      style: { position: 'fixed', top: `${position.value.top}px`, left: `${position.value.left}px`, visibility: position.value.ready ? 'visible' : 'hidden' },
      class: 'few-navigation-menu-content', onKeydown: handleKeydown,
    }), slots);
  },
});

export const FewNavigationMenuLink = defineComponent({
  name: 'FewNavigationMenuLink',
  inheritAttrs: false,
  props: { asChild: Boolean, active: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('a', props.asChild, mergeProps(attrs, {
      'aria-current': props.active ? 'page' : undefined, 'data-active': dataAttr(props.active), class: 'few-navigation-menu-link',
    }), slots);
  },
});

/** Indicador que acompanha a posição do trigger aberto (renderize dentro de List). */
export const FewNavigationMenuIndicator = defineComponent({
  name: 'FewNavigationMenuIndicator',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const menu = useNavigationMenu('FewNavigationMenuIndicator');
    const rect = ref<{ left: number; width: number } | null>(null);
    watch(() => menu.value(), (value) => {
      const trigger = value ? menu.triggers.get(value) : undefined;
      rect.value = trigger ? { left: trigger.offsetLeft, width: trigger.offsetWidth } : null;
    }, { flush: 'post', immediate: true });
    return () => {
      if (!menu.value() || !rect.value) return null;
      return renderPrimitive('div', props.asChild, mergeProps(attrs, {
        'aria-hidden': 'true', 'data-state': 'visible',
        style: { transform: `translateX(${rect.value.left}px)`, width: `${rect.value.width}px` },
        class: 'few-navigation-menu-indicator',
      }), slots);
    };
  },
});
