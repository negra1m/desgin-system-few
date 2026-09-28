# Padrão de composição no Vue

Contrato do adaptador `@fewcompany/vue` (`packages/vue`). A referência viva é `packages/vue/src/components/navigation/tabs.ts` + `packages/vue/src/demos/navigation.ts`. A **fonte da verdade de cada componente é a implementação React** em `packages/react/src/components/<categoria>/<nome>.tsx`: mesmas partes, classes `few-*`, `data-state`/`aria-*` e teclado. O CSS é o mesmo do core; o Vue não tem CSS próprio.

Componentes são escritos em TypeScript com `defineComponent` + render functions (`h`), sem SFC e sem compilador de template: o pacote compila só com `tsc`.

## Mapeamento React → Vue

| React | Vue |
|---|---|
| `Foo` (Root) + `Foo.Part` | `FewFoo` + `FewFooPart` (`defineComponent({ name: 'FewFooPart' })`), exports planos |
| `asChild` / Slot | prop `asChild: Boolean` + `renderPrimitive(tag, props.asChild, mergedProps, slots, wrap?)` (clona o único filho do slot com `mergeProps`) |
| Parte que envolve `children` com markup (spinner, indicador) | o parâmetro `wrap` de `renderPrimitive` recebe os filhos e devolve os filhos finais |
| Props nativas / `className` | `inheritAttrs: false` + `mergeProps(attrs, { class: 'few-foo', … })` (class/style concatenam, `onX` encadeiam) |
| `value/defaultValue/onValueChange` | props `value` (default `undefined`) + `defaultValue` + emit `update:value` via `useControllable` → `v-model:value` |
| `open/onOpenChange`, `checked/onCheckedChange` | `open`/`update:open`, `checked`/`update:checked` (`v-model:open`, `v-model:checked`) |
| Callbacks (`onSelect`) | `emits: ['select']` |
| Contexto (`createContext`) | `createContext<T>('FewFoo')` → `[provideFoo, useFoo, useFooOptional]` (provide/inject) |
| `useId` | `useId('foo')` no setup |
| Parte que retorna `null` | render function retorna `null` (desmonta), `forceMount` mantém com `hidden` |
| `useDismiss`, `usePosition`, `useTopLayer` | mesmos nomes na lib, chamados no setup com getters/refs |
| `moveFocus` | `moveFocus` (mesma assinatura) |
| `useToast()` | `useToast()` composable com estado em módulo (fila via `enqueueToast` do core) |
| `VisuallyHidden` | `FewVisuallyHidden` |
| `Portal` | Sem equivalente: `<dialog>` e `popover` nativos (o `Teleport` do Vue perderia o tema do contêiner) |

## Regras

1. **Render functions**: `setup(props, { slots, attrs, emit })` retorna `() => renderPrimitive(...)`. Slots sempre como função (`slots.default?.()`), nunca arrays diretos em `h(Component, props, [...])`.
2. **Refs de DOM**: `const host = ref<HTMLElement | null>(null)` e `ref: host` nas props do primitive. Com `asChild`, o ref mescla no filho (`cloneVNode(..., true)`).
3. **Estado reativo**: `useControllable` para tudo que o React controla; `computed` para derivados; efeitos com `watch`/`watchEffect` (`flush: 'post'` quando toca DOM) e `onScopeDispose` para limpar. Guarde DOM com `typeof document !== 'undefined'` (SSR).
4. **Atributos**: mesmos `role`, `aria-*`, `data-state`, `data-disabled` (`dataAttr()`), `tabindex`, `type="button"`. Booleanos HTML: `disabled: props.disabled || undefined` (Vue omite `undefined`/`false` corretamente para atributos booleanos).
5. **Overlays**: `<dialog>` nativo com `showModal()/close()` num `watch` sobre `open`; popovers com `popover: 'manual'` + `useTopLayer` + `usePosition` + `useDismiss`. Foco volta ao trigger ao fechar.
6. **Sem dependências** além de `vue` e `@fewcompany/core`. Lógica pura vem do core (`nextIndex`, `typeaheadIndex`, `clamp`, `paginationRange`, `computeFloatingPosition`, `calendarGrid`, `filterOptions`, `sortRows`, …).
7. **Imports relativos com sufixo `.js`**.

## Onde cada coisa vive

- Componente: `packages/vue/src/components/<cat>/<nome>.ts`, exportado em `components/<cat>/index.ts` (barrel já existe).
- Demo/host de teste: `packages/vue/src/demos/<cat>.ts`, um `defineComponent` por id do registry, registrado em `<CAT>_DEMOS` (render functions com `h`, textos em português).
- Teste: `tests/vue/<cat>.test.mjs` com `node:test`, importando `renderComponent` e `<CAT>_DEMOS` de `./_render.mjs` (SSR via `@vue/server-renderer`). 3 a 8 asserções de contrato por categoria.

## Validação

```
npm run typecheck -w @fewcompany/vue   # tsc, resolve o core pelo src (sem build)
npm run build:vue                      # dist (usado pelos testes)
node --test tests/vue/<cat>.test.mjs   # exige build:vue
```

Em trabalho paralelo, ignore erros de outras categorias; os seus devem zerar.
