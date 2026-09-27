"use client";
import { useLayoutEffect, useState, type CSSProperties, type RefObject } from 'react';

export type Side = 'top' | 'bottom' | 'left' | 'right';
export type Align = 'start' | 'center' | 'end';
export interface PositionOptions { side?: Side; align?: Align; offset?: number; open?: boolean; matchWidth?: boolean }
export interface PositionResult { style: CSSProperties; side: Side; ready: boolean }

const opposite: Record<Side, Side> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };

function compute(anchor: DOMRect, floating: DOMRect, side: Side, align: Align, offset: number) {
  let top = 0, left = 0;
  if (side === 'top' || side === 'bottom') {
    top = side === 'top' ? anchor.top - floating.height - offset : anchor.bottom + offset;
    left = align === 'start' ? anchor.left : align === 'end' ? anchor.right - floating.width : anchor.left + anchor.width / 2 - floating.width / 2;
  } else {
    left = side === 'left' ? anchor.left - floating.width - offset : anchor.right + offset;
    top = align === 'start' ? anchor.top : align === 'end' ? anchor.bottom - floating.height : anchor.top + anchor.height / 2 - floating.height / 2;
  }
  return { top, left };
}

/**
 * Posiciona um elemento flutuante (position: fixed) em relação a uma âncora, com flip quando falta espaço.
 * Sem dependência externa. Combine com `useTopLayer` (atributo popover) para escapar de overflow/transform.
 */
export function usePosition(anchor: RefObject<Element | null>, floating: RefObject<HTMLElement | null>, { side = 'bottom', align = 'start', offset = 6, open = true, matchWidth = false }: PositionOptions = {}): PositionResult {
  const [state, setState] = useState<PositionResult>({ style: { position: 'fixed', top: 0, left: 0, visibility: 'hidden' }, side, ready: false });
  useLayoutEffect(() => {
    if (!open) { setState(current => (current.ready ? { ...current, ready: false, style: { ...current.style, visibility: 'hidden' } } : current)); return; }
    const update = () => {
      const a = anchor.current, f = floating.current;
      if (!a || !f) return;
      const ar = a.getBoundingClientRect(), fr = f.getBoundingClientRect();
      const vw = window.innerWidth, vh = window.innerHeight, margin = 8;
      let finalSide = side;
      let pos = compute(ar, fr, side, align, offset);
      const overflow = pos.top < margin || pos.top + fr.height > vh - margin || pos.left < margin || pos.left + fr.width > vw - margin;
      if (overflow) { const flipped = compute(ar, fr, opposite[side], align, offset); const fits = flipped.top >= margin && flipped.top + fr.height <= vh - margin && flipped.left >= margin && flipped.left + fr.width <= vw - margin; if (fits) { pos = flipped; finalSide = opposite[side]; } }
      const top = Math.max(margin, Math.min(pos.top, vh - fr.height - margin));
      const left = Math.max(margin, Math.min(pos.left, vw - fr.width - margin));
      setState({ style: { position: 'fixed', top, left, ...(matchWidth ? { width: ar.width } : {}), visibility: 'visible' }, side: finalSide, ready: true });
    };
    update();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    if (observer) { if (anchor.current) observer.observe(anchor.current); if (floating.current) observer.observe(floating.current); }
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => { observer?.disconnect(); window.removeEventListener('scroll', update, true); window.removeEventListener('resize', update); };
  }, [anchor, floating, side, align, offset, open, matchWidth]);
  return state;
}
