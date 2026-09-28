// NumberInput (ver docs/composition-angular.md). Fonte da verdade: packages/react/src/components/forms/number-input.tsx.
import { Component, Directive, booleanAttribute, computed, effect, inject, input, model, signal } from '@angular/core';
import { clamp, roundToStep } from '@fewcompany/core';
import { dataAttr } from '../../lib/attrs.js';

/** Raiz: `<div fewNumberInput [(value)]="qty" [min]="0" [max]="10">…</div>`. */
@Directive({
  selector: '[fewNumberInput]',
  exportAs: 'fewNumberInput',
  host: { class: 'few-number-input', '[attr.data-disabled]': 'dataAttr(disabled())' },
})
export class FewNumberInput {
  readonly value = model<number | null>(null);
  readonly min = input(-Infinity);
  readonly max = input(Infinity);
  readonly step = input(1);
  readonly disabled = input(false, { transform: booleanAttribute });
  protected readonly dataAttr = dataAttr;

  setValue(next: number | null) {
    if (next === null) { this.value.set(null); return; }
    const anchor = Number.isFinite(this.min()) ? this.min() : 0;
    this.value.set(clamp(roundToStep(next, this.step(), anchor), this.min(), this.max()));
  }
  stepBy(delta: number) { this.setValue((this.value() ?? (Number.isFinite(this.min()) ? this.min() : 0)) + delta); }
}

/** `<input fewNumberInputInput>`: texto local sincronizado com o valor, comprometido no blur/Enter. */
@Directive({
  selector: 'input[fewNumberInputInput]',
  host: {
    class: 'few-input few-number-input-input',
    type: 'text', inputmode: 'decimal', role: 'spinbutton',
    '[attr.aria-valuenow]': 'numberInput.value() ?? null',
    '[attr.aria-valuemin]': 'minAttr',
    '[attr.aria-valuemax]': 'maxAttr',
    '[disabled]': 'numberInput.disabled()',
    '[value]': 'text()',
    '(input)': 'onInput($event)',
    '(blur)': 'onBlur($event)',
    '(keydown)': 'onKeydown($event)',
  },
})
export class FewNumberInputInput {
  protected readonly numberInput = inject(FewNumberInput);
  protected readonly text = signal('');

  constructor() {
    effect(() => { this.text.set(this.numberInput.value() === null ? '' : String(this.numberInput.value())); });
  }

  protected get minAttr() { return Number.isFinite(this.numberInput.min()) ? this.numberInput.min() : null; }
  protected get maxAttr() { return Number.isFinite(this.numberInput.max()) ? this.numberInput.max() : null; }

  protected onInput(event: Event) { this.text.set((event.target as HTMLInputElement).value); }

  private commit(raw: string) {
    if (raw.trim() === '') { this.numberInput.setValue(null); return; }
    const parsed = Number(raw);
    if (!Number.isNaN(parsed)) this.numberInput.setValue(parsed);
    else this.text.set(this.numberInput.value() === null ? '' : String(this.numberInput.value()));
  }
  protected onBlur(event: FocusEvent) { this.commit((event.target as HTMLInputElement).value); }
  protected onKeydown(event: KeyboardEvent) {
    if (event.defaultPrevented || this.numberInput.disabled()) return;
    const step = this.numberInput.step();
    if (event.key === 'ArrowUp') { event.preventDefault(); this.numberInput.stepBy(step); }
    else if (event.key === 'ArrowDown') { event.preventDefault(); this.numberInput.stepBy(-step); }
    else if (event.key === 'PageUp') { event.preventDefault(); this.numberInput.stepBy(step * 10); }
    else if (event.key === 'PageDown') { event.preventDefault(); this.numberInput.stepBy(-step * 10); }
    else if (event.key === 'Home' && Number.isFinite(this.numberInput.min())) { event.preventDefault(); this.numberInput.setValue(this.numberInput.min()); }
    else if (event.key === 'End' && Number.isFinite(this.numberInput.max())) { event.preventDefault(); this.numberInput.setValue(this.numberInput.max()); }
    else if (event.key === 'Enter') { this.commit((event.target as HTMLInputElement).value); }
  }
}

// Adaptação documentada (como em Carousel.Previous/Next): aria-label fixo, sem override via props.
@Component({
  selector: 'button[fewNumberInputIncrement]',
  host: {
    class: 'few-number-input-increment', type: 'button', tabindex: '-1',
    'aria-label': 'Aumentar',
    '[disabled]': 'isDisabled()',
    '(click)': 'onClick()',
  },
  template: `<ng-content>+</ng-content>`,
})
export class FewNumberInputIncrement {
  private readonly numberInput = inject(FewNumberInput);
  protected readonly isDisabled = computed(() => {
    const value = this.numberInput.value();
    return this.numberInput.disabled() || (value !== null && Number.isFinite(this.numberInput.max()) && value >= this.numberInput.max());
  });
  protected onClick() { this.numberInput.stepBy(this.numberInput.step()); }
}

@Component({
  selector: 'button[fewNumberInputDecrement]',
  host: {
    class: 'few-number-input-decrement', type: 'button', tabindex: '-1',
    'aria-label': 'Diminuir',
    '[disabled]': 'isDisabled()',
    '(click)': 'onClick()',
  },
  template: `<ng-content>&minus;</ng-content>`,
})
export class FewNumberInputDecrement {
  private readonly numberInput = inject(FewNumberInput);
  protected readonly isDisabled = computed(() => {
    const value = this.numberInput.value();
    return this.numberInput.disabled() || (value !== null && Number.isFinite(this.numberInput.min()) && value <= this.numberInput.min());
  });
  protected onClick() { this.numberInput.stepBy(-this.numberInput.step()); }
}

/** Importe tudo de uma vez: `imports: [FEW_NUMBER_INPUT]`. */
export const FEW_NUMBER_INPUT = [FewNumberInput, FewNumberInputInput, FewNumberInputIncrement, FewNumberInputDecrement] as const;
