"use client";
import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export interface PortalProps { children: ReactNode; container?: Element | null }

/**
 * Portal seguro para SSR. Prefira <dialog> e o atributo `popover` (top layer nativo, mantém o tema do contêiner);
 * use Portal só quando o conteúdo precisa sair da árvore. Passe `container` para preservar `data-few-theme`.
 */
export function Portal({ children, container }: PortalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return createPortal(children, container ?? document.body);
}
