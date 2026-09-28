// Grid: ver docs/composition-vue.md. grid-template-columns/span resolvidos pelo headless (@fewcompany/core).
import { defineComponent, mergeProps, type CSSProperties, type PropType } from 'vue';
import { resolveGap, resolveGridColumns, resolveGridSpan, type Gap, type GridColumns } from '@fewcompany/core';
import { renderPrimitive } from '../../lib/primitive.js';

export const FewGrid = defineComponent({
  name: 'FewGrid',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    /** Número de colunas iguais, ou 'auto' (usa minChildWidth com minmax/auto-fit). Padrão 'auto'. */
    columns: { type: [Number, String] as PropType<GridColumns>, default: 'auto' },
    minChildWidth: { type: String, default: '200px' },
    gap: { type: [String, Number] as PropType<Gap>, default: undefined },
    rowGap: { type: [String, Number] as PropType<Gap>, default: undefined },
    align: { type: String as PropType<CSSProperties['alignItems']>, default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, {
      class: 'few-grid',
      style: {
        gridTemplateColumns: resolveGridColumns(props.columns, props.minChildWidth),
        gap: resolveGap(props.gap, '0px'),
        rowGap: props.rowGap !== undefined ? resolveGap(props.rowGap) : undefined,
        alignItems: props.align,
      } as CSSProperties,
    }), slots);
  },
});

export const FewGridItem = defineComponent({
  name: 'FewGridItem',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    colSpan: { type: Number, default: undefined },
    rowSpan: { type: Number, default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, {
      class: 'few-grid-item',
      style: { gridColumn: resolveGridSpan(props.colSpan), gridRow: resolveGridSpan(props.rowSpan) } as CSSProperties,
    }), slots);
  },
});
