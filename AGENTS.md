# Regras do projeto

`initial.txt` é a regra de implementação: biblioteca compartilhada de componentes React para web e desktop, catálogo com menu lateral, versões e indicação de uso nos apps. Preserve seu conteúdo original.

- Componentes reutilizáveis em `packages/ui`, catálogo Next em `apps/catalog`.
- Antes de alterar Next.js, consulte os guias relevantes da versão instalada em `node_modules/next/dist/docs/`.
- Não acople a biblioteca a APIs, autenticação ou estado de um produto. Não copie credenciais nem dados de clientes.
- Registre origem e uso real separadamente. Caraminholas e iFIGHT são referências até que sejam migrados.
- Reutilize tokens `--few-*`; preserve teclado, foco, labels e movimento reduzido.
- Valide pacote, catálogo e tarball conforme `docs/validation.md`.
- O MVP inicial pode ser enviado à main conforme autorização do usuário. Publicar no registro npm é um fluxo separado descrito em `docs/npm-strategy.md`.
