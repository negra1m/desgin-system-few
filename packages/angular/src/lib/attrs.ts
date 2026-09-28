/** Valor para host binding `[attr.data-x]`: '' quando verdadeiro, null remove o atributo. */
export const dataAttr = (condition: unknown): '' | null => (condition ? '' : null);
export const dataState = (open: boolean) => (open ? 'open' : 'closed');
