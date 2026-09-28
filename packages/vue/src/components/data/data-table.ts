// DataTable: atalho orientado a dados sobre FewTable (ver table.ts). Célula: `column.render(row)` ou slot nomeado `cell-<key>`.
import { computed, defineComponent, h, type PropType, type VNodeChild } from 'vue';
import type { SortDirection } from '@fewcompany/core';
import { sortRows } from '@fewcompany/core';
import { useControllable } from '../../lib/use-controllable.js';
import { FewTable, FewTableCaption, FewTableHeader, FewTableBody, FewTableRow, FewTableHead, FewTableCell, FewTableEmpty } from './table.js';

export interface DataTableColumn {
  key: string;
  label: string;
  /** Opcional: se ausente, usa o slot nomeado `cell-<key>`; sem os dois, cai no valor bruto da linha. */
  render?: (row: Record<string, unknown>) => VNodeChild;
  sortable?: boolean;
  numeric?: boolean;
  width?: string | number;
}
export interface DataTableSort { key: string; direction: SortDirection }
export interface DataTableSelection { selected: string[]; onSelectedChange: (selected: string[]) => void }

/** Atalho orientado a dados: caption + colunas + linhas, ordenação e seleção opcionais. Para composição livre, use `FewTable*`. */
export const FewDataTable = defineComponent({
  name: 'FewDataTable',
  props: {
    caption: { type: String, required: true },
    columns: { type: Array as PropType<DataTableColumn[]>, required: true },
    rows: { type: Array as PropType<Record<string, unknown>[]>, required: true },
    rowKey: { type: Function as PropType<(row: Record<string, unknown>) => string>, required: true },
    emptyMessage: { type: String, default: 'Nenhum registro encontrado.' },
    sort: { type: Object as PropType<DataTableSort | null>, default: undefined },
    defaultSort: { type: Object as PropType<DataTableSort | null>, default: null },
    selection: { type: Object as PropType<DataTableSelection | undefined>, default: undefined },
    density: { type: String as PropType<'compact' | 'comfortable' | undefined>, default: undefined },
    striped: Boolean,
    stickyHeader: Boolean,
  },
  emits: { 'update:sort': (sort: DataTableSort | null) => sort === null || typeof sort === 'object' },
  setup(props, { slots, emit }) {
    const [sort, setSort] = useControllable<DataTableSort | null>(() => props.sort, props.defaultSort, v => emit('update:sort', v));
    const sorted = computed(() => (sort.value ? sortRows(props.rows, sort.value.key, sort.value.direction) : props.rows));

    function toggleSort(key: string) {
      setSort(current => {
        if (!current || current.key !== key) return { key, direction: 'asc' };
        if (current.direction === 'asc') return { key, direction: 'desc' };
        return null;
      });
    }
    const allSelected = computed(() => !!props.selection && props.rows.length > 0 && props.rows.every(row => props.selection!.selected.includes(props.rowKey(row))));
    function toggleAll() { if (props.selection) props.selection.onSelectedChange(allSelected.value ? [] : props.rows.map(props.rowKey)); }
    function toggleRow(id: string) {
      if (!props.selection) return;
      const sel = props.selection.selected;
      props.selection.onSelectedChange(sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]);
    }

    return () => {
      const colSpan = props.columns.length + (props.selection ? 1 : 0);
      const rowsSorted = sorted.value;
      return h(FewTable, { density: props.density, striped: props.striped, stickyHeader: props.stickyHeader }, () => [
        h(FewTableCaption, null, () => props.caption),
        h(FewTableHeader, null, () => [
          h(FewTableRow, null, () => [
            ...(props.selection ? [h(FewTableHead, null, () => h('input', { type: 'checkbox', checked: allSelected.value, onChange: toggleAll, 'aria-label': 'Selecionar todas as linhas' }))] : []),
            ...props.columns.map(column => h(FewTableHead, {
              key: column.key,
              numeric: column.numeric,
              sortable: column.sortable,
              sortDirection: sort.value?.key === column.key ? (sort.value.direction === 'asc' ? 'ascending' : 'descending') : 'none',
              onSort: column.sortable ? () => toggleSort(column.key) : undefined,
              style: column.width !== undefined ? { width: typeof column.width === 'number' ? `${column.width}px` : column.width } : undefined,
            }, () => column.label)),
          ]),
        ]),
        h(FewTableBody, null, () => (rowsSorted.length === 0
          ? h(FewTableEmpty, { colSpan }, () => props.emptyMessage)
          : rowsSorted.map(row => {
              const id = props.rowKey(row);
              const isSelected = props.selection?.selected.includes(id);
              return h(FewTableRow, { key: id, selected: isSelected }, () => [
                ...(props.selection ? [h(FewTableCell, null, () => h('input', { type: 'checkbox', checked: !!isSelected, onChange: () => toggleRow(id), 'aria-label': `Selecionar linha ${id}` }))] : []),
                ...props.columns.map(column => h(FewTableCell, { key: column.key, numeric: column.numeric }, () =>
                  slots[`cell-${column.key}`]?.(row) ?? column.render?.(row) ?? String(row[column.key] ?? ''))),
              ]);
            }))),
      ]);
    };
  },
});
