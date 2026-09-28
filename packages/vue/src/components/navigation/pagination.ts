// Paginação. Ver pagination.tsx no React. Lógica pura (paginationRange) vem do core.
import { computed, defineComponent, h, mergeProps } from 'vue';
import { paginationRange } from '@fewcompany/core';
import { createContext } from '../../lib/context.js';
import { useControllable } from '../../lib/use-controllable.js';
import { renderPrimitive, dataAttr } from '../../lib/primitive.js';

interface PaginationContext { page: () => number; setPage: (page: number) => void; total: () => number; siblings: () => number }
const [providePagination, usePagination, usePaginationOptional] = createContext<PaginationContext>('FewPagination');

/** Raiz: `<FewPagination v-model:page="page" :total="12">`. */
export const FewPagination = defineComponent({
  name: 'FewPagination',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    page: { type: Number, default: undefined },
    defaultPage: { type: Number, default: 1 },
    /** Total de páginas; quando > 0, FewPaginationList se auto-preenche com paginationRange. */
    total: { type: Number, default: 0 },
    /** Páginas vizinhas mostradas de cada lado da atual. */
    siblings: { type: Number, default: 1 },
  },
  emits: { 'update:page': (page: number) => typeof page === 'number' },
  setup(props, { slots, attrs, emit }) {
    const [page, setPage] = useControllable(() => props.page, props.defaultPage, p => emit('update:page', p));
    providePagination({ page: () => page.value, setPage, total: () => props.total, siblings: () => props.siblings });
    return () => renderPrimitive('nav', props.asChild, mergeProps(attrs, {
      'aria-label': (attrs['aria-label'] as string | undefined) ?? 'Paginação', class: 'few-pagination',
    }), slots);
  },
});

/** Lista de páginas. Sem slot, se auto-preenche a partir de total/siblings (paginationRange). Com slot, composição manual. */
export const FewPaginationList = defineComponent({
  name: 'FewPaginationList',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const pagination = usePagination('FewPaginationList');
    return () => {
      const hasChildren = Boolean(slots.default);
      const content = hasChildren ? slots.default!() : (pagination.total() > 0
        ? paginationRange(pagination.page(), pagination.total(), pagination.siblings()).map((entry, index) =>
            h(FewPaginationItem, { key: entry === 'ellipsis' ? `ellipsis-${index}` : entry }, () =>
              entry === 'ellipsis' ? h(FewPaginationEllipsis) : h(FewPaginationLink, { page: entry, isActive: entry === pagination.page() }, () => String(entry))))
        : []);
      return renderPrimitive('ul', props.asChild, mergeProps(attrs, { class: 'few-pagination-list' }), { default: () => content });
    };
  },
});

export const FewPaginationItem = defineComponent({
  name: 'FewPaginationItem',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('li', props.asChild, mergeProps(attrs, { class: 'few-pagination-item' }), slots);
  },
});

export const FewPaginationLink = defineComponent({
  name: 'FewPaginationLink',
  inheritAttrs: false,
  props: { asChild: Boolean, isActive: { type: Boolean, default: undefined }, page: { type: Number, default: undefined } },
  setup(props, { slots, attrs }) {
    const pagination = usePaginationOptional();
    const active = computed(() => props.isActive ?? (props.page !== undefined && pagination?.page() === props.page));
    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented) return;
      event.preventDefault();
      if (props.page !== undefined) pagination?.setPage(props.page);
    }
    return () => renderPrimitive('a', props.asChild, mergeProps(attrs, {
      href: (attrs['href'] as string | undefined) ?? '#',
      'aria-current': active.value ? 'page' : undefined, 'data-state': active.value ? 'active' : undefined,
      class: 'few-pagination-link', onClick: handleClick,
    }), slots);
  },
});

export const FewPaginationPrevious = defineComponent({
  name: 'FewPaginationPrevious',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const pagination = usePaginationOptional();
    const disabled = computed(() => (pagination ? pagination.page() <= 1 : false));
    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented) return;
      event.preventDefault();
      if (!pagination || disabled.value) return;
      pagination.setPage(pagination.page() - 1);
    }
    return () => renderPrimitive('a', props.asChild, mergeProps(attrs, {
      href: (attrs['href'] as string | undefined) ?? '#',
      'aria-label': (attrs['aria-label'] as string | undefined) ?? 'Página anterior',
      'aria-disabled': disabled.value ? true : undefined, 'data-disabled': dataAttr(disabled.value),
      class: 'few-pagination-previous', onClick: handleClick,
    }), slots, children => children.length ? children : ['‹ Anterior']);
  },
});

export const FewPaginationNext = defineComponent({
  name: 'FewPaginationNext',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const pagination = usePaginationOptional();
    const disabled = computed(() => (pagination ? pagination.total() > 0 && pagination.page() >= pagination.total() : false));
    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented) return;
      event.preventDefault();
      if (!pagination || disabled.value) return;
      pagination.setPage(pagination.page() + 1);
    }
    return () => renderPrimitive('a', props.asChild, mergeProps(attrs, {
      href: (attrs['href'] as string | undefined) ?? '#',
      'aria-label': (attrs['aria-label'] as string | undefined) ?? 'Próxima página',
      'aria-disabled': disabled.value ? true : undefined, 'data-disabled': dataAttr(disabled.value),
      class: 'few-pagination-next', onClick: handleClick,
    }), slots, children => children.length ? children : ['Próxima ›']);
  },
});

export const FewPaginationEllipsis = defineComponent({
  name: 'FewPaginationEllipsis',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('span', props.asChild, mergeProps(attrs, { 'aria-hidden': 'true', class: 'few-pagination-ellipsis' }), slots, children => children.length ? children : ['…']);
  },
});
