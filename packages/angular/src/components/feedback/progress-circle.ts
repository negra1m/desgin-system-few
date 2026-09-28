// ProgressCircle (ver docs/composition-angular.md). Fonte da verdade: packages/react/src/components/feedback/progress-circle.tsx.
import { Component, Directive, computed, inject, input } from '@angular/core';
import { clamp, progressPercent, progressValueText, type Tone, type Size } from '@fewcompany/core';

const SIZE_PX: Record<Size, number> = { sm: 32, md: 48, lg: 64 };
const THICKNESS_PX: Record<Size, number> = { sm: 3, md: 4, lg: 5 };

/** Raiz: `<div fewProgressCircle [value]="72" size="md">`. value=null → indeterminado (gira sem valor conhecido). */
@Directive({
  selector: '[fewProgressCircle]',
  exportAs: 'fewProgressCircle',
  host: {
    '[class]': 'classes()',
    role: 'progressbar',
    '[attr.aria-valuemin]': '0',
    '[attr.aria-valuemax]': 'max()',
    '[attr.aria-valuenow]': 'now()',
    '[attr.aria-valuetext]': 'resolvedValueText()',
    '[attr.data-tone]': 'tone()',
    '[attr.data-state]': 'state()',
    '[style.width.px]': 'resolvedSize()',
    '[style.height.px]': 'resolvedSize()',
  },
})
export class FewProgressCircle {
  readonly value = input<number | null>(0);
  readonly max = input(100);
  readonly size = input<Size | number>('md');
  /** Espessura do traço em px. Padrão calculado a partir do size. */
  readonly thickness = input<number>();
  readonly tone = input<Tone>('info');
  readonly valueText = input<string>();

  readonly percent = computed(() => progressPercent(this.value(), this.max()));
  readonly resolvedSize = computed(() => {
    const size = this.size();
    return typeof size === 'number' ? size : SIZE_PX[size];
  });
  readonly resolvedThickness = computed(() => {
    const thickness = this.thickness();
    if (thickness !== undefined) return thickness;
    const size = this.size();
    return typeof size === 'number' ? Math.max(2, Math.round(this.resolvedSize() / 12)) : THICKNESS_PX[size];
  });
  protected readonly now = computed(() => (this.value() === null ? undefined : clamp(this.value() as number, 0, this.max())));
  protected readonly state = computed(() => (this.value() === null ? 'indeterminate' : 'determinate'));
  protected readonly resolvedValueText = computed(() => this.valueText() ?? progressValueText(this.percent()));
  protected readonly classes = computed(() => `few-progress-circle few-tone--${this.tone()}`);
}

/** SVG: `<svg fewProgressCircleCircle></svg>`. Markup interno (dois `<circle>`) gerado pelo componente. */
@Component({
  selector: '[fewProgressCircleCircle]',
  host: {
    class: 'few-progress-circle-svg',
    'aria-hidden': 'true',
    '[attr.viewBox]': 'viewBox()',
    '[attr.width]': 'size()',
    '[attr.height]': 'size()',
    '[attr.data-state]': 'state()',
  },
  template: `
    <svg:circle class="few-progress-circle-track" [attr.cx]="center()" [attr.cy]="center()" [attr.r]="radius()" [attr.stroke-width]="thickness()" fill="none" />
    <svg:circle
      class="few-progress-circle-indicator"
      [attr.cx]="center()" [attr.cy]="center()" [attr.r]="radius()"
      [attr.stroke-width]="thickness()" fill="none" stroke-linecap="round"
      [attr.stroke-dasharray]="dashArray()"
      [attr.transform]="'rotate(-90 ' + center() + ' ' + center() + ')'"
    />
  `,
})
export class FewProgressCircleCircle {
  private readonly circle = inject(FewProgressCircle);
  protected readonly size = computed(() => this.circle.resolvedSize());
  protected readonly thickness = computed(() => this.circle.resolvedThickness());
  protected readonly radius = computed(() => (this.size() - this.thickness()) / 2);
  protected readonly circumference = computed(() => 2 * Math.PI * this.radius());
  protected readonly center = computed(() => this.size() / 2);
  protected readonly state = computed(() => (this.circle.percent() === null ? 'indeterminate' : 'determinate'));
  private readonly dash = computed(() => {
    const percent = this.circle.percent();
    return percent === null ? this.circumference() * 0.25 : (this.circumference() * percent) / 100;
  });
  protected readonly dashArray = computed(() => `${this.dash()} ${this.circumference() - this.dash()}`);
  protected readonly viewBox = computed(() => `0 0 ${this.size()} ${this.size()}`);
}

/** Rótulo: `<span fewProgressCircleLabel></span>`. Sem conteúdo projetado, cai no texto padrão ("72%"). */
@Component({
  selector: '[fewProgressCircleLabel]',
  host: { class: 'few-progress-circle-label' },
  template: `<ng-content>{{ defaultText() }}</ng-content>`,
})
export class FewProgressCircleLabel {
  private readonly circle = inject(FewProgressCircle);
  protected readonly defaultText = computed(() => progressValueText(this.circle.percent()) ?? '');
}

/** Importe tudo de uma vez: `imports: [FEW_PROGRESS_CIRCLE]`. */
export const FEW_PROGRESS_CIRCLE = [FewProgressCircle, FewProgressCircleCircle, FewProgressCircleLabel] as const;
