// AspectRatio: ver docs/composition-angular.md. Espelha packages/react/src/components/layout/aspect-ratio.tsx:
// wrapper externo fixo (padding-bottom) + conteúdo interno absoluto. @Component porque envolve o conteúdo com markup próprio.
import { Component, computed, input } from '@angular/core';

@Component({
  selector: '[fewAspectRatio]',
  template: `<div class="few-aspect-ratio-content" style="position:absolute;inset:0"><ng-content></ng-content></div>`,
  host: {
    class: 'few-aspect-ratio',
    '[style.position]': "'relative'",
    '[style.width]': "'100%'",
    '[style.padding-bottom.%]': 'paddingBottomPercent()',
  },
})
export class FewAspectRatio {
  /** Largura / altura. Padrão 16/9. */
  readonly ratio = input<number>(16 / 9);
  protected readonly paddingBottomPercent = computed(() => 100 / this.ratio());
}

export const FEW_ASPECT_RATIO = [FewAspectRatio] as const;
