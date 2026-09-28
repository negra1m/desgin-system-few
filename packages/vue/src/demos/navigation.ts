// Demos/hosts de teste da categoria "Navegação" (pasta components/navigation). Um componente por id do registry.
import { defineComponent, h, ref, type Component } from 'vue';
import { FewTabs, FewTabsList, FewTabsTrigger, FewTabsContent } from '../components/navigation/tabs.js';
import {
  FewBreadcrumb, FewBreadcrumbList, FewBreadcrumbItem, FewBreadcrumbLink, FewBreadcrumbPage, FewBreadcrumbSeparator, FewBreadcrumbEllipsis,
} from '../components/navigation/breadcrumb.js';
import { FewPagination, FewPaginationList, FewPaginationPrevious, FewPaginationNext } from '../components/navigation/pagination.js';
import { FewSteps, FewStepsItem, FewStepsIndicator, FewStepsTitle, FewStepsDescription, FewStepsSeparator } from '../components/navigation/steps.js';
import {
  FewNavigationMenu, FewNavigationMenuList, FewNavigationMenuItem, FewNavigationMenuTrigger, FewNavigationMenuContent, FewNavigationMenuLink,
} from '../components/navigation/navigation-menu.js';
import {
  FewSidebar, FewSidebarHeader, FewSidebarTrigger, FewSidebarContent, FewSidebarGroup, FewSidebarGroupLabel,
  FewSidebarMenu, FewSidebarMenuItem, FewSidebarMenuButton, FewSidebarMenuBadge, FewSidebarSeparator, FewSidebarFooter,
} from '../components/navigation/sidebar.js';
import {
  FewCommandMenu, FewCommandInput, FewCommandList, FewCommandEmpty, FewCommandGroup, FewCommandGroupHeading, FewCommandItem, FewCommandShortcut,
} from '../components/navigation/command-menu.js';

export const DemoTabs = defineComponent({
  name: 'DemoTabs',
  setup() {
    return () => h(FewTabs, { defaultValue: 'overview' }, () => [
      h(FewTabsList, null, () => [
        h(FewTabsTrigger, { value: 'overview' }, () => 'Visão geral'),
        h(FewTabsTrigger, { value: 'activity' }, () => 'Atividade'),
        h(FewTabsTrigger, { value: 'settings', disabled: true }, () => 'Configurações'),
      ]),
      h(FewTabsContent, { value: 'overview' }, () => h('p', { class: 'few-muted' }, 'Todas as informações do projeto em um só lugar.')),
      h(FewTabsContent, { value: 'activity' }, () => h('p', { class: 'few-muted' }, 'Ana atualizou os componentes há 2 minutos.')),
    ]);
  },
});

export const DemoBreadcrumb = defineComponent({
  name: 'DemoBreadcrumb',
  setup() {
    return () => h(FewBreadcrumb, null, () => [
      h(FewBreadcrumbList, null, () => [
        h(FewBreadcrumbItem, null, () => h(FewBreadcrumbLink, { href: '#inicio' }, () => 'Início')),
        h(FewBreadcrumbSeparator),
        h(FewBreadcrumbItem, null, () => h(FewBreadcrumbLink, { href: '#projetos' }, () => 'Projetos')),
        h(FewBreadcrumbSeparator),
        h(FewBreadcrumbItem, null, () => h(FewBreadcrumbEllipsis)),
        h(FewBreadcrumbSeparator),
        h(FewBreadcrumbItem, null, () => h(FewBreadcrumbPage, null, () => 'Catálogo Few')),
      ]),
    ]);
  },
});

export const DemoPagination = defineComponent({
  name: 'DemoPagination',
  setup() {
    const page = ref(4);
    return () => h('div', { class: 'demo-stack' }, [
      h(FewPagination, { page: page.value, 'onUpdate:page': (value: number) => { page.value = value; }, total: 12, siblings: 1, class: 'demo-row' }, () => [
        h(FewPaginationPrevious),
        h(FewPaginationList),
        h(FewPaginationNext),
      ]),
      h('p', { class: 'few-muted', role: 'status' }, `Página ${page.value} de 12.`),
    ]);
  },
});

export const DemoSteps = defineComponent({
  name: 'DemoSteps',
  setup() {
    const step = ref(1);
    const items = [
      { title: 'Dados', description: 'Informações da conta' },
      { title: 'Pagamento', description: 'Forma de cobrança' },
      { title: 'Revisão', description: 'Confirme e finalize' },
    ];
    return () => h('div', { class: 'demo-stack' }, [
      h(FewSteps, { value: step.value, 'onUpdate:value': (value: number) => { step.value = value; } }, () =>
        items.flatMap((item, index) => [
          index > 0 ? h(FewStepsSeparator, { key: `sep-${index}` }) : null,
          h(FewStepsItem, { key: item.title, index }, () => [
            h(FewStepsIndicator),
            h(FewStepsTitle, null, () => item.title),
            h(FewStepsDescription, null, () => item.description),
          ]),
        ])),
      h('p', { class: 'few-muted', role: 'status' }, `Etapa atual: ${items[step.value].title}. Clique em uma etapa para navegar.`),
    ]);
  },
});

export const DemoNavigationMenu = defineComponent({
  name: 'DemoNavigationMenu',
  setup() {
    return () => h(FewNavigationMenu, { class: 'demo-narrow', 'aria-label': 'Menu de exemplo' }, () => [
      h(FewNavigationMenuList, { class: 'demo-row' }, () => [
        h(FewNavigationMenuItem, { value: 'produto' }, () => [
          h(FewNavigationMenuTrigger, null, () => 'Produto'),
          h(FewNavigationMenuContent, null, () => [
            h(FewNavigationMenuLink, { href: '#catalogo' }, () => 'Catálogo'),
            h(FewNavigationMenuLink, { href: '#precos' }, () => 'Preços'),
          ]),
        ]),
        h(FewNavigationMenuItem, { value: 'empresa' }, () => [
          h(FewNavigationMenuTrigger, null, () => 'Empresa'),
          h(FewNavigationMenuContent, null, () => [
            h(FewNavigationMenuLink, { href: '#sobre' }, () => 'Sobre'),
            h(FewNavigationMenuLink, { href: '#contato' }, () => 'Contato'),
          ]),
        ]),
      ]),
    ]);
  },
});

export const DemoSidebar = defineComponent({
  name: 'DemoSidebar',
  setup() {
    const collapsed = ref(false);
    const active = ref('visao-geral');
    return () => h('div', { class: 'demo-narrow', style: { height: '320px', border: '1px solid var(--few-line)', borderRadius: '8px', overflow: 'hidden', position: 'relative' } }, [
      h(FewSidebar, { collapsed: collapsed.value, 'onUpdate:collapsed': (value: boolean) => { collapsed.value = value; }, collapsible: 'icon' }, () => [
        h(FewSidebarHeader, null, () => [
          h(FewSidebarTrigger),
          collapsed.value ? null : h('span', { class: 'few-muted' }, 'Few Company'),
        ]),
        h(FewSidebarContent, null, () => [
          h(FewSidebarGroup, null, () => [
            h(FewSidebarGroupLabel, null, () => 'Navegação'),
            h(FewSidebarMenu, null, () => [
              h(FewSidebarMenuItem, null, () => h(FewSidebarMenuButton, {
                isActive: active.value === 'visao-geral', tooltip: 'Visão geral', onClick: () => { active.value = 'visao-geral'; },
              }, () => [h('span', { 'aria-hidden': 'true' }, '◇'), h('span', null, 'Visão geral')])),
              h(FewSidebarMenuItem, null, () => h(FewSidebarMenuButton, {
                isActive: active.value === 'projetos', tooltip: 'Projetos', onClick: () => { active.value = 'projetos'; },
              }, () => [h('span', { 'aria-hidden': 'true' }, '◈'), h('span', null, 'Projetos'), h(FewSidebarMenuBadge, null, () => '4')])),
            ]),
          ]),
        ]),
        h(FewSidebarSeparator),
        h(FewSidebarFooter, null, () => h('span', { class: 'few-muted' }, 'v1.1.0')),
      ]),
    ]);
  },
});

export const DemoCommandMenu = defineComponent({
  name: 'DemoCommandMenu',
  setup() {
    const open = ref(false);
    const selected = ref('');
    const items = [
      { label: 'Novo projeto', keywords: ['criar', 'adicionar'] },
      { label: 'Convidar pessoa', keywords: ['equipe', 'membro'] },
      { label: 'Configurações', keywords: ['ajustes', 'preferencias'] },
    ];
    return () => h('div', { class: 'demo-stack' }, [
      h('button', { type: 'button', onClick: () => { open.value = true; } }, 'Abrir paleta de comandos (ou Ctrl/Cmd+K)'),
      h(FewCommandMenu, { open: open.value, 'onUpdate:open': (value: boolean) => { open.value = value; }, shortcut: true, label: 'Comandos do projeto' }, () => [
        h(FewCommandInput, { placeholder: 'Buscar um comando…', 'aria-label': 'Buscar um comando' }),
        h(FewCommandList, null, () => [
          h(FewCommandEmpty, null, () => 'Nada encontrado.'),
          h(FewCommandGroup, null, () => [
            h(FewCommandGroupHeading, null, () => 'Ações'),
            ...items.map(item => h(FewCommandItem, {
              key: item.label, value: item.label, keywords: item.keywords,
              onSelect: () => { selected.value = item.label; open.value = false; },
            }, () => [item.label, h(FewCommandShortcut, null, () => '↵')])),
          ]),
        ]),
      ]),
      h('p', { class: 'few-muted', role: 'status' }, selected.value ? `Selecionado: ${selected.value}` : 'Nenhum comando executado ainda nesta demonstração.'),
    ]);
  },
});

export const NAVIGATION_DEMOS: Record<string, Component> = {
  tabs: DemoTabs,
  breadcrumb: DemoBreadcrumb,
  pagination: DemoPagination,
  steps: DemoSteps,
  'navigation-menu': DemoNavigationMenu,
  sidebar: DemoSidebar,
  'command-menu': DemoCommandMenu,
};
