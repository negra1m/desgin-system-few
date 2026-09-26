# Adicionar um componente

1. Defina um problema repetido em pelo menos dois contextos. Prefira HTML nativo quando ele resolve interação e acessibilidade.
2. Implemente a API tipada em `packages/ui/src/index.tsx`, sem imports de Next ou paths de produto. Interações usam props controladas.
3. Use tokens `--few-*` e seletores `.few-*`; não estilize tags globais na biblioteca.
4. Registre descrição, variantes, versão, origem e consumidores em `registry.ts`. Adicione demonstração interativa no catálogo.
5. Verifique teclado, foco, labels, estado desabilitado, tema claro/escuro, 390px e movimento reduzido.
6. Execute typecheck, testes, build, pack e teste o tarball em consumidor. Registre mudanças no changelog.

## Next.js

Leia os guias pertinentes em `node_modules/next/dist/docs/` antes de alterar o catálogo. A documentação local da versão instalada é a referência, conforme a regra do projeto de origem.

## Publicação

Não altere o registry npm automaticamente. O MVP pode subir direto à main no repositório, conforme autorização inicial. Novas publicações npm devem seguir a decisão em `npm-strategy.md`.
