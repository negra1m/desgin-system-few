import { nextIndex, type NavigationOptions } from '@fewcompany/core';

/** Itens focáveis dentro do contêiner, ignorando desabilitados. */
export function focusableItems(container: Element | null, selector: string): HTMLElement[] {
  if (!container) return [];
  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(el => !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true' && !el.hidden);
}

/**
 * Roving focus: move o foco entre itens com setas/Home/End. Retorna o item focado ou null quando a tecla não navega.
 * Uso em (keydown) da lista: `const t = moveFocus(host, '[role=tab]', e.key, { orientation }); if (t) e.preventDefault();`
 */
export function moveFocus(container: Element | null, selector: string, key: string, options: NavigationOptions = {}): HTMLElement | null {
  const items = focusableItems(container, selector);
  const current = items.indexOf(document.activeElement as HTMLElement);
  const next = nextIndex(key, current < 0 ? 0 : current, items.length, options);
  if (next === null) return null;
  items[next]?.focus();
  return items[next] ?? null;
}
