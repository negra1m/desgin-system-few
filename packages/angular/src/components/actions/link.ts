// Link de texto. Fonte da verdade: packages/react/src/components/actions/link.tsx.
import { Component, booleanAttribute, computed, input } from '@angular/core';
import { dataAttr } from '../../lib/attrs.js';

export type LinkVariant = 'default' | 'muted' | 'brand';
export type LinkUnderline = 'always' | 'hover' | 'none';

/**
 * `<a fewLink href="/painel">Ir</a>`.
 * Com `external`, abre em nova aba com rel seguro (noopener/noreferrer) e mostra um indicador ↗.
 */
@Component({
  selector: 'a[fewLink]',
  host: {
    class: 'few-link',
    '[class]': 'variantClasses()',
    '[attr.target]': 'targetAttr',
    '[attr.rel]': 'relAttr',
    '[attr.data-external]': 'dataAttr(external())',
  },
  template: `<ng-content></ng-content>@if (external()) {<span aria-hidden="true" class="few-link-icon">↗</span>}`,
})
export class FewLink {
  readonly variant = input<LinkVariant>('default');
  readonly underline = input<LinkUnderline>('hover');
  readonly external = input(false, { transform: booleanAttribute });
  readonly target = input<string>();
  readonly rel = input<string>();

  protected readonly variantClasses = computed(() => `few-link--${this.variant()} few-link--underline-${this.underline()}`);
  protected readonly dataAttr = dataAttr;

  protected get targetAttr(): string | null { return this.external() ? this.target() ?? '_blank' : this.target() ?? null; }
  protected get relAttr(): string | null {
    if (!this.external()) return this.rel() ?? null;
    return [this.rel(), 'noopener', 'noreferrer'].filter(Boolean).join(' ');
  }
}
