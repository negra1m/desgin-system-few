// DescriptionList: pares termo/detalhe (ver docs/composition-angular.md). Fonte da verdade: packages/react/src/components/data/description-list.tsx.
import { Directive, input } from '@angular/core';

export type FewDescriptionListLayout = 'vertical' | 'horizontal';

@Directive({
  selector: '[fewDescriptionList]',
  host: {
    class: 'few-description-list',
    '[attr.data-layout]': 'layout()',
    '[style.--few-dl-columns]': 'columns() > 1 ? columns() : null',
  },
})
export class FewDescriptionList {
  readonly layout = input<FewDescriptionListLayout>('vertical');
  readonly columns = input(1);
}

@Directive({ selector: '[fewDescriptionListItem]', host: { class: 'few-description-list-item' } })
export class FewDescriptionListItem {}

@Directive({ selector: 'dt[fewDescriptionListTerm]', host: { class: 'few-description-list-term' } })
export class FewDescriptionListTerm {}

@Directive({ selector: 'dd[fewDescriptionListDetails]', host: { class: 'few-description-list-details' } })
export class FewDescriptionListDetails {}

/** Importe tudo de uma vez: `imports: [FEW_DESCRIPTION_LIST]`. */
export const FEW_DESCRIPTION_LIST = [FewDescriptionList, FewDescriptionListItem, FewDescriptionListTerm, FewDescriptionListDetails] as const;
