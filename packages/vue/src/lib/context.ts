import { inject, provide, type InjectionKey } from 'vue';

/**
 * Contexto tipado para componentes compostos: `const [provideTabs, useTabs] = createContext<TabsContext>('FewTabs')`.
 * O hook lança erro claro quando uma parte é usada fora da raiz; a terceira função é a versão opcional.
 */
export function createContext<T>(name: string) {
  const key: InjectionKey<T> = Symbol(name);
  const provideValue = (value: T) => provide(key, value);
  const useValue = (part: string): T => { const value = inject(key, null); if (value === null) throw new Error(`<${part}> deve ser usado dentro de <${name}>.`); return value; };
  const useOptional = (): T | null => inject(key, null);
  return [provideValue, useValue, useOptional] as const;
}
