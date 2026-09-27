"use client";
import { useState } from 'react';
import { Alert, Badge, Button, EmptyState, Progress, ProgressCircle, Skeleton, Spinner, Tag } from '@fewcompany/ui';
import type { DemoMap } from './types';
// Demos da categoria "Feedback". Chave = id do registry. Cada demo é um componente React interativo.

function AlertDemo() {
  const [visible, setVisible] = useState({ soft: true, outline: true });
  return (
    <div className="demo-stack demo-narrow">
      {visible.soft && (
        <Alert tone="success" variant="soft">
          <Alert.Icon />
          <Alert.Title>Salvo</Alert.Title>
          <Alert.Description>Suas alterações foram salvas com sucesso.</Alert.Description>
          <Alert.Close aria-label="Fechar aviso" onDismiss={() => setVisible(v => ({ ...v, soft: false }))} />
        </Alert>
      )}
      {visible.outline && (
        <Alert tone="danger" variant="outline">
          <Alert.Icon />
          <Alert.Title>Falha ao publicar</Alert.Title>
          <Alert.Description>Verifique sua conexão e tente novamente.</Alert.Description>
          <Alert.Action><button type="button" className="few-button few-button--secondary">Tentar de novo</button></Alert.Action>
          <Alert.Close aria-label="Fechar aviso" onDismiss={() => setVisible(v => ({ ...v, outline: false }))} />
        </Alert>
      )}
      {!visible.soft && !visible.outline && <p className="few-muted">Os dois avisos foram fechados. Recarregue a página para vê-los de novo.</p>}
    </div>
  );
}

function BadgeDemo() {
  return (
    <div className="demo-stack">
      <div className="demo-row">
        <Badge tone="neutral">Rascunho</Badge>
        <Badge tone="success" dot>Ativo</Badge>
        <Badge tone="warning">Pendente</Badge>
        <Badge tone="danger">Bloqueado</Badge>
        <Badge tone="info">Novo</Badge>
      </div>
      <div className="demo-row">
        <Badge tone="success" variant="solid">Solid</Badge>
        <Badge tone="success" variant="soft">Soft</Badge>
        <Badge tone="success" variant="outline">Outline</Badge>
        <Badge tone="info" size="sm">Pequeno</Badge>
      </div>
    </div>
  );
}

function TagDemo() {
  const [tags, setTags] = useState(['React', 'TypeScript', 'Acessibilidade']);
  return (
    <div className="demo-stack">
      <div className="demo-row">
        {tags.map(tag => (
          <Tag key={tag} tone="info" variant="soft">
            <Tag.Label>{tag}</Tag.Label>
            <Tag.Close label={tag} onRemove={() => setTags(current => current.filter(item => item !== tag))} />
          </Tag>
        ))}
        {tags.length === 0 && <p className="few-muted">Todas as tags foram removidas.</p>}
      </div>
      <Tag tone="neutral" variant="outline" onClick={() => setTags(['React', 'TypeScript', 'Acessibilidade'])}>
        <Tag.Label>Restaurar tags</Tag.Label>
      </Tag>
    </div>
  );
}

function ProgressDemo() {
  const [value, setValue] = useState(30);
  const [indeterminate, setIndeterminate] = useState(false);
  return (
    <div className="demo-stack demo-narrow">
      <Progress value={indeterminate ? null : value} tone="info">
        <Progress.Label>Importação de dados</Progress.Label>
        <Progress.Value />
        <Progress.Track><Progress.Indicator /></Progress.Track>
      </Progress>
      <div className="demo-row">
        <button type="button" className="few-button few-button--secondary" disabled={indeterminate} onClick={() => setValue(v => Math.min(100, v + 10))}>+10%</button>
        <button type="button" className="few-button few-button--secondary" disabled={indeterminate} onClick={() => setValue(v => Math.max(0, v - 10))}>-10%</button>
        <label className="few-muted"><input type="checkbox" checked={indeterminate} onChange={e => setIndeterminate(e.target.checked)} /> Indeterminado</label>
      </div>
    </div>
  );
}

function ProgressCircleDemo() {
  const [value, setValue] = useState(65);
  return (
    <div className="demo-row">
      <ProgressCircle value={value} tone="success" size="md">
        <ProgressCircle.Circle />
        <ProgressCircle.Label />
      </ProgressCircle>
      <ProgressCircle value={null} tone="info" size="md">
        <ProgressCircle.Circle />
      </ProgressCircle>
      <div className="demo-stack">
        <button type="button" className="few-button few-button--secondary" onClick={() => setValue(v => Math.min(100, v + 15))}>+15%</button>
        <button type="button" className="few-button few-button--secondary" onClick={() => setValue(v => Math.max(0, v - 15))}>-15%</button>
      </div>
    </div>
  );
}

function SpinnerDemo() {
  return (
    <div className="demo-row">
      <Spinner size="sm" label="Carregando" />
      <Spinner size="md" tone="info" label="Carregando pedidos" />
      <Spinner size="lg" tone="success" label="Enviando" />
    </div>
  );
}

function SkeletonDemo() {
  const [loading, setLoading] = useState(true);
  return (
    <div className="demo-stack demo-narrow">
      <label className="few-muted"><input type="checkbox" checked={loading} onChange={e => setLoading(e.target.checked)} /> Carregando</label>
      {loading ? (
        <div className="demo-row" style={{ alignItems: 'flex-start' }}>
          <Skeleton variant="circle" />
          <Skeleton variant="text" lines={3} />
        </div>
      ) : (
        <div className="demo-row" style={{ alignItems: 'flex-start' }}>
          <span aria-hidden="true" className="few-empty-icon" style={{ width: 40, height: 40, fontSize: 18 }}>VN</span>
          <p className="few-muted">Vinícius Negrão publicou 3 novos componentes no catálogo Few UI.</p>
        </div>
      )}
    </div>
  );
}

function EmptyStateDemo() {
  const [status, setStatus] = useState<'empty' | 'success'>('empty');
  if (status === 'success') {
    return (
      <div className="demo-narrow">
        <Alert tone="success" variant="soft">
          <Alert.Icon />
          <Alert.Title>Projeto criado</Alert.Title>
          <Alert.Description>O projeto foi adicionado à sua lista.</Alert.Description>
          <Alert.Close aria-label="Fechar aviso" onDismiss={() => setStatus('empty')} />
        </Alert>
      </div>
    );
  }
  return (
    <div className="demo-narrow">
      <EmptyState size="sm">
        <EmptyState.Icon />
        <EmptyState.Title>Nenhum projeto ainda</EmptyState.Title>
        <EmptyState.Description>Crie o primeiro projeto para começar a organizar seu trabalho.</EmptyState.Description>
        <EmptyState.Actions>
          <Button onClick={() => setStatus('success')}>+ Novo projeto</Button>
        </EmptyState.Actions>
      </EmptyState>
    </div>
  );
}

export const feedbackDemos: DemoMap = {
  alert: AlertDemo,
  badge: BadgeDemo,
  tag: TagDemo,
  progress: ProgressDemo,
  'progress-circle': ProgressCircleDemo,
  spinner: SpinnerDemo,
  skeleton: SkeletonDemo,
  'empty-state': EmptyStateDemo,
};
