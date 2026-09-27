"use client";
// Carousel: trilho com scroll-snap, teclado ←→ e indicadores (ver docs/composition.md).
import { Children, cloneElement, isValidElement, useEffect, useRef, useState, type ComponentProps, type KeyboardEvent, type ReactElement, type RefObject, type UIEvent } from 'react';
import type { Orientation } from '@fewcompany/core';
import { carouselIndex } from '@fewcompany/core';
import { Slot } from '../../lib/slot.js';
import { createContext } from '../../lib/context.js';
import { useControllableState } from '../../lib/use-controllable-state.js';
import { cx } from '../../lib/cx.js';

interface CarouselContextValue {
  orientation: Orientation; loop: boolean; align: 'start' | 'center';
  index: number; setIndex: (index: number) => void;
  count: number; setCount: (count: number) => void;
  viewportRef: RefObject<HTMLDivElement | null>;
}
const [CarouselProvider, useCarouselCtx] = createContext<CarouselContextValue>('Carousel');

export interface CarouselProps extends Omit<ComponentProps<'div'>, 'defaultValue'> {
  asChild?: boolean; orientation?: Orientation; loop?: boolean; align?: 'start' | 'center';
  index?: number; defaultIndex?: number; onIndexChange?: (index: number) => void;
}
function CarouselRoot({ asChild, orientation = 'horizontal', loop = false, align = 'start', index, defaultIndex = 0, onIndexChange, className, ...props }: CarouselProps) {
  const [current, setCurrent] = useControllableState({ value: index, defaultValue: defaultIndex, onChange: onIndexChange });
  const [count, setCount] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const Comp = asChild ? Slot : 'div';
  return <CarouselProvider value={{ orientation, loop, align, index: current, setIndex: setCurrent, count, setCount, viewportRef }}>
    <Comp {...props} role="group" aria-roledescription="carousel" className={cx('few-carousel', className)} data-orientation={orientation} />
  </CarouselProvider>;
}

export interface CarouselViewportProps extends ComponentProps<'div'> { asChild?: boolean }
function CarouselViewport({ asChild, className, onScroll, onKeyDown, ...props }: CarouselViewportProps) {
  const { orientation, loop, index, count, setIndex, viewportRef } = useCarouselCtx('Carousel.Viewport');
  const Comp = asChild ? Slot : 'div';

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const items = el.querySelectorAll<HTMLElement>('[data-few-carousel-item]');
    const target = items[index];
    if (!target) return;
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    if (orientation === 'horizontal') el.scrollTo({ left: target.offsetLeft, behavior });
    else el.scrollTo({ top: target.offsetTop, behavior });
  }, [index, orientation, viewportRef]);

  function handleScroll(event: UIEvent<HTMLDivElement>) {
    onScroll?.(event);
    const el = event.currentTarget;
    const size = orientation === 'horizontal' ? el.clientWidth : el.clientHeight;
    const pos = orientation === 'horizontal' ? el.scrollLeft : el.scrollTop;
    if (size <= 0) return;
    const next = Math.round(pos / size);
    if (next !== index && next >= 0 && next < count) setIndex(next);
  }
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const forward = orientation === 'horizontal' ? event.key === 'ArrowRight' : event.key === 'ArrowDown';
    const backward = orientation === 'horizontal' ? event.key === 'ArrowLeft' : event.key === 'ArrowUp';
    if (!forward && !backward) return;
    event.preventDefault();
    setIndex(carouselIndex(index, forward ? 1 : -1, count, loop));
  }
  return <Comp {...props} ref={viewportRef} tabIndex={0} className={cx('few-carousel-viewport', className)} data-orientation={orientation} onScroll={handleScroll} onKeyDown={handleKeyDown} />;
}

export interface CarouselContentProps extends ComponentProps<'div'> { asChild?: boolean }
function CarouselContent({ asChild, className, children, ...props }: CarouselContentProps) {
  const { orientation, setCount } = useCarouselCtx('Carousel.Content');
  const items = Children.toArray(children);
  const total = items.length;
  useEffect(() => { setCount(total); }, [total, setCount]);
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} className={cx('few-carousel-content', className)} data-orientation={orientation}>
    {items.map((child, i) => isValidElement(child) ? cloneElement(child as ReactElement<Record<string, unknown>>, { 'data-few-carousel-index': i, 'data-few-carousel-total': total }) : child)}
  </Comp>;
}

export interface CarouselItemProps extends ComponentProps<'div'> { asChild?: boolean }
function CarouselItem({ asChild, className, children, ...props }: CarouselItemProps & { 'data-few-carousel-index'?: number; 'data-few-carousel-total'?: number }) {
  const index = props['data-few-carousel-index'] ?? 0;
  const total = props['data-few-carousel-total'] ?? 1;
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} data-few-carousel-item role="group" aria-roledescription="slide" aria-label={`${index + 1} de ${total}`} className={cx('few-carousel-item', className)}>{children}</Comp>;
}

export interface CarouselPreviousProps extends ComponentProps<'button'> { asChild?: boolean }
function CarouselPrevious({ asChild, className, disabled, onClick, ...props }: CarouselPreviousProps) {
  const { index, setIndex, count, loop } = useCarouselCtx('Carousel.Previous');
  const isDisabled = disabled || (!loop && index <= 0);
  const Comp = asChild ? Slot : 'button';
  return <Comp {...props} type="button" disabled={isDisabled} aria-label={props['aria-label'] ?? 'Slide anterior'} className={cx('few-carousel-previous', className)}
    onClick={(event) => { onClick?.(event); if (!event.defaultPrevented) setIndex(carouselIndex(index, -1, count, loop)); }} />;
}

export interface CarouselNextProps extends ComponentProps<'button'> { asChild?: boolean }
function CarouselNext({ asChild, className, disabled, onClick, ...props }: CarouselNextProps) {
  const { index, setIndex, count, loop } = useCarouselCtx('Carousel.Next');
  const isDisabled = disabled || (!loop && index >= count - 1);
  const Comp = asChild ? Slot : 'button';
  return <Comp {...props} type="button" disabled={isDisabled} aria-label={props['aria-label'] ?? 'Próximo slide'} className={cx('few-carousel-next', className)}
    onClick={(event) => { onClick?.(event); if (!event.defaultPrevented) setIndex(carouselIndex(index, 1, count, loop)); }} />;
}

export interface CarouselIndicatorsProps extends ComponentProps<'div'> { asChild?: boolean }
function CarouselIndicators({ asChild, className, ...props }: CarouselIndicatorsProps) {
  const { count, index, setIndex } = useCarouselCtx('Carousel.Indicators');
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} role="tablist" aria-label="Ir para o slide" className={cx('few-carousel-indicators', className)}>
    {Array.from({ length: count }, (_, i) => (
      <button key={i} type="button" role="tab" aria-current={i === index || undefined} aria-selected={i === index} aria-label={`Ir para o slide ${i + 1} de ${count}`} className="few-carousel-indicator" onClick={() => setIndex(i)} />
    ))}
  </Comp>;
}

/** Carousel composto: <Carousel><Carousel.Viewport><Carousel.Content><Carousel.Item/>…</Carousel.Content></Carousel.Viewport><Carousel.Previous/><Carousel.Next/><Carousel.Indicators/></Carousel> */
export const Carousel = Object.assign(CarouselRoot, { Root: CarouselRoot, Viewport: CarouselViewport, Content: CarouselContent, Item: CarouselItem, Previous: CarouselPrevious, Next: CarouselNext, Indicators: CarouselIndicators });
export { CarouselRoot, CarouselViewport, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, CarouselIndicators };
