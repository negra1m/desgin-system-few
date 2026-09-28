// Demos/hosts de teste da categoria "Ações" (pasta components/actions). Um componente por id do registry.
import { defineComponent, h, type Component } from 'vue';
import { FewButton } from '../components/actions/button.js';
import { FewIconButton } from '../components/actions/icon-button.js';
import { FewButtonGroup } from '../components/actions/button-group.js';
import { FewToggle } from '../components/actions/toggle.js';
import { FewToggleGroup, FewToggleGroupItem } from '../components/actions/toggle-group.js';
import { FewSplitButton, FewSplitButtonAction, FewSplitButtonTrigger, FewSplitButtonContent, FewSplitButtonItem } from '../components/actions/split-button.js';
import { FewLink } from '../components/actions/link.js';

export const DemoButton = defineComponent({
  name: 'DemoButton',
  setup() {
    return () => h('div', null, [
      h(FewButton, { variant: 'primary' }, () => 'Salvar'),
      h(FewButton, { loading: true }, () => 'Enviando'),
    ]);
  },
});

export const DemoIconButton = defineComponent({
  name: 'DemoIconButton',
  setup() {
    return () => h('div', null, [
      h(FewIconButton, { 'aria-label': 'Fechar' }, () => h('span', { 'aria-hidden': 'true' }, '×')),
      h(FewIconButton, { 'aria-label': 'Carregando', loading: true }, () => h('span', { 'aria-hidden': 'true' }, '×')),
    ]);
  },
});

export const DemoButtonGroup = defineComponent({
  name: 'DemoButtonGroup',
  setup() {
    return () => h(FewButtonGroup, { size: 'sm' }, () => [
      h(FewButton, null, () => 'Um'),
      h(FewButton, null, () => 'Dois'),
    ]);
  },
});

export const DemoToggle = defineComponent({
  name: 'DemoToggle',
  setup() {
    return () => h(FewToggle, { defaultPressed: true }, () => 'Negrito');
  },
});

export const DemoToggleGroup = defineComponent({
  name: 'DemoToggleGroup',
  setup() {
    return () => h(FewToggleGroup, { type: 'single', defaultValue: 'left' }, () => [
      h(FewToggleGroupItem, { value: 'left' }, () => 'Esquerda'),
      h(FewToggleGroupItem, { value: 'center' }, () => 'Centro'),
      h(FewToggleGroupItem, { value: 'right', disabled: true }, () => 'Direita'),
    ]);
  },
});

export const DemoSplitButton = defineComponent({
  name: 'DemoSplitButton',
  setup() {
    return () => h(FewSplitButton, null, () => [
      h(FewSplitButtonAction, null, () => 'Salvar'),
      h(FewSplitButtonTrigger),
      h(FewSplitButtonContent, null, () => [
        h(FewSplitButtonItem, null, () => 'Salvar como…'),
        h(FewSplitButtonItem, null, () => 'Exportar'),
      ]),
    ]);
  },
});

export const DemoLink = defineComponent({
  name: 'DemoLink',
  setup() {
    return () => h('div', null, [
      h(FewLink, { href: '/painel' }, () => 'Painel'),
      h(FewLink, { asChild: true }, () => h('a', { href: 'https://fewcompany.com' }, 'Site externo')),
    ]);
  },
});

export const ACTIONS_DEMOS: Record<string, Component> = {
  button: DemoButton,
  'icon-button': DemoIconButton,
  'button-group': DemoButtonGroup,
  toggle: DemoToggle,
  'toggle-group': DemoToggleGroup,
  'split-button': DemoSplitButton,
  link: DemoLink,
};
