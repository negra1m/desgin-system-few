// Grid: ver docs/composition-angular.md. Espelha packages/react/src/components/layout/grid.tsx:
// grid-template-columns/span resolvidos pelo headless (@fewcompany/core).
import { Directive, computed, input } from '@angular/core';
import { resolveGap, resolveGridColumns, resolveGridSpan, type Gap, type GridColumns } from '@fewcompany/core';

@Directive({
  selector: '[fewGrid]',
  exportAs: 'fewGrid',
  host: {
    class: 'few-grid',
    '[style.grid-template-columns]': 'gridTemplateColumns()',
    '[style.gap]': 'gapValue()',
    '[style.row-gap]': 'rowGapValue()',
    '[style.align-items]': 'align()',
  },
})
export class FewGrid {
  /** Número de colunas iguais, ou 'auto' (usa `minChildWidth` com minmax/auto-fit). Padrão 'auto'. */
  readonly columns = input<GridColumns>('auto');
  readonly minChildWidth = input<string>('200px');
  readonly gap = input<Gap | undefined>(undefined);
  readonly rowGap = input<Gap | undefined>(undefined);
  readonly align = input<string | undefined>(undefined);

  protected readonly gridTemplateColumns = computed(() => resolveGridColumns(this.columns(), this.minChildWidth()));
  protected readonly gapValue = computed(() => resolveGap(this.gap(), '0px'));
  protected readonly rowGapValue = computed(() => (this.rowGap() !== undefined ? resolveGap(this.rowGap()) : undefined));
}

@Directive({
  selector: '[fewGridItem]',
  host: {
    class: 'few-grid-item',
    '[style.grid-column]': 'colSpanValue()',
    '[style.grid-row]': 'rowSpanValue()',
  },
})
export class FewGridItem {
  readonly colSpan = input<number | undefined>(undefined);
  readonly rowSpan = input<number | undefined>(undefined);
  protected readonly colSpanValue = computed(() => resolveGridSpan(this.colSpan()));
  protected readonly rowSpanValue = computed(() => resolveGridSpan(this.rowSpan()));
}

/** Importe tudo de uma vez: `imports: [FEW_GRID]`. */
export const FEW_GRID = [FewGrid, FewGridItem] as const;
