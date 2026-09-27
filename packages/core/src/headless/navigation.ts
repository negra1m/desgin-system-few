// Headless da categoria "navigation". Funções puras (sem DOM) usadas pelos adaptadores: React hoje, Angular/Vue depois.

export type StepStatus = 'complete' | 'current' | 'upcoming';
/** Status de uma etapa (Steps) a partir do índice atual. */
export function stepStatus(index: number, current: number): StepStatus {
  return index < current ? 'complete' : index === current ? 'current' : 'upcoming';
}

/** Remove acentos e normaliza para comparação de busca (CommandMenu). */
export function normalizeText(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/** Pontua a correspondência de `query` em `text`/`keywords`, sem acento. null quando não corresponde; maior é melhor. */
export function commandScore(text: string, query: string, keywords: string[] = []): number | null {
  const q = normalizeText(query);
  if (!q) return 0;
  let best: number | null = null;
  for (const raw of [text, ...keywords]) {
    const hay = normalizeText(raw);
    if (!hay) continue;
    if (hay === q) best = Math.max(best ?? 0, 100);
    else if (hay.startsWith(q)) best = Math.max(best ?? 0, 75);
    else if (hay.includes(q)) best = Math.max(best ?? 0, 50);
  }
  return best;
}

/** Filtra e ordena itens { value, keywords } por relevância a `query` (útil fora do DOM, ex.: busca no servidor). */
export function commandFilter<T extends { value: string; keywords?: string[] }>(items: T[], query: string): T[] {
  if (!normalizeText(query)) return items;
  return items
    .map(item => ({ item, score: commandScore(item.value, query, item.keywords) }))
    .filter((entry): entry is { item: T; score: number } => entry.score !== null)
    .sort((a, b) => b.score - a.score)
    .map(entry => entry.item);
}
