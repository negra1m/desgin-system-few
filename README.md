# Few UI

Biblioteca React compartilhada e catálogo Next.js da Few Company. O `initial.txt` é a regra de escopo deste MVP: componentes variados, versões, exemplos com menu lateral e rastreabilidade entre produtos web e desktop.

## Executar

```sh
npm ci
npm run dev
```

Abra http://localhost:3200. O catálogo tem busca, links por hash, quatro temas, exemplos funcionais e instruções de uso. `npm run build` compila a biblioteca e exporta o catálogo em `apps/catalog/out/`, pronto para hospedar em qualquer servidor estático. Para abrir a exportação localmente, sirva essa pasta por HTTP (não `file://`, pois os assets usam caminhos absolutos).

```sh
npm run typecheck
npm test
npm run pack:ui
```

## Organização

- `packages/ui`: componentes React 19 em TypeScript, CSS com namespace `few-`, tokens e registro de componentes. Sem dependência de Next, Tailwind ou serviços externos no runtime da biblioteca.
- `apps/catalog`: documentação interativa Next.js, exportada como HTML estático.
- `docs`: decisões de marca, integração, adoção e estratégia npm.
- `tests`: contrato do pacote; `scripts/verify-catalog.mjs`: smoke test de navegador com Playwright.

O catálogo contém 17 entradas. `Field` e `CardHeader` são componentes auxiliares documentados junto aos exemplos. Button inclui tamanhos, variantes e estado loading; Tabs inclui teclado; Dialog usa a modalidade nativa do navegador; DataTable tem legenda e cabeçalhos semânticos.

## Usar em outro produto

Gere o tarball com `npm run pack:ui`. No consumidor:

```sh
npm install /caminho/fewcompany-ui-0.2.0.tgz
```

```tsx
import '@fewcompany/ui/styles.css';
import { Button, Card } from '@fewcompany/ui';

export function Example() {
  return <div data-few-theme="few"><Card><Button>Vamos construir</Button></Card></div>;
}
```

O pacote ainda não está publicado no registro npm. Distribuição local e workspaces funcionam agora. Publicação restrita exige configurar o escopo, a conta e o acesso npm. Veja [a avaliação de viabilidade](docs/npm-strategy.md).

## Origem e adoção

A marca segue fewcompany.com: azul profundo #0A0A1F, magenta #FF2ECC, lavanda #C9AFFF e azul #38B6FF, com Poppins no catálogo e tipografia de sistema como fallback na biblioteca. Caraminholas inspira formulários, checkout e operações; iFIGHT inspira indicadores, variantes e temas escuros. Os componentes foram generalizados para uma API compartilhada; nenhum serviço, dado de cliente ou segredo foi copiado.

**Consumidor integrado: o catálogo.** Caraminholas e iFIGHT são referências, com migração ainda pendente. O registro não afirma que esses apps já importam o pacote. Consulte [a matriz de adoção](docs/adoption.md).

Compatibilidade web foi validada no catálogo Next e no pacote React. Electron/Tauri devem usar a biblioteca no renderer e receber smoke test no consumidor. Este pacote não oferece componentes nativos de React Native.

Licença: uso interno, `UNLICENSED`, até decisão explícita sobre distribuição pública. Poppins é carregada e hospedada pelo Next no catálogo. A biblioteca permite herdar a fonte do aplicativo e inclui fallback de sistema.
