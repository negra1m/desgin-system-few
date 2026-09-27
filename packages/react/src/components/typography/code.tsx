"use client";
import { useRef, useState, type ComponentProps } from 'react';
import { Slot, Slottable } from '../../lib/slot.js';
import { cx } from '../../lib/cx.js';

export type CodeVariant = 'soft' | 'outline';

export interface CodeProps extends Omit<ComponentProps<'code'>, 'color' | 'ref'> {
  asChild?: boolean;
  /** Estilo do código inline. Sem efeito quando `block` está ativo. */
  variant?: CodeVariant;
  /** Renderiza um bloco (pre>code) com rolagem horizontal, em vez de código inline. */
  block?: boolean;
  /** Linguagem do trecho, exposta só como data-lang (sem syntax highlight). */
  lang?: string;
  /** Mostra um botão de copiar. Só tem efeito com `block`. */
  copyable?: boolean;
}

/** Code: código inline (`code`) ou em bloco (`pre>code`, rolagem por teclado, cópia opcional). */
function Code({ asChild, variant = 'soft', block, lang, copyable, className, children, ...props }: CodeProps) {
  const codeRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  if (!block) {
    const Comp = asChild ? Slot : 'code';
    return <Comp {...props} className={cx('few-code', className)} data-variant={variant} data-lang={lang}>{children}</Comp>;
  }

  const Comp = asChild ? Slot : 'pre';

  async function handleCopy() {
    const text = codeRef.current?.textContent ?? (typeof children === 'string' ? children : '');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard indisponível (permissão/contexto não seguro); botão fica sem feedback de sucesso */
    }
  }

  return (
    <Comp {...props} tabIndex={0} className={cx('few-code', className)} data-block="" data-lang={lang}>
      {asChild
        ? <Slottable>{children}</Slottable>
        : <code ref={codeRef} className="few-code-code">{children}</code>}
      {copyable && <button type="button" className="few-code-copy" onClick={handleCopy} aria-label="Copiar código">{copied ? 'Copiado' : 'Copiar'}</button>}
      {copyable && <span role="status" aria-live="polite" className="few-sr-only">{copied ? 'Copiado' : ''}</span>}
    </Comp>
  );
}

export { Code };
