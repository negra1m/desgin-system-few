import { onScopeDispose, ref, watch, type Ref } from 'vue';
import { computeFloatingPosition, type FloatingAlign, type FloatingSide } from '@fewcompany/core';

export interface PositionOptions { side?: FloatingSide; align?: FloatingAlign; offset?: number; matchWidth?: boolean }
export interface PositionState { top: number; left: number; width?: number; side: FloatingSide; ready: boolean }

/**
 * Posiciona um elemento flutuante (position: fixed) em relação a uma âncora, com flip. Chame no setup.
 * Retorna um ref com a posição; aplique via style `{ position: 'fixed', top: px, left: px }` e `data-side`.
 */
export function usePosition(open: () => boolean, anchor: Ref<Element | null | undefined>, floating: Ref<HTMLElement | null | undefined>, options: () => PositionOptions = () => ({})): Ref<PositionState> {
  const state = ref<PositionState>({ top: 0, left: 0, side: options().side ?? 'bottom', ready: false });
  let cleanup: (() => void) | null = null;
  const detach = () => { cleanup?.(); cleanup = null; };
  const update = () => {
    const a = anchor.value, f = floating.value;
    if (!a || !f) return;
    const { side = 'bottom', align = 'start', offset = 6, matchWidth = false } = options();
    const ar = a.getBoundingClientRect(), fr = f.getBoundingClientRect();
    const pos = computeFloatingPosition({ top: ar.top, left: ar.left, width: ar.width, height: ar.height }, { top: fr.top, left: fr.left, width: fr.width, height: fr.height }, { width: window.innerWidth, height: window.innerHeight }, { side, align, offset });
    state.value = { ...pos, width: matchWidth ? ar.width : undefined, ready: true };
  };
  watch([open, anchor, floating, options], ([isOpen]) => {
    detach();
    if (!isOpen || typeof window === 'undefined') { state.value = { ...state.value, ready: false }; return; }
    update();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    if (observer) { if (anchor.value) observer.observe(anchor.value); if (floating.value) observer.observe(floating.value); }
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    cleanup = () => { observer?.disconnect(); window.removeEventListener('scroll', update, true); window.removeEventListener('resize', update); };
  }, { flush: 'post', immediate: true });
  onScopeDispose(detach);
  return state;
}
