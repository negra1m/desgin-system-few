# Regras do projeto

`initial.txt` é a regra de implementação: biblioteca compartilhada de componentes React para web e desktop, catálogo com menu lateral, versões e indicação de uso nos apps. Preserve seu conteúdo original.

- Núcleo sem framework em `packages/core` (tokens, CSS `few-*`, lógica headless). Adaptadores: React em `packages/react` (npm `@fewcompany/ui`), Angular em `packages/angular`, Vue em `packages/vue`. Catálogo Next em `apps/catalog`, com demos em `apps/catalog/demos`.
- Todo componente segue `docs/composition.md` (React, fonte da verdade), `docs/composition-angular.md` e `docs/composition-vue.md`: partes compostas, `asChild` (ou seletor de atributo no Angular), estado controlado ou não, `data-state` para CSS, lógica pura no core. Um componente novo ou corrigido no React deve ser replicado nos outros dois adaptadores no mesmo PR.
- Antes de alterar Next.js, consulte os guias relevantes da versão instalada em `node_modules/next/dist/docs/`.
- Não acople a biblioteca a APIs, autenticação ou estado de um produto. Não copie credenciais nem dados de clientes.
- Registre origem e uso real separadamente. Caraminholas e iFIGHT são referências até que sejam migrados.
- Reutilize tokens `--few-*`; preserve teclado, foco, labels e movimento reduzido.
- Valide pacote, catálogo e tarballs conforme `docs/validation.md`.
- A partir da 1.0.0 esta lib é o padrão de todos os projetos React/Next da Few. Projetos consumidores propõem PRs aqui para componentes novos ou correções, e reportam qualquer atraso causado pela lib.
- O MVP inicial pode ser enviado à main conforme autorização do usuário. Publicar no registro npm é um fluxo separado descrito em `docs/npm-strategy.md`.
