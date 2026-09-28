import { DestroyRef, effect, inject, signal, type Signal } from '@angular/core';
import { computeFloatingPosition, type FloatingAlign, type FloatingSide } from '@fewcompany/core';

export interface PositionOptions { side?: FloatingSide; align?: FloatingAlign; offset?: number; matchWidth?: boolean }
export interface PositionState { top: number; left: number; width?: number; side: FloatingSide; ready: boolean }

/**
 * Posiciona um elemento flutuante (position: fixed) em relação a uma âncora, com flip. Chame no construtor.
 * Retorna um signal com a posição; aplique via host binding `[style.top.px]`, `[style.left.px]`, `[attr.data-side]`.
 */
export function setupPosition(open: Signal<boolean>, anchor: () => Element | null | undefined, floating: () => HTMLElement | null | undefined, options: () => PositionOptions = () => ({})): Signal<PositionState> {
  const state = signal<PositionState>({ top: 0, left: 0, side: options().side ?? 'bottom', ready: false });
  let cleanup: (() => void) | null = null;
  const detach = () => { cleanup?.(); cleanup = null; };
  const update = () => {
    const a = anchor(), f = floating();
    if (!a || !f) return;
    const { side = 'bottom', align = 'start', offset = 6, matchWidth = false } = options();
    const ar = a.getBoundingClientRect(), fr = f.getBoundingClientRect();
    const pos = computeFloatingPosition({ top: ar.top, left: ar.left, width: ar.width, height: ar.height }, { top: fr.top, left: fr.left, width: fr.width, height: fr.height }, { width: window.innerWidth, height: window.innerHeight }, { side, align, offset });
    state.set({ ...pos, width: matchWidth ? ar.width : undefined, ready: true });
  };
  effect(() => {
    detach();
    if (!open() || typeof window === 'undefined') { state.update(s => ({ ...s, ready: false })); return; }
    queueMicrotask(update);
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    const a = anchor(), f = floating();
    if (observer) { if (a) observer.observe(a); if (f) observer.observe(f); }
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    cleanup = () => { observer?.disconnect(); window.removeEventListener('scroll', update, true); window.removeEventListener('resize', update); };
  });
  inject(DestroyRef).onDestroy(detach);
  return state.asReadonly();
}
