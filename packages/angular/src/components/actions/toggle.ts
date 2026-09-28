// Botão de dois estados (pressionado/solto), fora de um grupo. Fonte da verdade: packages/react/src/components/actions/toggle.tsx.
import { Directive, booleanAttribute, computed, input, model } from '@angular/core';
import type { Size } from '@fewcompany/core';
import { dataAttr } from '../../lib/attrs.js';

export type ToggleVariant = 'primary' | 'secondary';

/** `<button fewToggle [(pressed)]="bold">N</button>` */
@Directive({
  selector: '[fewToggle]',
  host: {
    class: 'few-toggle',
    '[class]': 'variantClasses()',
    type: 'button',
    '[attr.aria-pressed]': 'pressed()',
    '[attr.disabled]': 'disabled() ? "" : null',
    '[attr.data-state]': 'pressed() ? "on" : "off"',
    '[attr.data-disabled]': 'dataAttr(disabled())',
    '(click)': 'handleClick()',
  },
})
export class FewToggle {
  readonly pressed = model(false);
  readonly size = input<Size>('md');
  readonly variant = input<ToggleVariant>('secondary');
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly variantClasses = computed(() => `few-toggle--${this.variant()} few-toggle--${this.size()}`);
  protected readonly dataAttr = dataAttr;

  protected handleClick() {
    if (this.disabled()) return;
    this.pressed.set(!this.pressed());
  }
}
