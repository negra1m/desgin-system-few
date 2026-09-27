# Adicionar um componente

1. Defina um problema repetido em pelo menos dois contextos. Prefira HTML nativo quando ele resolve interação e acessibilidade.
2. Siga `composition.md`: partes compostas (`Foo`, `Foo.Trigger`, `Foo.Content`), `asChild` em toda parte, `value/defaultValue/onValueChange`, `data-state` para CSS. Implemente em `packages/react/src/components/<categoria>/<nome>.tsx` e exporte no barrel da categoria. Sem imports de Next ou paths de produto.
3. Lógica pura (índices, faixas, grades, filtros) vai para `packages/core/src/headless/<categoria>.ts`, sem DOM nem React.
4. CSS em `packages/core/src/styles/components/<nome>.css`, com tokens `--few-*` e seletores `.few-*`; não estilize tags globais.
5. Registre descrição, variantes, partes, origem, referências e consumidores em `packages/react/src/registry/<categoria>.ts`. Adicione a demonstração interativa em `apps/catalog/demos/<categoria>.tsx`.
6. Verifique teclado, foco, labels, estado desabilitado, tema claro/escuro, 390px e movimento reduzido.
7. Escreva contratos em `tests/<categoria>.test.mjs`. Execute typecheck, testes, build, pack e teste os tarballs em consumidor. Registre mudanças no changelog.

## Next.js

Leia os guias pertinentes em `node_modules/next/dist/docs/` antes de alterar o catálogo. A documentação local da versão instalada é a referência. As demos ficam fora de `app/` porque `layout.tsx` dentro de `app/` é convenção de rota.

## Publicação

Não altere o registro npm automaticamente. O MVP pode subir direto à main no repositório, conforme autorização inicial. Novas publicações npm devem seguir a decisão em `npm-strategy.md`.
