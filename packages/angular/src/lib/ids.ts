let counter = 0;
/** Id único e estável por instância (chame no campo da classe). Prefixo em kebab-case. */
export function fewId(prefix: string): string { counter += 1; return `few-${prefix}-${counter}`; }
