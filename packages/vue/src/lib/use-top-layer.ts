import { onScopeDispose, watch, type Ref } from 'vue';

/** Mostra/esconde `element` (com atributo popover="manual") no top layer nativo; sem Popover API alterna `hidden`. */
export function applyTopLayer(element: HTMLElement | null | undefined, open: boolean) {
  if (!element) return;
  const supported = typeof element.showPopover === 'function';
  try {
    if (supported) { if (open && !element.matches(':popover-open')) element.showPopover(); if (!open && element.matches(':popover-open')) element.hidePopover(); }
    else element.hidden = !open;
  } catch { element.hidden = !open; }
}

/** Versão reativa: chame no setup com um getter `open` e o ref do elemento. */
export function useTopLayer(open: () => boolean, element: Ref<HTMLElement | null | undefined>) {
  watch([open, element], ([isOpen, el]) => applyTopLayer(el, isOpen), { flush: 'post', immediate: true });
  onScopeDispose(() => { const el = element.value; if (el && typeof el.hidePopover === 'function') { try { if (el.matches(':popover-open')) el.hidePopover(); } catch { /* elemento já removido */ } } });
}
