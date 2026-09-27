"use client";
import { useLayoutEffect, type RefObject } from 'react';

/**
 * Mostra/esconde um elemento com atributo `popover="manual"` no top layer nativo (sem z-index, sem portal).
 * Em navegadores sem Popover API, alterna `hidden`. Renderize o elemento sempre com `popover="manual"`.
 */
export function useTopLayer(ref: RefObject<HTMLElement | null>, open: boolean) {
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const supported = 'showPopover' in element && typeof element.showPopover === 'function';
    try {
      if (supported) { if (open && !element.matches(':popover-open')) element.showPopover(); if (!open && element.matches(':popover-open')) element.hidePopover(); }
      else element.hidden = !open;
    } catch { element.hidden = !open; }
    return () => { if (supported) { try { if (element.matches(':popover-open')) element.hidePopover(); } catch { /* elemento já removido */ } } };
  }, [ref, open]);
}
