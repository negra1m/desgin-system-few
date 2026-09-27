"use client";
import type { ComponentProps, CSSProperties } from 'react';
import { cx } from '../../lib/cx.js';

export type SkeletonVariant = 'text' | 'circle' | 'rect';

export interface SkeletonProps extends ComponentProps<'span'> {
  variant?: SkeletonVariant;
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  /** Repete linhas de texto (só variant="text"; ignorado quando asChild). */
  lines?: number;
  /** Anima o pulse. Desligue para um frame estático (ex.: captura de tela). */
  animate?: boolean;
  /**
   * Envolve `children`: esconde o conteúdo real (aria-hidden) e mostra o esqueleto por cima,
   * no mesmo espaço do conteúdo. Não é o Slot/troca-de-tag do resto da biblioteca — aqui
   * "asChild" é literal: existe um wrapper, porque o objetivo é reservar o layout final.
   */
  asChild?: boolean;
}
/** Componente simples. `<Skeleton variant="text" lines={3} />` ou `<Skeleton asChild><Avatar /></Skeleton>`. */
export function Skeleton({ variant = 'text', width, height, lines = 1, animate = true, asChild, className, style, children, ...props }: SkeletonProps) {
  const baseStyle: CSSProperties = { width, height, ...style };

  if (asChild) {
    return (
      <span {...props} aria-hidden="true" className={cx('few-skeleton-wrap', className)} style={baseStyle}>
        <span className="few-skeleton-content">{children}</span>
        <span className={cx('few-skeleton', 'few-skeleton-overlay', `few-skeleton--${variant}`, !animate && 'few-skeleton--static')} />
      </span>
    );
  }

  if (variant === 'text' && lines > 1) {
    return (
      <span {...props} aria-hidden="true" className={cx('few-skeleton-lines', className)} style={style}>
        {Array.from({ length: lines }, (_, index) => (
          <span
            key={index}
            className={cx('few-skeleton', 'few-skeleton--text', !animate && 'few-skeleton--static')}
            style={index === lines - 1 ? { ...baseStyle, width: width ?? '70%' } : baseStyle}
          />
        ))}
      </span>
    );
  }

  return (
    <span
      {...props}
      aria-hidden="true"
      className={cx('few-skeleton', `few-skeleton--${variant}`, !animate && 'few-skeleton--static', className)}
      style={baseStyle}
    />
  );
}
