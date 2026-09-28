# @fewcompany/vue

Adaptador Vue 3.5 do design system da Few Company, sobre `@fewcompany/core`. Mesmo CSS, mesmas classes `few-*`, mesmos `data-state` e comportamento de teclado dos adaptadores React e Angular. Escrito em render functions (TypeScript puro), funciona em SFC, `<script setup>` ou `h()`.

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { FewTabs, FewTabsList, FewTabsTrigger, FewTabsContent, FewButton, FewDialog, FewDialogTrigger, FewDialogContent, FewDialogTitle, FewDialogClose } from '@fewcompany/vue';
import '@fewcompany/vue/styles.css';
const tab = ref('resumo');
</script>

<template>
  <FewTabs v-model:value="tab">
    <FewTabsList>
      <FewTabsTrigger value="resumo">Resumo</FewTabsTrigger>
      <FewTabsTrigger value="atividade">Atividade</FewTabsTrigger>
    </FewTabsList>
    <FewTabsContent value="resumo">…</FewTabsContent>
  </FewTabs>

  <FewDialog>
    <FewDialogTrigger as-child><FewButton>Compartilhar</FewButton></FewDialogTrigger>
    <FewDialogContent>
      <FewDialogTitle>Pronto?</FewDialogTitle>
      <FewDialogClose as-child><FewButton variant="secondary">Voltar</FewButton></FewDialogClose>
    </FewDialogContent>
  </FewDialog>
</template>
```

Padrão (ver `docs/composition-vue.md`): cada parte é um componente `FewFooPart`; toda parte aceita `as-child` (clona o filho único do slot mesclando props, classes e handlers) e atributos nativos; estado por `v-model:value`, `v-model:open`, `v-model:checked` (ou `default-value` para não controlado); contexto por `provide/inject`; overlays em `<dialog>` e `popover` nativos. Temas por `data-few-theme` em qualquer contêiner.

Testes de contrato rodam por SSR (`@vue/server-renderer`) em `tests/vue/`; as demos ficam em `src/demos`.
