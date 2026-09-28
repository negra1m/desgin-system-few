// Table: primitiva composta de tabela acessível (ver docs/composition-vue.md). FewDataTable é o atalho orientado a dados sobre esta base.
import { cloneVNode, defineComponent, h, mergeProps, type PropType } from 'vue';
import { renderPrimitive, dataAttr } from '../../lib/primitive.js';

/** Wrapper com rolagem horizontal (`role="region"`, focável) + `<table>`. `asChild` aplica os atributos do wrapper direto na `<table>` (sem a div de rolagem). */
export const FewTable = defineComponent({
  name: 'FewTable',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    /** Densidade do espaçamento de células. */
    density: { type: String as PropType<'compact' | 'comfortable'>, default: 'comfortable' },
    /** Zebra nas linhas do corpo. */
    striped: { type: Boolean, default: false },
    /** Fixa o cabeçalho ao rolar verticalmente. */
    stickyHeader: { type: Boolean, default: false },
  },
  setup(props, { slots, attrs }) {
    return () => {
      const table = h('table', {
        class: ['few-table', props.striped && 'few-table--striped'],
        'data-density': props.density,
        'data-sticky-header': dataAttr(props.stickyHeader),
      }, slots.default?.());
      const wrapperProps = mergeProps(attrs, { role: 'region', tabindex: 0, class: 'few-table-root', 'data-density': props.density });
      if (!props.asChild) return h('div', wrapperProps, [table]);
      return cloneVNode(table, wrapperProps, true);
    };
  },
});

export const FewTableCaption = defineComponent({
  name: 'FewTableCaption',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('caption', props.asChild, mergeProps(attrs, { class: 'few-table-caption' }), slots);
  },
});

export const FewTableHeader = defineComponent({
  name: 'FewTableHeader',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('thead', props.asChild, mergeProps(attrs, { class: 'few-table-header' }), slots);
  },
});

export const FewTableBody = defineComponent({
  name: 'FewTableBody',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('tbody', props.asChild, mergeProps(attrs, { class: 'few-table-body' }), slots);
  },
});

export const FewTableFooter = defineComponent({
  name: 'FewTableFooter',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('tfoot', props.asChild, mergeProps(attrs, { class: 'few-table-footer' }), slots);
  },
});

export const FewTableRow = defineComponent({
  name: 'FewTableRow',
  inheritAttrs: false,
  props: { asChild: Boolean, selected: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('tr', props.asChild, mergeProps(attrs, {
      class: 'few-table-row',
      'data-state': props.selected ? 'selected' : undefined,
      'aria-selected': props.selected || undefined,
    }), slots);
  },
});

/** `sortable` ignora `asChild` — o `<th>` precisa do `scope` e do botão interno de ordenação. */
export const FewTableHead = defineComponent({
  name: 'FewTableHead',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    numeric: Boolean,
    sortable: { type: Boolean, default: false },
    sortDirection: { type: String as PropType<'ascending' | 'descending' | 'none'>, default: 'none' },
  },
  emits: ['sort'],
  setup(props, { slots, attrs, emit }) {
    return () => {
      const merged = mergeProps(attrs, {
        scope: 'col',
        'aria-sort': props.sortable ? props.sortDirection : undefined,
        'data-numeric': dataAttr(props.numeric),
        class: 'few-table-head',
      });
      if (props.sortable) {
        return h('th', merged, [
          h('button', { type: 'button', class: 'few-table-sort', 'data-direction': props.sortDirection, onClick: () => emit('sort') }, [
            h('span', null, slots.default?.()),
            h('span', { 'aria-hidden': 'true', class: 'few-table-sort-icon' }),
          ]),
        ]);
      }
      return renderPrimitive('th', props.asChild, merged, slots);
    };
  },
});

export const FewTableCell = defineComponent({
  name: 'FewTableCell',
  inheritAttrs: false,
  props: { asChild: Boolean, numeric: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('td', props.asChild, mergeProps(attrs, { 'data-numeric': dataAttr(props.numeric), class: 'few-table-cell' }), slots);
  },
});

export const FewTableEmpty = defineComponent({
  name: 'FewTableEmpty',
  inheritAttrs: false,
  props: { asChild: Boolean, colSpan: { type: Number, required: true } },
  setup(props, { slots, attrs }) {
    return () => {
      const cell = h('td', { colspan: props.colSpan, class: 'few-table-empty-cell' }, slots.default?.());
      const rowProps = mergeProps(attrs, { class: 'few-table-empty' });
      if (!props.asChild) return h('tr', rowProps, [cell]);
      return cloneVNode(cell, rowProps, true);
    };
  },
});
