"use client";
import type { ComponentProps } from 'react';
import { normalizeKbdKeys, type KbdPlatform } from '@fewcompany/core';
import { Slot } from '../../lib/slot.js';
import { cx } from '../../lib/cx.js';

export type KbdSize = 'sm' | 'md';
export type { KbdPlatform };

export interface KbdProps extends Omit<ComponentProps<'kbd'>, 'color'> {
  asChild?: boolean;
  /** Sequência de teclas, renderizada com separador "+". Ignorado quando `children` é informado. */
  keys?: string[];
  /** Plataforma usada para normalizar `keys` (ex.: Cmd no mac). Sem detecção automática. */
  platform?: KbdPlatform;
  size?: KbdSize;
}

/** Kbd: atalho de teclado com aparência de tecla física, a partir de `children` ou de `keys`. */
function Kbd({ asChild, keys, platform = 'other', size = 'md', className, children, ...props }: KbdProps) {
  const Comp = asChild ? Slot : 'kbd';
  const sequence = children === undefined && keys ? normalizeKbdKeys(keys, platform) : null;
  return <Comp {...props} className={cx('few-kbd', className)} data-size={size}>
    {sequence
      ? sequence.map((key, index) => (
        <span key={`${key}-${index}`} className="few-kbd-key">
          {index > 0 && <span className="few-kbd-sep" aria-hidden="true">+</span>}
          {key}
        </span>
      ))
      : children}
  </Comp>;
}

export { Kbd };
