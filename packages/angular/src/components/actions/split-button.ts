// Ação principal + gatilho que abre uma lista de ações secundárias. Fonte da verdade: packages/react/src/components/actions/split-button.tsx.
import { Component, Directive, ElementRef, type Signal, booleanAttribute, computed, effect, inject, input, model, signal } from '@angular/core';
import type { Size } from '@fewcompany/core';
import { fewId } from '../../lib/ids.js';
import { dataAttr } from '../../lib/attrs.js';
import { focusableItems, moveFocus } from '../../lib/roving.js';
import { setupDismiss } from '../../lib/dismiss.js';
import { setupTopLayer } from '../../lib/top-layer.js';
import { setupPosition, type PositionState } from '../../lib/position.js';
import type { ButtonVariant } from './button.js';

/**
 * Raiz: `<div fewSplitButton>…</div>`. Fecha com Escape ou pointerdown fora do trigger/conteúdo.
 * Foco volta ao Trigger ao fechar por Escape ou seleção de item.
 */
@Directive({
  selector: '[fewSplitButton]',
  exportAs: 'fewSplitButton',
  host: { class: 'few-split-button', '[attr.data-state]': 'open() ? "open" : "closed"' },
})
export class FewSplitButton {
  readonly baseId = fewId('split-button');
  readonly open = model(false);
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<Size>('md');

  private readonly triggerEl = signal<HTMLElement | null>(null);
  private readonly contentEl = signal<HTMLElement | null>(null);

  constructor() {
    setupDismiss(this.open, () => this.open.set(false), () => [this.triggerEl(), this.contentEl()]);
  }

  registerTrigger(el: HTMLElement | null) { this.triggerEl.set(el); }
  registerContent(el: HTMLElement | null) { this.contentEl.set(el); }
  getTriggerEl(): HTMLElement | null { return this.triggerEl(); }
  setOpen(open: boolean) { this.open.set(open); }
  focusTrigger() { this.triggerEl()?.focus(); }
}

/** Ação principal: `<button fewSplitButtonAction>Publicar</button>`. */
@Component({
  selector: '[fewSplitButtonAction]',
  host: {
    class: 'few-split-button-action',
    '[class]': 'variantClasses()',
    type: 'button',
    '[attr.disabled]': 'isDisabled() ? "" : null',
    '[attr.aria-busy]': 'loading() ? "true" : null',
  },
  template: `@if (loading()) {<span class="few-spinner" aria-hidden="true"></span>}<ng-content></ng-content>`,
})
export class FewSplitButtonAction {
  protected readonly splitButton = inject(FewSplitButton);

  readonly loading = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly isDisabled = computed(() => this.disabled() || this.loading());
  protected readonly variantClasses = computed(() => `few-split-button-action--${this.splitButton.variant()} few-split-button-action--${this.splitButton.size()}`);
}

/** Gatilho: `<button fewSplitButtonTrigger aria-label="Mais ações" />`. ArrowDown/Enter/Espaço abrem o menu. */
@Component({
  selector: '[fewSplitButtonTrigger]',
  host: {
    class: 'few-split-button-trigger',
    '[class]': 'variantClasses()',
    type: 'button',
    'aria-haspopup': 'menu',
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.aria-expanded]': 'splitButton.open()',
    '[attr.aria-controls]': 'menuId',
    '[attr.data-state]': 'splitButton.open() ? "open" : "closed"',
    '(click)': 'handleClick()',
    '(keydown)': 'handleKeydown($event)',
  },
  template: `<span aria-hidden="true" class="few-split-button-caret"></span>`,
})
export class FewSplitButtonTrigger {
  private readonly hostEl = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly splitButton = inject(FewSplitButton);

  readonly ariaLabel = input('Mais ações', { alias: 'aria-label' });

  protected readonly variantClasses = computed(() => `few-split-button-trigger--${this.splitButton.variant()} few-split-button-trigger--${this.splitButton.size()}`);
  protected get menuId() { return `${this.splitButton.baseId}-menu`; }

  constructor() {
    this.splitButton.registerTrigger(this.hostEl.nativeElement);
  }

  protected handleClick() {
    this.splitButton.setOpen(!this.splitButton.open());
  }
  protected handleKeydown(event: KeyboardEvent) {
    if (event.defaultPrevented) return;
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') { event.preventDefault(); this.splitButton.setOpen(true); }
  }
}

/** Lista de ações secundárias: `<div fewSplitButtonContent><button fewSplitButtonItem>…</button></div>`. */
@Directive({
  selector: '[fewSplitButtonContent]',
  host: {
    class: 'few-split-button-content',
    role: 'menu',
    popover: 'manual',
    '[style.position]': "'fixed'",
    '[id]': 'id',
    '[style.top.px]': 'position().top',
    '[style.left.px]': 'position().left',
    '[attr.data-side]': 'position().side',
    '(keydown)': 'onKeydown($event)',
  },
})
export class FewSplitButtonContent {
  private readonly hostEl = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly splitButton = inject(FewSplitButton);
  protected readonly position: Signal<PositionState>;

  constructor() {
    this.splitButton.registerContent(this.hostEl.nativeElement);
    this.position = setupPosition(this.splitButton.open, () => this.splitButton.getTriggerEl(), () => this.hostEl.nativeElement, () => ({ side: 'bottom', align: 'end' }));
    setupTopLayer(this.splitButton.open, () => this.hostEl.nativeElement);
    effect(() => {
      if (typeof document === 'undefined' || !this.splitButton.open()) return;
      focusableItems(this.hostEl.nativeElement, '[role="menuitem"]')[0]?.focus();
    });
  }

  protected get id() { return `${this.splitButton.baseId}-menu`; }

  protected onKeydown(event: KeyboardEvent) {
    if (event.defaultPrevented) return;
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); this.close(); return; }
    const target = moveFocus(this.hostEl.nativeElement, '[role="menuitem"]', event.key, { orientation: 'vertical' });
    if (target) event.preventDefault();
  }
  private close() {
    this.splitButton.setOpen(false);
    this.splitButton.focusTrigger();
  }
}

/** Item do menu: `<button fewSplitButtonItem>Salvar como rascunho</button>`. */
@Directive({
  selector: '[fewSplitButtonItem]',
  host: {
    class: 'few-split-button-item',
    role: 'menuitem',
    tabindex: '-1',
    '[attr.disabled]': 'disabled() ? "" : null',
    '[attr.data-disabled]': 'dataAttr(disabled())',
    '(click)': 'handleClick()',
  },
})
export class FewSplitButtonItem {
  private readonly splitButton = inject(FewSplitButton);
  readonly disabled = input(false, { transform: booleanAttribute });
  protected readonly dataAttr = dataAttr;

  protected handleClick() {
    if (this.disabled()) return;
    this.splitButton.setOpen(false);
    this.splitButton.focusTrigger();
  }
}

/** Importe tudo de uma vez: `imports: [FEW_SPLIT_BUTTON]`. */
export const FEW_SPLIT_BUTTON = [FewSplitButton, FewSplitButtonAction, FewSplitButtonTrigger, FewSplitButtonContent, FewSplitButtonItem] as const;
