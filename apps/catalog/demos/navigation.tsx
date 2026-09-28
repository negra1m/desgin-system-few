"use client";
import { useState } from 'react';
import { Breadcrumb, CommandMenu, NavigationMenu, Pagination, Sidebar, Steps, Tabs } from '@fewcompany/ui';
import type { DemoMap } from './types';
// Demos da categoria "Navegação". Chave = id do registry. Cada demo é um componente React interativo.

function TabsDemo() {
  const [tab, setTab] = useState('geral');
  return <Tabs value={tab} onValueChange={setTab}>
    <Tabs.List aria-label="Seções do projeto">
      <Tabs.Trigger value="geral">Visão geral</Tabs.Trigger>
      <Tabs.Trigger value="atividade">Atividade</Tabs.Trigger>
      <Tabs.Trigger value="config">Configurações</Tabs.Trigger>
    </Tabs.List>
    <Tabs.Content value="geral"><p className="few-muted">Todas as informações do projeto em um só lugar.</p></Tabs.Content>
    <Tabs.Content value="atividade"><p className="few-muted">Ana atualizou os componentes há 2 minutos.</p></Tabs.Content>
    <Tabs.Content value="config"><p className="few-muted">Preferências desta demonstração.</p></Tabs.Content>
  </Tabs>;
}

function BreadcrumbDemo() {
  return <Breadcrumb className="demo-narrow">
    <Breadcrumb.List>
      <Breadcrumb.Item><Breadcrumb.Link href="#inicio">Início</Breadcrumb.Link></Breadcrumb.Item>
      <Breadcrumb.Separator />
      <Breadcrumb.Item><Breadcrumb.Link href="#projetos">Projetos</Breadcrumb.Link></Breadcrumb.Item>
      <Breadcrumb.Separator />
      <Breadcrumb.Item><Breadcrumb.Ellipsis /></Breadcrumb.Item>
      <Breadcrumb.Separator />
      <Breadcrumb.Item><Breadcrumb.Page>Catálogo Few</Breadcrumb.Page></Breadcrumb.Item>
    </Breadcrumb.List>
  </Breadcrumb>;
}

function PaginationDemo() {
  const [page, setPage] = useState(4);
  return <div className="demo-stack">
    <Pagination page={page} onPageChange={setPage} total={12} siblings={1} className="demo-row">
      <Pagination.Previous />
      <Pagination.List />
      <Pagination.Next />
    </Pagination>
    <p className="few-muted" role="status">Página {page} de 12.</p>
  </div>;
}

function StepsDemo() {
  const [step, setStep] = useState(1);
  const items = [
    { title: 'Dados', description: 'Informações da conta' },
    { title: 'Pagamento', description: 'Forma de cobrança' },
    { title: 'Revisão', description: 'Confirme e finalize' },
  ];
  return <div className="demo-stack">
    <Steps value={step} onValueChange={setStep}>
      {items.flatMap((item, index) => [
        index > 0 ? <Steps.Separator key={`sep-${index}`} /> : null,
        <Steps.Item key={item.title} index={index}>
          <Steps.Indicator />
          <Steps.Title>{item.title}</Steps.Title>
          <Steps.Description>{item.description}</Steps.Description>
        </Steps.Item>,
      ])}
    </Steps>
    <p className="few-muted" role="status">Etapa atual: {items[step].title}. Clique em uma etapa para navegar.</p>
  </div>;
}

function NavigationMenuDemo() {
  return <NavigationMenu className="demo-narrow" aria-label="Menu de exemplo">
    <NavigationMenu.List className="demo-row">
      <NavigationMenu.Item value="produto">
        <NavigationMenu.Trigger>Produto</NavigationMenu.Trigger>
        <NavigationMenu.Content>
          <NavigationMenu.Link href="#catalogo">Catálogo</NavigationMenu.Link>
          <NavigationMenu.Link href="#precos">Preços</NavigationMenu.Link>
        </NavigationMenu.Content>
      </NavigationMenu.Item>
      <NavigationMenu.Item value="empresa">
        <NavigationMenu.Trigger>Empresa</NavigationMenu.Trigger>
        <NavigationMenu.Content>
          <NavigationMenu.Link href="#sobre">Sobre</NavigationMenu.Link>
          <NavigationMenu.Link href="#contato">Contato</NavigationMenu.Link>
        </NavigationMenu.Content>
      </NavigationMenu.Item>
    </NavigationMenu.List>
  </NavigationMenu>;
}

function SidebarDemo() {
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState('visao-geral');
  return <div className="demo-narrow" style={{ height: 320, border: '1px solid var(--few-line)', borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
    <Sidebar collapsed={collapsed} onCollapsedChange={setCollapsed} collapsible="icon">
      <Sidebar.Header>
        <Sidebar.Trigger />
        {!collapsed && <span className="few-muted">Few Company</span>}
      </Sidebar.Header>
      <Sidebar.Content>
        <Sidebar.Group>
          <Sidebar.GroupLabel>Navegação</Sidebar.GroupLabel>
          <Sidebar.Menu>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton isActive={active === 'visao-geral'} tooltip="Visão geral" onClick={() => setActive('visao-geral')}>
                <span aria-hidden="true">◇</span><span>Visão geral</span>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton isActive={active === 'projetos'} tooltip="Projetos" onClick={() => setActive('projetos')}>
                <span aria-hidden="true">◈</span><span>Projetos</span><Sidebar.MenuBadge>4</Sidebar.MenuBadge>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          </Sidebar.Menu>
        </Sidebar.Group>
      </Sidebar.Content>
      <Sidebar.Separator />
      <Sidebar.Footer><span className="few-muted">v1.1.0</span></Sidebar.Footer>
    </Sidebar>
  </div>;
}

function CommandMenuDemo() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState('');
  const items = [
    { label: 'Novo projeto', keywords: ['criar', 'adicionar'] },
    { label: 'Convidar pessoa', keywords: ['equipe', 'membro'] },
    { label: 'Configurações', keywords: ['ajustes', 'preferencias'] },
  ];
  return <div className="demo-stack">
    <button type="button" onClick={() => setOpen(true)}>Abrir paleta de comandos (ou Ctrl/Cmd+K)</button>
    <CommandMenu open={open} onOpenChange={setOpen} shortcut label="Comandos do projeto">
      <CommandMenu.Input placeholder="Buscar um comando…" aria-label="Buscar um comando" />
      <CommandMenu.List>
        <CommandMenu.Empty>Nada encontrado.</CommandMenu.Empty>
        <CommandMenu.Group>
          <CommandMenu.GroupHeading>Ações</CommandMenu.GroupHeading>
          {items.map(item => <CommandMenu.Item key={item.label} value={item.label} keywords={item.keywords} onSelect={() => { setSelected(item.label); setOpen(false); }}>
            {item.label}<CommandMenu.Shortcut>↵</CommandMenu.Shortcut>
          </CommandMenu.Item>)}
        </CommandMenu.Group>
      </CommandMenu.List>
    </CommandMenu>
    <p className="few-muted" role="status">{selected ? `Selecionado: ${selected}` : 'Nenhum comando executado ainda nesta demonstração.'}</p>
  </div>;
}

export const navigationDemos: DemoMap = {
  tabs: TabsDemo,
  breadcrumb: BreadcrumbDemo,
  pagination: PaginationDemo,
  steps: StepsDemo,
  'navigation-menu': NavigationMenuDemo,
  sidebar: SidebarDemo,
  'command-menu': CommandMenuDemo,
};
