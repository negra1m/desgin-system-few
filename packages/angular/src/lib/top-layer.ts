import { DestroyRef, effect, inject, type Signal } from '@angular/core';

/** Mostra/esconde `element` (com atributo popover="manual") no top layer nativo; sem Popover API alterna `hidden`. */
export function applyTopLayer(element: HTMLElement | null | undefined, open: boolean) {
  if (!element) return;
  const supported = typeof element.showPopover === 'function';
  try {
    if (supported) { if (open && !element.matches(':popover-open')) element.showPopover(); if (!open && element.matches(':popover-open')) element.hidePopover(); }
    else element.hidden = !open;
  } catch { element.hidden = !open; }
}

/** Versão reativa: chame no construtor com um signal `open` e um getter do elemento. */
export function setupTopLayer(open: Signal<boolean>, element: () => HTMLElement | null | undefined) {
  effect(() => { applyTopLayer(element(), open()); });
  inject(DestroyRef).onDestroy(() => { const el = element(); if (el && typeof el.hidePopover === 'function') { try { if (el.matches(':popover-open')) el.hidePopover(); } catch { /* elemento já removido */ } } });
}
