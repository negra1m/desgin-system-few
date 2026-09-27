"use client";
import { createContext as createReactContext, useContext as useReactContext, type ReactNode } from 'react';

/**
 * Contexto tipado para componentes compostos.
 * `const [TabsProvider, useTabs] = createContext<TabsContext>('Tabs')`.
 * O hook lança erro claro quando uma parte é usada fora da raiz.
 */
export function createContext<T>(name: string, defaultValue?: T) {
  const Context = createReactContext<T | undefined>(defaultValue);
  function Provider({ value, children }: { value: T; children: ReactNode }) { return <Context value={value}>{children}</Context>; }
  function useContext(part: string): T {
    const value = useReactContext(Context);
    if (value === undefined) throw new Error(`<${part}> deve ser usado dentro de <${name}>.`);
    return value;
  }
  function useOptionalContext(): T | undefined { return useReactContext(Context); }
  return [Provider, useContext, useOptionalContext] as const;
}
