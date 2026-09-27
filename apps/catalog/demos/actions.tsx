"use client";
import { useState } from 'react';
import { Button, IconButton, ButtonGroup, Toggle, ToggleGroup, SplitButton, Link } from '@fewcompany/ui';
import type { DemoMap } from './types';
// Demos da categoria "Ações". Chave = id do registry. Cada demo é um componente React interativo.

function ButtonDemo() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  function handleSave() {
    if (status === 'loading') return;
    setStatus('loading');
    setTimeout(() => {
      setStatus('done');
      setTimeout(() => setStatus('idle'), 1600);
    }, 700);
  }
  return (
    <div className="demo-stack">
      <div className="demo-row">
        <Button variant="primary">Primário</Button>
        <Button variant="secondary">Secundário</Button>
        <Button variant="ghost">Discreto</Button>
        <Button variant="danger">Excluir conta</Button>
        <Button variant="link">Ver detalhes</Button>
      </div>
      <div className="demo-row">
        <Button size="sm">Pequeno</Button>
        <Button size="md">Médio</Button>
        <Button size="lg">Grande</Button>
      </div>
      <div className="demo-row">
        <Button onClick={handleSave} loading={status === 'loading'}>
          {status === 'done' ? 'Salvo ✓' : 'Salvar alterações'}
        </Button>
        <p className="few-muted" role="status">
          {status === 'loading' ? 'Salvando…' : status === 'done' ? 'Alterações salvas com sucesso.' : 'Clique para simular o salvamento.'}
        </p>
      </div>
      <div className="demo-row">
        <Button asChild>
          <a href="#exemplo-aschild" onClick={event => event.preventDefault()}>Renderizado como link (asChild)</a>
        </Button>
      </div>
    </div>
  );
}

function IconButtonDemo() {
  const [liked, setLiked] = useState(false);
  return (
    <div className="demo-row">
      <IconButton aria-label={liked ? 'Remover curtida' : 'Curtir'} variant={liked ? 'primary' : 'secondary'} onClick={() => setLiked(value => !value)}>{liked ? '♥' : '♡'}</IconButton>
      <IconButton aria-label="Editar" variant="ghost" shape="square">✎</IconButton>
      <IconButton aria-label="Excluir" variant="danger">🗑</IconButton>
      <IconButton aria-label="Carregando" loading />
    </div>
  );
}

function ButtonGroupDemo() {
  const [view, setView] = useState<'lista' | 'grade'>('lista');
  return (
    <div className="demo-stack">
      <ButtonGroup attached>
        <Button variant={view === 'lista' ? 'primary' : 'secondary'} onClick={() => setView('lista')}>Lista</Button>
        <Button variant={view === 'grade' ? 'primary' : 'secondary'} onClick={() => setView('grade')}>Grade</Button>
      </ButtonGroup>
      <p className="few-muted">Visualização atual: {view}</p>
      <ButtonGroup attached orientation="vertical" size="sm" variant="secondary">
        <Button>Um</Button>
        <Button>Dois</Button>
        <Button>Três</Button>
      </ButtonGroup>
    </div>
  );
}

function ToggleDemo() {
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(true);
  return (
    <div className="demo-row">
      <Toggle pressed={bold} onPressedChange={setBold} aria-label="Negrito"><strong>N</strong></Toggle>
      <Toggle pressed={italic} onPressedChange={setItalic} aria-label="Itálico"><em>I</em></Toggle>
      <Toggle defaultPressed size="sm">Favorito</Toggle>
    </div>
  );
}

function ToggleGroupDemo() {
  const [align, setAlign] = useState('left');
  const [tags, setTags] = useState<string[]>(['few']);
  return (
    <div className="demo-stack">
      <ToggleGroup type="single" value={align} onValueChange={setAlign} aria-label="Alinhamento do texto">
        <ToggleGroup.Item value="left">Esquerda</ToggleGroup.Item>
        <ToggleGroup.Item value="center">Centro</ToggleGroup.Item>
        <ToggleGroup.Item value="right">Direita</ToggleGroup.Item>
      </ToggleGroup>
      <p className="few-muted">Alinhamento: {align}</p>
      <ToggleGroup type="multiple" value={tags} onValueChange={setTags} aria-label="Marcadores">
        <ToggleGroup.Item value="few">Few</ToggleGroup.Item>
        <ToggleGroup.Item value="ui">UI</ToggleGroup.Item>
        <ToggleGroup.Item value="beta">Beta</ToggleGroup.Item>
      </ToggleGroup>
      <p className="few-muted">Marcadores: {tags.length ? tags.join(', ') : 'nenhum'}</p>
    </div>
  );
}

function SplitButtonDemo() {
  const [message, setMessage] = useState('Nenhuma ação executada ainda.');
  return (
    <div className="demo-stack demo-narrow">
      <SplitButton>
        <SplitButton.Action onClick={() => setMessage('Publicado.')}>Publicar</SplitButton.Action>
        <SplitButton.Trigger aria-label="Mais ações de publicação" />
        <SplitButton.Content>
          <SplitButton.Item onClick={() => setMessage('Salvo como rascunho.')}>Salvar como rascunho</SplitButton.Item>
          <SplitButton.Item onClick={() => setMessage('Agendado para amanhã.')}>Agendar publicação</SplitButton.Item>
          <SplitButton.Item disabled onClick={() => setMessage('Duplicado.')}>Duplicar (em breve)</SplitButton.Item>
        </SplitButton.Content>
      </SplitButton>
      <p className="few-muted" role="status">{message}</p>
    </div>
  );
}

function LinkDemo() {
  return (
    <div className="demo-stack">
      <div className="demo-row">
        <Link href="#exemplo" onClick={event => event.preventDefault()}>Link padrão</Link>
        <Link href="#exemplo" variant="muted" onClick={event => event.preventDefault()}>Link discreto</Link>
        <Link href="#exemplo" variant="brand" onClick={event => event.preventDefault()}>Link de marca</Link>
      </div>
      <div className="demo-row">
        <Link href="#exemplo" underline="always" onClick={event => event.preventDefault()}>Sempre sublinhado</Link>
        <Link href="#exemplo" underline="none" onClick={event => event.preventDefault()}>Sem sublinhado</Link>
      </div>
      <Link href="https://fewcompany.com" external>Site da Few Company</Link>
      <Link asChild variant="brand">
        <a href="#exemplo-aschild" onClick={event => event.preventDefault()}>Renderizado via asChild</a>
      </Link>
    </div>
  );
}

export const actionsDemos: DemoMap = {
  button: ButtonDemo,
  'icon-button': IconButtonDemo,
  'button-group': ButtonGroupDemo,
  toggle: ToggleDemo,
  'toggle-group': ToggleGroupDemo,
  'split-button': SplitButtonDemo,
  link: LinkDemo,
};
