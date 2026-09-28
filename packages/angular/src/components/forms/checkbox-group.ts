// CheckboxGroup (ver docs/composition-angular.md). Fonte da verdade: packages/react/src/components/forms/checkbox-group.tsx.
// `FewCheckboxGroupItem` implementa o mesmo `FEW_CHECKBOX_HOST` de checkbox.ts, então `fewCheckboxInput` e
// `fewCheckboxIndicator` funcionam sem alteração dentro de um item do grupo.
import { Directive, booleanAttribute, computed, forwardRef, inject, input, model } from '@angular/core';
import type { Orientation } from '@fewcompany/core';
import { toggleValue } from '@fewcompany/core';
import { dataAttr } from '../../lib/attrs.js';
import { FEW_CHECKBOX_HOST, type FewCheckboxHost } from './checkbox.js';

/** Raiz: `<div fewCheckboxGroup [(value)]="selected">…</div>`. */
@Directive({
  selector: '[fewCheckboxGroup]',
  exportAs: 'fewCheckboxGroup',
  host: { class: 'few-checkbox-group', role: 'group', '[attr.data-orientation]': 'orientation()' },
})
export class FewCheckboxGroup {
  readonly value = model<string[]>([]);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly orientation = input<Orientation>('vertical');
  toggle(item: string) { this.value.set(toggleValue(this.value(), item)); }
}

/** `<label fewCheckboxGroupItem value="a"><input fewCheckboxInput/><span fewCheckboxIndicator/> A</label>`. */
@Directive({
  selector: 'label[fewCheckboxGroupItem]',
  providers: [{ provide: FEW_CHECKBOX_HOST, useExisting: forwardRef(() => FewCheckboxGroupItem) }],
  host: { class: 'few-checkbox', '[attr.data-state]': 'state()', '[attr.data-disabled]': 'dataAttr(disabled())' },
})
export class FewCheckboxGroupItem implements FewCheckboxHost {
  private readonly group = inject(FewCheckboxGroup);
  readonly value = input.required<string>();
  protected readonly ownDisabled = input(false, { transform: booleanAttribute, alias: 'disabled' });
  readonly disabled = computed(() => this.ownDisabled() || this.group.disabled());
  private readonly checked = computed(() => this.group.value().includes(this.value()));
  readonly state = computed<'checked' | 'unchecked'>(() => (this.checked() ? 'checked' : 'unchecked'));
  protected readonly dataAttr = dataAttr;

  /** Ignora o booleano recebido: um clique sempre alterna a presença no array, como no React (`ctx.toggle(value)`). */
  setChecked() { this.group.toggle(this.value()); }
}

/** Importe tudo de uma vez: `imports: [FEW_CHECKBOX_GROUP, FEW_CHECKBOX]` (Input/Indicator vêm de checkbox.ts). */
export const FEW_CHECKBOX_GROUP = [FewCheckboxGroup, FewCheckboxGroupItem] as const;
