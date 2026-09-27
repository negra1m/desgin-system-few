# @fewcompany/vue (reservado)

Adaptador Vue do design system. Ainda sem código.

Quando for iniciado:
- Consome `@fewcompany/core` (tokens, `styles.css`, funções headless). Não duplica lógica nem CSS.
- Um componente por parte composta; `provide/inject` no lugar do contexto React; slots no lugar de `asChild`.
- Mesmos nomes de partes e atributos `data-state` do adaptador React, para o CSS `few-*` servir igual.
