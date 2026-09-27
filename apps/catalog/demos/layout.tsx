"use client";
import { useState } from 'react';
import type { DemoMap } from './types';
import { Badge, Card, Separator, AspectRatio, ScrollArea, Stack, Grid, Toolbar, AppShell } from '@fewcompany/ui';

function CardDemo() {
  return (
    <div className="demo-stack">
      <div className="demo-row">
        <Card variant="outlined" padding="sm">
          <Card.Header>
            <Card.Title level={4}>Outlined</Card.Title>
            <Card.Description>Borda visível, fundo da superfície.</Card.Description>
            <Card.Action><Badge tone="info">novo</Badge></Card.Action>
          </Card.Header>
          <Card.Content>Conteúdo do cartão.</Card.Content>
        </Card>
        <Card variant="soft" padding="sm">
          <Card.Header>
            <Card.Title level={4}>Soft</Card.Title>
            <Card.Description>Fundo suave, sem borda.</Card.Description>
          </Card.Header>
          <Card.Content>Conteúdo do cartão.</Card.Content>
        </Card>
      </div>
      <Card variant="elevated" padding="md" asChild>
        <button type="button" onClick={() => alert('Cartão clicável')}>
          <Card.Header>
            <Card.Title>Elevated + interativo</Card.Title>
            <Card.Description>asChild em botão: hover e foco vêm do CSS.</Card.Description>
          </Card.Header>
          <Card.Footer>
            <span className="few-muted">Clique no cartão</span>
            <span className="few-button few-button--secondary few-button--sm" aria-hidden="true">Abrir ↗</span>
          </Card.Footer>
        </button>
      </Card>
    </div>
  );
}

function SeparatorDemo() {
  return (
    <div className="demo-stack demo-narrow">
      <p className="few-muted">Horizontal</p>
      <Separator orientation="horizontal" />
      <p className="few-muted">Com rótulo</p>
      <Separator label="ou" />
      <div className="demo-row" style={{ height: 48 }}>
        <span>Esquerda</span>
        <Separator orientation="vertical" />
        <span>Direita</span>
      </div>
    </div>
  );
}

function AspectRatioDemo() {
  const [ratio, setRatio] = useState<number>(16 / 9);
  const options: Array<{ label: string; value: number }> = [
    { label: '16:9', value: 16 / 9 },
    { label: '1:1', value: 1 },
    { label: '4:3', value: 4 / 3 },
  ];
  return (
    <div className="demo-stack demo-narrow">
      <div className="demo-row">
        {options.map(option => (
          <button key={option.label} type="button" className="few-button" data-state={ratio === option.value ? 'active' : undefined} onClick={() => setRatio(option.value)}>
            {option.label}
          </button>
        ))}
      </div>
      <AspectRatio ratio={ratio}>
        <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', background: 'var(--few-soft)', color: 'var(--few-muted)' }}>
          {options.find(option => option.value === ratio)?.label}
        </div>
      </AspectRatio>
    </div>
  );
}

function ScrollAreaDemo() {
  const itens = Array.from({ length: 16 }, (_, index) => `Item ${index + 1}`);
  return (
    <div className="demo-narrow">
      <ScrollArea type="hover" style={{ height: 180, border: '1px solid var(--few-line)', borderRadius: 'var(--few-radius)' }}>
        <ScrollArea.Viewport label="Lista de exemplo" style={{ height: '100%', padding: 12 }}>
          <div className="demo-stack" style={{ gap: 8 }}>
            {itens.map(item => <div key={item} className="few-muted">{item}</div>)}
          </div>
        </ScrollArea.Viewport>
      </ScrollArea>
    </div>
  );
}

function StackDemo() {
  const [direction, setDirection] = useState<'row' | 'column'>('column');
  return (
    <div className="demo-stack demo-narrow">
      <button type="button" className="few-button" onClick={() => setDirection(current => (current === 'row' ? 'column' : 'row'))}>
        Direção: {direction === 'row' ? 'linha' : 'coluna'}
      </button>
      <Stack direction={direction} gap={4} style={{ padding: 12, border: '1px dashed var(--few-line)', borderRadius: 'var(--few-radius)' }}>
        <div className="few-badge">Um</div>
        <div className="few-badge">Dois</div>
        <div className="few-badge">Três</div>
      </Stack>
    </div>
  );
}

function GridDemo() {
  return (
    <div className="demo-narrow">
      <Grid columns="auto" minChildWidth="96px" gap={3}>
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} style={{ background: 'var(--few-soft)', borderRadius: 'var(--few-radius)', padding: 12, textAlign: 'center' }}>{index + 1}</div>
        ))}
        <Grid.Item colSpan={2}>
          <div style={{ background: 'var(--few-surface)', border: '1px solid var(--few-line)', borderRadius: 'var(--few-radius)', padding: 12, textAlign: 'center' }}>colSpan=2</div>
        </Grid.Item>
      </Grid>
    </div>
  );
}

function ToolbarDemo() {
  const [ativo, setAtivo] = useState<string | null>(null);
  const acoes = ['Negrito', 'Itálico', 'Sublinhado'];
  return (
    <div className="demo-narrow">
      <Toolbar label="Formatação de texto">
        <Toolbar.Group>
          {acoes.map(acao => (
            <Toolbar.Button key={acao} aria-pressed={ativo === acao} onClick={() => setAtivo(current => (current === acao ? null : acao))}>
              {acao[0]}
            </Toolbar.Button>
          ))}
        </Toolbar.Group>
        <Toolbar.Separator />
        <Toolbar.Link href="#">Ajuda</Toolbar.Link>
      </Toolbar>
      <p className="few-muted" style={{ marginTop: 8 }}>Ativo: {ativo ?? 'nenhum'} — setas movem o foco entre os itens.</p>
    </div>
  );
}

function AppShellDemo() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="demo-narrow" style={{ border: '1px solid var(--few-line)', borderRadius: 'var(--few-radius)', overflow: 'hidden' }}>
      <AppShell sidebarWidth="120px" sidebarCollapsed={collapsed} onSidebarCollapsedChange={setCollapsed} style={{ minHeight: 260 }}>
        <AppShell.Header>
          <AppShell.SidebarTrigger>☰</AppShell.SidebarTrigger>
          <strong>Painel</strong>
        </AppShell.Header>
        <AppShell.Sidebar>
          <nav className="demo-stack" style={{ gap: 8, padding: 12 }}>
            <span className="few-muted">Início</span>
            <span className="few-muted">Ajustes</span>
          </nav>
        </AppShell.Sidebar>
        <AppShell.Main id="main-content" style={{ padding: 16 }}>
          Conteúdo principal. Abaixo de 768px a sidebar vira off-canvas com fundo escurecido e fecha com Esc.
        </AppShell.Main>
        <AppShell.Footer>Few Company</AppShell.Footer>
      </AppShell>
    </div>
  );
}

export const layoutDemos: DemoMap = {
  card: CardDemo,
  separator: SeparatorDemo,
  'aspect-ratio': AspectRatioDemo,
  'scroll-area': ScrollAreaDemo,
  stack: StackDemo,
  grid: GridDemo,
  toolbar: ToolbarDemo,
  'app-shell': AppShellDemo,
};
