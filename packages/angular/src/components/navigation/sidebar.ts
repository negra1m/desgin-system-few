// Ver docs/composition-angular.md. Fonte da verdade: packages/react/src/components/navigation/sidebar.tsx.
import { Component, Directive, ElementRef, Signal, booleanAttribute, computed, effect, inject, input, model, signal } from '@angular/core';
import { setupDismiss } from '../../lib/dismiss.js';
import { dataAttr } from '../../lib/attrs.js';

export type SidebarSide = 'left' | 'right';
export type SidebarCollapsible = 'offcanvas' | 'icon' | 'none';

/** Verdadeiro abaixo de 768px. SSR-safe (assume false até o efeito rodar no cliente). Uso interno do Trigger. */
function setupIsMobile(): Signal<boolean> {
  const isMobile = signal(false);
  effect((onCleanup) => {
    if (typeof window === 'undefined') return;
    const query = window.matchMedia('(max-width: 767px)');
    const update = () => isMobile.set(query.matches);
    update();
    query.addEventListener('change', update);
    onCleanup(() => query.removeEventListener('change', update));
  });
  return isMobile.asReadonly();
}

/**
 * Raiz: `<div fewSidebar [(collapsed)]="collapsed" collapsible="icon">`.
 * offcanvas: painel deslizante em telas < 768px. icon: encolhe para a largura de ícones no desktop (também vira off-canvas no mobile). none: nunca colapsa.
 * Renderiza o backdrop mobile como primeiro filho (Angular não tem equivalente a irmão via Fragment/Portal).
 */
@Component({
  selector: '[fewSidebar]',
  exportAs: 'fewSidebar',
  host: {
    class: 'few-sidebar', '[attr.data-side]': 'side()', '[attr.data-collapsible]': 'collapsible()',
    '[attr.data-state]': 'collapsed() ? "collapsed" : "expanded"', '[attr.data-mobile-open]': 'dataAttr(mobileOpen())',
  },
  template: `
    @if (mobileOpen() && collapsible() !== 'none') {
      <div class="few-sidebar-backdrop" data-state="open" (click)="setMobileOpen(false)"></div>
    }
    <ng-content />
  `,
})
export class FewSidebar {
  readonly collapsed = model(false);
  readonly side = input<SidebarSide>('left');
  readonly collapsible = input<SidebarCollapsible>('offcanvas');
  protected readonly dataAttr = dataAttr;
  private readonly mobileOpenState = signal(false);
  readonly mobileOpen = this.mobileOpenState.asReadonly();
  constructor() {
    setupDismiss(this.mobileOpen, () => this.mobileOpenState.set(false), () => [], { outside: false });
  }
  setCollapsed(value: boolean) { this.collapsed.set(value); }
  setMobileOpen(value: boolean) { this.mobileOpenState.set(value); }
}

@Directive({ selector: '[fewSidebarHeader]', host: { class: 'few-sidebar-header' } })
export class FewSidebarHeader {}

@Directive({ selector: '[fewSidebarContent]', host: { class: 'few-sidebar-content' } })
export class FewSidebarContent {}

@Directive({ selector: '[fewSidebarFooter]', host: { class: 'few-sidebar-footer' } })
export class FewSidebarFooter {}

@Directive({ selector: '[fewSidebarGroup]', host: { class: 'few-sidebar-group' } })
export class FewSidebarGroup {}

@Directive({ selector: '[fewSidebarGroupLabel]', host: { class: 'few-sidebar-group-label' } })
export class FewSidebarGroupLabel {}

@Directive({ selector: '[fewSidebarMenu]', host: { class: 'few-sidebar-menu' } })
export class FewSidebarMenu {}

@Directive({ selector: '[fewSidebarMenuItem]', host: { class: 'few-sidebar-menu-item' } })
export class FewSidebarMenuItem {}

/** Item de menu. Envolva o rótulo em `<span>` (sem aria-hidden) para que ele suma automaticamente no modo colapsado "icon" (via CSS). `tooltip` vira `title` só quando colapsado em modo "icon". */
@Directive({
  selector: '[fewSidebarMenuButton]',
  host: {
    class: 'few-sidebar-menu-button', type: 'button',
    '[attr.title]': 'showTooltip() ? tooltip() : null',
    '[attr.aria-current]': 'isActive() ? "page" : null', '[attr.data-active]': 'dataAttr(isActive())',
  },
})
export class FewSidebarMenuButton {
  private readonly sidebar = inject(FewSidebar);
  readonly isActive = input(false, { transform: booleanAttribute });
  readonly tooltip = input<string>();
  protected readonly dataAttr = dataAttr;
  protected readonly showTooltip = computed(() => Boolean(this.tooltip()) && this.sidebar.collapsed() && this.sidebar.collapsible() === 'icon');
}

@Directive({ selector: '[fewSidebarMenuBadge]', host: { class: 'few-sidebar-menu-badge' } })
export class FewSidebarMenuBadge {}

@Directive({ selector: '[fewSidebarSeparator]', host: { class: 'few-sidebar-separator', role: 'separator', 'aria-orientation': 'horizontal' } })
export class FewSidebarSeparator {}

/** Alterna `collapsed` no desktop e o painel off-canvas em telas < 768px. Sem conteúdo projetado, mostra "☰". */
@Component({
  selector: '[fewSidebarTrigger]',
  host: {
    class: 'few-sidebar-trigger', type: 'button',
    '[attr.aria-label]': 'ariaLabel()', '[attr.aria-expanded]': 'expanded()',
    '(click)': 'onClick()',
  },
  template: `<ng-content />@if (empty()) {<span>☰</span>}`,
})
export class FewSidebarTrigger {
  private readonly sidebar = inject(FewSidebar);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly ariaLabel = input('Alternar barra lateral', { alias: 'aria-label' });
  protected readonly isMobile = setupIsMobile();
  protected readonly expanded = computed(() => (this.isMobile() ? this.sidebar.mobileOpen() : !this.sidebar.collapsed()));
  protected readonly empty = signal(false);
  ngAfterContentInit() { this.empty.set(!this.elementRef.nativeElement.textContent?.trim()); }
  protected onClick() {
    if (this.isMobile()) this.sidebar.setMobileOpen(!this.sidebar.mobileOpen());
    else this.sidebar.setCollapsed(!this.sidebar.collapsed());
  }
}

/** Faixa fina na borda, alternativa de clique ao Trigger para expandir/colapsar no desktop. Decorativa para leitores de tela. */
@Directive({
  selector: '[fewSidebarRail]',
  host: {
    class: 'few-sidebar-rail', type: 'button', tabindex: '-1', 'aria-hidden': 'true',
    '[attr.data-state]': 'sidebar.collapsed() ? "collapsed" : "expanded"',
    '(click)': 'sidebar.setCollapsed(!sidebar.collapsed())',
  },
})
export class FewSidebarRail {
  protected readonly sidebar = inject(FewSidebar);
}

/** Importe tudo de uma vez: `imports: [FEW_SIDEBAR]`. */
export const FEW_SIDEBAR = [
  FewSidebar, FewSidebarHeader, FewSidebarContent, FewSidebarFooter, FewSidebarGroup, FewSidebarGroupLabel,
  FewSidebarMenu, FewSidebarMenuItem, FewSidebarMenuButton, FewSidebarMenuBadge, FewSidebarSeparator, FewSidebarTrigger, FewSidebarRail,
] as const;
