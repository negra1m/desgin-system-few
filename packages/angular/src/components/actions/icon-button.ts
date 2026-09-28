// Botão só com ícone. Fonte da verdade: packages/react/src/components/actions/icon-button.tsx.
import { Component, ElementRef, booleanAttribute, computed, inject, input } from '@angular/core';
import type { Size } from '@fewcompany/core';
import { dataAttr } from '../../lib/attrs.js';
import type { ButtonVariant } from './button.js';
import { FewButtonGroup } from './button-group.js';

/**
 * `<button fewIconButton aria-label="Fechar">×</button>`.
 * `aria-label` é obrigatório: não há texto visível. Enquanto `loading`, o spinner substitui o conteúdo.
 */
@Component({
  selector: 'button[fewIconButton], a[fewIconButton]',
  host: {
    class: 'few-icon-button',
    '[class]': 'variantClasses()',
    '[attr.type]': 'typeAttr',
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.disabled]': 'isDisabled() ? "" : null',
    '[attr.aria-busy]': 'loading() ? "true" : null',
    '[attr.data-loading]': 'dataAttr(loading())',
  },
  template: `@if (loading()) {<span class="few-spinner" aria-hidden="true"></span>} @else {<ng-content></ng-content>}`,
})
export class FewIconButton {
  private readonly hostEl = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly group = inject(FewButtonGroup, { optional: true });

  readonly ariaLabel = input.required<string>({ alias: 'aria-label' });
  readonly variant = input<ButtonVariant>();
  readonly size = input<Size>();
  readonly shape = input<'round' | 'square'>('round');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly loading = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly resolvedVariant = computed(() => this.variant() ?? this.group?.variant() ?? 'primary');
  protected readonly resolvedSize = computed(() => this.size() ?? this.group?.size() ?? 'md');
  protected readonly isDisabled = computed(() => this.disabled() || this.loading());
  protected readonly variantClasses = computed(() => `few-icon-button--${this.resolvedVariant()} few-icon-button--${this.resolvedSize()} few-icon-button--${this.shape()}`);
  protected readonly dataAttr = dataAttr;

  protected get typeAttr(): string | null { return this.hostEl.nativeElement.tagName === 'A' ? null : this.type(); }
}
