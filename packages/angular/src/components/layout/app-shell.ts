// AppShell: ver docs/composition-angular.md. Espelha packages/react/src/components/layout/app-shell.tsx.
// Não depende de Sidebar (outra categoria) — AppShell.Sidebar é só a região <aside>.
import { Component, DestroyRef, Directive, afterNextRender, booleanAttribute, computed, inject, input, model, signal } from '@angular/core';
import { fewId } from '../../lib/ids.js';
import { setupDismiss } from '../../lib/dismiss.js';
import { dataAttr } from '../../lib/attrs.js';

type SidebarSide = 'left' | 'right';

/**
 * AppShell.Root: grid com áreas header/sidebar/main/footer. Abaixo de 768px a sidebar vira off-canvas
 * (backdrop + Escape fecham). O backdrop é markup interno do componente — por isso @Component com <ng-content>.
 */
@Component({
  selector: '[fewAppShell]',
  exportAs: 'fewAppShell',
  template: `
    <ng-content></ng-content>
    @if (!sidebarCollapsed()) {
      <div class="few-app-shell-backdrop" aria-hidden="true" (click)="setCollapsed(true)"></div>
    }
  `,
  host: {
    class: 'few-app-shell',
    '[style.--few-app-shell-sidebar-width]': 'sidebarWidth()',
    '[attr.data-sidebar-side]': 'sidebarSide()',
    '[attr.data-sidebar-collapsed]': 'dataAttr(sidebarCollapsed())',
  },
})
export class FewAppShell {
  readonly sidebarWidth = input<string>('280px');
  readonly sidebarSide = input<SidebarSide>('left');
  readonly sidebarCollapsed = model<boolean>(false);
  readonly sidebarId = fewId('app-shell-sidebar');
  protected readonly dataAttr = dataAttr;
  private readonly isMobile = signal(false);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const mql = window.matchMedia('(max-width: 767px)');
      const update = () => this.isMobile.set(mql.matches);
      update();
      mql.addEventListener('change', update);
      destroyRef.onDestroy(() => mql.removeEventListener('change', update));
    });
    setupDismiss(computed(() => this.isMobile() && !this.sidebarCollapsed()), () => this.setCollapsed(true), () => [], { outside: false });
  }

  setCollapsed(collapsed: boolean) { this.sidebarCollapsed.set(collapsed); }
}

@Directive({ selector: '[fewAppShellHeader]', host: { class: 'few-app-shell-header', '[attr.data-sticky]': 'dataAttr(sticky())' } })
export class FewAppShellHeader {
  readonly sticky = input(false, { transform: booleanAttribute });
  protected readonly dataAttr = dataAttr;
}

/** `<aside>` ligado ao SidebarTrigger por aria-controls/id. Fica `inert` quando colapsado. */
@Directive({
  selector: '[fewAppShellSidebar]',
  host: {
    class: 'few-app-shell-sidebar',
    '[id]': 'shell.sidebarId', '[attr.inert]': 'dataAttr(shell.sidebarCollapsed())',
    '[attr.data-side]': 'shell.sidebarSide()', '[attr.data-collapsed]': 'dataAttr(shell.sidebarCollapsed())',
  },
})
export class FewAppShellSidebar {
  protected readonly shell = inject(FewAppShell);
  protected readonly dataAttr = dataAttr;
}

/** Passe `id="main-content"` no consumidor para servir de alvo de skip link. */
@Directive({ selector: '[fewAppShellMain]', host: { class: 'few-app-shell-main' } })
export class FewAppShellMain {}

@Directive({ selector: '[fewAppShellFooter]', host: { class: 'few-app-shell-footer' } })
export class FewAppShellFooter {}

@Directive({
  selector: '[fewAppShellSidebarTrigger]',
  host: {
    class: 'few-app-shell-sidebar-trigger', type: 'button',
    '[attr.aria-expanded]': '!shell.sidebarCollapsed()', '[attr.aria-controls]': 'shell.sidebarId',
    '(click)': 'toggle()',
  },
})
export class FewAppShellSidebarTrigger {
  private readonly shell = inject(FewAppShell);
  protected toggle() { this.shell.setCollapsed(!this.shell.sidebarCollapsed()); }
}

/** Importe tudo de uma vez: `imports: [FEW_APP_SHELL]`. */
export const FEW_APP_SHELL = [FewAppShell, FewAppShellHeader, FewAppShellSidebar, FewAppShellMain, FewAppShellFooter, FewAppShellSidebarTrigger] as const;
