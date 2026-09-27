# Validação · 0.3.0

Versão atual: 0.3.0 (composição Radix-style, núcleo `@fewcompany/core`, 82 componentes). Executada em 27/09/2026, Windows 11, Node 22/24, Chromium headless (Playwright 1.63).

- `npm run build:ui`: core (tsc + concatenação de 80 arquivos CSS em `styles.css`) e adaptador React (tsc + cópia do CSS e tokens).
- `npm run typecheck`: core, react e catálogo sem erros. O react resolve o core pelo `src` via `paths`; o catálogo resolve o `dist`.
- `npm test`: 55 testes em `tests/*.test.mjs` (contratos por categoria + pacote): registry com ids únicos, 82 entradas, versão 0.3.0 e categorias válidas; Slot mescla props; Button `asChild`/loading; Field associa label, `aria-describedby` e `aria-invalid`; Checkbox indeterminate; Switch `role=switch`; Slider `aria-valuenow`; Dialog `aria-labelledby`; menus `role=menu`; Toast `aria-live` e fila do core; tabela vazia; `sortRows`; Accordion `aria-expanded`; `calendarGrid`, `filterOptions`, `parseDate`; `paginationRange`, `nextIndex`, `typeaheadIndex`; arquivos distribuídos com `"use client"`, temas e movimento reduzido.
- `npm run build -w @fewcompany/catalog`: Next 16.3.6, exportação estática, 3 rotas.
- `npm run pack:ui`: `fewcompany-core-0.3.0.tgz` e `fewcompany-ui-0.3.0.tgz`, sem dados de produtos.
- `npm run test:consumer`: instala os dois tarballs em projeto React temporário independente; valida exports, CSS, tokens, core, `asChild`, Field e Tabs sem Next.
- `node scripts/verify-catalog.mjs` com Playwright: navegação, busca, botão em carregamento, temas, modal com Escape e retorno de foco, teclado das abas, deep link `#table`, associação de labels, campo inválido e ausência de overflow em 390px. Sem erros de runtime no navegador.
- Varredura extra: as 82 páginas de componente abertas por hash em 1440px e 390px, sem erro de página, sem erro de console, todas com demo e sem overflow horizontal. Única ocorrência: hashchange disparado antes da hidratação na primeira navegação após o load, que não reproduz em deep link direto nem após a hidratação.

Para repetir o teste de navegador, execute `npm run build`, `npm run preview` e o script em outro terminal com Playwright instalado. `PLAYWRIGHT_MODULE` pode apontar para uma instalação externa do Playwright. Capturas geradas em `artifacts/`.

Limites: não é auditoria completa WCAG; o catálogo foi verificado em Chromium. Testes de contrato usam render estático; interações de ponteiro (Slider, FileUpload, Carousel, ContextMenu, Drawer, Popover) ainda não têm teste automatizado nem revisão manual registrada. Integrações em iFIGHT, Caraminholas e renderer desktop ainda não foram realizadas. Não houve publicação no registro npm.
