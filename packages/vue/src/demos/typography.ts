// Demos/hosts de teste da categoria "Tipografia" (pasta components/typography). Um componente por id do registry.
import { defineComponent, h, type Component } from 'vue';
import { FewHeading } from '../components/typography/heading.js';
import { FewText } from '../components/typography/text.js';
import { FewCode } from '../components/typography/code.js';
import { FewKbd } from '../components/typography/kbd.js';

export const DemoHeading = defineComponent({
  name: 'DemoHeading',
  setup() {
    return () => h(FewHeading, { level: 2, size: 'xl', tone: 'brand' }, () => 'Título da seção');
  },
});

export const DemoText = defineComponent({
  name: 'DemoText',
  setup() {
    return () => h(FewText, { as: 'p', tone: 'muted' }, () => 'Texto de apoio com tom neutro.');
  },
});

export const DemoCode = defineComponent({
  name: 'DemoCode',
  setup() {
    return () => h(FewCode, { block: true, lang: 'ts', copyable: true }, () => "const few = 'company';");
  },
});

export const DemoKbd = defineComponent({
  name: 'DemoKbd',
  setup() {
    return () => h(FewKbd, { keys: ['Mod', 'K'] });
  },
});

export const TYPOGRAPHY_DEMOS: Record<string, Component> = { heading: DemoHeading, text: DemoText, code: DemoCode, kbd: DemoKbd };
