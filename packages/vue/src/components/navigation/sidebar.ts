// Barra lateral colapsável/off-canvas. Ver sidebar.tsx no React.
import { computed, defineComponent, h, mergeProps, onMounted, onUnmounted, ref, type PropType, type Ref } from 'vue';
import { createContext } from '../../lib/context.js';
import { useControllable } from '../../lib/use-controllable.js';
import { useDismiss } from '../../lib/use-dismiss.js';
import { renderPrimitive, dataAttr } from '../../lib/primitive.js';

type SidebarSide = 'left' | 'right';
type SidebarCollapsible = 'offcanvas' | 'icon' | 'none';

interface SidebarContext {
  collapsed: () => boolean; setCollapsed: (value: boolean | ((previous: boolean) => boolean)) => void;
  side: () => SidebarSide; collapsible: () => SidebarCollapsible;
  mobileOpen: () => boolean; setMobileOpen: (value: boolean | ((previous: boolean) => boolean)) => void;
}
const [provideSidebar, useSidebar] = createContext<SidebarContext>('FewSidebar');

/** Verdadeiro abaixo de 768px. SSR-safe: só liga o matchMedia em onMounted (fica false no servidor). */
function useIsMobile(): Ref<boolean> {
  const isMobile = ref(false);
  let query: MediaQueryList | null = null;
  let update: (() => void) | null = null;
  onMounted(() => {
    if (typeof window === 'undefined') return;
    query = window.matchMedia('(max-width: 767px)');
    update = () => { isMobile.value = query!.matches; };
    update();
    query.addEventListener('change', update);
  });
  onUnmounted(() => { if (query && update) query.removeEventListener('change', update); });
  return isMobile;
}

/** Raiz: `<FewSidebar v-model:collapsed="collapsed" collapsible="icon">`. */
export const FewSidebar = defineComponent({
  name: 'FewSidebar',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    collapsed: { type: Boolean, default: undefined },
    defaultCollapsed: { type: Boolean, default: false },
    side: { type: String as PropType<SidebarSide>, default: 'left' },
    /** offcanvas: painel deslizante em telas < 768px. icon: encolhe para a largura de ícones no desktop (também vira off-canvas no mobile). none: nunca colapsa. */
    collapsible: { type: String as PropType<SidebarCollapsible>, default: 'offcanvas' },
  },
  emits: { 'update:collapsed': (value: boolean) => typeof value === 'boolean' },
  setup(props, { slots, attrs, emit }) {
    const [collapsed, setCollapsed] = useControllable(() => props.collapsed, props.defaultCollapsed, v => emit('update:collapsed', v));
    const mobileOpen = ref(false);
    const setMobileOpen = (next: boolean | ((previous: boolean) => boolean)) => {
      mobileOpen.value = typeof next === 'function' ? (next as (previous: boolean) => boolean)(mobileOpen.value) : next;
    };
    useDismiss(() => mobileOpen.value, () => setMobileOpen(false), () => [], { outside: false });
    provideSidebar({
      collapsed: () => collapsed.value, setCollapsed,
      side: () => props.side, collapsible: () => props.collapsible,
      mobileOpen: () => mobileOpen.value, setMobileOpen,
    });
    return () => {
      const backdrop = (mobileOpen.value && props.collapsible !== 'none')
        ? h('div', { class: 'few-sidebar-backdrop', 'data-state': 'open', onClick: () => setMobileOpen(false) })
        : null;
      const panel = renderPrimitive('div', props.asChild, mergeProps(attrs, {
        'data-side': props.side, 'data-collapsible': props.collapsible,
        'data-state': collapsed.value ? 'collapsed' : 'expanded', 'data-mobile-open': dataAttr(mobileOpen.value),
        class: 'few-sidebar',
      }), slots);
      return [backdrop, panel];
    };
  },
});

export const FewSidebarHeader = defineComponent({
  name: 'FewSidebarHeader',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { class: 'few-sidebar-header' }), slots);
  },
});

export const FewSidebarContent = defineComponent({
  name: 'FewSidebarContent',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { class: 'few-sidebar-content' }), slots);
  },
});

export const FewSidebarFooter = defineComponent({
  name: 'FewSidebarFooter',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { class: 'few-sidebar-footer' }), slots);
  },
});

export const FewSidebarGroup = defineComponent({
  name: 'FewSidebarGroup',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { class: 'few-sidebar-group' }), slots);
  },
});

export const FewSidebarGroupLabel = defineComponent({
  name: 'FewSidebarGroupLabel',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { class: 'few-sidebar-group-label' }), slots);
  },
});

export const FewSidebarMenu = defineComponent({
  name: 'FewSidebarMenu',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('ul', props.asChild, mergeProps(attrs, { class: 'few-sidebar-menu' }), slots);
  },
});

export const FewSidebarMenuItem = defineComponent({
  name: 'FewSidebarMenuItem',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('li', props.asChild, mergeProps(attrs, { class: 'few-sidebar-menu-item' }), slots);
  },
});

/** Item de menu. Envolva o rótulo em <span> (sem aria-hidden) para que ele suma automaticamente no modo colapsado "icon". `tooltip` vira title só quando colapsado. */
export const FewSidebarMenuButton = defineComponent({
  name: 'FewSidebarMenuButton',
  inheritAttrs: false,
  props: { asChild: Boolean, isActive: Boolean, tooltip: { type: String, default: undefined } },
  setup(props, { slots, attrs }) {
    const sidebar = useSidebar('FewSidebarMenuButton');
    const showTooltip = computed(() => Boolean(props.tooltip) && sidebar.collapsed() && sidebar.collapsible() === 'icon');
    return () => renderPrimitive('button', props.asChild, mergeProps(attrs, {
      type: 'button', title: showTooltip.value ? props.tooltip : undefined,
      'aria-current': props.isActive ? 'page' : undefined, 'data-active': dataAttr(props.isActive),
      class: 'few-sidebar-menu-button',
    }), slots);
  },
});

export const FewSidebarMenuBadge = defineComponent({
  name: 'FewSidebarMenuBadge',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('span', props.asChild, mergeProps(attrs, { class: 'few-sidebar-menu-badge' }), slots);
  },
});

export const FewSidebarSeparator = defineComponent({
  name: 'FewSidebarSeparator',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { role: 'separator', 'aria-orientation': 'horizontal', class: 'few-sidebar-separator' }), slots);
  },
});

/** Alterna collapsed no desktop e mobileOpen em telas < 768px. */
export const FewSidebarTrigger = defineComponent({
  name: 'FewSidebarTrigger',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const sidebar = useSidebar('FewSidebarTrigger');
    const isMobile = useIsMobile();
    const expanded = computed(() => isMobile.value ? sidebar.mobileOpen() : !sidebar.collapsed());
    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented) return;
      if (isMobile.value) sidebar.setMobileOpen(open => !open); else sidebar.setCollapsed(value => !value);
    }
    return () => renderPrimitive('button', props.asChild, mergeProps(attrs, {
      type: 'button', 'aria-label': (attrs['aria-label'] as string | undefined) ?? 'Alternar barra lateral',
      'aria-expanded': expanded.value, class: 'few-sidebar-trigger', onClick: handleClick,
    }), slots, children => children.length ? children : ['☰']);
  },
});

/** Faixa fina na borda, alternativa de clique ao Trigger para expandir/colapsar no desktop. Decorativa para leitores de tela. */
export const FewSidebarRail = defineComponent({
  name: 'FewSidebarRail',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const sidebar = useSidebar('FewSidebarRail');
    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented) return;
      sidebar.setCollapsed(value => !value);
    }
    return () => renderPrimitive('button', props.asChild, mergeProps(attrs, {
      type: 'button', tabindex: -1, 'aria-hidden': 'true', 'data-state': sidebar.collapsed() ? 'collapsed' : 'expanded',
      class: 'few-sidebar-rail', onClick: handleClick,
    }), slots);
  },
});
