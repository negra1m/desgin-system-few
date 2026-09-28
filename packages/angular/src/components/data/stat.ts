// Stat: métrica com label/valor/variação (ver docs/composition-angular.md). Fonte da verdade: packages/react/src/components/data/stat.tsx.
// MetricCard (atalho @deprecated no React) não foi migrado: fora do escopo desta categoria.
import { Component, Directive, computed, input } from '@angular/core';
import type { Tone } from '@fewcompany/core';

@Directive({ selector: '[fewStat]', host: { class: 'few-stat', '[attr.data-tone]': 'tone()' } })
export class FewStat {
  readonly tone = input<Tone>('neutral');
}

@Directive({ selector: '[fewStatLabel]', host: { class: 'few-stat-label few-label' } })
export class FewStatLabel {}

@Directive({ selector: '[fewStatValue]', host: { class: 'few-stat-value' } })
export class FewStatValue {}

@Component({
  selector: '[fewStatChange]',
  host: { class: 'few-stat-change', '[attr.data-direction]': 'direction()', '[attr.data-tone]': 'resolvedTone()' },
  template: `<span aria-hidden="true" class="few-stat-change-icon">{{ arrow() }}</span><ng-content></ng-content>`,
})
export class FewStatChange {
  readonly direction = input<'up' | 'down' | 'flat'>('flat');
  readonly tone = input<Tone | undefined>(undefined);
  protected readonly resolvedTone = computed(() => this.tone() ?? (this.direction() === 'up' ? 'success' : this.direction() === 'down' ? 'danger' : 'neutral'));
  protected readonly arrow = computed(() => (this.direction() === 'up' ? '↑' : this.direction() === 'down' ? '↓' : '→'));
}

@Directive({ selector: '[fewStatDescription]', host: { class: 'few-stat-description few-muted' } })
export class FewStatDescription {}

@Directive({ selector: '[fewStatIcon]', host: { class: 'few-stat-icon', 'aria-hidden': 'true' } })
export class FewStatIcon {}

/** Importe tudo de uma vez: `imports: [FEW_STAT]`. */
export const FEW_STAT = [FewStat, FewStatLabel, FewStatValue, FewStatChange, FewStatDescription, FewStatIcon] as const;
