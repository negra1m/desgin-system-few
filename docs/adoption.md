# Matriz de adoção · 1.1.0

| Produto | Papel atual | Versão consumida |
| --- | --- | --- |
| Catálogo Few | Integração real dos pacotes `@fewcompany/core` e `@fewcompany/ui` | 1.1.0 |
| Caraminholas | Referência de formulários, cards, checkout e status | Não migrado |
| iFIGHT | Referência de variantes, indicadores e tema escuro | Não migrado |

Cada entrada em `packages/react/src/registry/<categoria>.ts` descreve variantes, partes, versão, origem, referências de API e consumidores. Atualize `consumers` apenas quando houver uma importação real do pacote no produto e validação da tela migrada.

A versão 1.1.0 muda a API de todos os componentes para composição (partes + `asChild`). Migrações de Caraminholas e iFIGHT devem partir desta versão, não da 0.2.0.

Fontes consultadas no workspace:

- Caraminholas: `src/components/admin/ui.tsx`, `order-form.tsx`, `checkout/checkout-form.tsx`, `src/app/globals.css`.
- iFIGHT: `DESIGN_TOKENS.md`, `app/pages/components/ui/button.tsx`, `card.tsx`.
- Few: https://www.fewcompany.com/en, inspecionado em 26/09/2026. A paleta publicada usa #0A0A1F, #FF2ECC, #C9AFFF e #38B6FF; o site usa Poppins. O símbolo oficial vem de https://www.fewcompany.com/brand/few-simbolo.svg e é mantido localmente no catálogo. Os tokens de superfície e feedback são adaptações para contraste de controles.
- APIs de referência: Radix Primitives, PrimeReact e Material UI, citadas por componente no campo `references` do registry.

Não transferimos códigos de pagamento, autenticação, dados de clientes, assets de produtos ou fontes proprietárias. Os temas Caraminholas e iFIGHT são presets de demonstração; migrações reais podem requerer ajustes.
