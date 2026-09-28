// Ver docs/composition-angular.md. Fonte da verdade: packages/react/src/components/navigation/breadcrumb.tsx.
import { Component, Directive, ElementRef, inject, input, signal } from '@angular/core';

/** Raiz: `<nav fewBreadcrumb>`. Sem estado — apenas host bindings. */
@Directive({
  selector: '[fewBreadcrumb]',
  host: { class: 'few-breadcrumb', '[attr.aria-label]': 'ariaLabel()' },
})
export class FewBreadcrumb {
  readonly ariaLabel = input('Trilha', { alias: 'aria-label' });
}

@Directive({ selector: '[fewBreadcrumbList]', host: { class: 'few-breadcrumb-list' } })
export class FewBreadcrumbList {}

@Directive({ selector: '[fewBreadcrumbItem]', host: { class: 'few-breadcrumb-item' } })
export class FewBreadcrumbItem {}

/** Link de um nível intermediário: `<a fewBreadcrumbLink href="/">Início</a>`. */
@Directive({ selector: '[fewBreadcrumbLink]', host: { class: 'few-breadcrumb-link' } })
export class FewBreadcrumbLink {}

/** Página atual: não é um link navegável, é anunciada via aria-current="page". */
@Directive({
  selector: '[fewBreadcrumbPage]',
  host: { class: 'few-breadcrumb-page', role: 'link', 'aria-disabled': 'true', 'aria-current': 'page' },
})
export class FewBreadcrumbPage {}

/** Separador entre itens. Sem conteúdo projetado, mostra "/". */
@Component({
  selector: '[fewBreadcrumbSeparator]',
  host: { class: 'few-breadcrumb-separator', role: 'presentation', 'aria-hidden': 'true' },
  template: `<ng-content />@if (empty()) {<span>/</span>}`,
})
export class FewBreadcrumbSeparator {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly empty = signal(false);
  ngAfterContentInit() { this.empty.set(!this.elementRef.nativeElement.textContent?.trim()); }
}

/** Reticências (itens ocultos em trilhas longas). Sem conteúdo projetado, mostra "…". */
@Component({
  selector: '[fewBreadcrumbEllipsis]',
  host: { class: 'few-breadcrumb-ellipsis', role: 'presentation', 'aria-hidden': 'true' },
  template: `<ng-content />@if (empty()) {<span>…</span>}`,
})
export class FewBreadcrumbEllipsis {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly empty = signal(false);
  ngAfterContentInit() { this.empty.set(!this.elementRef.nativeElement.textContent?.trim()); }
}

/** Importe tudo de uma vez: `imports: [FEW_BREADCRUMB]`. */
export const FEW_BREADCRUMB = [
  FewBreadcrumb, FewBreadcrumbList, FewBreadcrumbItem, FewBreadcrumbLink, FewBreadcrumbPage, FewBreadcrumbSeparator, FewBreadcrumbEllipsis,
] as const;
