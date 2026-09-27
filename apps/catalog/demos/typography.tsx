"use client";
import { useState } from 'react';
import { Heading, Text, Code, Kbd } from '@fewcompany/ui';
import type { DemoMap } from './types';

function HeadingDemo() {
  const [size, setSize] = useState<'sm' | 'lg' | '2xl'>('lg');
  return <div className="demo-stack">
    <div className="demo-row">
      <label className="few-muted">Tamanho
        <select value={size} onChange={e => setSize(e.target.value as typeof size)} style={{ marginLeft: 8 }}>
          <option value="sm">sm</option>
          <option value="lg">lg</option>
          <option value="2xl">2xl</option>
        </select>
      </label>
    </div>
    <Heading level={2} size={size}>Catálogo Few UI</Heading>
    <Heading level={3} size="md" tone="muted">Subtítulo em tom neutro</Heading>
    <Heading level={1} size="2xl" tone="gradient">Gradiente da marca</Heading>
  </div>;
}

function TextDemo() {
  const [lines, setLines] = useState(2);
  return <div className="demo-stack demo-narrow">
    <Text as="p" size="md">Texto de corpo padrão, tag p, tom ink.</Text>
    <Text as="span" tone="success">Operação concluída com sucesso.</Text>
    <div className="demo-row">
      <Text tabular>R$ 1.234,50</Text>
      <Text tabular>R$    12,00</Text>
    </div>
    <label className="few-muted">Linhas visíveis (lineClamp)
      <input type="range" min={1} max={4} value={lines} onChange={e => setLines(Number(e.target.value))} />
    </label>
    <Text as="p" lineClamp={lines} tone="muted">
      Esta descrição é longa de propósito para demonstrar o corte por número de linhas via lineClamp,
      sem cortar palavras no meio e sem exigir uma altura fixa no contêiner pai.
    </Text>
    <Text as="p" truncate tone="muted">Uma linha só, truncada com reticências quando o texto não cabe no espaço disponível.</Text>
  </div>;
}

function CodeDemo() {
  return <div className="demo-stack">
    <p className="few-muted">Instale com <Code>npm install @fewcompany/ui</Code> ou <Code variant="outline">npx few add heading</Code>.</p>
    <Code block copyable lang="tsx">{'export function Heading({ level = 2, size = "lg" }) {\n  const Tag = `h${level}`;\n  return <Tag data-size={size} />;\n}'}</Code>
  </div>;
}

function KbdDemo() {
  const [platform, setPlatform] = useState<'other' | 'mac'>('other');
  return <div className="demo-stack">
    <label className="few-muted"><input type="checkbox" checked={platform === 'mac'} onChange={e => setPlatform(e.target.checked ? 'mac' : 'other')} /> Exibir teclas do mac</label>
    <div className="demo-row">
      <Text as="span" className="few-muted">Buscar</Text>
      <Kbd keys={['Mod', 'K']} platform={platform} />
    </div>
    <div className="demo-row">
      <Text as="span" className="few-muted">Salvar</Text>
      <Kbd keys={['Mod', 'Shift', 'S']} platform={platform} size="sm" />
    </div>
  </div>;
}

export const typographyDemos: DemoMap = { heading: HeadingDemo, text: TextDemo, code: CodeDemo, kbd: KbdDemo };
