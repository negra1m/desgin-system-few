// Headless da categoria "forms". Funções puras (sem DOM) usadas pelos adaptadores: React hoje, Angular/Vue depois.
import { clamp, roundToStep } from './shared.js';

/** Distribui uma string colada/digitada pelos slots do PinInput a partir de `start`. Ignora espaços. */
export function distributePin(chars: string[], text: string, start: number, length: number): string[] {
  const digits = text.replace(/\s/g, '').split('');
  const next = chars.slice(0, length);
  while (next.length < length) next.push('');
  digits.forEach((ch, i) => { if (start + i < length) next[start + i] = ch; });
  return next;
}

/** Índice do slot em que o foco deve pousar depois de preencher `filled` caracteres a partir de `start`. */
export function nextPinIndex(start: number, filled: number, length: number): number {
  return clamp(start + filled, 0, length - 1);
}

/** Valor mais próximo (alinhado ao step) de uma posição percentual [0,100] no eixo do slider. */
export function valueFromPercent(percent: number, min: number, max: number, step: number): number {
  const raw = min + (clamp(percent, 0, 100) / 100) * (max - min);
  return clamp(roundToStep(raw, step, min), min, max);
}

/** Posição percentual [0,100] correspondente a um valor do slider. */
export function percentFromValue(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return clamp(((value - min) / (max - min)) * 100, 0, 100);
}

/** Índice do thumb cujo valor está mais perto de `value` (para saber qual thumb mover num slider de faixa). */
export function closestThumbIndex(values: number[], value: number): number {
  let closest = 0;
  let bestDistance = Infinity;
  values.forEach((current, index) => {
    const distance = Math.abs(current - value);
    if (distance < bestDistance) { bestDistance = distance; closest = index; }
  });
  return closest;
}

/** Formata bytes em unidade legível (B, KB, MB, GB). */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, exponent);
  const formatted = exponent === 0 ? String(value) : value.toFixed(value < 10 ? 1 : 0);
  return `${formatted} ${units[exponent]}`;
}

export interface FileValidationOptions { accept?: string; maxSize?: number }
/** Valida um arquivo por extensão/mime (accept) e tamanho máximo. Retorna a mensagem de erro ou null. */
export function validateFile(file: { name: string; type: string; size: number }, { accept, maxSize }: FileValidationOptions): string | null {
  if (maxSize !== undefined && file.size > maxSize) return `Arquivo maior que ${formatFileSize(maxSize)}.`;
  if (accept) {
    const patterns = accept.split(',').map(pattern => pattern.trim()).filter(Boolean);
    const matches = patterns.some(pattern => {
      if (pattern.startsWith('.')) return file.name.toLowerCase().endsWith(pattern.toLowerCase());
      if (pattern.endsWith('/*')) return file.type.startsWith(pattern.slice(0, -1));
      return file.type === pattern;
    });
    if (patterns.length && !matches) return 'Tipo de arquivo não permitido.';
  }
  return null;
}

/** Divide texto colado/digitado em tags por vírgula, descartando vazias. */
export function splitTags(raw: string): string[] {
  return raw.split(',').map(tag => tag.trim()).filter(Boolean);
}

export interface AddTagsOptions { max?: number; allowDuplicates?: boolean }
/** Adiciona tags a uma lista respeitando duplicidade e limite máximo. */
export function addTags(current: string[], incoming: string[], { max, allowDuplicates = false }: AddTagsOptions = {}): string[] {
  const next = current.slice();
  for (const tag of incoming) {
    if (!tag) continue;
    if (!allowDuplicates && next.includes(tag)) continue;
    if (max !== undefined && next.length >= max) break;
    next.push(tag);
  }
  return next;
}

/** Alterna um valor dentro de um array (usado pelo CheckboxGroup). */
export function toggleValue(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter(current => current !== value) : [...values, value];
}
