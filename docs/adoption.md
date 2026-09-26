# Matriz de adoção · 0.2.0

| Produto | Papel atual | Versão consumida |
| --- | --- | --- |
| Catálogo Few | Integração real do pacote | 0.2.0 |
| Caraminholas | Referência de formulários, cards, checkout e status | Não migrado |
| iFIGHT | Referência de variantes, indicadores e tema escuro | Não migrado |

Cada entrada em `packages/ui/src/registry.ts` descreve variantes, versão, origem e consumidores. Atualize `consumers` apenas quando houver uma importação real do pacote no produto e validação da tela migrada.

Fontes consultadas no workspace:

- Caraminholas: `src/components/admin/ui.tsx`, `order-form.tsx`, `checkout/checkout-form.tsx`, `src/app/globals.css`.
- iFIGHT: `DESIGN_TOKENS.md`, `app/pages/components/ui/button.tsx`, `card.tsx`.
- Few: https://www.fewcompany.com/en, inspecionado em 26/09/2026. A paleta publicada usa #0A0A1F, #FF2ECC, #C9AFFF e #38B6FF; o site usa Poppins. O símbolo oficial vem de https://www.fewcompany.com/brand/few-simbolo.svg e é mantido localmente no catálogo. Os tokens de superfície e feedback são adaptações para contraste de controles.

Não transferimos códigos de pagamento, autenticação, dados de clientes, assets de produtos ou fontes proprietárias. Os temas Caraminholas e iFIGHT são presets de demonstração; migrações reais podem requerer ajustes.
