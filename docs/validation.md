# Validação do MVP

Executada em Windows, Node 22 e Chromium headless:

- `npm run build`: biblioteca TypeScript e catálogo Next 16.3.6 com exportação estática.
- `npm run typecheck`: biblioteca e catálogo.
- `npm test`: seis contratos de registry, botão em carregamento, associação de formulário/erro, progresso, tabela vazia e arquivos distribuídos.
- `npm run pack:ui`: tarball `fewcompany-ui-0.1.0.tgz`, aproximadamente 9 KB compactados, sem dados dos produtos.
- `npm run test:consumer`: instala o tarball em projeto React temporário independente; valida imports, CSS, tokens e renderização sem Next.
- `node scripts/verify-catalog.mjs` com Playwright: navegação, busca, carregamento, temas, modal com Escape e retorno de foco, teclado das abas, deep links, associação de labels e ausência de overflow em 390px. Sem erros de runtime no navegador.

Para repetir o teste de navegador, execute `npm run build`, `npm run preview` e o script em outro terminal com Playwright instalado. `PLAYWRIGHT_MODULE` pode apontar para uma instalação externa do Playwright. Capturas geradas em `artifacts/`.

Limites: não é auditoria completa WCAG; o catálogo foi verificado em Chromium. Integrações em iFIGHT, Caraminholas e renderer desktop ainda não foram realizadas. Não houve publicação no registro npm.
