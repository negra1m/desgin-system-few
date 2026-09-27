"use client";
import { Children, Fragment, cloneElement, isValidElement, type HTMLAttributes, type ReactElement, type ReactNode, type Ref } from 'react';
import { composeRefs } from './compose-refs.js';
import { mergeProps } from './merge-props.js';

export interface SlotProps extends HTMLAttributes<HTMLElement> { children?: ReactNode; ref?: Ref<HTMLElement> }
type ChildElement = ReactElement<Record<string, unknown> & { ref?: Ref<HTMLElement>; children?: ReactNode }>;

/**
 * Slot: renderiza o filho no lugar do elemento padrão, mesclando props e ref.
 * Uso: `const Comp = asChild ? Slot : 'button'`.
 * Use <Slottable> quando a parte renderiza conteúdo ao redor de `children` (ícone + texto).
 */
export function Slot({ children, ref, ...slotProps }: SlotProps) {
  const list = Children.toArray(children);
  const slottable = list.find(isSlottable) as ReactElement<{ children?: ReactNode }> | undefined;
  if (slottable) {
    const target = slottable.props.children;
    if (!isValidElement(target)) return null;
    const element = target as ChildElement;
    const inner = list.map(child => (child === slottable ? element.props.children : child));
    return cloneElement(element, { ...mergeProps(slotProps as Record<string, unknown>, element.props), ref: composeRefs(ref, element.props.ref), children: inner });
  }
  if (!isValidElement(children)) { if (list.length > 1) throw new Error('Slot (asChild) espera exatamente um elemento filho.'); return null; }
  const element = children as ChildElement;
  return cloneElement(element, { ...mergeProps(slotProps as Record<string, unknown>, element.props), ref: composeRefs(ref, element.props.ref) });
}

const SLOTTABLE = Symbol.for('few.slottable');
export function Slottable({ children }: { children: ReactNode }) { return <Fragment>{children}</Fragment>; }
(Slottable as unknown as { $$few: symbol }).$$few = SLOTTABLE;
function isSlottable(node: ReactNode): boolean { return isValidElement(node) && (node.type as { $$few?: symbol }).$$few === SLOTTABLE; }
