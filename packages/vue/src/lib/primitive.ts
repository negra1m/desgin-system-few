import { Comment, Fragment, Text, cloneVNode, h, mergeProps, type Slots, type VNode, type VNodeArrayChildren } from 'vue';

type Props = Record<string, unknown>;

/** Filhos "reais" de um slot: ignora comentários e achata Fragments (v-for, templates). */
export function slotNodes(nodes: VNode[] | undefined): VNode[] {
  return (nodes ?? []).flatMap(node => node.type === Comment ? [] : node.type === Fragment && Array.isArray(node.children) ? slotNodes(node.children as VNode[]) : [node]);
}

/**
 * Renderiza a tag padrão ou, com `asChild`, o único filho do slot com as props mescladas (padrão Radix/Slot).
 * `mergeProps` concatena class/style e encadeia handlers `onX` (o do filho roda primeiro).
 * `wrap` transforma os filhos (ex.: prefixar um spinner) tanto na tag padrão quanto no filho clonado.
 */
export function renderPrimitive(tag: string, asChild: boolean | undefined, props: Props, slots: Slots, wrap?: (children: VNodeArrayChildren) => VNodeArrayChildren): VNode | null {
  const children = slots.default?.() ?? [];
  if (!asChild) return h(tag, props, wrap ? wrap(children) : children);
  const [child, ...rest] = slotNodes(children);
  if (!child || rest.length) { if (rest.length) throw new Error('asChild espera exatamente um elemento filho.'); return null; }
  if (child.type === Text) throw new Error('asChild precisa de um elemento, não de texto.');
  if (!wrap) return cloneVNode(child, props, true);
  const inner = Array.isArray(child.children) ? (child.children as VNodeArrayChildren) : child.children != null ? [String(child.children)] : [];
  const merged = mergeProps((child.props ?? {}) as Props, props);
  return typeof child.type === 'string' ? h(child.type, merged, wrap(inner)) : cloneVNode(child, props, true);
}

/** Atributo data-* booleano: '' quando verdadeiro, undefined remove. */
export const dataAttr = (condition: unknown): '' | undefined => (condition ? '' : undefined);
export const dataState = (open: boolean) => (open ? 'open' : 'closed');
