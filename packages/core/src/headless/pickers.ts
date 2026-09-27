// Headless da categoria "pickers". Funções puras (sem DOM, sem Intl) usadas pelos adaptadores: React hoje, Angular/Vue depois.

/** Remove acentos e normaliza caixa para comparação de texto. Uso interno de filterOptions. */
function normalizeText(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/** Filtra opções cujo rótulo contém o texto digitado (sem acento, sem caixa). Texto vazio devolve tudo. */
export function filterOptions<T>(options: readonly T[], query: string, getLabel: (option: T) => string): T[] {
  const needle = normalizeText(query);
  if (!needle) return [...options];
  return options.filter(option => normalizeText(getLabel(option)).includes(needle));
}

// ---- Datas: comparação, aritmética e faixas ----

/** Meia-noite local do dia (zera hora/min/seg/ms). */
export const startOfDay = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** Primeiro dia do mês, meia-noite local. */
export const startOfMonth = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1);

export const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export const addDays = (date: Date, amount: number): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);

/** Soma meses preservando o dia quando possível (cai no último dia do mês de destino quando estoura, ex.: 31/jan + 1 mês = 28 ou 29/fev). */
export function addMonths(date: Date, amount: number): Date {
  const day = date.getDate();
  const result = new Date(date.getFullYear(), date.getMonth() + amount, 1);
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(day, lastDay));
  return result;
}

export const addYears = (date: Date, amount: number): Date => addMonths(date, amount * 12);

/** Restringe `date` ao intervalo [min, max] quando informados (compara por dia). */
export function clampDate(date: Date, min?: Date, max?: Date): Date {
  const day = startOfDay(date);
  if (min && day < startOfDay(min)) return startOfDay(min);
  if (max && day > startOfDay(max)) return startOfDay(max);
  return day;
}

export interface DateRange { from?: Date; to?: Date }

/** Verdadeiro quando `date` está entre `from` e `to` (inclusive, ordem livre). Falso se a faixa estiver incompleta. */
export function isInRange(date: Date, range: DateRange): boolean {
  if (!range.from || !range.to) return false;
  const [start, end] = range.from.getTime() <= range.to.getTime() ? [range.from, range.to] : [range.to, range.from];
  const day = startOfDay(date).getTime();
  return day >= startOfDay(start).getTime() && day <= startOfDay(end).getTime();
}

export interface DateBounds { min?: Date; max?: Date; disabledDates?: (date: Date) => boolean }

/** Verdadeiro quando a data está fora de [min, max] ou marcada por `disabledDates`. */
export function isDateDisabled(date: Date, { min, max, disabledDates }: DateBounds = {}): boolean {
  const day = startOfDay(date).getTime();
  if (min && day < startOfDay(min).getTime()) return true;
  if (max && day > startOfDay(max).getTime()) return true;
  return disabledDates?.(date) ?? false;
}

/**
 * Semanas (arrays de 7 dias) que cobrem o mês, incluindo dias de fora para completar a
 * primeira e a última semana. `weekStartsOn`: 0 = domingo … 6 = sábado.
 */
export function calendarGrid(year: number, month: number, weekStartsOn = 0): Date[][] {
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);
  const leading = (firstOfMonth.getDay() - weekStartsOn + 7) % 7;
  const trailing = (weekStartsOn + 6 - lastOfMonth.getDay() + 7) % 7;
  const totalDays = leading + lastOfMonth.getDate() + trailing;
  const gridStart = addDays(firstOfMonth, -leading);
  const weeks: Date[][] = [];
  for (let week = 0; week < totalDays / 7; week++) {
    weeks.push(Array.from({ length: 7 }, (_, day) => addDays(gridStart, week * 7 + day)));
  }
  return weeks;
}

// ---- dd/mm/aaaa ----

const DATE_PATTERN = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

/** Formata como dd/mm/aaaa. */
export function formatDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

/** Interpreta dd/mm/aaaa. Retorna null quando o texto não é uma data válida (incl. datas inexistentes como 31/02). */
export function parseDate(text: string): Date | null {
  const match = DATE_PATTERN.exec(text.trim());
  if (!match) return null;
  const day = Number(match[1]), month = Number(match[2]), year = Number(match[3]);
  if (month < 1 || month > 12 || day < 1) return null;
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}
