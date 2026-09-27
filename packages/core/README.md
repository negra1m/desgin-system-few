# @fewcompany/core

Base sem framework do design system da Few Company: tokens, CSS (`styles.css`, classes `few-*`, temas por `data-few-theme`) e lógica headless (funções puras, sem DOM).

- Adaptadores consomem este pacote: `@fewcompany/ui` (React) hoje; `packages/angular` e `packages/vue` reservados.
- `src/headless/<categoria>.ts` exporta funções puras: navegação por teclado, faixas de paginação, grade de calendário, filtro de opções.
- `src/styles/base.css` tem temas e utilidades. `src/styles/components/<nome>.css` é concatenado em ordem alfabética no build.
