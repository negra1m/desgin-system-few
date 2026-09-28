// ScrollArea: ver docs/composition-vue.md. Rola nativamente; Scrollbar/Thumb existem só por compatibilidade de API (renderizam null).
import { defineComponent, mergeProps, onMounted, onScopeDispose, ref, type PropType } from 'vue';
import type { Orientation } from '@fewcompany/core';
import { createContext } from '../../lib/context.js';
import { renderPrimitive } from '../../lib/primitive.js';

export type ScrollAreaType = 'auto' | 'always' | 'scroll' | 'hover';
interface ScrollAreaContextValue { type: () => ScrollAreaType; orientation: () => Orientation | 'both' }
const [provideScrollArea, useScrollArea] = createContext<ScrollAreaContextValue>('FewScrollArea');

export const FewScrollArea = defineComponent({
  name: 'FewScrollArea',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    type: { type: String as PropType<ScrollAreaType>, default: 'hover' },
    orientation: { type: String as PropType<Orientation | 'both'>, default: 'vertical' },
  },
  setup(props, { slots, attrs }) {
    provideScrollArea({ type: () => props.type, orientation: () => props.orientation });
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { class: 'few-scroll-area', 'data-type': props.type, 'data-orientation': props.orientation }), slots);
  },
});

/** FewScrollAreaViewport: overflow nativo. Marca data-overflow-top/bottom conforme o scroll, para sombras de borda via CSS. */
export const FewScrollAreaViewport = defineComponent({
  name: 'FewScrollAreaViewport',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    /** aria-label da região rolável (obrigatório: viewport tem tabindex=0 e role="region"). */
    label: { type: String, required: true },
  },
  setup(props, { slots, attrs }) {
    useScrollArea('FewScrollAreaViewport');
    const host = ref<HTMLElement | null>(null);
    const update = () => {
      const el = host.value;
      if (!el) return;
      const top = el.scrollTop > 1;
      const bottom = el.scrollTop + el.clientHeight < el.scrollHeight - 1;
      if (top) el.dataset['overflowTop'] = ''; else delete el.dataset['overflowTop'];
      if (bottom) el.dataset['overflowBottom'] = ''; else delete el.dataset['overflowBottom'];
    };
    let observer: ResizeObserver | null = null;
    onMounted(() => {
      const el = host.value;
      if (!el) return;
      update();
      el.addEventListener('scroll', update);
      if (typeof ResizeObserver !== 'undefined') { observer = new ResizeObserver(update); observer.observe(el); }
    });
    onScopeDispose(() => { host.value?.removeEventListener('scroll', update); observer?.disconnect(); });
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { ref: host, tabindex: 0, role: 'region', 'aria-label': props.label, class: 'few-scroll-area-viewport' }), slots);
  },
});

export interface ScrollAreaScrollbarProps { orientation?: Orientation }
/** Existe só por compatibilidade de API: a barra é a nativa, estilizada via CSS (scrollbar-width/color + ::-webkit-scrollbar). */
export const FewScrollAreaScrollbar = defineComponent({
  name: 'FewScrollAreaScrollbar',
  props: { orientation: { type: String as PropType<Orientation>, default: 'vertical' } },
  setup() { return () => null; },
});

export const FewScrollAreaThumb = defineComponent({
  name: 'FewScrollAreaThumb',
  setup() { return () => null; },
});
