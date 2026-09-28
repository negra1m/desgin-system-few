// Progress (ver docs/composition-angular.md). Fonte da verdade: packages/react/src/components/feedback/progress.tsx.
import { Component, Directive, computed, inject, input } from '@angular/core';
import { clamp, progressPercent, progressValueText, type Tone, type Size } from '@fewcompany/core';

/** Raiz: `<div fewProgress [value]="72">`. value=null → indeterminado (sem aria-valuenow). */
@Directive({
  selector: '[fewProgress]',
  exportAs: 'fewProgress',
  host: {
    '[class]': 'classes()',
    role: 'progressbar',
    '[attr.aria-valuemin]': '0',
    '[attr.aria-valuemax]': 'max()',
    '[attr.aria-valuenow]': 'now()',
    '[attr.aria-valuetext]': 'resolvedValueText()',
    '[attr.data-tone]': 'tone()',
    '[attr.data-size]': 'size()',
    '[attr.data-state]': 'state()',
  },
})
export class FewProgress {
  /** null = indeterminado (sem valor conhecido). */
  readonly value = input<number | null>(0);
  readonly max = input(100);
  readonly size = input<Size>('md');
  readonly tone = input<Tone>('info');
  /** Sobrescreve o aria-valuetext padrão ("72%"). */
  readonly valueText = input<string>();

  readonly percent = computed(() => progressPercent(this.value(), this.max()));
  protected readonly now = computed(() => (this.value() === null ? undefined : clamp(this.value() as number, 0, this.max())));
  protected readonly state = computed(() => (this.value() === null ? 'indeterminate' : 'determinate'));
  protected readonly resolvedValueText = computed(() => this.valueText() ?? progressValueText(this.percent()));
  protected readonly classes = computed(() => `few-progress few-tone--${this.tone()} few-progress--${this.size()}`);
}

@Directive({ selector: '[fewProgressTrack]', host: { class: 'few-progress-track' } })
export class FewProgressTrack {}

/** Barra: `<div fewProgressTrack><div fewProgressIndicator></div></div>`. Largura em % via style. */
@Directive({
  selector: '[fewProgressIndicator]',
  host: {
    class: 'few-progress-indicator',
    '[attr.data-state]': 'state()',
    '[style.width.%]': 'percent()',
  },
})
export class FewProgressIndicator {
  private readonly progress = inject(FewProgress);
  protected readonly percent = computed(() => this.progress.percent());
  protected readonly state = computed(() => (this.percent() === null ? 'indeterminate' : 'determinate'));
}

@Directive({ selector: '[fewProgressLabel]', host: { class: 'few-progress-label' } })
export class FewProgressLabel {}

/** Valor: `<span fewProgressValue></span>`. Sem conteúdo projetado, cai no texto padrão ("72%"). */
@Component({
  selector: '[fewProgressValue]',
  host: { class: 'few-progress-value' },
  template: `<ng-content>{{ defaultText() }}</ng-content>`,
})
export class FewProgressValue {
  private readonly progress = inject(FewProgress);
  protected readonly defaultText = computed(() => progressValueText(this.progress.percent()) ?? '');
}

/** Importe tudo de uma vez: `imports: [FEW_PROGRESS]`. */
export const FEW_PROGRESS = [FewProgress, FewProgressTrack, FewProgressIndicator, FewProgressLabel, FewProgressValue] as const;
