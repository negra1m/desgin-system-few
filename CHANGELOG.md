# Changelog

## 1.0.0

- **Padrão oficial.** A partir desta versão, o design system é a base obrigatória de todos os projetos React/Next da Few, salvo indicação explícita em contrário. Componentes importantes ausentes viram PR de novo componente; componentes ruins viram PR de correção na lib. Qualquer atraso causado pela lib deve ser reportado.
- **Composição (mudança incompatível).** Toda a API passa ao padrão de componentes compostos: raiz + partes (`Tabs`, `Tabs.List`, `Tabs.Trigger`, `Tabs.Content`), `asChild` via Slot em toda parte, estado controlado ou não (`value/defaultValue/onValueChange`), atributos `data-state` para CSS. Props antigas como `items`, `title`, `label` em Tabs, Dialog, Alert, Field e Progress deixam de existir. `MetricCard` e `CardHeader` seguem como atalhos `@deprecated` sobre `Stat` e `Card`.
- **Novo pacote `@fewcompany/core`.** Tokens, CSS e lógica headless (funções puras, sem DOM) saem do adaptador React para um núcleo sem framework. `packages/angular` e `packages/vue` ficam reservados para adaptadores futuros sobre o mesmo core e CSS.
- **82 componentes** em nove categorias: Utilitários (3), Ações (7), Formulários (24), Navegação (7), Overlays (9), Feedback (8), Dados (12), Estrutura (8), Tipografia (4). Referências de API: Radix, PrimeReact e Material UI.
- Overlays usam `<dialog>` nativo e o atributo `popover` (top layer) em vez de portais, preservando o tema do contêiner. Posicionamento e dismiss próprios, sem dependências.
- Catálogo: menu por categoria, página de Composição, anatomia (partes) por componente, demos em `apps/catalog/demos`.
- Distribuição: dois tarballs (`fewcompany-core`, `fewcompany-ui`). Testes de contrato por categoria em `tests/`.

## 0.2.0

- Identidade alinhada ao site atual da Few: #0A0A1F, #FF2ECC, #C9AFFF e #38B6FF.
- Catálogo escuro com Poppins, gradientes de marca e símbolo oficial em composição SVG/CSS com profundidade, órbitas e parallax.
- Pausa explícita da animação, respeito a movimento reduzido e composição adaptada para mobile.
- Tokens da biblioteca atualizados; tema Few minimal e presets Caraminholas/iFIGHT preservados.
- Mudança visual: o tema padrão `few` passa a ser escuro. Consumidores que dependiam do tema claro anterior devem escolher um preset claro ou sobrescrever os tokens semânticos antes de atualizar.

## 0.1.0

- Biblioteca React com 17 entradas de catálogo e auxiliares Field/CardHeader.
- Tokens, quatro temas, CSS com namespace e preferências de movimento reduzido.
- Catálogo Next exportável para HTML, menu lateral, busca, deep links e exemplos interativos.
- Rastreabilidade de origem, versões e adoção, sem presumir migração de produtos.
- Pacote npm instalável via tarball e parecer de distribuição interna.
