// Hosts de demonstração/teste da categoria "Dados" (pasta components/data). Um @Component por id do registry, selector few-demo-<id>.
// Mesmos exemplos (textos, dados) das demos React em apps/catalog/demos/data.tsx, adaptados ao padrão Angular.
import { Component, computed, signal, type Type } from '@angular/core';
import { sortRows, type SortDirection } from '@fewcompany/core';
import { FEW_TABLE } from '../components/data/table.js';
import { FewDataTable, type FewDataTableColumn } from '../components/data/data-table.js';
import { FEW_LIST } from '../components/data/list.js';
import { FEW_DESCRIPTION_LIST } from '../components/data/description-list.js';
import { FEW_AVATAR } from '../components/data/avatar.js';
import { FEW_AVATAR_GROUP } from '../components/data/avatar-group.js';
import { FEW_STAT } from '../components/data/stat.js';
import { FEW_TIMELINE } from '../components/data/timeline.js';
import { FEW_TREE } from '../components/data/tree.js';
import { FEW_ACCORDION } from '../components/data/accordion.js';
import { FEW_COLLAPSIBLE } from '../components/data/collapsible.js';
import { FEW_CAROUSEL } from '../components/data/carousel.js';

interface Order { id: string; name: string; value: number; status: string }
const ORDERS: Order[] = [
  { id: 'CAR-0042', name: 'Ana Lima', value: 224.9, status: 'Pago' },
  { id: 'CAR-0041', name: 'João Santos', value: 180, status: 'Em preparação' },
  { id: 'CAR-0040', name: 'Bia Costa', value: 320, status: 'Enviado' },
];

@Component({
  selector: 'few-demo-table',
  imports: [FEW_TABLE],
  template: `
    <div class="demo-stack">
      <div fewTable striped>
        <caption fewTableCaption>Pedidos recentes · dados de exemplo</caption>
        <thead fewTableHeader>
          <tr fewTableRow>
            <th fewTableHead sortable [sortDirection]="direction('name')" (sort)="toggle('name')">Cliente</th>
            <th fewTableHead numeric sortable [sortDirection]="direction('value')" (sort)="toggle('value')">Total</th>
            <th fewTableHead>Situação</th>
          </tr>
        </thead>
        <tbody fewTableBody>
          @for (row of sortedRows(); track row.id) {
            <tr fewTableRow>
              <td fewTableCell>{{ row.name }}</td>
              <td fewTableCell numeric>R$ {{ row.value.toFixed(2) }}</td>
              <td fewTableCell>{{ row.status }}</td>
            </tr>
          }
        </tbody>
      </div>
      <p class="few-muted" role="status">Clique no cabeçalho de Cliente ou Total para ordenar.</p>
    </div>
  `,
})
export class DemoTable {
  private readonly sort = signal<{ key: string; direction: SortDirection } | null>(null);
  protected readonly sortedRows = computed(() => {
    const sort = this.sort();
    return sort ? sortRows(ORDERS, sort.key, sort.direction) : ORDERS;
  });
  protected direction(key: string): 'ascending' | 'descending' | 'none' {
    const sort = this.sort();
    if (!sort || sort.key !== key) return 'none';
    return sort.direction === 'asc' ? 'ascending' : 'descending';
  }
  protected toggle(key: string) {
    const current = this.sort();
    if (!current || current.key !== key) { this.sort.set({ key, direction: 'asc' }); return; }
    if (current.direction === 'asc') { this.sort.set({ key, direction: 'desc' }); return; }
    this.sort.set(null);
  }
}

@Component({
  selector: 'few-demo-data-table',
  imports: [FewDataTable],
  template: `
    <div class="demo-stack">
      <few-data-table caption="Pedidos · atalho de dados" [rows]="orders" [rowKey]="rowKey" [columns]="columns"
        [selectable]="true" [(selected)]="selected" />
      <p class="few-muted" role="status">{{ selected().length }} linha(s) selecionada(s).</p>
    </div>
  `,
})
export class DemoDataTable {
  protected readonly orders = ORDERS;
  protected readonly rowKey = (row: Order) => row.id;
  protected readonly selected = signal<string[]>([]);
  protected readonly columns: FewDataTableColumn<Order>[] = [
    { key: 'name', label: 'Cliente', render: row => row.name, sortable: true },
    { key: 'value', label: 'Total', numeric: true, render: row => `R$ ${row.value.toFixed(2)}` },
    { key: 'status', label: 'Situação', render: row => row.status },
  ];
}

@Component({
  selector: 'few-demo-list',
  imports: [FEW_LIST],
  template: `
    <ul fewList variant="divided" class="demo-narrow">
      <li fewListItem>
        <span fewListItemIcon>●</span>
        <div fewListItemContent><p fewListItemTitle>Ana Lima</p><p fewListItemDescription>Aluna desde 2024</p></div>
        <div fewListItemAction><button type="button" class="few-button few-button--ghost few-button--sm">Ver</button></div>
      </li>
      <li fewListItem>
        <span fewListItemIcon>●</span>
        <div fewListItemContent><p fewListItemTitle>João Santos</p><p fewListItemDescription>Aluno desde 2023</p></div>
      </li>
    </ul>
  `,
})
export class DemoList {}

@Component({
  selector: 'few-demo-description-list',
  imports: [FEW_DESCRIPTION_LIST],
  template: `
    <dl fewDescriptionList layout="horizontal" class="demo-narrow">
      <div fewDescriptionListItem><dt fewDescriptionListTerm>Plano</dt><dd fewDescriptionListDetails>Mensal</dd></div>
      <div fewDescriptionListItem><dt fewDescriptionListTerm>Renovação</dt><dd fewDescriptionListDetails>05 de outubro</dd></div>
      <div fewDescriptionListItem><dt fewDescriptionListTerm>Situação</dt><dd fewDescriptionListDetails>Ativa</dd></div>
    </dl>
  `,
})
export class DemoDescriptionList {}

const AVATAR_IMAGE_SRC = "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='%23C9AFFF'/%3E%3Ccircle cx='40' cy='32' r='14' fill='%230A0A1F'/%3E%3Cellipse cx='40' cy='72' rx='24' ry='18' fill='%230A0A1F'/%3E%3C/svg%3E";

@Component({
  selector: 'few-demo-avatar',
  imports: [FEW_AVATAR],
  template: `
    <div class="demo-row">
      <span fewAvatar name="Ana Lima" size="sm"><span fewAvatarFallback></span></span>
      <span fewAvatar name="João Santos">
        <img fewAvatarImage [src]="avatarImageSrc" />
        <span fewAvatarFallback></span><span fewAvatarStatus status="online"></span>
      </span>
      <span fewAvatar name="Few Company" size="lg" shape="square"><span fewAvatarFallback></span></span>
    </div>
  `,
})
export class DemoAvatar {
  protected readonly avatarImageSrc = AVATAR_IMAGE_SRC;
}

const AVATAR_GROUP_NAMES = ['Ana Lima', 'João Santos', 'Bia Costa', 'Rafa Souza', 'Few Company'];

@Component({
  selector: 'few-demo-avatar-group',
  imports: [FEW_AVATAR_GROUP, FEW_AVATAR],
  template: `
    <div fewAvatarGroup [max]="3">
      @for (name of names; track name) {
        <span fewAvatar [name]="name"><span fewAvatarFallback></span></span>
      }
      <span fewAvatarGroupOverflow></span>
    </div>
  `,
})
export class DemoAvatarGroup {
  protected readonly names = AVATAR_GROUP_NAMES;
}

@Component({
  selector: 'few-demo-stat',
  imports: [FEW_STAT],
  template: `
    <div class="demo-grid">
      <div fewStat tone="success"><p fewStatLabel>Receita do mês</p><p fewStatValue>R$ 12.480</p><span fewStatChange direction="up">+12% neste mês</span></div>
      <div fewStat tone="info"><p fewStatLabel>Alunos ativos</p><p fewStatValue>148</p><span fewStatChange direction="up" tone="info">8 novas matrículas</span></div>
    </div>
  `,
})
export class DemoStat {}

@Component({
  selector: 'few-demo-timeline',
  imports: [FEW_TIMELINE],
  template: `
    <ol fewTimeline class="demo-narrow">
      <li fewTimelineItem state="complete">
        <span fewTimelineIndicator></span><span fewTimelineConnector></span>
        <div fewTimelineContent><p fewTimelineTitle>Pedido confirmado</p><time fewTimelineTime dateTime="2026-09-20">20 de set.</time></div>
      </li>
      <li fewTimelineItem state="current">
        <span fewTimelineIndicator></span><span fewTimelineConnector></span>
        <div fewTimelineContent>
          <p fewTimelineTitle>Em preparação</p><time fewTimelineTime dateTime="2026-09-22">22 de set.</time>
          <p fewTimelineDescription>Previsão de envio em 2 dias.</p>
        </div>
      </li>
      <li fewTimelineItem state="upcoming">
        <span fewTimelineIndicator></span>
        <div fewTimelineContent><p fewTimelineTitle>Envio</p></div>
      </li>
    </ol>
  `,
})
export class DemoTimeline {}

@Component({
  selector: 'few-demo-tree',
  imports: [FEW_TREE],
  template: `
    <div class="demo-stack">
      <div fewTree class="demo-narrow" [(expanded)]="expanded" [(value)]="selected">
        <div fewTreeItem value="pastas">
          <div fewTreeItemTrigger>Pastas</div>
          <div fewTreeItemContent>
            <div fewTreeItem value="contratos"><div fewTreeItemTrigger>Contratos</div></div>
            <div fewTreeItem value="recibos"><div fewTreeItemTrigger>Recibos</div></div>
          </div>
        </div>
        <div fewTreeItem value="arquivados"><div fewTreeItemTrigger>Arquivados</div></div>
      </div>
      <p class="few-muted" role="status">Selecionado: {{ selected()[0] ?? 'nenhum' }}.</p>
    </div>
  `,
})
export class DemoTree {
  protected readonly expanded = signal<string[]>(['pastas']);
  protected readonly selected = signal<string[]>([]);
}

@Component({
  selector: 'few-demo-accordion',
  imports: [FEW_ACCORDION],
  template: `
    <div fewAccordion type="single" collapsible [value]="['faq-1']" class="demo-narrow">
      <div fewAccordionItem value="faq-1">
        <h3 fewAccordionHeader><button fewAccordionTrigger class="few-button few-button--ghost">Como funciona o plano?</button></h3>
        <div fewAccordionContent>Cobrança mensal, sem fidelidade.</div>
      </div>
      <div fewAccordionItem value="faq-2">
        <h3 fewAccordionHeader><button fewAccordionTrigger class="few-button few-button--ghost">Posso cancelar quando quiser?</button></h3>
        <div fewAccordionContent>Sim, direto pelo painel da conta.</div>
      </div>
    </div>
  `,
})
export class DemoAccordion {}

@Component({
  selector: 'few-demo-collapsible',
  imports: [FEW_COLLAPSIBLE],
  template: `
    <div fewCollapsible #panel="fewCollapsible" class="demo-narrow">
      <button fewCollapsibleTrigger class="few-button few-button--secondary few-button--sm">{{ panel.open() ? 'Ocultar detalhes técnicos' : 'Ver detalhes técnicos' }}</button>
      <div fewCollapsibleContent><p class="few-muted">Node 20, PostgreSQL 15, Redis 7.</p></div>
    </div>
  `,
})
export class DemoCollapsible {}

const CAROUSEL_SLIDES = ['Depoimento de Ana', 'Depoimento de João', 'Depoimento de Bia'];

@Component({
  selector: 'few-demo-carousel',
  imports: [FEW_CAROUSEL],
  template: `
    <div fewCarousel loop class="demo-narrow">
      <div fewCarouselViewport>
        <div fewCarouselContent>
          @for (slide of slides; track slide) {
            <div fewCarouselItem>{{ slide }}</div>
          }
        </div>
      </div>
      <div class="demo-row">
        <button fewCarouselPrevious class="few-button few-button--secondary few-button--sm">‹ Anterior</button>
        <button fewCarouselNext class="few-button few-button--secondary few-button--sm">Próximo ›</button>
      </div>
      <div fewCarouselIndicators></div>
    </div>
  `,
})
export class DemoCarousel {
  protected readonly slides = CAROUSEL_SLIDES;
}

export const DATA_DEMOS: Record<string, Type<unknown>> = {
  table: DemoTable,
  'data-table': DemoDataTable,
  list: DemoList,
  'description-list': DemoDescriptionList,
  avatar: DemoAvatar,
  'avatar-group': DemoAvatarGroup,
  stat: DemoStat,
  timeline: DemoTimeline,
  tree: DemoTree,
  accordion: DemoAccordion,
  collapsible: DemoCollapsible,
  carousel: DemoCarousel,
};
