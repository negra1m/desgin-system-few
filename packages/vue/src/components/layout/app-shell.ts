// AppShell: ver docs/composition-vue.md. Não depende de Sidebar (outra categoria) — FewAppShellSidebar é só a região <aside>.
import { defineComponent, h, mergeProps, onMounted, onScopeDispose, ref, type CSSProperties, type PropType, type Ref, type VNodeArrayChildren } from 'vue';
import { createContext } from '../../lib/context.js';
import { dataAttr, renderPrimitive } from '../../lib/primitive.js';
import { useControllable } from '../../lib/use-controllable.js';
import { useDismiss } from '../../lib/use-dismiss.js';
import { useId } from '../../lib/ids.js';

export type SidebarSide = 'left' | 'right';
interface AppShellContextValue { sidebarId: string; collapsed: () => boolean; setCollapsed: (collapsed: boolean) => void; sidebarSide: () => SidebarSide; sidebarRef: Ref<HTMLElement | null> }
const [provideAppShell, useAppShell] = createContext<AppShellContextValue>('FewAppShell');

/**
 * FewAppShell (Root): grid com áreas header/sidebar/main/footer. Abaixo de 768px a sidebar vira off-canvas
 * (backdrop + Escape fecham). O backdrop é injetado automaticamente só quando `asChild` não é usado.
 * `v-model:sidebarCollapsed` disponível via prop `sidebarCollapsed` + emit `update:sidebarCollapsed`.
 */
export const FewAppShell = defineComponent({
  name: 'FewAppShell',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    sidebarWidth: { type: String, default: '280px' },
    sidebarSide: { type: String as PropType<SidebarSide>, default: 'left' },
    sidebarCollapsed: { type: Boolean, default: undefined },
    defaultSidebarCollapsed: { type: Boolean, default: false },
  },
  emits: { 'update:sidebarCollapsed': (collapsed: boolean) => typeof collapsed === 'boolean' },
  setup(props, { slots, attrs, emit }) {
    const sidebarId = useId('app-shell-sidebar');
    const sidebarRef = ref<HTMLElement | null>(null);
    const [collapsed, setCollapsed] = useControllable(() => props.sidebarCollapsed, props.defaultSidebarCollapsed, v => emit('update:sidebarCollapsed', v));
    const isMobile = ref(false);
    let detachMql: (() => void) | null = null;
    onMounted(() => {
      if (typeof window === 'undefined') return;
      const mql = window.matchMedia('(max-width: 767px)');
      const update = () => { isMobile.value = mql.matches; };
      update();
      mql.addEventListener('change', update);
      detachMql = () => mql.removeEventListener('change', update);
    });
    onScopeDispose(() => detachMql?.());
    useDismiss(() => isMobile.value && !collapsed.value, () => setCollapsed(true), () => [], { outside: false });
    provideAppShell({ sidebarId, collapsed: () => collapsed.value, setCollapsed, sidebarSide: () => props.sidebarSide, sidebarRef });
    return () => {
      const vars = { '--few-app-shell-sidebar-width': props.sidebarWidth } as CSSProperties;
      const appendBackdrop = (kids: VNodeArrayChildren): VNodeArrayChildren => (collapsed.value ? kids : [...kids, h('div', { class: 'few-app-shell-backdrop', 'aria-hidden': 'true', onClick: () => setCollapsed(true) })]);
      return renderPrimitive('div', props.asChild, mergeProps(attrs, {
        class: 'few-app-shell', style: vars, 'data-sidebar-side': props.sidebarSide, 'data-sidebar-collapsed': dataAttr(collapsed.value),
      }), slots, props.asChild ? undefined : appendBackdrop);
    };
  },
});

export const FewAppShellHeader = defineComponent({
  name: 'FewAppShellHeader',
  inheritAttrs: false,
  props: { asChild: Boolean, sticky: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('header', props.asChild, mergeProps(attrs, { class: 'few-app-shell-header', 'data-sticky': dataAttr(props.sticky) }), slots);
  },
});

/** FewAppShellSidebar: <aside> ligado ao FewAppShellSidebarTrigger por aria-controls. Fica `inert` quando colapsado. */
export const FewAppShellSidebar = defineComponent({
  name: 'FewAppShellSidebar',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const shell = useAppShell('FewAppShellSidebar');
    return () => renderPrimitive('aside', props.asChild, mergeProps(attrs, {
      ref: shell.sidebarRef, id: shell.sidebarId, inert: shell.collapsed() || undefined, class: 'few-app-shell-sidebar', 'data-side': shell.sidebarSide(), 'data-collapsed': dataAttr(shell.collapsed()),
    }), slots);
  },
});

/** FewAppShellMain: passe `id="main-content"` para servir de alvo de skip link. */
export const FewAppShellMain = defineComponent({
  name: 'FewAppShellMain',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('main', props.asChild, mergeProps(attrs, { class: 'few-app-shell-main' }), slots);
  },
});

export const FewAppShellFooter = defineComponent({
  name: 'FewAppShellFooter',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('footer', props.asChild, mergeProps(attrs, { class: 'few-app-shell-footer' }), slots);
  },
});

export const FewAppShellSidebarTrigger = defineComponent({
  name: 'FewAppShellSidebarTrigger',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const shell = useAppShell('FewAppShellSidebarTrigger');
    return () => renderPrimitive('button', props.asChild, mergeProps(attrs, {
      type: 'button', 'aria-expanded': !shell.collapsed(), 'aria-controls': shell.sidebarId, class: 'few-app-shell-sidebar-trigger',
      onClick: () => shell.setCollapsed(!shell.collapsed()),
    }), slots);
  },
});
