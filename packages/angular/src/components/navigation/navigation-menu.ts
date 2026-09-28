// Ver docs/composition-angular.md. Fonte da verdade: packages/react/src/components/navigation/navigation-menu.tsx.
import { Component, Directive, DestroyRef, ElementRef, booleanAttribute, computed, effect, inject, input, model, signal } from '@angular/core';
import { fewId } from '../../lib/ids.js';
import { moveFocus } from '../../lib/roving.js';
import { setupDismiss } from '../../lib/dismiss.js';
import { setupPosition } from '../../lib/position.js';
import { setupTopLayer } from '../../lib/top-layer.js';
import { dataAttr } from '../../lib/attrs.js';

/** Raiz: `<nav fewNavigationMenu [(value)]="open">`. Sem binding, `value` é interno (não controlado). */
@Directive({
  selector: '[fewNavigationMenu]',
  exportAs: 'fewNavigationMenu',
  host: { class: 'few-navigation-menu', '[attr.aria-label]': 'ariaLabel()' },
})
export class FewNavigationMenu {
  readonly value = model<string | null>(null);
  readonly ariaLabel = input('Menu principal', { alias: 'aria-label' });
  readonly baseId = fewId('navmenu');
  /** Triggers registrados por valor (usado pelo Indicator para medir posição). Não reativo, uso interno. */
  readonly triggers = new Map<string, HTMLElement>();
  setValue(value: string | null) { this.value.set(value); }
}

/** Lista dos triggers, com roving horizontal (setas/Home/End) entre eles. */
@Directive({
  selector: '[fewNavigationMenuList]',
  host: { class: 'few-navigation-menu-list', '(keydown)': 'onKeydown($event)' },
})
export class FewNavigationMenuList {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected onKeydown(event: KeyboardEvent) {
    if (event.defaultPrevented) return;
    const target = moveFocus(this.host.nativeElement, '[data-few-navmenu-trigger]', event.key, { orientation: 'horizontal' });
    if (target) event.preventDefault();
  }
}

/** Item: `<li fewNavigationMenuItem value="produtos">`. Publica {value, open, ids} para Trigger/Content. */
@Directive({
  selector: '[fewNavigationMenuItem]',
  exportAs: 'fewNavigationMenuItem',
  host: { class: 'few-navigation-menu-item', '[attr.data-state]': 'open() ? "open" : "closed"' },
})
export class FewNavigationMenuItem {
  protected readonly menu = inject(FewNavigationMenu);
  readonly value = input.required<string>();
  /** Público: lido por FewNavigationMenuTrigger/Content, que só têm o item injetado (não herdam). */
  readonly open = computed(() => this.menu.value() === this.value());
  /** Referência ao elemento do trigger, preenchida por FewNavigationMenuTrigger; usada como âncora pelo Content. */
  triggerEl: HTMLElement | null = null;
  get triggerId() { return `${this.menu.baseId}-trigger-${this.value()}`; }
  get contentId() { return `${this.menu.baseId}-content-${this.value()}`; }
}

/** Abre no hover, foco ou Enter/ArrowDown; fecha com Escape ou ao abrir outro item. */
@Directive({
  selector: '[fewNavigationMenuTrigger]',
  host: {
    class: 'few-navigation-menu-trigger', type: 'button', 'data-few-navmenu-trigger': '',
    '[id]': 'item.triggerId', '[attr.data-state]': 'item.open() ? "open" : "closed"',
    '[attr.aria-expanded]': 'item.open()', '[attr.aria-controls]': 'item.contentId',
    '(click)': 'onClick()', '(keydown)': 'onKeydown($event)', '(focus)': 'onFocus()', '(mouseenter)': 'onFocus()',
  },
})
export class FewNavigationMenuTrigger {
  private readonly menu = inject(FewNavigationMenu);
  protected readonly item = inject(FewNavigationMenuItem);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  constructor() {
    const el = this.elementRef.nativeElement;
    this.item.triggerEl = el;
    this.menu.triggers.set(this.item.value(), el);
    inject(DestroyRef).onDestroy(() => {
      this.menu.triggers.delete(this.item.value());
      if (this.item.triggerEl === el) this.item.triggerEl = null;
    });
  }
  protected onClick() { this.menu.setValue(this.item.open() ? null : this.item.value()); }
  protected onKeydown(event: KeyboardEvent) {
    if (event.defaultPrevented) return;
    if (event.key === 'Escape' && this.item.open()) { event.preventDefault(); this.menu.setValue(null); }
    else if (event.key === 'ArrowDown' && !this.item.open()) { event.preventDefault(); this.menu.setValue(this.item.value()); }
  }
  protected onFocus() { this.menu.setValue(this.item.value()); }
}

/** Flyout posicionado com setupPosition + top layer nativo (popover="manual"); fecha com Escape e clique fora. */
@Component({
  selector: '[fewNavigationMenuContent]',
  host: {
    class: 'few-navigation-menu-content', popover: 'manual', role: 'group',
    '[id]': 'item.contentId', '[attr.aria-labelledby]': 'item.triggerId',
    '[attr.data-state]': 'item.open() ? "open" : "closed"',
    '[style.position]': '"fixed"', '[style.top.px]': 'position().top', '[style.left.px]': 'position().left',
    '[attr.data-side]': 'position().side',
    '(keydown)': 'onKeydown($event)',
  },
  template: `<ng-content />`,
})
export class FewNavigationMenuContent {
  private readonly menu = inject(FewNavigationMenu);
  protected readonly item = inject(FewNavigationMenuItem);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly position = setupPosition(this.item.open, () => this.item.triggerEl, () => this.elementRef.nativeElement, () => ({ side: 'bottom', align: 'start' }));
  constructor() {
    setupTopLayer(this.item.open, () => this.elementRef.nativeElement);
    setupDismiss(this.item.open, () => this.menu.setValue(null), () => [this.item.triggerEl, this.elementRef.nativeElement]);
  }
  protected onKeydown(event: KeyboardEvent) {
    if (event.defaultPrevented) return;
    if (event.key === 'Escape') { event.preventDefault(); this.menu.setValue(null); }
  }
}

@Directive({
  selector: '[fewNavigationMenuLink]',
  host: { class: 'few-navigation-menu-link', '[attr.aria-current]': 'active() ? "page" : null', '[attr.data-active]': 'dataAttr(active())' },
})
export class FewNavigationMenuLink {
  readonly active = input(false, { transform: booleanAttribute });
  protected readonly dataAttr = dataAttr;
}

/** Indicador que acompanha a posição do trigger aberto (renderize dentro de List). */
@Component({
  selector: '[fewNavigationMenuIndicator]',
  host: {
    class: 'few-navigation-menu-indicator', 'aria-hidden': 'true',
    '[attr.data-state]': 'rect() ? "visible" : null',
    '[style.display]': 'rect() ? null : "none"',
    '[style.transform]': 'rect() ? "translateX(" + rect()!.left + "px)" : null',
    '[style.width.px]': 'rect()?.width',
  },
  template: ``,
})
export class FewNavigationMenuIndicator {
  private readonly menu = inject(FewNavigationMenu);
  protected readonly rect = signal<{ left: number; width: number } | null>(null);
  constructor() {
    effect(() => {
      const value = this.menu.value();
      if (typeof window === 'undefined') { this.rect.set(null); return; }
      const trigger = value ? this.menu.triggers.get(value) : undefined;
      this.rect.set(trigger ? { left: trigger.offsetLeft, width: trigger.offsetWidth } : null);
    });
  }
}

/** Importe tudo de uma vez: `imports: [FEW_NAVIGATION_MENU]`. */
export const FEW_NAVIGATION_MENU = [
  FewNavigationMenu, FewNavigationMenuList, FewNavigationMenuItem, FewNavigationMenuTrigger, FewNavigationMenuContent, FewNavigationMenuLink, FewNavigationMenuIndicator,
] as const;
