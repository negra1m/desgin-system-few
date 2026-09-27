"use client";
import { useEffect, useRef, type RefObject } from 'react';

export interface DismissOptions { escape?: boolean; outside?: boolean; enabled?: boolean }

/**
 * Fecha camadas (popover, menu, drawer) com Escape e clique/toque fora dos elementos em `refs`.
 * O primeiro Escape é consumido pela camada mais interna (stopPropagation).
 */
export function useDismiss(active: boolean, onDismiss: () => void, refs: Array<RefObject<Element | null>>, { escape = true, outside = true, enabled = true }: DismissOptions = {}) {
  const onDismissRef = useRef(onDismiss); onDismissRef.current = onDismiss;
  const refsRef = useRef(refs); refsRef.current = refs;
  useEffect(() => {
    if (!active || !enabled) return;
    const onKeyDown = (event: KeyboardEvent) => { if (escape && event.key === 'Escape' && !event.defaultPrevented) { event.preventDefault(); event.stopPropagation(); onDismissRef.current(); } };
    const onPointerDown = (event: PointerEvent) => {
      if (!outside) return;
      const target = event.target as Node | null;
      if (!target || refsRef.current.some(ref => ref.current?.contains(target))) return;
      onDismissRef.current();
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => { document.removeEventListener('keydown', onKeyDown); document.removeEventListener('pointerdown', onPointerDown, true); };
  }, [active, enabled, escape, outside]);
}
