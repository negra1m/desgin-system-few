import { DestroyRef, effect, inject, type Signal } from '@angular/core';

export interface DismissOptions { escape?: boolean; outside?: boolean }

/**
 * Fecha camadas (popover, menu, drawer) com Escape e pointerdown fora dos elementos retornados por `inside()`.
 * Chame no construtor (contexto de injeção). `active` é um signal; os listeners existem só enquanto ativo.
 */
export function setupDismiss(active: Signal<boolean>, onDismiss: () => void, inside: () => Array<Element | null | undefined>, { escape = true, outside = true }: DismissOptions = {}) {
  const destroyRef = inject(DestroyRef);
  let cleanup: (() => void) | null = null;
  const detach = () => { cleanup?.(); cleanup = null; };
  effect(() => {
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
  });
  destroyRef.onDestroy(detach);
}
