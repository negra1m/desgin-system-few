// Ver docs/composition-angular.md. Fonte da verdade: packages/react/src/components/navigation/pagination.tsx.
import { Component, Directive, ElementRef, computed, inject, input, model, signal } from '@angular/core';
import { paginationRange } from '@fewcompany/core';
import { dataAttr } from '../../lib/attrs.js';

/** Raiz: `<nav fewPagination [(page)]="page" [total]="12">`. Sem binding, `page` é interno (não controlado). */
@Directive({
  selector: '[fewPagination]',
  exportAs: 'fewPagination',
  host: { class: 'few-pagination', '[attr.aria-label]': 'ariaLabel()' },
})
export class FewPagination {
  readonly page = model<number>(1);
  /** Total de páginas; quando > 0, Pagination.List se auto-preenche com paginationRange. */
  readonly total = input(0);
  /** Páginas vizinhas mostradas de cada lado da atual. */
  readonly siblings = input(1);
  readonly ariaLabel = input('Paginação', { alias: 'aria-label' });
  setPage(page: number) { this.page.set(page); }
}

@Directive({ selector: '[fewPaginationItem]', host: { class: 'few-pagination-item' } })
export class FewPaginationItem {}

/** Link de página: `<a fewPaginationLink [page]="2">2</a>`. */
@Directive({
  selector: '[fewPaginationLink]',
  host: {
    class: 'few-pagination-link', '[attr.href]': 'href()',
    '[attr.aria-current]': 'active() ? "page" : null', '[attr.data-state]': 'active() ? "active" : null',
    '(click)': 'onClick($event)',
  },
})
export class FewPaginationLink {
  private readonly pagination = inject(FewPagination, { optional: true });
  readonly page = input<number>();
  readonly isActive = input<boolean>();
  readonly href = input('#');
  protected readonly active = computed(() => this.isActive() ?? (this.page() !== undefined && this.pagination?.page() === this.page()));
  protected onClick(event: MouseEvent) {
    event.preventDefault();
    const page = this.page();
    if (page !== undefined) this.pagination?.setPage(page);
  }
}

/** Página anterior. Sem conteúdo projetado, mostra "‹ Anterior". */
@Component({
  selector: '[fewPaginationPrevious]',
  host: {
    class: 'few-pagination-previous', '[attr.href]': 'href()',
    '[attr.aria-label]': 'ariaLabel()', '[attr.aria-disabled]': 'disabled() ? "true" : null', '[attr.data-disabled]': 'dataAttr(disabled())',
    '(click)': 'onClick($event)',
  },
  template: `<ng-content />@if (empty()) {<span>‹ Anterior</span>}`,
})
export class FewPaginationPrevious {
  private readonly pagination = inject(FewPagination, { optional: true });
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly href = input('#');
  readonly ariaLabel = input('Página anterior', { alias: 'aria-label' });
  protected readonly dataAttr = dataAttr;
  protected readonly empty = signal(false);
  protected readonly disabled = computed(() => (this.pagination ? this.pagination.page() <= 1 : false));
  ngAfterContentInit() { this.empty.set(!this.elementRef.nativeElement.textContent?.trim()); }
  protected onClick(event: MouseEvent) {
    event.preventDefault();
    if (!this.pagination || this.disabled()) return;
    this.pagination.setPage(this.pagination.page() - 1);
  }
}

/** Próxima página. Sem conteúdo projetado, mostra "Próxima ›". */
@Component({
  selector: '[fewPaginationNext]',
  host: {
    class: 'few-pagination-next', '[attr.href]': 'href()',
    '[attr.aria-label]': 'ariaLabel()', '[attr.aria-disabled]': 'disabled() ? "true" : null', '[attr.data-disabled]': 'dataAttr(disabled())',
    '(click)': 'onClick($event)',
  },
  template: `<ng-content />@if (empty()) {<span>Próxima ›</span>}`,
})
export class FewPaginationNext {
  private readonly pagination = inject(FewPagination, { optional: true });
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly href = input('#');
  readonly ariaLabel = input('Próxima página', { alias: 'aria-label' });
  protected readonly dataAttr = dataAttr;
  protected readonly empty = signal(false);
  protected readonly disabled = computed(() => (this.pagination ? this.pagination.total() > 0 && this.pagination.page() >= this.pagination.total() : false));
  ngAfterContentInit() { this.empty.set(!this.elementRef.nativeElement.textContent?.trim()); }
  protected onClick(event: MouseEvent) {
    event.preventDefault();
    if (!this.pagination || this.disabled()) return;
    this.pagination.setPage(this.pagination.page() + 1);
  }
}

/** Reticências (faixa de páginas omitida). Sem conteúdo projetado, mostra "…". */
@Component({
  selector: '[fewPaginationEllipsis]',
  host: { class: 'few-pagination-ellipsis', 'aria-hidden': 'true' },
  template: `<ng-content />@if (empty()) {<span>…</span>}`,
})
export class FewPaginationEllipsis {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly empty = signal(false);
  ngAfterContentInit() { this.empty.set(!this.elementRef.nativeElement.textContent?.trim()); }
}

/** Lista de páginas. Sem conteúdo projetado, se auto-preenche a partir de total/siblings (paginationRange). Com conteúdo, composição manual. */
@Component({
  selector: '[fewPaginationList]',
  host: { class: 'few-pagination-list' },
  imports: [FewPaginationItem, FewPaginationLink, FewPaginationEllipsis],
  template: `
    @if (pagination.total() > 0) {
      @for (entry of range(); track $index) {
        <li fewPaginationItem>
          @if (entry === 'ellipsis') { <span fewPaginationEllipsis></span> }
          @else { <a fewPaginationLink [page]="entry">{{ entry }}</a> }
        </li>
      }
    } @else {
      <ng-content />
    }
  `,
})
export class FewPaginationList {
  protected readonly pagination = inject(FewPagination);
  protected readonly range = computed(() => paginationRange(this.pagination.page(), this.pagination.total(), this.pagination.siblings()));
}

/** Importe tudo de uma vez: `imports: [FEW_PAGINATION]`. */
export const FEW_PAGINATION = [
  FewPagination, FewPaginationList, FewPaginationItem, FewPaginationLink, FewPaginationPrevious, FewPaginationNext, FewPaginationEllipsis,
] as const;
