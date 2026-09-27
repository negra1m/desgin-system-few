"use client";
// DataTable: atalho orientado a dados sobre Table (ver table.tsx). Migra o DataTable antigo (git show HEAD:packages/ui/src/index.tsx).
import type { CSSProperties, ReactNode } from 'react';
import type { SortDirection } from '@fewcompany/core';
import { sortRows } from '@fewcompany/core';
import { useControllableState } from '../../lib/use-controllable-state.js';
import { cx } from '../../lib/cx.js';
import { TableRoot, TableCaption, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from './table.js';

export interface DataTableColumn<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  sortable?: boolean;
  numeric?: boolean;
  width?: string | number;
}
export interface DataTableSort { key: string; direction: SortDirection }
export interface DataTableSelection { selected: string[]; onSelectedChange: (selected: string[]) => void }
export interface DataTableProps<T> {
  caption: string;
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
  sort?: DataTableSort | null;
  defaultSort?: DataTableSort | null;
  onSortChange?: (sort: DataTableSort | null) => void;
  selection?: DataTableSelection;
  density?: 'compact' | 'comfortable';
  striped?: boolean;
  stickyHeader?: boolean;
  className?: string;
}
/** Atalho orientado a dados: caption + colunas + linhas, ordenação e seleção opcionais. Para composição livre, use `Table.*`. */
export function DataTable<T>({ caption, columns, rows, rowKey, emptyMessage = 'Nenhum registro encontrado.', sort: sortProp, defaultSort = null, onSortChange, selection, density, striped, stickyHeader, className }: DataTableProps<T>) {
  const [sort, setSort] = useControllableState<DataTableSort | null>({ value: sortProp, defaultValue: defaultSort, onChange: onSortChange });
  const sorted = sort ? sortRows(rows, sort.key, sort.direction, (row, key) => (row as Record<string, unknown>)[key]) : rows;
  function toggleSort(key: string) {
    setSort(current => {
      if (!current || current.key !== key) return { key, direction: 'asc' };
      if (current.direction === 'asc') return { key, direction: 'desc' };
      return null;
    });
  }
  const allSelected = !!selection && rows.length > 0 && rows.every(row => selection.selected.includes(rowKey(row)));
  function toggleAll() { if (selection) selection.onSelectedChange(allSelected ? [] : rows.map(rowKey)); }
  function toggleRow(id: string) { if (selection) selection.onSelectedChange(selection.selected.includes(id) ? selection.selected.filter(x => x !== id) : [...selection.selected, id]); }
  const colSpan = columns.length + (selection ? 1 : 0);
  return <TableRoot className={className} density={density} striped={striped} stickyHeader={stickyHeader}>
    <TableCaption>{caption}</TableCaption>
    <TableHeader>
      <TableRow>
        {selection && <TableHead><input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Selecionar todas as linhas" /></TableHead>}
        {columns.map(column => (
          <TableHead key={column.key} numeric={column.numeric} sortable={column.sortable}
            sortDirection={sort?.key === column.key ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
            onSort={column.sortable ? () => toggleSort(column.key) : undefined}
            style={column.width !== undefined ? ({ width: column.width } as CSSProperties) : undefined}>
            {column.label}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
    <TableBody>
      {sorted.length === 0
        ? <TableEmpty colSpan={colSpan}>{emptyMessage}</TableEmpty>
        : sorted.map(row => {
            const id = rowKey(row);
            const isSelected = selection?.selected.includes(id);
            return <TableRow key={id} selected={isSelected}>
              {selection && <TableCell><input type="checkbox" checked={!!isSelected} onChange={() => toggleRow(id)} aria-label={`Selecionar linha ${id}`} /></TableCell>}
              {columns.map(column => <TableCell key={column.key} numeric={column.numeric}>{column.render(row)}</TableCell>)}
            </TableRow>;
          })}
    </TableBody>
  </TableRoot>;
}
