# Padrão de composição no Angular

Contrato do adaptador `@fewcompany/angular` (`packages/angular`). A referência viva é `packages/angular/src/components/navigation/tabs.ts` + `packages/angular/src/demos/navigation.ts`. A **fonte da verdade de cada componente é a implementação React** em `packages/react/src/components/<categoria>/<nome>.tsx`: mesmas partes, mesmas classes `few-*`, mesmos `data-state`/`aria-*`, mesmo teclado. O CSS é o mesmo do core; o Angular não tem CSS próprio.

## Mapeamento React → Angular

| React | Angular |
|---|---|
| `Foo` (Root) + `Foo.Part` | `FewFoo` + `FewFooPart`, seletores de atributo `[fewFoo]`, `[fewFooPart]`; `FEW_FOO = [FewFoo, FewFooPart, …] as const` |
| `asChild` / Slot | Não existe: a parte é uma diretiva aplicada no elemento do consumidor (`<a fewButton>`, `<button fewTabsTrigger>`) |
| Parte que envolve `children` com markup (spinner, indicador) | `@Component` com seletor de atributo e `<ng-content>` |
| Parte sem markup próprio | `@Directive` com `host: {}` |
| `value/defaultValue/onValueChange` | `value = model<T>(default)` → `[(value)]` (controlado) ou `[value]` / nada (não controlado) |
| `open/onOpenChange`, `checked/onCheckedChange` | `open = model(false)`, `checked = model(false)` |
| Props de opção (`orientation`, `size`, `variant`) | `input<T>('default')`; flags com `input(false, { transform: booleanAttribute })` |
| Callbacks (`onSelect`) | `select = output<T>()` |
| Contexto (`createContext`) | `inject(FewFoo)`; opcional com `{ optional: true }`; Root com `exportAs: 'fewFoo'` |
| `useId` | `readonly baseId = fewId('foo')` (campo da classe) |
| Parte que retorna `null` quando inativa | Fica no DOM com `[hidden]` (equivale a `forceMount`); consumidor usa `@if` para desmontar |
| `useDismiss`, `usePosition`, `useTopLayer` | `setupDismiss`, `setupPosition`, `setupTopLayer` chamados no construtor (contexto de injeção) com signals |
| `moveFocus` | `moveFocus` (mesma assinatura) |
| `useToast()` | Serviço injetável `FewToastService` (`providedIn: 'root'`) com `toast()` e `dismiss()` |
| `VisuallyHidden` | `[fewVisuallyHidden]` |
| `Portal` | Sem equivalente: `<dialog>` e `popover` nativos |

## Regras

1. **Zoneless e SSR.** Só signals (`input`, `model`, `computed`, `signal`, `effect`). DOM apenas em `afterNextRender`/`afterRenderEffect`/handlers, guardado por `typeof document !== 'undefined'`. Nada de `ngZone`, `setTimeout` para forçar CD, nem `@HostBinding`/`@HostListener`: use o objeto `host`.
2. **Host bindings** para tudo que o React coloca no elemento: `class`, `role`, `type`, `[id]`, `[attr.aria-*]`, `[attr.data-state]`, `[attr.data-disabled]` (use `dataAttr()`: `''` ou `null`), `[attr.tabindex]`, `(click)`, `(keydown)`. Classes fixas via `class: 'few-foo-part'` (Angular mescla com a classe do consumidor).
3. **Estado** sempre em `model()`/`input()`; nunca `@Input()`/`@Output()` decoradores. Métodos públicos no Root para as partes chamarem (`select()`, `setOpen()`), não acesso direto ao signal privado.
4. **Acessibilidade e teclado** idênticos ao React: leia o `.tsx` correspondente e reproduza cada atributo e tecla.
5. **Overlays**: `<dialog fewDialogContent>` com `showModal()/close()` em `effect` sobre `open()`; popovers com `popover="manual"` no host + `setupTopLayer` + `setupPosition` (aplique `[style.position]="'fixed'"`, `[style.top.px]`, `[style.left.px]`, `[attr.data-side]`) + `setupDismiss`. Foco volta ao trigger ao fechar.
6. **Sem dependências** além de `@angular/core`, `@angular/common` e `@fewcompany/core`. Sem `@angular/cdk`, sem `@angular/forms` (ControlValueAccessor fica para depois; não é escopo).
7. **Lógica pura** vem de `@fewcompany/core` (`nextIndex`, `typeaheadIndex`, `clamp`, `roundToStep`, `paginationRange`, `getInitials`, `computeFloatingPosition`, `calendarGrid`, `filterOptions`, `sortRows`, `distributePin`, …). Não reimplemente o que existe lá; se o React precisou de uma função pura nova, ela já está no core.
8. **Imports relativos com sufixo `.js`** (`'../../lib/ids.js'`), como no React.

## Onde cada coisa vive

- Componente: `packages/angular/src/components/<cat>/<nome>.ts`, exportado em `components/<cat>/index.ts` (barrel já existe).
- Demo/host de teste: `packages/angular/src/demos/<cat>.ts`, um `@Component` por id do registry (`selector: 'few-demo-<id>'`, `imports: [FEW_FOO]`, template inline), registrado em `<CAT>_DEMOS`. Textos em português, mesmos exemplos das demos React quando fizer sentido.
- Teste: `tests/angular/<cat>.test.mjs` com `node:test`, importando `renderComponent` e `<CAT>_DEMOS` de `./_render.mjs` (SSR via platform-server, sem navegador). 3 a 8 asserções de contrato por categoria (roles, aria, data-state, ids ligados).

## Validação

```
npm run typecheck -w @fewcompany/angular   # ngc com strictTemplates, resolve o core pelo src (sem build)
npm run build:angular                      # dist (parcial, publicável) + dist-full (para os testes SSR)
node --test tests/angular/<cat>.test.mjs   # exige build:angular
```

Erros de template aparecem no typecheck (`strictTemplates`). Em trabalho paralelo, ignore erros de outras categorias; os seus devem zerar.
