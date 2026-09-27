"use client";
import type { ComponentProps } from 'react';
import { Slot, Slottable } from '../../lib/slot.js';
import { cx, dataAttr } from '../../lib/cx.js';

export type LinkVariant = 'default' | 'muted' | 'brand';
export type LinkUnderline = 'always' | 'hover' | 'none';

export interface LinkProps extends ComponentProps<'a'> {
  asChild?: boolean;
  variant?: LinkVariant;
  underline?: LinkUnderline;
  /** Abre em nova aba com rel seguro e mostra um indicador ↗. */
  external?: boolean;
}

/** Link de texto. `<Link href="/painel">Ir</Link>` ou `<Link asChild><NextLink href="/painel">Ir</NextLink></Link>`. */
export function Link({ asChild, variant = 'default', underline = 'hover', external = false, target, rel, className, children, ...props }: LinkProps) {
  const Comp = asChild ? Slot : 'a';
  return (
    <Comp
      {...props}
      target={external ? target ?? '_blank' : target}
      rel={external ? cx(rel, 'noopener', 'noreferrer') : rel}
      data-external={dataAttr(external)}
      className={cx('few-link', `few-link--${variant}`, `few-link--underline-${underline}`, className)}
    >
      <Slottable>{children}</Slottable>
      {external && <span aria-hidden="true" className="few-link-icon">↗</span>}
    </Comp>
  );
}
