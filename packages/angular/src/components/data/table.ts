// Table: primitiva composta de tabela acessível (ver docs/composition-angular.md). Fonte da verdade: packages/react/src/components/data/table.tsx.
// DataTable (data-table.ts) é o atalho orientado a dados sobre esta base.
import { Component, Directive, booleanAttribute, input, output } from '@angular/core';
import { dataAttr } from '../../lib/attrs.js';

export type FewTableDensity = 'compact' | 'comfortable';
export type FewTableSortDirection = 'ascending' | 'descending' | 'none';

/**
 * Raiz: `<div fewTable>` gera a `<table class="few-table">` e projeta o conteúdo (caption/thead/tbody/tfoot) dentro dela.
 * O wrapper (host, `<div>`) recebe `role="region"` + `tabindex="0"` para rolagem horizontal acessível — equivalente ao `Table.Root` do React.
 */
@Component({
  selector: '[fewTable]',
  host: {
    class: 'few-table-root',
    role: 'region',
    tabindex: '0',
    '[attr.data-density]': 'density()',
  },
  template: `<table class="few-table" [class.few-table--striped]="striped()" [attr.data-density]="density()" [attr.data-sticky-header]="dataAttr(stickyHeader())"><ng-content></ng-content></table>`,
})
export class FewTable {
  readonly density = input<FewTableDensity>('comfortable');
  readonly striped = input(false, { transform: booleanAttribute });
  readonly stickyHeader = input(false, { transform: booleanAttribute });
  protected readonly dataAttr = dataAttr;
}

@Directive({ selector: '[fewTableCaption]', host: { class: 'few-table-caption' } })
export class FewTableCaption {}

@Directive({ selector: '[fewTableHeader]', host: { class: 'few-table-header' } })
export class FewTableHeader {}

@Directive({ selector: '[fewTableBody]', host: { class: 'few-table-body' } })
export class FewTableBody {}

@Directive({ selector: '[fewTableFooter]', host: { class: 'few-table-footer' } })
export class FewTableFooter {}

@Directive({
  selector: '[fewTableRow]',
  host: {
    class: 'few-table-row',
    '[attr.data-state]': 'selected() ? "selected" : null',
    '[attr.aria-selected]': 'selected() || null',
  },
})
export class FewTableRow {
  readonly selected = input(false, { transform: booleanAttribute });
}

/** `<th fewTableHead>`: `scope="col"` fixo. `sortable` desenha o botão interno de ordenação (ignora conteúdo simples). */
@Component({
  selector: 'th[fewTableHead]',
  host: {
    class: 'few-table-head',
    scope: 'col',
    '[attr.aria-sort]': 'sortable() ? sortDirection() : null',
    '[attr.data-numeric]': 'dataAttr(numeric())',
  },
  template: `
    @if (sortable()) {
      <button type="button" class="few-table-sort" [attr.data-direction]="sortDirection()" (click)="sort.emit()">
        <span><ng-content></ng-content></span><span aria-hidden="true" class="few-table-sort-icon"></span>
      </button>
    } @else {
      <ng-content></ng-content>
    }
  `,
})
export class FewTableHead {
  readonly numeric = input(false, { transform: booleanAttribute });
  readonly sortable = input(false, { transform: booleanAttribute });
  readonly sortDirection = input<FewTableSortDirection>('none');
  readonly sort = output<void>();
  protected readonly dataAttr = dataAttr;
}

@Directive({
  selector: '[fewTableCell]',
  host: { class: 'few-table-cell', '[attr.data-numeric]': 'dataAttr(numeric())' },
})
export class FewTableCell {
  readonly numeric = input(false, { transform: booleanAttribute });
  protected readonly dataAttr = dataAttr;
}

/** `<tr fewTableEmpty [colSpan]="n">Mensagem</tr>`: envolve o conteúdo projetado num único `<td>`. */
@Component({
  selector: 'tr[fewTableEmpty]',
  host: { class: 'few-table-empty' },
  template: `<td [attr.colspan]="colSpan()" class="few-table-empty-cell"><ng-content></ng-content></td>`,
})
export class FewTableEmpty {
  readonly colSpan = input.required<number>();
}

/** Importe tudo de uma vez: `imports: [FEW_TABLE]`. */
export const FEW_TABLE = [FewTable, FewTableCaption, FewTableHeader, FewTableBody, FewTableFooter, FewTableRow, FewTableHead, FewTableCell, FewTableEmpty] as const;
