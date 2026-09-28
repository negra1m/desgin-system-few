// Toolbar: ver docs/composition-angular.md. Espelha packages/react/src/components/layout/toolbar.tsx:
// roving focus imperativo (como Radix RovingFocusGroup) sobre [data-few-toolbar-item], via moveFocus/focusableItems.
import { Directive, ElementRef, afterNextRender, booleanAttribute, computed, inject, input } from '@angular/core';
import type { Orientation } from '@fewcompany/core';
import { focusableItems, moveFocus } from '../../lib/roving.js';
import { dataAttr } from '../../lib/attrs.js';

@Directive({
  selector: '[fewToolbar]',
  exportAs: 'fewToolbar',
  host: {
    class: 'few-toolbar', role: 'toolbar',
    '[attr.aria-label]': 'label()', '[attr.aria-orientation]': 'orientation()', '[attr.data-orientation]': 'orientation()',
    '(keydown)': 'onKeydown($event)', '(focusin)': 'onFocusIn($event)',
  },
})
export class FewToolbar {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly orientation = input<Orientation>('horizontal');
  /** aria-label obrigatório: a toolbar não tem rótulo visível próprio. */
  readonly label = input.required<string>();
  readonly loop = input(true, { transform: booleanAttribute });

  constructor() {
    afterNextRender(() => {
      focusableItems(this.host.nativeElement, '[data-few-toolbar-item]').forEach((item, index) => { item.tabIndex = index === 0 ? 0 : -1; });
    });
  }

  protected onFocusIn(event: FocusEvent) {
    const target = event.target as HTMLElement;
    if (!target.hasAttribute('data-few-toolbar-item')) return;
    focusableItems(this.host.nativeElement, '[data-few-toolbar-item]').forEach(item => { item.tabIndex = item === target ? 0 : -1; });
  }

  protected onKeydown(event: KeyboardEvent) {
    if (event.defaultPrevented) return;
    const target = moveFocus(this.host.nativeElement, '[data-few-toolbar-item]', event.key, { orientation: this.orientation(), loop: this.loop() });
    if (target) event.preventDefault();
  }
}

@Directive({
  selector: '[fewToolbarButton]',
  host: {
    class: 'few-toolbar-button', type: 'button', 'data-few-toolbar-item': '',
    '[attr.disabled]': 'disabled() ? "" : null', '[attr.data-disabled]': 'dataAttr(disabled())',
  },
})
export class FewToolbarButton {
  /** Só valida que o botão está dentro de um fewToolbar (paridade com useToolbarContext do React). */
  private readonly toolbar = inject(FewToolbar);
  readonly disabled = input(false, { transform: booleanAttribute });
  protected readonly dataAttr = dataAttr;
}

@Directive({ selector: '[fewToolbarLink]', host: { class: 'few-toolbar-link', 'data-few-toolbar-item': '' } })
export class FewToolbarLink {
  private readonly toolbar = inject(FewToolbar);
}

@Directive({
  selector: '[fewToolbarSeparator]',
  host: {
    class: 'few-toolbar-separator', role: 'separator',
    '[attr.aria-orientation]': 'crossOrientation()', '[attr.data-orientation]': 'crossOrientation()',
  },
})
export class FewToolbarSeparator {
  private readonly toolbar = inject(FewToolbar);
  protected readonly crossOrientation = computed(() => (this.toolbar.orientation() === 'horizontal' ? 'vertical' : 'horizontal'));
}

@Directive({ selector: '[fewToolbarGroup]', host: { class: 'few-toolbar-group', role: 'group' } })
export class FewToolbarGroup {}

/** Toolbar composto: `<div fewToolbar label="Formatação"><div fewToolbarGroup>…</div></div>`. Importe com `imports: [FEW_TOOLBAR]`. */
export const FEW_TOOLBAR = [FewToolbar, FewToolbarButton, FewToolbarLink, FewToolbarSeparator, FewToolbarGroup] as const;
