// Headless da categoria "feedback". Funções puras (sem DOM) usadas pelos adaptadores: React hoje, Angular/Vue depois.
import { clamp } from './shared.js';

/** Percentual 0–100 a partir de value/max. value=null (indeterminado) propaga null. max<=0 evita divisão por zero. */
export function progressPercent(value: number | null, max = 100): number | null {
  if (value === null) return null;
  if (max <= 0) return 0;
  return clamp((value / max) * 100, 0, 100);
}

/** Texto acessível padrão para o valor de um progresso, ex.: "72%". undefined quando indeterminado. */
export function progressValueText(percent: number | null): string | undefined {
  if (percent === null) return undefined;
  return `${Math.round(percent)}%`;
}
