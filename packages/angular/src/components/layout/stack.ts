// Stack: ver docs/composition-angular.md. Espelha packages/react/src/components/layout/stack.tsx: flex com gap
// resolvido pelo headless (@fewcompany/core), direção responsiva via CSS vars (few.css lê --few-stack-direction[-md]).
import { Directive, booleanAttribute, computed, input } from '@angular/core';
import { resolveGap, type Gap } from '@fewcompany/core';

export type StackDirection = 'row' | 'column';
export interface StackDirectionResponsive { base: StackDirection; md?: StackDirection }

@Directive({
  selector: '[fewStack]',
  host: {
    class: 'few-stack',
    '[attr.data-responsive]': 'responsiveAttr()',
    '[style.--few-stack-direction]': 'base()',
    '[style.--few-stack-direction-md]': 'md()',
    '[style.--few-stack-gap]': 'gapValue()',
    '[style.align-items]': 'align()',
    '[style.justify-content]': 'justify()',
    '[style.flex-wrap]': 'wrapValue()',
  },
})
export class FewStack {
  /** 'row' | 'column', ou responsivo: { base: 'column', md: 'row' } (troca em 768px). */
  readonly direction = input<StackDirection | StackDirectionResponsive>('column');
  /** Token da escala (1,2,3,4,6,8,12,16) ou valor CSS cru (ex.: '2rem'). */
  readonly gap = input<Gap | undefined>(undefined);
  readonly align = input<string | undefined>(undefined);
  readonly justify = input<string | undefined>(undefined);
  readonly wrap = input(false, { transform: booleanAttribute });

  protected readonly base = computed(() => {
    const d = this.direction();
    return typeof d === 'object' ? d.base : d;
  });
  protected readonly md = computed(() => {
    const d = this.direction();
    return typeof d === 'object' ? d.md : undefined;
  });
  protected readonly responsiveAttr = computed(() => (this.md() ? '' : null));
  protected readonly gapValue = computed(() => resolveGap(this.gap(), '0px'));
  protected readonly wrapValue = computed(() => (this.wrap() ? 'wrap' : undefined));
}

export const FEW_STACK = [FewStack] as const;
