// Ver docs/composition-angular.md. Fonte da verdade: packages/react/src/components/navigation/steps.tsx.
import { Component, Directive, ElementRef, booleanAttribute, computed, inject, input, model, signal } from '@angular/core';
import { stepStatus, type Orientation } from '@fewcompany/core';
import { dataAttr } from '../../lib/attrs.js';

/** Raiz: `<ol fewSteps [(value)]="step">`. Sem binding, `value` é interno (não controlado). `clickable` habilita navegação por clique/teclado. */
@Directive({
  selector: '[fewSteps]',
  exportAs: 'fewSteps',
  host: { class: 'few-steps', '[attr.data-orientation]': 'orientation()' },
})
export class FewSteps {
  /** Índice da etapa atual (0-based). */
  readonly value = model<number>(0);
  readonly orientation = input<Orientation>('horizontal');
  /** Permite clicar/Enter/Espaço em uma etapa para navegar até ela. */
  readonly clickable = input(false, { transform: booleanAttribute });
  setValue(index: number) { if (this.clickable()) this.value.set(index); }
}

/** Etapa: `<li fewStepsItem [index]="0">`. Publica {index, status} para Indicator/Title/Description. */
@Directive({
  selector: '[fewStepsItem]',
  exportAs: 'fewStepsItem',
  host: {
    class: 'few-steps-item',
    '[attr.data-state]': 'status()', '[attr.data-orientation]': 'steps.orientation()', '[attr.data-disabled]': 'dataAttr(disabled())',
    '[attr.aria-current]': 'status() === "current" ? "step" : null',
    '[attr.role]': 'interactive() ? "button" : null', '[attr.tabindex]': 'interactive() ? 0 : null',
    '(click)': 'onClick()', '(keydown)': 'onKeydown($event)',
  },
})
export class FewStepsItem {
  protected readonly steps = inject(FewSteps);
  readonly index = input.required<number>();
  readonly disabled = input(false, { transform: booleanAttribute });
  protected readonly dataAttr = dataAttr;
  /** Público: lido por FewStepsIndicator/Title/Description, que só têm o item injetado (não herdam). */
  readonly status = computed(() => stepStatus(this.index(), this.steps.value()));
  protected readonly interactive = computed(() => this.steps.clickable() && !this.disabled());
  protected onClick() { if (this.interactive()) this.steps.setValue(this.index()); }
  protected onKeydown(event: KeyboardEvent) {
    if (!this.interactive()) return;
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); this.steps.setValue(this.index()); }
  }
}

/** Indicador da etapa. Sem conteúdo projetado, mostra "✓" (completa) ou o número (1-based). */
@Component({
  selector: '[fewStepsIndicator]',
  host: { class: 'few-steps-indicator', 'aria-hidden': 'true', '[attr.data-state]': 'item.status()' },
  template: `<ng-content />@if (empty()) {<span>{{ item.status() === 'complete' ? '✓' : item.index() + 1 }}</span>}`,
})
export class FewStepsIndicator {
  protected readonly item = inject(FewStepsItem);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly empty = signal(false);
  ngAfterContentInit() { this.empty.set(!this.elementRef.nativeElement.textContent?.trim()); }
}

@Directive({ selector: '[fewStepsTitle]', host: { class: 'few-steps-title', '[attr.data-state]': 'item.status()' } })
export class FewStepsTitle {
  protected readonly item = inject(FewStepsItem);
}

@Directive({ selector: '[fewStepsDescription]', host: { class: 'few-steps-description', '[attr.data-state]': 'item.status()' } })
export class FewStepsDescription {
  protected readonly item = inject(FewStepsItem);
}

@Directive({
  selector: '[fewStepsSeparator]',
  host: { class: 'few-steps-separator', role: 'presentation', 'aria-hidden': 'true', '[attr.data-orientation]': 'steps.orientation()' },
})
export class FewStepsSeparator {
  protected readonly steps = inject(FewSteps);
}

/** Importe tudo de uma vez: `imports: [FEW_STEPS]`. */
export const FEW_STEPS = [FewSteps, FewStepsItem, FewStepsIndicator, FewStepsTitle, FewStepsDescription, FewStepsSeparator] as const;
