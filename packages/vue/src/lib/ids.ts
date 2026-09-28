let counter = 0;
/** Id único e estável por instância (chame no setup). Prefixo em kebab-case. */
export function useId(prefix: string): string { counter += 1; return `few-${prefix}-${counter}`; }
