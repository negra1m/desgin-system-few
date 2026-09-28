// Botão simples (sem partes). Fonte da verdade: packages/react/src/components/actions/button.tsx.
import { Component, ElementRef, booleanAttribute, computed, inject, input } from '@angular/core';
import type { Size } from '@fewcompany/core';
import { dataAttr } from '../../lib/attrs.js';
import { FewButtonGroup } from './button-group.js';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link';

/**
 * `<button fewButton variant="primary">Salvar</button>` ou `<a fewButton href="/">Ir</a>`.
 * `loading` mostra spinner, marca aria-busy e desabilita. Size/variant caem para o ButtonGroup ancestral quando não definidos.
 */
@Component({
  selector: 'button[fewButton], a[fewButton]',
  host: {
    class: 'few-button',
    '[class]': 'variantClasses()',
    '[attr.type]': 'typeAttr',
    '[attr.disabled]': 'isDisabled() ? "" : null',
    '[attr.aria-busy]': 'loading() ? "true" : null',
    '[attr.data-loading]': 'dataAttr(loading())',
  },
  template: `@if (loading()) {<span class="few-spinner" aria-hidden="true"></span>}<ng-content></ng-content>`,
})
export class FewButton {
  private readonly hostEl = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly group = inject(FewButtonGroup, { optional: true });

  readonly variant = input<ButtonVariant>();
  readonly size = input<Size>();
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly loading = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly resolvedVariant = computed(() => this.variant() ?? this.group?.variant() ?? 'primary');
  protected readonly resolvedSize = computed(() => this.size() ?? this.group?.size() ?? 'md');
  protected readonly isDisabled = computed(() => this.disabled() || this.loading());
  protected readonly variantClasses = computed(() => `few-button--${this.resolvedVariant()} few-button--${this.resolvedSize()}`);
  protected readonly dataAttr = dataAttr;

  protected get typeAttr(): string | null { return this.hostEl.nativeElement.tagName === 'A' ? null : this.type(); }
}
