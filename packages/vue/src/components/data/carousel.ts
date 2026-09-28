// Carousel: trilho com scroll-snap, teclado ←→ e indicadores (ver docs/composition-vue.md).
import { cloneVNode, defineComponent, h, mergeProps, ref, watch, type PropType, type Ref, type Slots } from 'vue';
import type { Orientation } from '@fewcompany/core';
import { carouselIndex } from '@fewcompany/core';
import { createContext } from '../../lib/context.js';
import { useControllable } from '../../lib/use-controllable.js';
import { renderPrimitive, dataAttr, slotNodes } from '../../lib/primitive.js';

interface CarouselContextValue {
  orientation: () => Orientation; loop: () => boolean; align: () => 'start' | 'center';
  index: () => number; setIndex: (index: number) => void;
  count: () => number; setCount: (count: number) => void;
  viewportRef: Ref<HTMLElement | null>;
}
const [provideCarousel, useCarousel] = createContext<CarouselContextValue>('FewCarousel');

/** Raiz: `<FewCarousel v-model:index="slide">`. Sem `index`, o estado é interno (`defaultIndex`). */
export const FewCarousel = defineComponent({
  name: 'FewCarousel',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    orientation: { type: String as PropType<Orientation>, default: 'horizontal' },
    loop: { type: Boolean, default: false },
    align: { type: String as PropType<'start' | 'center'>, default: 'start' },
    index: { type: Number, default: undefined },
    defaultIndex: { type: Number, default: 0 },
  },
  emits: { 'update:index': (index: number) => typeof index === 'number' },
  setup(props, { slots, attrs, emit }) {
    const [current, setCurrent] = useControllable<number>(() => props.index, props.defaultIndex, v => emit('update:index', v));
    const count = ref(0);
    const viewportRef = ref<HTMLElement | null>(null);
    provideCarousel({
      orientation: () => props.orientation, loop: () => props.loop, align: () => props.align,
      index: () => current.value, setIndex: setCurrent,
      count: () => count.value, setCount: (n: number) => { count.value = n; },
      viewportRef,
    });
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, {
      role: 'group', 'aria-roledescription': 'carousel', class: 'few-carousel', 'data-orientation': props.orientation,
    }), slots);
  },
});

export const FewCarouselViewport = defineComponent({
  name: 'FewCarouselViewport',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const carousel = useCarousel('FewCarousel.Viewport');

    watch([() => carousel.index(), () => carousel.orientation()], () => {
      const el = carousel.viewportRef.value;
      if (!el) return;
      const items = el.querySelectorAll<HTMLElement>('[data-few-carousel-item]');
      const target = items[carousel.index()];
      if (!target) return;
      const behavior = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
      if (carousel.orientation() === 'horizontal') el.scrollTo({ left: target.offsetLeft, behavior });
      else el.scrollTo({ top: target.offsetTop, behavior });
    }, { immediate: true, flush: 'post' });

    function handleScroll(event: Event) {
      const el = event.currentTarget as HTMLElement;
      const size = carousel.orientation() === 'horizontal' ? el.clientWidth : el.clientHeight;
      const pos = carousel.orientation() === 'horizontal' ? el.scrollLeft : el.scrollTop;
      if (size <= 0) return;
      const next = Math.round(pos / size);
      if (next !== carousel.index() && next >= 0 && next < carousel.count()) carousel.setIndex(next);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented) return;
      const forward = carousel.orientation() === 'horizontal' ? event.key === 'ArrowRight' : event.key === 'ArrowDown';
      const backward = carousel.orientation() === 'horizontal' ? event.key === 'ArrowLeft' : event.key === 'ArrowUp';
      if (!forward && !backward) return;
      event.preventDefault();
      carousel.setIndex(carouselIndex(carousel.index(), forward ? 1 : -1, carousel.count(), carousel.loop()));
    }
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, {
      ref: carousel.viewportRef, tabindex: 0, class: 'few-carousel-viewport', 'data-orientation': carousel.orientation(),
      onScroll: handleScroll, onKeydown: handleKeyDown,
    }), slots);
  },
});

export const FewCarouselContent = defineComponent({
  name: 'FewCarouselContent',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const carousel = useCarousel('FewCarousel.Content');
    return () => {
      const items = slotNodes(slots.default?.());
      const total = items.length;
      carousel.setCount(total);
      const cloned = items.map((node, i) => cloneVNode(node, { 'data-few-carousel-index': i, 'data-few-carousel-total': total }));
      return renderPrimitive('div', props.asChild, mergeProps(attrs, { class: 'few-carousel-content', 'data-orientation': carousel.orientation() }),
        { default: () => cloned } as Slots);
    };
  },
});

export const FewCarouselItem = defineComponent({
  name: 'FewCarouselItem',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => {
      const index = Number(attrs['data-few-carousel-index'] ?? 0);
      const total = Number(attrs['data-few-carousel-total'] ?? 1);
      return renderPrimitive('div', props.asChild, mergeProps(attrs, {
        'data-few-carousel-item': dataAttr(true), role: 'group', 'aria-roledescription': 'slide',
        'aria-label': `${index + 1} de ${total}`, class: 'few-carousel-item',
      }), slots);
    };
  },
});

export const FewCarouselPrevious = defineComponent({
  name: 'FewCarouselPrevious',
  inheritAttrs: false,
  props: { asChild: Boolean, disabled: { type: Boolean, default: undefined } },
  setup(props, { slots, attrs }) {
    const carousel = useCarousel('FewCarousel.Previous');
    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented) return;
      carousel.setIndex(carouselIndex(carousel.index(), -1, carousel.count(), carousel.loop()));
    }
    return () => {
      const isDisabled = props.disabled || (!carousel.loop() && carousel.index() <= 0);
      return renderPrimitive('button', props.asChild, mergeProps(attrs, {
        type: 'button', disabled: isDisabled || undefined, 'aria-label': (attrs['aria-label'] as string | undefined) ?? 'Slide anterior',
        class: 'few-carousel-previous', onClick: handleClick,
      }), slots);
    };
  },
});

export const FewCarouselNext = defineComponent({
  name: 'FewCarouselNext',
  inheritAttrs: false,
  props: { asChild: Boolean, disabled: { type: Boolean, default: undefined } },
  setup(props, { slots, attrs }) {
    const carousel = useCarousel('FewCarousel.Next');
    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented) return;
      carousel.setIndex(carouselIndex(carousel.index(), 1, carousel.count(), carousel.loop()));
    }
    return () => {
      const isDisabled = props.disabled || (!carousel.loop() && carousel.index() >= carousel.count() - 1);
      return renderPrimitive('button', props.asChild, mergeProps(attrs, {
        type: 'button', disabled: isDisabled || undefined, 'aria-label': (attrs['aria-label'] as string | undefined) ?? 'Próximo slide',
        class: 'few-carousel-next', onClick: handleClick,
      }), slots);
    };
  },
});

export const FewCarouselIndicators = defineComponent({
  name: 'FewCarouselIndicators',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { attrs }) {
    const carousel = useCarousel('FewCarousel.Indicators');
    return () => {
      const buttons = Array.from({ length: carousel.count() }, (_, i) => h('button', {
        key: i, type: 'button', role: 'tab', 'aria-current': i === carousel.index() || undefined,
        'aria-selected': i === carousel.index(), 'aria-label': `Ir para o slide ${i + 1} de ${carousel.count()}`,
        class: 'few-carousel-indicator', onClick: () => carousel.setIndex(i),
      }));
      return renderPrimitive('div', props.asChild, mergeProps(attrs, { role: 'tablist', 'aria-label': 'Ir para o slide', class: 'few-carousel-indicators' }),
        { default: () => buttons } as Slots);
    };
  },
});
