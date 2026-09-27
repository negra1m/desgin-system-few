# Padrão de composição (Radix-style)

Contrato obrigatório para todo componente da biblioteca. A referência viva é `packages/react/src/components/navigation/tabs.tsx` + `packages/core/src/styles/components/tabs.css`. Copie o padrão, não invente outro.

## Pacotes

| Pacote | Pasta | Conteúdo |
|---|---|---|
| `@fewcompany/core` | `packages/core` | tokens, CSS `few-*`, lógica headless (funções puras, sem DOM, sem React) |
| `@fewcompany/ui` | `packages/react` | adaptador React: Slot/`asChild`, contextos, hooks, componentes compostos, registry |
| reservados | `packages/angular`, `packages/vue` | só README por enquanto |

## Onde cada coisa vive

Para um componente `Foo` da categoria `<cat>` (utilities, actions, forms, pickers, navigation, overlays, feedback, data, layout, typography):

- Componente: `packages/react/src/components/<cat>/foo.tsx` e `export * from './foo.js'` no `components/<cat>/index.ts`.
- CSS: `packages/core/src/styles/components/foo.css` (concatenado em ordem alfabética no build; nunca edite `base.css` sem necessidade).
- Lógica pura (cálculo de índice, grade de calendário, filtro, faixas): `packages/core/src/headless/<cat>.ts`. Sem `document`, `window` ou React. O React só liga estado a DOM.
- Registry: um `component({...})` em `packages/react/src/registry/<cat>.ts`.
- Demo do catálogo: `apps/catalog/app/demos/<cat>.tsx`, chave = `id` do registry.
- Testes: `tests/<cat>.test.mjs` com `node:test` + `renderToStaticMarkup` importando de `../packages/react/dist/index.js`.

## Anatomia de um componente composto

```tsx
"use client";                      // sempre, em todo arquivo de componente
import { createContext } from '../../lib/context.js';
import { Slot } from '../../lib/slot.js';
import { useControllableState } from '../../lib/use-controllable-state.js';
import { cx, dataAttr, dataState } from '../../lib/cx.js';

const [FooProvider, useFoo] = createContext<FooContextValue>('Foo');

function FooRoot({ asChild, value, defaultValue, onValueChange, className, ...props }: FooProps) {
  const [current, setCurrent] = useControllableState({ value, defaultValue, onChange: onValueChange });
  const Comp = asChild ? Slot : 'div';
  return <FooProvider value={{ current, setCurrent }}><Comp {...props} className={cx('few-foo', className)} data-state={dataState(open)} /></FooProvider>;
}
function FooTrigger({ asChild, className, ...props }: FooTriggerProps) {
  const ctx = useFoo('Foo.Trigger');
  const Comp = asChild ? Slot : 'button';
  return <Comp {...props} type="button" className={cx('few-foo-trigger', className)} />;
}

export const Foo = Object.assign(FooRoot, { Root: FooRoot, Trigger: FooTrigger, Content: FooContent });
export { FooRoot, FooTrigger, FooContent };
```

Regras:

1. **Partes**: `Root` é o próprio `Foo`; partes ficam como estáticos (`Foo.Trigger`) e também como exports planos (`FooTrigger`). Nomes de partes seguem Radix: Root, Trigger, Content, List, Item, Label, Description, Title, Close, Indicator, Thumb, Track, Group, Separator, Portal, Overlay, Anchor, Arrow, Value, Viewport.
2. **`asChild`** em toda parte que renderiza um elemento. `const Comp = asChild ? Slot : 'tag'`. Use `Slottable` quando a parte envolve `children` com outros nós (ícone + texto, spinner).
3. **Props nativas**: `extends ComponentProps<'tag'>`; espalhe `...props` primeiro e sobrescreva depois; `className` sempre mesclado com `cx`. `ref` é prop normal no React 19 (sem forwardRef).
4. **Estado**: `value/defaultValue/onValueChange`, `open/defaultOpen/onOpenChange`, `checked/defaultChecked/onCheckedChange` via `useControllableState`. Nunca só controlado.
5. **Atributos de estado** para CSS: `data-state` (`open|closed`, `active|inactive`, `checked|unchecked|indeterminate`, `on|off`), `data-disabled`, `data-orientation`, `data-side`, `data-highlighted`, `data-invalid`. CSS estiliza por esses atributos, não por classes de estado.
6. **Classes**: `few-<comp>` na raiz, `few-<comp>-<parte>` nas partes. Sem estilos em tags globais. Só tokens `--few-*` (cores, `--few-radius`, `--few-ring`, `--few-fast`, `--few-shadow`, `--few-overlay`). A raiz define `font-family:var(--few-font);color:var(--few-ink)`; filhos usam `font:inherit`.
7. **Acessibilidade**: roles/aria WAI-ARIA APG, teclado completo (setas via `moveFocus` da lib, Home/End, Escape, Enter/Espaço), foco visível `outline:var(--few-ring);outline-offset:var(--few-ring-offset)`, `aria-disabled`/`disabled`, labels. Movimento reduzido já é tratado no `base.css`; não adicione animações essenciais.
8. **Overlays**: prefira `<dialog>` (modal) e o atributo `popover="manual"` + `useTopLayer` (não modal) em vez de Portal, para o tema do contêiner ser herdado. Posicione com `usePosition(anchorRef, contentRef, { side, align })` e feche com `useDismiss`. Foco volta ao trigger ao fechar.
9. **Headless primeiro**: se existe cálculo (índice seguinte, faixa, grade, filtro, formatação), escreva como função pura no `core` e teste mentalmente sem DOM. Reaproveite `nextIndex`, `typeaheadIndex`, `clamp`, `roundToStep`, `paginationRange`, `getInitials` de `@fewcompany/core`.
10. **Sem dependências** novas. Sem imports de Next, de produtos ou de caminhos absolutos. Sem dados de clientes.
11. **Componentes simples** (Badge, Kbd, Separator) seguem o mesmo contrato, só sem contexto: `asChild`, `className`, props nativas, `data-*`.

## Lib disponível (`packages/react/src/lib`)

`Slot`, `Slottable`, `createContext`, `useControllableState`, `cx`, `dataState`, `dataAttr`, `composeRefs`, `mergeProps`, `Portal`, `VisuallyHidden`, `useDismiss`, `usePosition`, `useTopLayer`, `moveFocus`, `focusableItems`. Importe por caminho relativo (`../../lib/slot.js`), com sufixo `.js`.

## Registry

```ts
component({ id: 'tabs', name: 'Tabs', category: 'Navegação', description: 'Uma frase em português, útil, sem jargão.',
  variants: ['horizontal', 'vertical', 'manual activation'], parts: ['Root', 'List', 'Trigger', 'Content'],
  origins: ['iFIGHT · navegação de painéis'], references: ['Radix Tabs', 'PrimeReact TabView'],
  code: '<Tabs defaultValue="a"><Tabs.List><Tabs.Trigger value="a">A</Tabs.Trigger></Tabs.List><Tabs.Content value="a">…</Tabs.Content></Tabs>' })
```

`id` em kebab-case, único, é o que o catálogo usa na URL (`#tabs`). `origins` cita padrões reais dos produtos (Caraminholas, iFIGHT) ou `Few · novo padrão`.

## Demo do catálogo

Em `apps/catalog/app/demos/<cat>.tsx`, `export const <cat>Demos: DemoMap = { tabs: TabsDemo }`. Cada demo é um componente React com estado local, textos em português, mostra as variantes principais, e funciona em 390px. Classes utilitárias do catálogo: `demo-stack` (coluna), `demo-row` (linha com wrap), `demo-grid` (2 colunas), `demo-narrow` (max 360px), `few-muted`.

## Como validar o que você fez

```
npm run typecheck -w @fewcompany/ui         # tsc do adaptador React (resolve o core pelo src, sem build)
npm run build:ui                            # core + react em dist (o catálogo consome o dist)
npm run typecheck -w @fewcompany/catalog
npm test                                    # contratos em tests/*.test.mjs (usa dist)
```

Erros de tipo em arquivos de outras categorias podem ser ignorados enquanto o trabalho está em paralelo; os seus devem zerar. O catálogo Next resolve `@fewcompany/ui` pelo `dist`: não use `paths` no tsconfig do catálogo, o Turbopack não resolve imports `.js` apontando para fontes `.ts`.
