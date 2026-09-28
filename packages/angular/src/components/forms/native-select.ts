// NativeSelect (ver docs/composition-angular.md). Fonte da verdade: packages/react/src/components/forms/native-select.tsx.
// Implementado como wrapper @Component com chevron (uma das duas formas previstas): o <select> real é
// projetado via ng-content e recebe sua própria diretiva de classe/invalid.
import { Component, Directive, booleanAttribute, computed, inject, input } from '@angular/core';
import type { Size } from '@fewcompany/core';
import { FewField } from './field.js';

/** `<span fewNativeSelect><select fewNativeSelectControl>…</select></span>`. */
@Component({
  selector: '[fewNativeSelect]',
  host: { '[class]': 'classes()' },
  template: `
    <ng-content></ng-content>
    <svg aria-hidden="true" viewBox="0 0 20 20" class="few-native-select-chevron">
      <path d="M5 7.5l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `,
})
export class FewNativeSelect {
  readonly size = input<Size>('md');
  protected readonly classes = computed(() => `few-native-select few-native-select--${this.size()}`);
}

/** `<select fewNativeSelectControl>`: combina `invalid` com o FewField ancestral (ver adaptação em field.ts). */
@Directive({
  selector: 'select[fewNativeSelectControl]',
  host: { class: 'few-native-select-control', '[attr.aria-invalid]': 'isInvalid() || null' },
})
export class FewNativeSelectControl {
  private readonly field = inject(FewField, { optional: true });
  readonly invalid = input(false, { transform: booleanAttribute });
  protected readonly isInvalid = computed(() => this.invalid() || (this.field?.invalid() ?? false));
}

/** Importe tudo de uma vez: `imports: [FEW_NATIVE_SELECT]`. */
export const FEW_NATIVE_SELECT = [FewNativeSelect, FewNativeSelectControl] as const;
