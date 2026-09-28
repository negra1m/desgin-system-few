// PasswordInput (ver docs/composition-angular.md). Fonte da verdade: packages/react/src/components/forms/password-input.tsx.
// O React reaproveita o componente <Input> internamente (herda `invalid`/Field.Control); no Angular o
// equivalente é aplicar `fewInput` junto de `fewPasswordInputInput` no mesmo <input>.
import { Component, Directive, booleanAttribute, computed, inject, model } from '@angular/core';

/** Raiz: `<div fewPasswordInput [(visible)]="show">…</div>`. */
@Directive({
  selector: '[fewPasswordInput]',
  exportAs: 'fewPasswordInput',
  host: { class: 'few-input-group few-password-input' },
})
export class FewPasswordInput {
  readonly visible = model(false);
}

/** Combinar com `fewInput`: `<input fewInput fewPasswordInputInput fewFieldControl>`. */
@Directive({
  selector: 'input[fewPasswordInputInput]',
  host: { class: 'few-input-group-input', '[attr.type]': "passwordInput.visible() ? 'text' : 'password'" },
})
export class FewPasswordInputInput {
  protected readonly passwordInput = inject(FewPasswordInput);
}

// Adaptação documentada: aria-label/texto fixo por estado (Mostrar/Ocultar), sem override via props.
@Component({
  selector: 'button[fewPasswordInputToggle]',
  host: {
    class: 'few-input-group-element few-password-input-toggle', type: 'button', 'data-side': 'end',
    '[attr.aria-pressed]': 'passwordInput.visible()',
    '[attr.aria-label]': 'ariaLabel',
    '(click)': 'onClick()',
  },
  template: `<ng-content>{{ label() }}</ng-content>`,
})
export class FewPasswordInputToggle {
  protected readonly passwordInput = inject(FewPasswordInput);
  protected get ariaLabel() { return this.passwordInput.visible() ? 'Ocultar senha' : 'Mostrar senha'; }
  protected readonly label = computed(() => (this.passwordInput.visible() ? 'Ocultar' : 'Mostrar'));
  protected onClick() { this.passwordInput.visible.set(!this.passwordInput.visible()); }
}

/** Importe tudo de uma vez: `imports: [FEW_PASSWORD_INPUT]`. */
export const FEW_PASSWORD_INPUT = [FewPasswordInput, FewPasswordInputInput, FewPasswordInputToggle] as const;
