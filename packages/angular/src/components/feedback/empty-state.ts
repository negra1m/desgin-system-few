// EmptyState (ver docs/composition-angular.md). Fonte da verdade: packages/react/src/components/feedback/empty-state.tsx.
import { Component, Directive, computed, input } from '@angular/core';
import type { Size } from '@fewcompany/core';

/** Raiz: `<div fewEmptyState size="sm">`. */
@Directive({
  selector: '[fewEmptyState]',
  exportAs: 'fewEmptyState',
  host: { '[class]': 'classes()', '[attr.data-size]': 'size()' },
})
export class FewEmptyState {
  readonly size = input<Size>('md');
  protected readonly classes = computed(() => `few-empty few-empty--${this.size()}`);
}

/** Ícone: `<span fewEmptyStateIcon></span>`. Sem conteúdo projetado, cai no ícone padrão "↗". */
@Component({
  selector: '[fewEmptyStateIcon]',
  host: { class: 'few-empty-icon', 'aria-hidden': 'true' },
  template: `<ng-content>↗</ng-content>`,
})
export class FewEmptyStateIcon {}

@Directive({ selector: '[fewEmptyStateTitle]', host: { class: 'few-empty-title' } })
export class FewEmptyStateTitle {}

@Directive({ selector: '[fewEmptyStateDescription]', host: { class: 'few-empty-description few-muted' } })
export class FewEmptyStateDescription {}

@Directive({ selector: '[fewEmptyStateActions]', host: { class: 'few-empty-actions' } })
export class FewEmptyStateActions {}

/** Importe tudo de uma vez: `imports: [FEW_EMPTY_STATE]`. */
export const FEW_EMPTY_STATE = [FewEmptyState, FewEmptyStateIcon, FewEmptyStateTitle, FewEmptyStateDescription, FewEmptyStateActions] as const;
