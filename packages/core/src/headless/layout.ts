// Headless da categoria "layout". Funções puras (sem DOM) usadas pelos adaptadores: React hoje, Angular/Vue depois.
import { tokens } from '../tokens.js';

export type SpaceToken = keyof typeof tokens.space;
export type Gap = SpaceToken | (number & {}) | (string & {});

/**
 * Resolve um valor de gap (Stack/Grid): número da escala (1,2,3,4,6,8,12,16) vira o px do token;
 * outro número vira px cru; string (ex.: '2rem') passa como está. Sem valor, usa `fallback`.
 */
export function resolveGap(gap: Gap | undefined, fallback = '0px'): string {
  if (gap === undefined) return fallback;
  if (typeof gap === 'number') return (tokens.space as Record<number, string>)[gap] ?? `${gap}px`;
  return gap;
}

export type GridColumns = number | 'auto';

/** Resolve `grid-template-columns`: 'auto' gera colunas responsivas via minmax; número gera N colunas iguais. */
export function resolveGridColumns(columns: GridColumns = 'auto', minChildWidth = '200px'): string {
  if (columns === 'auto') return `repeat(auto-fit, minmax(${minChildWidth}, 1fr))`;
  const count = Math.max(1, Math.floor(columns));
  return `repeat(${count}, minmax(0, 1fr))`;
}

/** Resolve `grid-column`/`grid-row` para Grid.Item a partir de colSpan/rowSpan. */
export function resolveGridSpan(span: number | undefined): string | undefined {
  if (!span || span < 1) return undefined;
  return `span ${Math.floor(span)} / span ${Math.floor(span)}`;
}
