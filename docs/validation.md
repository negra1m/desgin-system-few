# Validação · 1.1.0

Versão atual: 1.1.0 (adaptadores Angular e Vue sobre o mesmo core e CSS da 1.0.0). Executada em 28/09/2026, Windows 11, Node 22/24, Angular 22.2, Vue 3.5.43, Chromium headless (Playwright 1.63).

- `npm run build`: core (80 CSS concatenados), React, Angular (`ngc` parcial em `dist` + completo em `dist-full`, com pós-processamento de extensões ESM), Vue (`tsc`) e catálogo Next (exportação estática).
- `npm run typecheck --workspaces`: core, React, Angular (`strictTemplates`), Vue e catálogo sem erros.
- `npm test`: 128 testes em `tests/**/*.test.mjs`, todos passando:
  - React (55): contratos por categoria e pacote (registry com 82 ids, versão 1.1.0, Slot, Field, Dialog, menus, Toast, tabela, calendário, headless).
  - Angular (37): SSR via `@angular/platform-server` dos hosts em `packages/angular/src/demos`: Tabs, Breadcrumb, Pagination, Steps, CommandMenu, Button/Toggle/ToggleGroup, Field/Checkbox/Switch/Slider/RadioGroup/NumberInput, Select/Calendar/Combobox, Dialog/DropdownMenu/Menubar/Toast, Progress/Alert/Spinner/Badge/Tag, Table/Avatar/Accordion/Tree, Card/Separator/Toolbar/Grid, Heading/Text/Code/Kbd.
  - Vue (36): SSR via `@vue/server-renderer` das demos em `packages/vue/src/demos`, mesma cobertura por categoria.
- `npm run pack:ui`: `fewcompany-core-1.1.0.tgz`, `fewcompany-ui-1.1.0.tgz`, `fewcompany-angular-1.1.0.tgz`, `fewcompany-vue-1.1.0.tgz`.
- `npm run test:consumer`: instala core + ui em projeto React temporário independente e valida exports, CSS, tokens, `asChild`, Field e Tabs.
- Catálogo: `scripts/verify-catalog.mjs` com Playwright (navegação, busca, temas, modal, teclado, deep link, 390px) passa na 1.1.0. Varredura extra em modo Vue: as 82 páginas com o seletor "Framework" em Vue, todas com a demo montada (exceto `portal`, sem equivalente), snippet `@fewcompany/vue` presente, sem erro de página ou console e sem overflow.

Para repetir o teste de navegador, execute `npm run build`, `npm run preview` e o script em outro terminal com Playwright instalado. `PLAYWRIGHT_MODULE` pode apontar para uma instalação externa do Playwright.

Limites: não é auditoria completa WCAG. Vue foi validado por SSR, typecheck e montagem das 82 demos no catálogo (Chromium), mas sem teste de interação além de Tabs e Button. Angular foi validado só por SSR e typecheck: interações de ponteiro, foco, popovers e diálogos ainda não têm teste em browser nem consumidor de referência (não há catálogo Angular nem verificação dos tarballs Angular/Vue em app real). Angular sem `ControlValueAccessor` (`@angular/forms`). Integrações em iFIGHT, Caraminholas e renderer desktop ainda não foram realizadas. Não houve publicação no registro npm.
