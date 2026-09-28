// Demos/hosts de teste da categoria "Utilitários" (pasta components/utilities). Um componente por id do registry.
// `slot` mostra o as-child (papel do Slot no Vue); `portal` não tem equivalente e fica sem demo.
import { defineComponent, h, ref, type Component } from 'vue';
import { FewButton } from '../components/actions/button.js';
import { FewVisuallyHidden } from '../components/utilities/visually-hidden.js';

export const DemoSlot = defineComponent({
  name: 'DemoSlot',
  setup() {
    const asChild = ref(true);
    const clicks = ref(0);
    return () => h('div', { class: 'demo-stack' }, [
      h('label', { class: 'few-muted' }, [
        h('input', { type: 'checkbox', checked: asChild.value, onChange: (event: Event) => { asChild.value = (event.target as HTMLInputElement).checked; } }),
        ' Renderizar como filho (as-child)',
      ]),
      asChild.value
        ? h(FewButton, { asChild: true, variant: 'secondary', onClick: () => { clicks.value += 1; } }, () => h('a', { href: '#slot', onClick: (event: Event) => event.preventDefault() }, 'Sou um link com as props do botão'))
        : h(FewButton, { variant: 'secondary', onClick: () => { clicks.value += 1; } }, () => 'Sou um botão padrão'),
      h('p', { class: 'few-muted', role: 'status' }, `Cliques recebidos: ${clicks.value}. Handlers do filho e do componente são encadeados.`),
    ]);
  },
});

export const DemoVisuallyHidden = defineComponent({
  name: 'DemoVisuallyHidden',
  setup() {
    return () => h('div', { class: 'demo-row' }, [
      h(FewButton, { variant: 'secondary', 'aria-describedby': 'vue-vh-hint' }, () => [h('span', { 'aria-hidden': 'true' }, '⌕'), h(FewVisuallyHidden, null, () => 'Buscar componentes')]),
      h('p', { id: 'vue-vh-hint', class: 'few-muted' }, 'O botão mostra só o ícone. Leitores de tela leem “Buscar componentes”.'),
    ]);
  },
});

export const UTILITIES_DEMOS: Record<string, Component> = { slot: DemoSlot, 'visually-hidden': DemoVisuallyHidden };
