// Demos/hosts de teste da categoria "Estrutura" (pasta components/layout). Um componente por id do registry.
import { defineComponent, h, type Component } from 'vue';
import { FewCard, FewCardHeaderPart, FewCardTitle, FewCardDescription, FewCardAction, FewCardContent, FewCardFooter } from '../components/layout/card.js';
import { FewSeparator } from '../components/layout/separator.js';
import { FewAspectRatio } from '../components/layout/aspect-ratio.js';
import { FewScrollArea, FewScrollAreaViewport } from '../components/layout/scroll-area.js';
import { FewStack } from '../components/layout/stack.js';
import { FewGrid, FewGridItem } from '../components/layout/grid.js';
import { FewToolbar, FewToolbarButton, FewToolbarLink, FewToolbarSeparator } from '../components/layout/toolbar.js';
import { FewAppShell, FewAppShellFooter, FewAppShellHeader, FewAppShellMain, FewAppShellSidebar, FewAppShellSidebarTrigger } from '../components/layout/app-shell.js';

export const DemoCard = defineComponent({
  name: 'DemoCard',
  setup() {
    return () => h(FewCard, { variant: 'elevated', padding: 'lg' }, () => [
      h(FewCardHeaderPart, null, () => [
        h(FewCardTitle, null, () => 'Plano Few'),
        h(FewCardDescription, null, () => 'Resumo de uso do mês.'),
        h(FewCardAction, null, () => h('button', { type: 'button' }, 'Editar')),
      ]),
      h(FewCardContent, null, () => h('p', null, 'Consumo dentro do limite contratado.')),
      h(FewCardFooter, null, () => h('span', { class: 'few-muted' }, 'Atualizado há 2 minutos.')),
    ]);
  },
});

export const DemoSeparator = defineComponent({
  name: 'DemoSeparator',
  setup() {
    return () => h('div', null, [
      h(FewSeparator, null),
      h(FewSeparator, { orientation: 'vertical' }),
      h(FewSeparator, {}, { label: () => 'ou' }),
    ]);
  },
});

export const DemoAspectRatio = defineComponent({
  name: 'DemoAspectRatio',
  setup() {
    return () => h('div', { class: 'demo-narrow' }, h(FewAspectRatio, { ratio: 16 / 9 }, () => h('div', {
      style: { width: '100%', height: '100%', display: 'grid', placeItems: 'center', background: 'var(--few-soft)', color: 'var(--few-muted)' },
    }, 'Área 16:9 reservada')));
  },
});

export const DemoScrollArea = defineComponent({
  name: 'DemoScrollArea',
  setup() {
    return () => h(FewScrollArea, { type: 'hover' }, () => h(FewScrollAreaViewport, { label: 'Lista de notificações' }, () =>
      Array.from({ length: 20 }, (_, index) => h('p', { key: index }, `Notificação ${index + 1}`)),
    ));
  },
});

export const DemoStack = defineComponent({
  name: 'DemoStack',
  setup() {
    return () => h(FewStack, { direction: { base: 'column', md: 'row' }, gap: 4 }, () => [
      h('div', null, 'Item 1'),
      h('div', null, 'Item 2'),
      h('div', null, 'Item 3'),
    ]);
  },
});

export const DemoGrid = defineComponent({
  name: 'DemoGrid',
  setup() {
    return () => h(FewGrid, { columns: 3, gap: 4 }, () => [
      h(FewGridItem, { colSpan: 2 }, () => 'Bloco principal'),
      h(FewGridItem, null, () => 'Bloco lateral'),
    ]);
  },
});

export const DemoToolbar = defineComponent({
  name: 'DemoToolbar',
  setup() {
    return () => h(FewToolbar, { label: 'Formatação de texto' }, () => [
      h(FewToolbarButton, null, () => 'Negrito'),
      h(FewToolbarButton, null, () => 'Itálico'),
      h(FewToolbarSeparator, null),
      h(FewToolbarLink, { href: '#' }, () => 'Ajuda'),
    ]);
  },
});

export const DemoAppShell = defineComponent({
  name: 'DemoAppShell',
  setup() {
    return () => h(FewAppShell, { defaultSidebarCollapsed: false }, () => [
      h(FewAppShellHeader, null, () => [
        h(FewAppShellSidebarTrigger, null, () => 'Menu'),
        h('span', null, 'Painel Few'),
      ]),
      h(FewAppShellSidebar, null, () => h('nav', null, 'Navegação')),
      h(FewAppShellMain, { id: 'main-content' }, () => h('p', null, 'Conteúdo principal.')),
      h(FewAppShellFooter, null, () => 'Few Company'),
    ]);
  },
});

export const LAYOUT_DEMOS: Record<string, Component> = {
  card: DemoCard,
  separator: DemoSeparator,
  'aspect-ratio': DemoAspectRatio,
  'scroll-area': DemoScrollArea,
  stack: DemoStack,
  grid: DemoGrid,
  toolbar: DemoToolbar,
  'app-shell': DemoAppShell,
};
