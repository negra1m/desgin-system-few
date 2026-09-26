# Matriz de adoção · 0.1.0

| Produto | Papel atual | Versão consumida |
| --- | --- | --- |
| Catálogo Few | Integração real do pacote | 0.1.0 |
| Caraminholas | Referência de formulários, cards, checkout e status | Não migrado |
| iFIGHT | Referência de variantes, indicadores e tema escuro | Não migrado |

Cada entrada em `packages/ui/src/registry.ts` descreve variantes, versão, origem e consumidores. Atualize `consumers` apenas quando houver uma importação real do pacote no produto e validação da tela migrada.

Fontes consultadas no workspace:

- Caraminholas: `src/components/admin/ui.tsx`, `order-form.tsx`, `checkout/checkout-form.tsx`, `src/app/globals.css`.
- iFIGHT: `DESIGN_TOKENS.md`, `app/pages/components/ui/button.tsx`, `card.tsx`.
- Few: https://fewcompany.com e o projeto local `few-ilja/src/styles/{site,base}.css`. Verde #152a21, carvão #292929, hierarquia editorial e formas orgânicas orientaram o tema. A paleta da biblioteca adapta esses valores para superfícies e contraste de controles.

Não transferimos códigos de pagamento, autenticação, dados de clientes, assets de produtos ou fontes proprietárias. Os temas Caraminholas e iFIGHT são presets de demonstração; migrações reais podem requerer ajustes.
