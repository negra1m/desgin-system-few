// Hosts de demonstração/teste da categoria "Navegação" (pasta components/navigation). Um @Component por id do registry, selector few-demo-<id>.
import { Component, signal, type Type } from '@angular/core';
import { FEW_TABS } from '../components/navigation/tabs.js';
import { FEW_BREADCRUMB } from '../components/navigation/breadcrumb.js';
import { FEW_PAGINATION } from '../components/navigation/pagination.js';
import { FEW_STEPS } from '../components/navigation/steps.js';
import { FEW_NAVIGATION_MENU } from '../components/navigation/navigation-menu.js';
import { FEW_SIDEBAR } from '../components/navigation/sidebar.js';
import { FEW_COMMAND_MENU } from '../components/navigation/command-menu.js';

@Component({
  selector: 'few-demo-tabs',
  imports: [FEW_TABS],
  template: `
    <div fewTabs [value]="'overview'">
      <div fewTabsList>
        <button fewTabsTrigger value="overview">Visão geral</button>
        <button fewTabsTrigger value="activity">Atividade</button>
        <button fewTabsTrigger value="settings" disabled>Configurações</button>
      </div>
      <div fewTabsContent value="overview"><p class="few-muted">Todas as informações do projeto em um só lugar.</p></div>
      <div fewTabsContent value="activity"><p class="few-muted">Ana atualizou os componentes há 2 minutos.</p></div>
    </div>
  `,
})
export class DemoTabs {}

@Component({
  selector: 'few-demo-breadcrumb',
  imports: [FEW_BREADCRUMB],
  template: `
    <nav fewBreadcrumb>
      <ol fewBreadcrumbList>
        <li fewBreadcrumbItem><a fewBreadcrumbLink href="#inicio">Início</a></li>
        <span fewBreadcrumbSeparator></span>
        <li fewBreadcrumbItem><a fewBreadcrumbLink href="#projetos">Projetos</a></li>
        <span fewBreadcrumbSeparator></span>
        <li fewBreadcrumbItem><span fewBreadcrumbEllipsis></span></li>
        <span fewBreadcrumbSeparator></span>
        <li fewBreadcrumbItem><span fewBreadcrumbPage>Catálogo Few</span></li>
      </ol>
    </nav>
  `,
})
export class DemoBreadcrumb {}

@Component({
  selector: 'few-demo-pagination',
  imports: [FEW_PAGINATION],
  template: `
    <div class="demo-stack">
      <nav fewPagination [(page)]="page" [total]="12" [siblings]="1" class="demo-row">
        <a fewPaginationPrevious></a>
        <ul fewPaginationList></ul>
        <a fewPaginationNext></a>
      </nav>
      <p class="few-muted" role="status">Página {{ page() }} de 12.</p>
    </div>
  `,
})
export class DemoPagination {
  protected readonly page = signal(4);
}

@Component({
  selector: 'few-demo-steps',
  imports: [FEW_STEPS],
  template: `
    <div class="demo-stack">
      <ol fewSteps [(value)]="step" clickable>
        <li fewStepsItem [index]="0">
          <span fewStepsIndicator></span>
          <span fewStepsTitle>Dados</span>
          <span fewStepsDescription>Informações da conta</span>
        </li>
        <div fewStepsSeparator></div>
        <li fewStepsItem [index]="1">
          <span fewStepsIndicator></span>
          <span fewStepsTitle>Pagamento</span>
          <span fewStepsDescription>Forma de cobrança</span>
        </li>
        <div fewStepsSeparator></div>
        <li fewStepsItem [index]="2">
          <span fewStepsIndicator></span>
          <span fewStepsTitle>Revisão</span>
          <span fewStepsDescription>Confirme e finalize</span>
        </li>
      </ol>
      <p class="few-muted" role="status">Etapa atual: {{ titles[step()] }}. Clique em uma etapa para navegar.</p>
    </div>
  `,
})
export class DemoSteps {
  protected readonly step = signal(1);
  protected readonly titles = ['Dados', 'Pagamento', 'Revisão'];
}

@Component({
  selector: 'few-demo-navigation-menu',
  imports: [FEW_NAVIGATION_MENU],
  template: `
    <nav fewNavigationMenu aria-label="Menu de exemplo" class="demo-narrow">
      <ul fewNavigationMenuList class="demo-row">
        <li fewNavigationMenuItem value="produto">
          <button fewNavigationMenuTrigger>Produto</button>
          <div fewNavigationMenuContent>
            <a fewNavigationMenuLink href="#catalogo">Catálogo</a>
            <a fewNavigationMenuLink href="#precos">Preços</a>
          </div>
        </li>
        <li fewNavigationMenuItem value="empresa">
          <button fewNavigationMenuTrigger>Empresa</button>
          <div fewNavigationMenuContent>
            <a fewNavigationMenuLink href="#sobre">Sobre</a>
            <a fewNavigationMenuLink href="#contato">Contato</a>
          </div>
        </li>
      </ul>
    </nav>
  `,
})
export class DemoNavigationMenu {}

@Component({
  selector: 'few-demo-sidebar',
  imports: [FEW_SIDEBAR],
  template: `
    <div class="demo-narrow" style="height:320px;border:1px solid var(--few-line);border-radius:8px;overflow:hidden;position:relative">
      <div fewSidebar [(collapsed)]="collapsed" collapsible="icon">
        <div fewSidebarHeader>
          <button fewSidebarTrigger></button>
          @if (!collapsed()) { <span class="few-muted">Few Company</span> }
        </div>
        <div fewSidebarContent>
          <div fewSidebarGroup>
            <div fewSidebarGroupLabel>Navegação</div>
            <ul fewSidebarMenu>
              <li fewSidebarMenuItem>
                <button fewSidebarMenuButton [isActive]="active() === 'visao-geral'" tooltip="Visão geral" (click)="active.set('visao-geral')">
                  <span aria-hidden="true">◇</span><span>Visão geral</span>
                </button>
              </li>
              <li fewSidebarMenuItem>
                <button fewSidebarMenuButton [isActive]="active() === 'projetos'" tooltip="Projetos" (click)="active.set('projetos')">
                  <span aria-hidden="true">◈</span><span>Projetos</span><span fewSidebarMenuBadge>4</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div fewSidebarSeparator></div>
        <div fewSidebarFooter><span class="few-muted">v1.0.0</span></div>
      </div>
    </div>
  `,
})
export class DemoSidebar {
  protected readonly collapsed = signal(false);
  protected readonly active = signal('visao-geral');
}

@Component({
  selector: 'few-demo-command-menu',
  imports: [FEW_COMMAND_MENU],
  template: `
    <div class="demo-stack">
      <button type="button" (click)="open.set(true)">Abrir paleta de comandos (ou Ctrl/Cmd+K)</button>
      <dialog fewCommandMenu [(open)]="open" shortcut label="Comandos do projeto">
        <input fewCommandInput placeholder="Buscar um comando…" aria-label="Buscar um comando" />
        <div fewCommandList>
          <div fewCommandEmpty>Nada encontrado.</div>
          <div fewCommandGroup>
            <div fewCommandGroupHeading>Ações</div>
            @for (item of items; track item.label) {
              <div fewCommandItem [value]="item.label" [keywords]="item.keywords" (select)="onSelect(item.label)">
                {{ item.label }}<kbd fewCommandShortcut>↵</kbd>
              </div>
            }
          </div>
        </div>
      </dialog>
      <p class="few-muted" role="status">{{ selected() ? 'Selecionado: ' + selected() : 'Nenhum comando executado ainda nesta demonstração.' }}</p>
    </div>
  `,
})
export class DemoCommandMenu {
  protected readonly open = signal(false);
  protected readonly selected = signal('');
  protected readonly items = [
    { label: 'Novo projeto', keywords: ['criar', 'adicionar'] },
    { label: 'Convidar pessoa', keywords: ['equipe', 'membro'] },
    { label: 'Configurações', keywords: ['ajustes', 'preferencias'] },
  ];
  protected onSelect(label: string) { this.selected.set(label); this.open.set(false); }
}

export const NAVIGATION_DEMOS: Record<string, Type<unknown>> = {
  tabs: DemoTabs,
  breadcrumb: DemoBreadcrumb,
  pagination: DemoPagination,
  steps: DemoSteps,
  'navigation-menu': DemoNavigationMenu,
  sidebar: DemoSidebar,
  'command-menu': DemoCommandMenu,
};
