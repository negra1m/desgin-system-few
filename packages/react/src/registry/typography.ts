import { component, type ComponentRecord } from './shared.js';
// Registro da categoria "Tipografia" (pasta components/typography). Um component() por componente, na ordem do menu.
export const typographyRegistry: ComponentRecord[] = [
  component({
    id: 'heading', name: 'Heading', category: 'Tipografia',
    description: 'Título semântico com tag (h1–h6) e tamanho visual escolhidos de forma independente.',
    variants: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'tone: gradient'],
    origins: ['Catálogo Few · hero e seções'],
    references: ['Radix Themes Heading', 'MUI Typography'],
    code: '<Heading level={1} size="3xl" tone="gradient">Few UI</Heading>',
    vueCode: `<FewHeading :level="1" size="3xl" tone="gradient">Few UI</FewHeading>`,
  }),
  component({
    id: 'text', name: 'Text', category: 'Tipografia',
    description: 'Texto de corpo com tag flexível (p, span, div, label), truncamento por linha ou por N linhas e tom semântico.',
    variants: ['xs', 'sm', 'md', 'lg', 'truncate', 'lineClamp', 'tabular'],
    origins: ['Catálogo Few · hero e seções'],
    references: ['Radix Themes Text', 'MUI Typography'],
    code: '<Text as="p" tone="muted" lineClamp={2}>Descrição mais longa…</Text>',
    vueCode: `<FewText as="p" tone="muted" :line-clamp="2">Descrição mais longa…</FewText>`,
  }),
  component({
    id: 'code', name: 'Code', category: 'Tipografia',
    description: 'Código inline ou em bloco, com rolagem horizontal por teclado e botão de copiar opcional.',
    variants: ['soft', 'outline', 'block', 'copyable'],
    origins: ['Catálogo Few · painel de código'],
    references: ['Radix Themes Code', 'MUI Typography'],
    code: '<Code block copyable lang="tsx">{"const x = 1;"}</Code>',
    vueCode: `<FewCode block copyable lang="tsx">const x = 1;</FewCode>`,
  }),
  component({
    id: 'kbd', name: 'Kbd', category: 'Tipografia',
    description: 'Atalho de teclado com aparência de tecla física, a partir de children ou da lista keys.',
    variants: ['sm', 'md'],
    origins: ['Catálogo Few · atalho de busca'],
    references: ['Radix Themes Kbd', 'MUI Typography'],
    code: '<Kbd keys={["Ctrl", "K"]} />',
    vueCode: `<FewKbd :keys="['Ctrl', 'K']" />`,
  }),
];
