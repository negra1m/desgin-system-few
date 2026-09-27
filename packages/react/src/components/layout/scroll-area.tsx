"use client";
// ScrollArea: ver docs/composition.md. Rola nativamente; Scrollbar/Thumb existem só por compatibilidade de API (renderizam null).
import { useEffect, useRef, type ComponentProps } from 'react';
import type { Orientation } from '@fewcompany/core';
import { Slot } from '../../lib/slot.js';
import { createContext } from '../../lib/context.js';
import { cx } from '../../lib/cx.js';

type ScrollAreaType = 'auto' | 'always' | 'scroll' | 'hover';
interface ScrollAreaContextValue { type: ScrollAreaType; orientation: Orientation | 'both' }
const [ScrollAreaProvider, useScrollArea] = createContext<ScrollAreaContextValue>('ScrollArea');

export interface ScrollAreaProps extends ComponentProps<'div'> { asChild?: boolean; type?: ScrollAreaType; orientation?: Orientation | 'both' }
function ScrollAreaRoot({ asChild, type = 'hover', orientation = 'vertical', className, ...props }: ScrollAreaProps) {
  const Comp = asChild ? Slot : 'div';
  return (
    <ScrollAreaProvider value={{ type, orientation }}>
      <Comp {...props} className={cx('few-scroll-area', className)} data-type={type} data-orientation={orientation} />
    </ScrollAreaProvider>
  );
}

export interface ScrollAreaViewportProps extends ComponentProps<'div'> {
  asChild?: boolean;
  /** aria-label da região rolável (obrigatório: viewport tem tabIndex=0 e role="region"). */
  label: string;
}
/** Viewport: overflow nativo. Marca data-overflow-top/bottom conforme o scroll, para sombras de borda via CSS. */
function ScrollAreaViewport({ asChild, label, className, ...props }: ScrollAreaViewportProps) {
  useScrollArea('ScrollArea.Viewport');
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const top = el.scrollTop > 1;
      const bottom = el.scrollTop + el.clientHeight < el.scrollHeight - 1;
      if (top) el.dataset.overflowTop = ''; else delete el.dataset.overflowTop;
      if (bottom) el.dataset.overflowBottom = ''; else delete el.dataset.overflowBottom;
    };
    update();
    el.addEventListener('scroll', update);
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    observer?.observe(el);
    return () => { el.removeEventListener('scroll', update); observer?.disconnect(); };
  }, []);
  const Comp = asChild ? Slot : 'div';
  return <Comp ref={ref} {...props} tabIndex={0} role="region" aria-label={label} className={cx('few-scroll-area-viewport', className)} />;
}

export interface ScrollAreaScrollbarProps extends ComponentProps<'div'> { orientation?: Orientation }
/** Existe só por compatibilidade de API com Radix: a barra é a nativa, estilizada via CSS (scrollbar-width/color + ::-webkit-scrollbar). */
function ScrollAreaScrollbar(_props: ScrollAreaScrollbarProps) { return null; }

export type ScrollAreaThumbProps = ComponentProps<'div'>;
function ScrollAreaThumb(_props: ScrollAreaThumbProps) { return null; }

/** ScrollArea composto: <ScrollArea type="hover"><ScrollArea.Viewport label="Lista">…</ScrollArea.Viewport></ScrollArea> */
export const ScrollArea = Object.assign(ScrollAreaRoot, { Root: ScrollAreaRoot, Viewport: ScrollAreaViewport, Scrollbar: ScrollAreaScrollbar, Thumb: ScrollAreaThumb });
export { ScrollAreaRoot, ScrollAreaViewport, ScrollAreaScrollbar, ScrollAreaThumb };
