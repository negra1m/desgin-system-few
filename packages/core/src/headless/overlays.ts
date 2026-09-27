// Headless da categoria "overlays". Funções puras (sem DOM) usadas pelos adaptadores: React hoje, Angular/Vue depois.
// A única lógica não trivial da categoria é a fila do Toast (máximo visível, ordem, remoção).

export type ToastTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

export interface ToastRecord {
  id: string;
  title?: string;
  description?: string;
  tone?: ToastTone;
  duration?: number;
}

/**
 * Insere (ou atualiza, se o id já existir) um toast na fila.
 * Quando a fila excede `max`, os mais antigos saem primeiro (FIFO).
 */
export function enqueueToast<T extends { id: string }>(queue: readonly T[], toast: T, max = 3): T[] {
  const next = [...queue.filter(item => item.id !== toast.id), toast];
  return next.length > max ? next.slice(next.length - max) : next;
}

/** Remove um toast da fila pelo id. Sem efeito se o id não existir. */
export function dismissToast<T extends { id: string }>(queue: readonly T[], id: string): T[] {
  return queue.filter(item => item.id !== id);
}

/** Limpa toda a fila. */
export function clearToasts<T>(): T[] {
  return [];
}

/**
 * Ordem de exibição no viewport. `newestFirst` (padrão) mostra o toast mais recente no topo da pilha visual,
 * como bottom-right empilhando para cima; inverta para viewports que crescem para baixo (top-*, ordem de chegada).
 */
export function orderToasts<T>(queue: readonly T[], newestFirst = true): T[] {
  return newestFirst ? [...queue].reverse() : [...queue];
}
