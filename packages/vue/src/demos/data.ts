// Demos/hosts de teste da categoria "Dados" (pasta components/data). Um componente por id do registry.
import { defineComponent, h, type Component } from 'vue';
import {
  FewTable, FewTableCaption, FewTableHeader, FewTableBody, FewTableRow, FewTableHead, FewTableCell,
  FewDataTable, type DataTableColumn,
  FewList, FewListItem, FewListItemContent, FewListItemTitle, FewListItemDescription,
  FewDescriptionList, FewDescriptionListItem, FewDescriptionListTerm, FewDescriptionListDetails,
  FewAvatar, FewAvatarImage, FewAvatarFallback, FewAvatarStatus,
  FewAvatarGroup, FewAvatarGroupOverflow,
  FewStat, FewStatLabel, FewStatValue, FewStatChange,
  FewTimeline, FewTimelineItem, FewTimelineIndicator, FewTimelineContent, FewTimelineTitle, FewTimelineTime,
  FewTree, FewTreeItem, FewTreeItemTrigger, FewTreeItemContent,
  FewAccordion, FewAccordionItem, FewAccordionHeader, FewAccordionTrigger, FewAccordionContent,
  FewCollapsible, FewCollapsibleTrigger, FewCollapsibleContent,
  FewCarousel, FewCarouselViewport, FewCarouselContent, FewCarouselItem, FewCarouselPrevious, FewCarouselNext, FewCarouselIndicators,
} from '../components/data/index.js';

export const DemoTable = defineComponent({
  name: 'DemoTable',
  setup() {
    return () => h(FewTable, null, () => [
      h(FewTableCaption, null, () => 'Projetos ativos'),
      h(FewTableHeader, null, () => h(FewTableRow, null, () => [
        h(FewTableHead, null, () => 'Nome'),
        h(FewTableHead, { numeric: true }, () => 'Membros'),
      ])),
      h(FewTableBody, null, () => [
        h(FewTableRow, null, () => [h(FewTableCell, null, () => 'Catálogo Few'), h(FewTableCell, { numeric: true }, () => '4')]),
        h(FewTableRow, null, () => [h(FewTableCell, null, () => 'Sentinel'), h(FewTableCell, { numeric: true }, () => '2')]),
      ]),
    ]);
  },
});

interface DemoRow { id: string; name: string; role: string }
const DATA_TABLE_ROWS: DemoRow[] = [
  { id: '1', name: 'Ana Lima', role: 'Design' },
  { id: '2', name: 'Bruno Costa', role: 'Engenharia' },
];
const DATA_TABLE_COLUMNS: DataTableColumn[] = [
  { key: 'name', label: 'Nome', sortable: true },
  { key: 'role', label: 'Função' },
];
export const DemoDataTable = defineComponent({
  name: 'DemoDataTable',
  setup() {
    return () => h(FewDataTable, {
      caption: 'Equipe',
      columns: DATA_TABLE_COLUMNS,
      rows: DATA_TABLE_ROWS as unknown as Record<string, unknown>[],
      rowKey: (row: Record<string, unknown>) => String(row['id']),
    });
  },
});

export const DemoList = defineComponent({
  name: 'DemoList',
  setup() {
    return () => h(FewList, null, () => [
      h(FewListItem, null, () => h(FewListItemContent, null, () => [
        h(FewListItemTitle, null, () => 'Ana Lima'),
        h(FewListItemDescription, null, () => 'Atualizou os componentes há 2 minutos.'),
      ])),
      h(FewListItem, null, () => h(FewListItemContent, null, () => [
        h(FewListItemTitle, null, () => 'Bruno Costa'),
        h(FewListItemDescription, null, () => 'Abriu uma issue no catálogo.'),
      ])),
    ]);
  },
});

export const DemoDescriptionList = defineComponent({
  name: 'DemoDescriptionList',
  setup() {
    return () => h(FewDescriptionList, null, () => [
      h(FewDescriptionListItem, null, () => [h(FewDescriptionListTerm, null, () => 'Status'), h(FewDescriptionListDetails, null, () => 'Ativo')]),
      h(FewDescriptionListItem, null, () => [h(FewDescriptionListTerm, null, () => 'Plano'), h(FewDescriptionListDetails, null, () => 'Few Company')]),
    ]);
  },
});

export const DemoAvatar = defineComponent({
  name: 'DemoAvatar',
  setup() {
    return () => h(FewAvatar, { name: 'Ana Lima' }, () => [
      h(FewAvatarImage, { src: 'https://example.com/avatar-quebrado.png' }),
      h(FewAvatarFallback),
      h(FewAvatarStatus, { status: 'online' }),
    ]);
  },
});

export const DemoAvatarGroup = defineComponent({
  name: 'DemoAvatarGroup',
  setup() {
    return () => h(FewAvatarGroup, { max: 2 }, () => [
      h(FewAvatar, { name: 'Ana Lima' }, () => h(FewAvatarFallback)),
      h(FewAvatar, { name: 'Bruno Costa' }, () => h(FewAvatarFallback)),
      h(FewAvatar, { name: 'Carla Souza' }, () => h(FewAvatarFallback)),
      h(FewAvatarGroupOverflow),
    ]);
  },
});

export const DemoStat = defineComponent({
  name: 'DemoStat',
  setup() {
    return () => h(FewStat, { tone: 'success' }, () => [
      h(FewStatLabel, null, () => 'Receita mensal'),
      h(FewStatValue, null, () => 'R$ 48.200'),
      h(FewStatChange, { direction: 'up' }, () => '12% vs. mês anterior'),
    ]);
  },
});

export const DemoTimeline = defineComponent({
  name: 'DemoTimeline',
  setup() {
    return () => h(FewTimeline, null, () => [
      h(FewTimelineItem, { state: 'complete' }, () => [
        h(FewTimelineIndicator),
        h(FewTimelineContent, null, () => [h(FewTimelineTitle, null, () => 'Projeto criado'), h(FewTimelineTime, { datetime: '2026-01-10' }, () => '10 jan')]),
      ]),
      h(FewTimelineItem, { state: 'current' }, () => [
        h(FewTimelineIndicator),
        h(FewTimelineContent, null, () => [h(FewTimelineTitle, null, () => 'Revisão em andamento'), h(FewTimelineTime, { datetime: '2026-02-02' }, () => '2 fev')]),
      ]),
    ]);
  },
});

export const DemoTree = defineComponent({
  name: 'DemoTree',
  setup() {
    return () => h(FewTree, { defaultExpanded: ['components'] }, () => [
      h(FewTreeItem, { value: 'components' }, () => [
        h(FewTreeItemTrigger, null, () => 'Componentes'),
        h(FewTreeItemContent, null, () => [
          h(FewTreeItem, { value: 'tabs' }, () => h(FewTreeItemTrigger, null, () => 'Tabs')),
          h(FewTreeItem, { value: 'tree' }, () => h(FewTreeItemTrigger, null, () => 'Tree')),
        ]),
      ]),
      h(FewTreeItem, { value: 'docs' }, () => h(FewTreeItemTrigger, null, () => 'Documentação')),
    ]);
  },
});

export const DemoAccordion = defineComponent({
  name: 'DemoAccordion',
  setup() {
    return () => h(FewAccordion, { type: 'single', collapsible: true, defaultValue: 'faq-1' }, () => [
      h(FewAccordionItem, { value: 'faq-1' }, () => [
        h(FewAccordionHeader, null, () => h(FewAccordionTrigger, null, () => 'Como funciona o catálogo?')),
        h(FewAccordionContent, null, () => 'O catálogo lista todos os componentes com demos ao vivo.'),
      ]),
      h(FewAccordionItem, { value: 'faq-2' }, () => [
        h(FewAccordionHeader, null, () => h(FewAccordionTrigger, null, () => 'Onde fica o núcleo?')),
        h(FewAccordionContent, null, () => 'Em packages/core, sem framework.'),
      ]),
    ]);
  },
});

export const DemoCollapsible = defineComponent({
  name: 'DemoCollapsible',
  setup() {
    return () => h(FewCollapsible, { defaultOpen: false }, () => [
      h(FewCollapsibleTrigger, null, () => 'Ver detalhes'),
      h(FewCollapsibleContent, null, () => 'Detalhes adicionais do projeto.'),
    ]);
  },
});

export const DemoCarousel = defineComponent({
  name: 'DemoCarousel',
  setup() {
    return () => h(FewCarousel, { defaultIndex: 0 }, () => [
      h(FewCarouselViewport, null, () => h(FewCarouselContent, null, () => [
        h(FewCarouselItem, null, () => 'Slide 1'),
        h(FewCarouselItem, null, () => 'Slide 2'),
        h(FewCarouselItem, null, () => 'Slide 3'),
      ])),
      h(FewCarouselPrevious),
      h(FewCarouselNext),
      h(FewCarouselIndicators),
    ]);
  },
});

export const DATA_DEMOS: Record<string, Component> = {
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
