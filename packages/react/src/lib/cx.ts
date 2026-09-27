export type ClassValue = string | false | null | undefined | 0;
export const cx = (...values: ClassValue[]) => values.filter(Boolean).join(' ');
/** Atributo data-* de estado, no padrão Radix: data-state="open" | "closed" etc. */
export const dataState = (open: boolean) => (open ? 'open' : 'closed');
export const dataAttr = (condition: unknown) => (condition ? '' : undefined);
