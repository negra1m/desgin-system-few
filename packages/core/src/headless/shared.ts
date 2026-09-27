import type { Orientation } from '../tokens.js';

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));

export const roundToStep = (value: number, step: number, min = 0) => {
  const rounded = Math.round((value - min) / step) * step + min;
  const decimals = (String(step).split('.')[1] ?? '').length;
  return Number(rounded.toFixed(decimals));
};

export interface NavigationOptions { orientation?: Orientation | 'both'; loop?: boolean; rtl?: boolean }
/** Índice seguinte para navegação por setas/Home/End. Retorna null quando a tecla não navega. */
export function nextIndex(key: string, index: number, count: number, { orientation = 'horizontal', loop = true, rtl = false }: NavigationOptions = {}): number | null {
  if (count <= 0) return null;
  const horizontal = orientation === 'horizontal' || orientation === 'both';
  const vertical = orientation === 'vertical' || orientation === 'both';
  const forward = (horizontal && key === (rtl ? 'ArrowLeft' : 'ArrowRight')) || (vertical && key === 'ArrowDown');
  const backward = (horizontal && key === (rtl ? 'ArrowRight' : 'ArrowLeft')) || (vertical && key === 'ArrowUp');
  if (key === 'Home') return 0;
  if (key === 'End') return count - 1;
  if (forward) return index + 1 < count ? index + 1 : loop ? 0 : index;
  if (backward) return index - 1 >= 0 ? index - 1 : loop ? count - 1 : index;
  return null;
}

/** Busca por digitação (typeahead): próximo item cujo rótulo começa pelo texto digitado, a partir de `from`. */
export function typeaheadIndex(labels: string[], typed: string, from: number): number | null {
  const query = typed.toLowerCase();
  if (!query) return null;
  const order = labels.map((_, i) => i);
  const ordered = order.slice(from + 1).concat(order.slice(0, from + 1));
  const repeated = query.length > 1 && [...query].every(ch => ch === query[0]);
  const found = ordered.find(i => labels[i].toLowerCase().startsWith(repeated ? query[0] : query));
  return found ?? null;
}

export const getInitials = (name: string) => name.split(' ').filter(Boolean).slice(0, 2).map(word => word[0]).join('').toUpperCase();

/** Faixa de páginas com reticências. */
export function paginationRange(page: number, total: number, siblings = 1): Array<number | 'ellipsis'> {
  if (total <= 0) return [];
  const window = siblings * 2 + 5;
  if (total <= window) return Array.from({ length: total }, (_, i) => i + 1);
  const left = Math.max(page - siblings, 2), right = Math.min(page + siblings, total - 1);
  const items: Array<number | 'ellipsis'> = [1];
  if (left > 2) items.push('ellipsis');
  for (let i = left; i <= right; i++) items.push(i);
  if (right < total - 1) items.push('ellipsis');
  items.push(total);
  return items;
}
