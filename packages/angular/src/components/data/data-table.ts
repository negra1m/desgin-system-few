// DataTable: atalho orientado a dados sobre Table (ver table.ts). Fonte da verdade: packages/react/src/components/data/data-table.tsx.
import { Component, TemplateRef, booleanAttribute, computed, input, model } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import type { SortDirection } from '@fewcompany/core';
import { sortRows } from '@fewcompany/core';
import { FewTable, FewTableCaption, FewTableHeader, FewTableBody, FewTableRow, FewTableHead, FewTableCell, FewTableEmpty } from './table.js';

export interface FewDataTableColumn<T> {
  key: string;
  label: string;
  /** Render simples (texto). Ignorado quando `cell` está definido. */
  render?: (row: T) => string;
  /** Render customizado por ng-template: `context.$implicit` é a linha. Tem prioridade sobre `render`. */
  cell?: TemplateRef<{ $implicit: T }>;
  sortable?: boolean;
  numeric?: boolean;
  width?: string | number;
}
export interface FewDataTableSort { key: string; direction: SortDirection }

/**
 * Atalho orientado a dados: caption + colunas + linhas, ordenação (`sort` controlado/não-controlado via model) e
 * seleção opcionais (`selectable` + `selected` model). Para composição livre, use as partes de `table.ts`.
 */
@Component({
  selector: 'few-data-table',
  imports: [FewTable, FewTableCaption, FewTableHeader, FewTableBody, FewTableRow, FewTableHead, FewTableCell, FewTableEmpty, NgTemplateOutlet],
  host: { class: 'few-data-table' },
  template: `
    <div fewTable [density]="density()" [striped]="striped()" [stickyHeader]="stickyHeader()">
      <caption fewTableCaption>{{ caption() }}</caption>
      <thead fewTableHeader>
        <tr fewTableRow>
          @if (selectable()) {
            <th fewTableHead>
              <input type="checkbox" [checked]="allSelected()" (change)="toggleAll()" aria-label="Selecionar todas as linhas" />
            </th>
          }
          @for (column of columns(); track column.key) {
            <th fewTableHead [numeric]="!!column.numeric" [sortable]="!!column.sortable"
              [sortDirection]="sortDirectionFor(column.key)" (sort)="toggleSort(column.key)"
              [style.width]="widthOf(column.width)">{{ column.label }}</th>
          }
        </tr>
      </thead>
      <tbody fewTableBody>
        @if (sortedRows().length === 0) {
          <tr fewTableEmpty [colSpan]="colSpan()">{{ emptyMessage() }}</tr>
        } @else {
          @for (row of sortedRows(); track rowKey()(row)) {
            <tr fewTableRow [selected]="isSelected(row)">
              @if (selectable()) {
                <td fewTableCell>
                  <input type="checkbox" [checked]="isSelected(row)" (change)="toggleRow(rowKey()(row))" [attr.aria-label]="'Selecionar linha ' + rowKey()(row)" />
                </td>
              }
              @for (column of columns(); track column.key) {
                <td fewTableCell [numeric]="!!column.numeric">
                  @if (column.cell) {
                    <ng-container *ngTemplateOutlet="column.cell; context: { $implicit: row }"></ng-container>
                  } @else {
                    {{ column.render ? column.render(row) : '' }}
                  }
                </td>
              }
            </tr>
          }
        }
      </tbody>
    </div>
  `,
})
export class FewDataTable<T> {
  readonly caption = input.required<string>();
  readonly columns = input.required<FewDataTableColumn<T>[]>();
  readonly rows = input.required<T[]>();
  readonly rowKey = input.required<(row: T) => string>();
  readonly emptyMessage = input('Nenhum registro encontrado.');
  readonly sort = model<FewDataTableSort | null>(null);
  readonly selectable = input(false, { transform: booleanAttribute });
  readonly selected = model<string[]>([]);
  readonly density = input<'compact' | 'comfortable'>('comfortable');
  readonly striped = input(false, { transform: booleanAttribute });
  readonly stickyHeader = input(false, { transform: booleanAttribute });

  protected readonly sortedRows = computed(() => {
    const sort = this.sort();
    return sort ? sortRows(this.rows(), sort.key, sort.direction) : this.rows();
  });
  protected readonly colSpan = computed(() => this.columns().length + (this.selectable() ? 1 : 0));
  protected readonly allSelected = computed(() => {
    const rows = this.rows();
    return this.selectable() && rows.length > 0 && rows.every(row => this.selected().includes(this.rowKey()(row)));
  });

  protected sortDirectionFor(key: string): 'ascending' | 'descending' | 'none' {
    const sort = this.sort();
    if (!sort || sort.key !== key) return 'none';
    return sort.direction === 'asc' ? 'ascending' : 'descending';
  }
  protected toggleSort(key: string) {
    const current = this.sort();
    if (!current || current.key !== key) { this.sort.set({ key, direction: 'asc' }); return; }
    if (current.direction === 'asc') { this.sort.set({ key, direction: 'desc' }); return; }
    this.sort.set(null);
  }
  protected isSelected(row: T) { return this.selected().includes(this.rowKey()(row)); }
  protected toggleAll() {
    this.selected.set(this.allSelected() ? [] : this.rows().map(this.rowKey()));
  }
  protected toggleRow(id: string) {
    const current = this.selected();
    this.selected.set(current.includes(id) ? current.filter(x => x !== id) : [...current, id]);
  }
  protected widthOf(width: string | number | undefined): string | null {
    if (width === undefined) return null;
    return typeof width === 'number' ? `${width}px` : width;
  }
}
