# Few UI

Design system da Few Company: núcleo sem framework, adaptador React 19 e catálogo Next.js. O `initial.txt` é a regra de escopo: componentes variados, versões, exemplos com menu lateral e rastreabilidade entre produtos web e desktop.

## Executar

```sh
npm ci
npm run dev
```

Abra http://localhost:3200. O catálogo tem busca, links por hash, quatro temas, exemplos funcionais, página de composição e instruções de uso. `npm run build` compila os pacotes e exporta o catálogo em `apps/catalog/out/`, pronto para hospedar em qualquer servidor estático. Para abrir a exportação localmente, sirva essa pasta por HTTP (`npm run preview`), não `file://`.

```sh
npm run typecheck
npm test
npm run pack:ui
npm run test:consumer
```

## Organização

- `packages/core` (`@fewcompany/core`): tokens, CSS com namespace `few-` (um arquivo por componente, concatenado no build) e lógica headless em funções puras, sem DOM nem framework.
- `packages/react` (`@fewcompany/ui`): adaptador React. Slot/`asChild`, contextos, hooks (`useControllableState`, `useDismiss`, `usePosition`, `useTopLayer`), 82 componentes compostos e o registry do catálogo.
- `packages/angular` (`@fewcompany/angular`): adaptador Angular 22 (standalone, signals, zoneless). Partes como diretivas de atributo, estado por `model()`, testes SSR com platform-server. Contrato em [docs/composition-angular.md](docs/composition-angular.md).
- `packages/vue` (`@fewcompany/vue`): adaptador Vue 3.5 em render functions, `as-child`, `v-model:value`, testes SSR com `@vue/server-renderer`. Contrato em [docs/composition-vue.md](docs/composition-vue.md).
- `apps/catalog`: documentação interativa Next.js, exportada como HTML estático; demos por categoria em `apps/catalog/demos`.
- `docs`: padrão de composição, decisões de marca, integração, adoção, validação e estratégia npm.
- `tests`: contratos por categoria; `scripts/verify-catalog.mjs`: smoke test de navegador com Playwright; `scripts/verify-consumer.mjs`: instala os tarballs em um consumidor independente.

## Padrão de composição

Cada componente é uma raiz com partes, no modelo do Radix: `Tabs`, `Tabs.List`, `Tabs.Trigger`, `Tabs.Content`. Toda parte aceita `asChild` (renderiza o seu elemento, mesclando props e ref), `className` e as props nativas. Estado é controlado ou não (`value/defaultValue/onValueChange`). CSS estiliza por `data-state`. Overlays usam `<dialog>` e `popover` nativos, sem portal, e herdam o tema do contêiner. Detalhes em [docs/composition.md](docs/composition.md).

## Usar em outro produto

Gere os tarballs com `npm run pack:ui`. No consumidor:

```sh
npm install /caminho/fewcompany-core-1.1.0.tgz /caminho/fewcompany-ui-1.1.0.tgz
```

```tsx
import '@fewcompany/ui/styles.css';
import { Button, Card } from '@fewcompany/ui';

export function Example() {
  return <div data-few-theme="few"><Card><Card.Content><Button>Vamos construir</Button></Card.Content></Card></div>;
}
```

Os pacotes ainda não estão publicados no registro npm. Distribuição local e workspaces funcionam agora. Publicação restrita exige configurar o escopo, a conta e o acesso npm. Veja [a avaliação de viabilidade](docs/npm-strategy.md).

## Origem e adoção

A marca segue fewcompany.com: azul profundo #0A0A1F, magenta #FF2ECC, lavanda #C9AFFF e azul #38B6FF, com Poppins no catálogo e tipografia de sistema como fallback na biblioteca. Caraminholas inspira formulários, checkout e operações; iFIGHT inspira indicadores, variantes e temas escuros. As APIs seguem Radix, PrimeReact e Material UI como referência, citadas por componente. Nenhum serviço, dado de cliente ou segredo foi copiado.

**Consumidor integrado: o catálogo.** Caraminholas e iFIGHT são referências, com migração ainda pendente. O registro não afirma que esses apps já importam o pacote. Consulte [a matriz de adoção](docs/adoption.md).

Compatibilidade web foi validada no catálogo Next e no pacote React. Electron/Tauri devem usar a biblioteca no renderer e receber smoke test no consumidor. Este pacote não oferece componentes nativos de React Native.

Licença: uso interno, `UNLICENSED`, até decisão explícita sobre distribuição pública. Poppins é carregada e hospedada pelo Next no catálogo. A biblioteca permite herdar a fonte do aplicativo e inclui fallback de sistema.
