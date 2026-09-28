import { onScopeDispose, watchEffect } from 'vue';

export interface DismissOptions { escape?: boolean; outside?: boolean }

/**
 * Fecha camadas (popover, menu, drawer) com Escape e pointerdown fora dos elementos retornados por `inside()`.
 * Chame no setup. Os listeners existem só enquanto `active()` é verdadeiro.
 */
export function useDismiss(active: () => boolean, onDismiss: () => void, inside: () => Array<Element | null | undefined>, { escape = true, outside = true }: DismissOptions = {}) {
  let cleanup: (() => void) | null = null;
  const detach = () => { cleanup?.(); cleanup = null; };
  watchEffect(() => {
    detach();
    if (!active() || typeof document === 'undefined') return;
    const onKeyDown = (event: KeyboardEvent) => { if (escape && event.key === 'Escape' && !event.defaultPrevented) { event.preventDefault(); event.stopPropagation(); onDismiss(); } };
    const onPointerDown = (event: PointerEvent) => {
      if (!outside) return;
      const target = event.target as Node | null;
      if (!target || inside().some(el => el?.contains(target))) return;
      onDismiss();
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown, true);
    cleanup = () => { document.removeEventListener('keydown', onKeyDown); document.removeEventListener('pointerdown', onPointerDown, true); };
  }, { flush: 'post' });
  onScopeDispose(detach);
}
