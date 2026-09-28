// RadioGroup (ver docs/composition-angular.md). Fonte da verdade: packages/react/src/components/forms/radio-group.tsx.
import { Directive, ElementRef, booleanAttribute, computed, inject, input, model } from '@angular/core';
import type { Orientation } from '@fewcompany/core';
import { dataAttr } from '../../lib/attrs.js';
import { fewId } from '../../lib/ids.js';
import { moveFocus } from '../../lib/roving.js';

/** Raiz: `<div fewRadioGroup [(value)]="plan">…</div>`. Roving focus por setas/Home/End entre os radios. */
@Directive({
  selector: '[fewRadioGroup]',
  exportAs: 'fewRadioGroup',
  host: {
    class: 'few-radio-group', role: 'radiogroup',
    '[attr.aria-orientation]': 'orientation()',
    '[attr.aria-required]': 'required() || null',
    '[attr.data-orientation]': 'orientation()',
    '(keydown)': 'onKeydown($event)',
  },
})
export class FewRadioGroup {
  private readonly hostEl = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly baseId = fewId('radio-group');
  readonly value = model('');
  readonly name = input<string>();
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly orientation = input<Orientation>('vertical');
  readonly loop = input(true, { transform: booleanAttribute });

  get groupName() { return this.name() ?? this.baseId; }

  protected onKeydown(event: KeyboardEvent) {
    if (event.defaultPrevented) return;
    const target = moveFocus(this.hostEl.nativeElement, 'input[type="radio"]:not(:disabled)', event.key, { orientation: this.orientation(), loop: this.loop() });
    if (!target) return;
    event.preventDefault();
    this.value.set((target as HTMLInputElement).value);
  }
}

/** `<label fewRadioGroupItem value="a"><input fewRadioGroupItemInput/><span fewRadioGroupIndicator/> A</label>`. */
@Directive({
  selector: 'label[fewRadioGroupItem]',
  exportAs: 'fewRadioGroupItem',
  host: { class: 'few-radio-group-item', '[attr.data-state]': 'state()', '[attr.data-disabled]': 'dataAttr(isDisabled())' },
})
export class FewRadioGroupItem {
  private readonly group = inject(FewRadioGroup);
  readonly value = input.required<string>();
  readonly disabled = input(false, { transform: booleanAttribute });
  protected readonly checked = computed(() => this.group.value() === this.value());
  readonly isDisabled = computed(() => this.disabled() || this.group.disabled());
  readonly state = computed<'checked' | 'unchecked'>(() => (this.checked() ? 'checked' : 'unchecked'));
  protected readonly dataAttr = dataAttr;

  get name() { return this.group.groupName; }
  select() { if (!this.isDisabled()) this.group.value.set(this.value()); }
}

@Directive({
  selector: 'input[fewRadioGroupItemInput]',
  host: {
    class: 'few-sr-only', type: 'radio',
    '[attr.name]': 'item.name',
    '[value]': 'item.value()',
    '[checked]': 'item.state() === "checked"',
    '[disabled]': 'item.isDisabled()',
    '(change)': 'item.select()',
  },
})
export class FewRadioGroupItemInput {
  protected readonly item = inject(FewRadioGroupItem);
}

/** `<span fewRadioGroupIndicator></span>`: o ponto central vem do CSS (`::after`); fica no DOM com `[hidden]`. */
@Directive({
  selector: 'span[fewRadioGroupIndicator]',
  host: {
    class: 'few-radio-group-indicator', 'aria-hidden': 'true',
    '[attr.data-state]': 'item.state()',
    '[hidden]': 'item.state() === "unchecked"',
  },
})
export class FewRadioGroupIndicator {
  protected readonly item = inject(FewRadioGroupItem);
}

/** Importe tudo de uma vez: `imports: [FEW_RADIO_GROUP]`. */
export const FEW_RADIO_GROUP = [FewRadioGroup, FewRadioGroupItem, FewRadioGroupItemInput, FewRadioGroupIndicator] as const;
