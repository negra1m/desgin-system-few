"use client";
import type { ComponentProps } from 'react';
import { Slot } from '../../lib/slot.js';
import { cx, dataAttr } from '../../lib/cx.js';
import { Input, type InputProps } from './input.js';

export interface InputGroupProps extends ComponentProps<'div'> { asChild?: boolean; invalid?: boolean }
/** Raiz que unifica a borda de addons, elementos e o input; a ordem dos filhos no JSX decide o lado (start/end). */
function InputGroupRoot({ asChild, invalid, className, ...props }: InputGroupProps) {
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} className={cx('few-input-group', className)} data-invalid={dataAttr(invalid)} data-disabled={dataAttr(props['aria-disabled'])} />;
}

export interface InputGroupAddonProps extends ComponentProps<'span'> { asChild?: boolean }
/** Prefixo/sufixo textual, com sua própria área (soma-se à largura do grupo). */
function InputGroupAddon({ asChild, className, ...props }: InputGroupAddonProps) {
  const Comp = asChild ? Slot : 'span';
  return <Comp {...props} className={cx('few-input-group-addon', className)} />;
}

export interface InputGroupElementProps extends ComponentProps<'span'> { asChild?: boolean; side?: 'start' | 'end' }
/** Ícone ou botão dentro do grupo (ex.: alternar senha, disparar busca). `side` é usado só para a borda; a posição real é a ordem no JSX. */
function InputGroupElement({ asChild, side = 'end', className, ...props }: InputGroupElementProps) {
  const Comp = asChild ? Slot : 'span';
  return <Comp {...props} data-side={side} className={cx('few-input-group-element', className)} />;
}

function InputGroupInput({ className, ...props }: InputProps) {
  return <Input {...props} className={cx('few-input-group-input', className)} />;
}

/** InputGroup composto: <InputGroup><InputGroup.Addon>R$</InputGroup.Addon><InputGroup.Input/></InputGroup> */
export const InputGroup = Object.assign(InputGroupRoot, { Root: InputGroupRoot, Addon: InputGroupAddon, Element: InputGroupElement, Input: InputGroupInput });
export { InputGroupRoot, InputGroupAddon, InputGroupElement, InputGroupInput };
