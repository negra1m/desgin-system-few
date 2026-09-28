// Switch (ver docs/composition-angular.md). Fonte da verdade: packages/react/src/components/forms/switch.tsx.
// role=switch no input nativo (checkbox + role="switch" é o padrão recomendado pela WAI-ARIA APG).
import { Directive, booleanAttribute, computed, inject, input, model } from '@angular/core';
import type { Size } from '@fewcompany/core';
import { dataAttr } from '../../lib/attrs.js';

/** Raiz: `<label fewSwitch [(checked)]="on"><input fewSwitchInput/><span fewSwitchThumb/></label>`. */
@Directive({
  selector: 'label[fewSwitch]',
  exportAs: 'fewSwitch',
  host: { '[class]': 'classes()', '[attr.data-state]': 'state()', '[attr.data-disabled]': 'dataAttr(disabled())' },
})
export class FewSwitch {
  readonly checked = model(false);
  readonly size = input<Size>('md');
  readonly disabled = input(false, { transform: booleanAttribute });
  protected readonly classes = computed(() => `few-switch few-switch--${this.size()}`);
  readonly state = computed<'checked' | 'unchecked'>(() => (this.checked() ? 'checked' : 'unchecked'));
  protected readonly dataAttr = dataAttr;
}

@Directive({
  selector: 'input[fewSwitchInput]',
  host: {
    class: 'few-sr-only', type: 'checkbox', role: 'switch',
    '[checked]': 'switchRoot.checked()',
    '[disabled]': 'switchRoot.disabled()',
    '(change)': 'onChange($event)',
  },
})
export class FewSwitchInput {
  protected readonly switchRoot = inject(FewSwitch);
  protected onChange(event: Event) { this.switchRoot.checked.set((event.target as HTMLInputElement).checked); }
}

/** `<span fewSwitchThumb></span>`: sem markup próprio — a trilha/bolinha vêm inteiramente do CSS. */
@Directive({ selector: 'span[fewSwitchThumb]', host: { class: 'few-switch-thumb', 'aria-hidden': 'true', '[attr.data-state]': 'switchRoot.state()' } })
export class FewSwitchThumb {
  protected readonly switchRoot = inject(FewSwitch);
}

/** Importe tudo de uma vez: `imports: [FEW_SWITCH]`. */
export const FEW_SWITCH = [FewSwitch, FewSwitchInput, FewSwitchThumb] as const;
