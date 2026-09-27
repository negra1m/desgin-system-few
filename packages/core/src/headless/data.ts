// Headless da categoria "data". Funções puras (sem DOM) usadas pelos adaptadores: React hoje, Angular/Vue depois.
import { clamp } from './shared.js';

export type SortDirection = 'asc' | 'desc';

/**
 * Ordena uma cópia das linhas por uma chave, com comparação numérica ou alfabética (pt-BR).
 * Nulos/indefinidos vão para o final, independente da direção. Nunca muta `rows`.
 */
export function sortRows<T>(rows: T[], key: string, direction: SortDirection, accessor: (row: T, key: string) => unknown = (row, k) => (row as Record<string, unknown>)[k]): T[] {
  const factor = direction === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = accessor(a, key);
    const bv = accessor(b, key);
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * factor;
    return String(av).localeCompare(String(bv), 'pt-BR', { numeric: true }) * factor;
  });
}

export interface FlatTreeNode { id: string; level: number; parentId: string | null; expandable: boolean }
export interface TreeInput { id: string; children?: TreeInput[] }
/**
 * Achata uma árvore em lista de nós visíveis, respeitando quais ids estão expandidos.
 * Usado para navegação por teclado (próximo/anterior visível) e por adaptadores sem DOM (Angular/Vue).
 */
export function flattenTree(nodes: TreeInput[], expanded: ReadonlySet<string> | string[], level = 0, parentId: string | null = null): FlatTreeNode[] {
  const expandedSet = expanded instanceof Set ? expanded : new Set(expanded);
  const out: FlatTreeNode[] = [];
  for (const node of nodes) {
    const expandable = Boolean(node.children && node.children.length);
    out.push({ id: node.id, level, parentId, expandable });
    if (expandable && expandedSet.has(node.id)) out.push(...flattenTree(node.children as TreeInput[], expandedSet, level + 1, node.id));
  }
  return out;
}

/** Próximo índice do slide ao avançar/voltar `delta` posições no carrossel, com laço opcional. */
export function carouselIndex(current: number, delta: number, count: number, loop: boolean): number {
  if (count <= 0) return 0;
  const next = current + delta;
  if (loop) return ((next % count) + count) % count;
  return clamp(next, 0, count - 1);
}
