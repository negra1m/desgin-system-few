// Slider (ver docs/composition-angular.md). Fonte da verdade: packages/react/src/components/forms/slider.tsx.
import { Directive, ElementRef, booleanAttribute, computed, inject, input, model, output } from '@angular/core';
import type { Orientation } from '@fewcompany/core';
import { closestThumbIndex, percentFromValue, valueFromPercent } from '@fewcompany/core';
import { dataAttr } from '../../lib/attrs.js';

function percentFromPointer(event: PointerEvent, rect: DOMRect, orientation: Orientation): number {
  return orientation === 'horizontal'
    ? ((event.clientX - rect.left) / rect.width) * 100
    : (1 - (event.clientY - rect.top) / rect.height) * 100;
}

/** Raiz: `<div fewSlider [(values)]="value" [min]="0" [max]="100">…</div>`. */
@Directive({
  selector: '[fewSlider]',
  exportAs: 'fewSlider',
  host: { class: 'few-slider', '[attr.data-orientation]': 'orientation()', '[attr.data-disabled]': 'dataAttr(disabled())' },
})
export class FewSlider {
  readonly values = model<number[]>([0]);
  readonly min = input(0);
  readonly max = input(100);
  readonly step = input(1);
  readonly orientation = input<Orientation>('horizontal');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly valueCommit = output<number[]>();
  protected readonly dataAttr = dataAttr;

  setValues(next: number[], shouldCommit = false) {
    const bounded = next.map(item => valueFromPercent(percentFromValue(item, this.min(), this.max()), this.min(), this.max(), this.step()));
    this.values.set(bounded);
    if (shouldCommit) this.valueCommit.emit(bounded);
  }
}

@Directive({
  selector: '[fewSliderTrack]',
  host: { class: 'few-slider-track', '[attr.data-orientation]': 'slider.orientation()', '(pointerdown)': 'onPointerDown($event)' },
})
export class FewSliderTrack {
  readonly slider = inject(FewSlider);
  readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  protected onPointerDown(event: PointerEvent) {
    if (this.slider.disabled()) return;
    const rect = this.el.nativeElement.getBoundingClientRect();
    const target = valueFromPercent(percentFromPointer(event, rect, this.slider.orientation()), this.slider.min(), this.slider.max(), this.slider.step());
    const values = this.slider.values();
    const index = closestThumbIndex(values, target);
    const next = values.slice();
    next[index] = target;
    this.slider.setValues(next, true);
  }
}

@Directive({
  selector: '[fewSliderRange]',
  host: { class: 'few-slider-range', '[style.--few-slider-start]': "start() + '%'", '[style.--few-slider-end]': "end() + '%'" },
})
export class FewSliderRange {
  private readonly slider = inject(FewSlider);
  private readonly numbers = computed(() => (this.slider.values().length ? this.slider.values() : [this.slider.min()]));
  protected readonly start = computed(() => percentFromValue(Math.min(...this.numbers()), this.slider.min(), this.slider.max()));
  protected readonly end = computed(() => percentFromValue(Math.max(...this.numbers()), this.slider.min(), this.slider.max()));
}

@Directive({
  selector: '[fewSliderThumb]',
  host: {
    class: 'few-slider-thumb', role: 'slider',
    '[attr.tabindex]': 'disabled() ? -1 : 0',
    '[attr.aria-valuemin]': 'slider.min()',
    '[attr.aria-valuemax]': 'slider.max()',
    '[attr.aria-valuenow]': 'value()',
    '[attr.aria-valuetext]': 'valueText()',
    '[attr.aria-orientation]': 'slider.orientation()',
    '[attr.aria-disabled]': 'disabled() || null',
    '[attr.data-orientation]': 'slider.orientation()',
    '[attr.data-disabled]': 'dataAttr(disabled())',
    '[style.--few-slider-percent]': "percent() + '%'",
    '(keydown)': 'onKeydown($event)',
    '(pointerdown)': 'onPointerDown($event)',
    '(pointermove)': 'onPointerMove($event)',
    '(pointerup)': 'onPointerUp($event)',
  },
})
export class FewSliderThumb {
  protected readonly slider = inject(FewSlider);
  private readonly track = inject(FewSliderTrack, { optional: true });
  readonly index = input.required<number>();
  protected readonly value = computed(() => this.slider.values()[this.index()] ?? this.slider.min());
  protected readonly valueText = computed(() => String(this.value()));
  protected readonly percent = computed(() => percentFromValue(this.value(), this.slider.min(), this.slider.max()));
  protected readonly disabled = computed(() => this.slider.disabled());
  protected readonly dataAttr = dataAttr;

  protected onKeydown(event: KeyboardEvent) {
    if (event.defaultPrevented || this.disabled()) return;
    const step = this.slider.step();
    let next: number | null = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = this.value() + step;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = this.value() - step;
    else if (event.key === 'PageUp') next = this.value() + step * 10;
    else if (event.key === 'PageDown') next = this.value() - step * 10;
    else if (event.key === 'Home') next = this.slider.min();
    else if (event.key === 'End') next = this.slider.max();
    if (next === null) return;
    event.preventDefault();
    const updated = this.slider.values().slice();
    updated[this.index()] = next;
    this.slider.setValues(updated, true);
  }
  protected onPointerDown(event: PointerEvent) {
    if (this.disabled()) return;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }
  protected onPointerMove(event: PointerEvent) {
    const current = event.currentTarget as HTMLElement;
    if (this.disabled() || !this.track || !current.hasPointerCapture(event.pointerId)) return;
    const rect = this.track.el.nativeElement.getBoundingClientRect();
    const target = valueFromPercent(percentFromPointer(event, rect, this.slider.orientation()), this.slider.min(), this.slider.max(), this.slider.step());
    const updated = this.slider.values().slice();
    updated[this.index()] = target;
    this.slider.setValues(updated);
  }
  protected onPointerUp(event: PointerEvent) {
    const current = event.currentTarget as HTMLElement;
    if (current.hasPointerCapture(event.pointerId)) current.releasePointerCapture(event.pointerId);
    this.slider.setValues(this.slider.values(), true);
  }
}

/** Importe tudo de uma vez: `imports: [FEW_SLIDER]`. */
export const FEW_SLIDER = [FewSlider, FewSliderTrack, FewSliderRange, FewSliderThumb] as const;
