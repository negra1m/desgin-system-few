"use client";
import { useState } from 'react';
import { sortRows, type SortDirection } from '@fewcompany/core';
import { Button, Table, DataTable, List, DescriptionList, Avatar, AvatarGroup, Stat, Timeline, Tree, Accordion, Collapsible, Carousel } from '@fewcompany/ui';
import type { DemoMap } from './types';
// Demos da categoria "Dados". Chave = id do registry. Cada demo é um componente React interativo.

const orders = [
  { id: 'CAR-0042', name: 'Ana Lima', value: 224.9, status: 'Pago' },
  { id: 'CAR-0041', name: 'João Santos', value: 180, status: 'Em preparação' },
  { id: 'CAR-0040', name: 'Bia Costa', value: 320, status: 'Enviado' },
];

function TableDemo() {
  const [sort, setSort] = useState<{ key: string; direction: SortDirection } | null>(null);
  const sorted = sort ? sortRows(orders, sort.key, sort.direction, (row, key) => (row as unknown as Record<string, unknown>)[key]) : orders;
  function toggle(key: string) {
    setSort(current => (!current || current.key !== key ? { key, direction: 'asc' } : current.direction === 'asc' ? { key, direction: 'desc' } : null));
  }
  function direction(key: string) { return sort?.key === key ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'; }
  return <div className="demo-stack">
    <Table.Root striped>
      <Table.Caption>Pedidos recentes · dados de exemplo</Table.Caption>
      <Table.Header>
        <Table.Row>
          <Table.Head sortable sortDirection={direction('name')} onSort={() => toggle('name')}>Cliente</Table.Head>
          <Table.Head numeric sortable sortDirection={direction('value')} onSort={() => toggle('value')}>Total</Table.Head>
          <Table.Head>Situação</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {sorted.map(row => <Table.Row key={row.id}>
          <Table.Cell>{row.name}</Table.Cell>
          <Table.Cell numeric>R$ {row.value.toFixed(2)}</Table.Cell>
          <Table.Cell>{row.status}</Table.Cell>
        </Table.Row>)}
      </Table.Body>
    </Table.Root>
    <p className="few-muted" role="status">Clique no cabeçalho de Cliente ou Total para ordenar.</p>
  </div>;
}

function DataTableDemo() {
  const [selected, setSelected] = useState<string[]>([]);
  const [empty, setEmpty] = useState(false);
  const rows = empty ? [] : orders;
  return <div className="demo-stack">
    <label className="few-muted"><input type="checkbox" checked={empty} onChange={e => setEmpty(e.target.checked)} /> Mostrar estado vazio</label>
    <DataTable caption="Pedidos · atalho de dados" rows={rows} rowKey={row => row.id} selection={{ selected, onSelectedChange: setSelected }}
      columns={[
        { key: 'name', label: 'Cliente', render: row => row.name, sortable: true },
        { key: 'value', label: 'Total', numeric: true, render: row => `R$ ${row.value.toFixed(2)}` },
        { key: 'status', label: 'Situação', render: row => row.status },
      ]} />
    <p className="few-muted" role="status">{selected.length} linha(s) selecionada(s).</p>
  </div>;
}

function ListDemo() {
  return <List variant="divided" className="demo-narrow">
    <List.Item>
      <List.ItemIcon aria-hidden="true">●</List.ItemIcon>
      <List.ItemContent><List.ItemTitle>Ana Lima</List.ItemTitle><List.ItemDescription>Aluna desde 2024</List.ItemDescription></List.ItemContent>
      <List.ItemAction><Button size="sm" variant="ghost">Ver</Button></List.ItemAction>
    </List.Item>
    <List.Item>
      <List.ItemIcon aria-hidden="true">●</List.ItemIcon>
      <List.ItemContent><List.ItemTitle>João Santos</List.ItemTitle><List.ItemDescription>Aluno desde 2023</List.ItemDescription></List.ItemContent>
    </List.Item>
  </List>;
}

function DescriptionListDemo() {
  return <DescriptionList layout="horizontal" className="demo-narrow">
    <DescriptionList.Item><DescriptionList.Term>Plano</DescriptionList.Term><DescriptionList.Details>Mensal</DescriptionList.Details></DescriptionList.Item>
    <DescriptionList.Item><DescriptionList.Term>Renovação</DescriptionList.Term><DescriptionList.Details>05 de outubro</DescriptionList.Details></DescriptionList.Item>
    <DescriptionList.Item><DescriptionList.Term>Situação</DescriptionList.Term><DescriptionList.Details>Ativa</DescriptionList.Details></DescriptionList.Item>
  </DescriptionList>;
}

const avatarImageSrc = "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='%23C9AFFF'/%3E%3Ccircle cx='40' cy='32' r='14' fill='%230A0A1F'/%3E%3Cellipse cx='40' cy='72' rx='24' ry='18' fill='%230A0A1F'/%3E%3C/svg%3E";
function AvatarDemo() {
  const [broken, setBroken] = useState(false);
  return <div className="demo-stack">
    <div className="demo-row">
      <Avatar.Root name="Ana Lima" size="sm"><Avatar.Fallback /></Avatar.Root>
      <Avatar.Root name="João Santos">
        {!broken && <Avatar.Image src={avatarImageSrc} />}
        <Avatar.Fallback /><Avatar.Status status="online" />
      </Avatar.Root>
      <Avatar.Root name="Few Company" size="lg" shape="square"><Avatar.Fallback /></Avatar.Root>
    </div>
    <label className="few-muted"><input type="checkbox" checked={broken} onChange={e => setBroken(e.target.checked)} /> Simular imagem indisponível (mostra as iniciais)</label>
  </div>;
}

function AvatarGroupDemo() {
  const names = ['Ana Lima', 'João Santos', 'Bia Costa', 'Rafa Souza', 'Few Company'];
  return <AvatarGroup.Root max={3}>
    {names.map(name => <Avatar.Root key={name} name={name}><Avatar.Fallback /></Avatar.Root>)}
    <AvatarGroup.Overflow />
  </AvatarGroup.Root>;
}

function StatDemo() {
  return <div className="demo-grid">
    <Stat tone="success"><Stat.Label>Receita do mês</Stat.Label><Stat.Value>R$ 12.480</Stat.Value><Stat.Change direction="up">+12% neste mês</Stat.Change></Stat>
    <Stat tone="info"><Stat.Label>Alunos ativos</Stat.Label><Stat.Value>148</Stat.Value><Stat.Change direction="up" tone="info">8 novas matrículas</Stat.Change></Stat>
  </div>;
}

function TimelineDemo() {
  return <Timeline className="demo-narrow">
    <Timeline.Item state="complete"><Timeline.Indicator /><Timeline.Connector />
      <Timeline.Content><Timeline.Title>Pedido confirmado</Timeline.Title><Timeline.Time dateTime="2026-09-20">20 de set.</Timeline.Time></Timeline.Content>
    </Timeline.Item>
    <Timeline.Item state="current"><Timeline.Indicator /><Timeline.Connector />
      <Timeline.Content><Timeline.Title>Em preparação</Timeline.Title><Timeline.Time dateTime="2026-09-22">22 de set.</Timeline.Time><Timeline.Description>Previsão de envio em 2 dias.</Timeline.Description></Timeline.Content>
    </Timeline.Item>
    <Timeline.Item state="upcoming"><Timeline.Indicator />
      <Timeline.Content><Timeline.Title>Envio</Timeline.Title></Timeline.Content>
    </Timeline.Item>
  </Timeline>;
}

function TreeDemo() {
  const [expanded, setExpanded] = useState<string[]>(['pastas']);
  const [selected, setSelected] = useState<string[]>([]);
  return <div className="demo-stack">
    <Tree className="demo-narrow" expanded={expanded} onExpandedChange={setExpanded} value={selected} onValueChange={setSelected}>
      <Tree.Item value="pastas">
        <Tree.ItemTrigger>Pastas</Tree.ItemTrigger>
        <Tree.ItemContent>
          <Tree.Item value="contratos"><Tree.ItemTrigger>Contratos</Tree.ItemTrigger></Tree.Item>
          <Tree.Item value="recibos"><Tree.ItemTrigger>Recibos</Tree.ItemTrigger></Tree.Item>
        </Tree.ItemContent>
      </Tree.Item>
      <Tree.Item value="arquivados"><Tree.ItemTrigger>Arquivados</Tree.ItemTrigger></Tree.Item>
    </Tree>
    <p className="few-muted" role="status">Selecionado: {selected[0] ?? 'nenhum'}.</p>
  </div>;
}

function AccordionDemo() {
  const [value, setValue] = useState<string | string[]>('faq-1');
  return <Accordion type="single" collapsible value={value} onValueChange={setValue} className="demo-narrow">
    <Accordion.Item value="faq-1">
      <Accordion.Header><Accordion.Trigger className="few-button few-button--ghost">Como funciona o plano?</Accordion.Trigger></Accordion.Header>
      <Accordion.Content>Cobrança mensal, sem fidelidade.</Accordion.Content>
    </Accordion.Item>
    <Accordion.Item value="faq-2">
      <Accordion.Header><Accordion.Trigger className="few-button few-button--ghost">Posso cancelar quando quiser?</Accordion.Trigger></Accordion.Header>
      <Accordion.Content>Sim, direto pelo painel da conta.</Accordion.Content>
    </Accordion.Item>
  </Accordion>;
}

function CollapsibleDemo() {
  const [open, setOpen] = useState(false);
  return <Collapsible open={open} onOpenChange={setOpen} className="demo-narrow">
    <Collapsible.Trigger asChild><Button variant="secondary" size="sm">{open ? 'Ocultar detalhes técnicos' : 'Ver detalhes técnicos'}</Button></Collapsible.Trigger>
    <Collapsible.Content><p className="few-muted">Node 20, PostgreSQL 15, Redis 7.</p></Collapsible.Content>
  </Collapsible>;
}

function CarouselDemo() {
  const slides = ['Depoimento de Ana', 'Depoimento de João', 'Depoimento de Bia'];
  return <Carousel loop className="demo-narrow">
    <Carousel.Viewport>
      <Carousel.Content>
        {slides.map(slide => <Carousel.Item key={slide}>{slide}</Carousel.Item>)}
      </Carousel.Content>
    </Carousel.Viewport>
    <div className="demo-row">
      <Carousel.Previous asChild><Button variant="secondary" size="sm">‹ Anterior</Button></Carousel.Previous>
      <Carousel.Next asChild><Button variant="secondary" size="sm">Próximo ›</Button></Carousel.Next>
    </div>
    <Carousel.Indicators />
  </Carousel>;
}

export const dataDemos: DemoMap = {
  table: TableDemo,
  'data-table': DataTableDemo,
  list: ListDemo,
  'description-list': DescriptionListDemo,
  avatar: AvatarDemo,
  'avatar-group': AvatarGroupDemo,
  stat: StatDemo,
  timeline: TimelineDemo,
  tree: TreeDemo,
  accordion: AccordionDemo,
  collapsible: CollapsibleDemo,
  carousel: CarouselDemo,
};
