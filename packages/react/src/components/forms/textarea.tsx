"use client";
import type { ComponentProps } from 'react';
import { cx, dataAttr } from '../../lib/cx.js';

export interface TextareaProps extends ComponentProps<'textarea'> {
  invalid?: boolean;
  /** Cresce a altura conforme o conteúdo, sem barra de rolagem própria. */
  autoResize?: boolean;
}
/** Textarea nativa. Sem asChild: é sempre um <textarea> real. */
export function Textarea({ invalid, autoResize, className, onInput, rows = 3, ...props }: TextareaProps) {
  const handleInput: NonNullable<ComponentProps<'textarea'>['onInput']> = (event) => {
    onInput?.(event);
    if (!autoResize) return;
    const el = event.currentTarget;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };
  return (
    <textarea
      {...props}
      rows={rows}
      onInput={handleInput}
      className={cx('few-input', 'few-textarea', autoResize && 'few-textarea--auto', className)}
      aria-invalid={invalid || (props['aria-invalid'] && props['aria-invalid'] !== 'false') || undefined}
      data-invalid={dataAttr(invalid)}
    />
  );
}
