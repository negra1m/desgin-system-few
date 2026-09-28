// Checkbox (ver docs/composition-angular.md). Fonte da verdade: packages/react/src/components/forms/checkbox.tsx.
//
// Adaptação documentada: o React tem um único componente (Checkbox.Root) que renderiza o <label> E o <input>
// escondido, porque `asChild`/Slot deixa a lógica de estado e a marcação do input no mesmo componente. Sem
// Slot, o Angular precisa de uma diretiva própria no elemento real: `fewCheckbox` (no <label>) fornece o
// estado; `fewCheckboxInput` (no <input>) e `fewCheckboxIndicator` (no indicador) leem esse estado via o token
// `FEW_CHECKBOX_HOST` — o mesmo token é implementado por `FewCheckboxGroupItem` (ver checkbox-group.ts), o que
// permite reaproveitar Input/Indicator sem duplicar a marcação/SVG entre Checkbox solto e CheckboxGroup.Item.
import { Component, Directive, ElementRef, InjectionToken, afterRenderEffect, booleanAttribute, computed, forwardRef, inject, input, model } from '@angular/core';
import { dataAttr } from '../../lib/attrs.js';

export type FewCheckedState = boolean | 'indeterminate';
type FewCheckboxVisualState = 'checked' | 'unchecked' | 'indeterminate';

/** Contrato lido por `FewCheckboxInput`/`FewCheckboxIndicator`. Implementado por `FewCheckbox` e `FewCheckboxGroupItem`. */
export interface FewCheckboxHost {
  readonly state: () => FewCheckboxVisualState;
  readonly disabled: () => boolean;
  setChecked(checked: boolean): void;
}
export const FEW_CHECKBOX_HOST = new InjectionToken<FewCheckboxHost>('FewCheckboxHost');

/** Raiz: `<label fewCheckbox [(checked)]="accepted"><input fewCheckboxInput/><span fewCheckboxIndicator/> Aceito os termos</label>`. */
@Directive({
  selector: 'label[fewCheckbox]',
  exportAs: 'fewCheckbox',
  providers: [{ provide: FEW_CHECKBOX_HOST, useExisting: forwardRef(() => FewCheckbox) }],
  host: { class: 'few-checkbox', '[attr.data-state]': 'state()', '[attr.data-disabled]': 'dataAttr(disabled())' },
})
export class FewCheckbox implements FewCheckboxHost {
  readonly checked = model<FewCheckedState>(false);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly state = computed<FewCheckboxVisualState>(() => (this.checked() === 'indeterminate' ? 'indeterminate' : this.checked() ? 'checked' : 'unchecked'));
  protected readonly dataAttr = dataAttr;
  setChecked(checked: boolean) { this.checked.set(checked); }
}

/** `<input type="checkbox" fewCheckboxInput/>`: visualmente oculto (few-sr-only), continua focável/acessível. */
@Directive({
  selector: 'input[fewCheckboxInput]',
  host: {
    class: 'few-sr-only', type: 'checkbox',
    '[checked]': 'host_.state() === "checked"',
    '[attr.aria-checked]': 'ariaChecked',
    '[disabled]': 'host_.disabled()',
    '(change)': 'onChange($event)',
  },
})
export class FewCheckboxInput {
  private readonly host_ = inject(FEW_CHECKBOX_HOST);
  private readonly hostEl = inject<ElementRef<HTMLInputElement>>(ElementRef);

  protected get ariaChecked(): 'true' | 'false' | 'mixed' {
    const state = this.host_.state();
    return state === 'indeterminate' ? 'mixed' : state === 'checked' ? 'true' : 'false';
  }

  constructor() {
    // `.indeterminate` é propriedade JS, não atributo — precisa ser escrita imperativamente no DOM real.
    afterRenderEffect(() => {
      if (typeof document === 'undefined') return;
      this.hostEl.nativeElement.indeterminate = this.host_.state() === 'indeterminate';
    });
  }

  protected onChange(event: Event) { this.host_.setChecked((event.target as HTMLInputElement).checked); }
}

/** `<span fewCheckboxIndicator></span>`: ícone de check/traço; fica no DOM com `[hidden]` quando desmarcado. */
@Component({
  selector: 'span[fewCheckboxIndicator]',
  host: {
    class: 'few-checkbox-indicator', 'aria-hidden': 'true',
    '[attr.data-state]': 'host_.state()',
    '[hidden]': 'host_.state() === "unchecked"',
  },
  template: `
    <ng-content>
      @if (host_.state() === 'indeterminate') {
        <svg viewBox="0 0 16 16" width="10" height="10"><path d="M3 8h10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
      } @else {
        <svg viewBox="0 0 16 16" width="10" height="10"><path d="M2.5 8.5l3.2 3.2 7.3-8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
      }
    </ng-content>
  `,
})
export class FewCheckboxIndicator {
  protected readonly host_ = inject(FEW_CHECKBOX_HOST);
}

/** Importe tudo de uma vez: `imports: [FEW_CHECKBOX]`. */
export const FEW_CHECKBOX = [FewCheckbox, FewCheckboxInput, FewCheckboxIndicator] as const;
