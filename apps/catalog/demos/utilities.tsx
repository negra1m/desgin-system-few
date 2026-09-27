"use client";
import { useRef, useState } from 'react';
import { Portal, Slot, VisuallyHidden } from '@fewcompany/ui';
import type { DemoMap } from './types';

function SlotDemo() {
  const [asChild, setAsChild] = useState(true);
  const [clicks, setClicks] = useState(0);
  const props = { className: 'demo-slot-target', onClick: () => setClicks(c => c + 1), 'data-demo': 'slot' };
  return <div className="demo-stack">
    <label className="few-muted"><input type="checkbox" checked={asChild} onChange={e => setAsChild(e.target.checked)} /> Renderizar como filho (asChild)</label>
    {asChild ? <Slot {...props}><a href="#slot" onClick={e => e.preventDefault()}>Sou um link com as props do Slot</a></Slot> : <button type="button" {...props}>Sou um botão padrão</button>}
    <p className="few-muted" role="status">Cliques recebidos pelo Slot: {clicks}. Handlers do filho e do Slot são compostos.</p>
  </div>;
}
function VisuallyHiddenDemo() {
  return <div className="demo-row">
    <button type="button" className="demo-slot-target" aria-describedby="vh-hint"><span aria-hidden="true">⌕</span><VisuallyHidden>Buscar componentes</VisuallyHidden></button>
    <p id="vh-hint" className="few-muted">O botão mostra só o ícone. Leitores de tela leem “Buscar componentes”.</p>
  </div>;
}
function PortalDemo() {
  const container = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  return <div className="demo-stack">
    <button type="button" className="demo-slot-target" onClick={() => setOpen(o => !o)} aria-expanded={open}>{open ? 'Remover do contêiner' : 'Renderizar no contêiner ao lado'}</button>
    <div ref={container} className="demo-portal-target" aria-live="polite">{!open && <span className="few-muted">Contêiner de destino (mantém o tema).</span>}</div>
    {open && <Portal container={container.current}><p className="few-muted">Este parágrafo foi montado via Portal dentro do contêiner.</p></Portal>}
  </div>;
}

export const utilitiesDemos: DemoMap = { slot: SlotDemo, 'visually-hidden': VisuallyHiddenDemo, portal: PortalDemo };
