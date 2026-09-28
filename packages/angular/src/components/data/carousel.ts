// Carousel: trilho com scroll-snap, teclado ←→ e indicadores (ver docs/composition-angular.md). Fonte da verdade: packages/react/src/components/data/carousel.tsx.
// Sincronização de rolagem via `afterRenderEffect` (reativo a `index()`), guardada por `typeof window`.
// Adaptação documentada: `Carousel.Previous`/`Next` não aceitam `aria-label` customizado (fixo em "Slide anterior"/"Próximo slide").
import { Component, Directive, ElementRef, afterRenderEffect, booleanAttribute, computed, contentChildren, effect, inject, input, model, signal } from '@angular/core';
import type { Orientation } from '@fewcompany/core';
import { carouselIndex } from '@fewcompany/core';

@Directive({
  selector: '[fewCarousel]',
  exportAs: 'fewCarousel',
  host: { class: 'few-carousel', role: 'group', 'aria-roledescription': 'carousel', '[attr.data-orientation]': 'orientation()' },
})
export class FewCarousel {
  readonly orientation = input<Orientation>('horizontal');
  readonly loop = input(false, { transform: booleanAttribute });
  readonly align = input<'start' | 'center'>('start');
  readonly index = model(0);
  /** Total de slides, atualizado por `Carousel.Content` a partir dos `Carousel.Item`s projetados. */
  readonly count = signal(0);
}

/** `<div fewCarouselViewport>`: rolagem com snap, sincroniza `index` ao rolar e responde a ←/→ (ou ↑/↓ vertical). */
@Directive({
  selector: '[fewCarouselViewport]',
  host: {
    class: 'few-carousel-viewport',
    tabindex: '0',
    '[attr.data-orientation]': 'carousel.orientation()',
    '(scroll)': 'onScroll($event)',
    '(keydown)': 'onKeydown($event)',
  },
})
export class FewCarouselViewport {
  protected readonly carousel = inject(FewCarousel);
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    afterRenderEffect(() => {
      const index = this.carousel.index();
      const el = this.hostRef.nativeElement;
      const items = el.querySelectorAll<HTMLElement>('[data-few-carousel-item]');
      const target = items[index];
      if (!target) return;
      const behavior = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
      if (this.carousel.orientation() === 'horizontal') el.scrollTo({ left: target.offsetLeft, behavior });
      else el.scrollTo({ top: target.offsetTop, behavior });
    });
  }

  protected onScroll(event: Event) {
    const el = event.currentTarget as HTMLElement;
    const orientation = this.carousel.orientation();
    const size = orientation === 'horizontal' ? el.clientWidth : el.clientHeight;
    const pos = orientation === 'horizontal' ? el.scrollLeft : el.scrollTop;
    if (size <= 0) return;
    const next = Math.round(pos / size);
    const count = this.carousel.count();
    if (next !== this.carousel.index() && next >= 0 && next < count) this.carousel.index.set(next);
  }
  protected onKeydown(event: KeyboardEvent) {
    if (event.defaultPrevented) return;
    const orientation = this.carousel.orientation();
    const forward = orientation === 'horizontal' ? event.key === 'ArrowRight' : event.key === 'ArrowDown';
    const backward = orientation === 'horizontal' ? event.key === 'ArrowLeft' : event.key === 'ArrowUp';
    if (!forward && !backward) return;
    event.preventDefault();
    this.carousel.index.set(carouselIndex(this.carousel.index(), forward ? 1 : -1, this.carousel.count(), this.carousel.loop()));
  }
}

/** `<div fewCarouselContent>`: conta os `Carousel.Item`s projetados e distribui posição/total a cada um. */
@Directive({
  selector: '[fewCarouselContent]',
  host: { class: 'few-carousel-content', '[attr.data-orientation]': 'carousel.orientation()' },
})
export class FewCarouselContent {
  protected readonly carousel = inject(FewCarousel);
  private readonly items = contentChildren(FewCarouselItem, { descendants: false });

  constructor() {
    effect(() => {
      const list = this.items();
      this.carousel.count.set(list.length);
      list.forEach((item, i) => item.setPosition(i, list.length));
    });
  }
}

@Directive({
  selector: '[fewCarouselItem]',
  host: {
    class: 'few-carousel-item',
    role: 'group',
    'aria-roledescription': 'slide',
    '[attr.data-few-carousel-item]': '""',
    '[attr.aria-label]': 'label()',
  },
})
export class FewCarouselItem {
  private readonly indexSig = signal(0);
  private readonly totalSig = signal(1);
  protected readonly label = computed(() => `${this.indexSig() + 1} de ${this.totalSig()}`);
  setPosition(index: number, total: number) { this.indexSig.set(index); this.totalSig.set(total); }
}

@Directive({
  selector: 'button[fewCarouselPrevious]',
  host: {
    class: 'few-carousel-previous',
    type: 'button',
    'aria-label': 'Slide anterior',
    '[disabled]': 'isDisabled()',
    '(click)': 'onClick()',
  },
})
export class FewCarouselPrevious {
  private readonly carousel = inject(FewCarousel);
  readonly disabled = input(false, { transform: booleanAttribute });
  protected readonly isDisabled = computed(() => this.disabled() || (!this.carousel.loop() && this.carousel.index() <= 0));
  protected onClick() { this.carousel.index.set(carouselIndex(this.carousel.index(), -1, this.carousel.count(), this.carousel.loop())); }
}

@Directive({
  selector: 'button[fewCarouselNext]',
  host: {
    class: 'few-carousel-next',
    type: 'button',
    'aria-label': 'Próximo slide',
    '[disabled]': 'isDisabled()',
    '(click)': 'onClick()',
  },
})
export class FewCarouselNext {
  private readonly carousel = inject(FewCarousel);
  readonly disabled = input(false, { transform: booleanAttribute });
  protected readonly isDisabled = computed(() => this.disabled() || (!this.carousel.loop() && this.carousel.index() >= this.carousel.count() - 1));
  protected onClick() { this.carousel.index.set(carouselIndex(this.carousel.index(), 1, this.carousel.count(), this.carousel.loop())); }
}

/** `<div fewCarouselIndicators></div>`: um botão `role="tab"` por slide. */
@Component({
  selector: '[fewCarouselIndicators]',
  host: { class: 'few-carousel-indicators', role: 'tablist', 'aria-label': 'Ir para o slide' },
  template: `
    @for (i of indices(); track i) {
      <button type="button" role="tab" [attr.aria-current]="i === carousel.index() ? true : null" [attr.aria-selected]="i === carousel.index()"
        [attr.aria-label]="'Ir para o slide ' + (i + 1) + ' de ' + carousel.count()" class="few-carousel-indicator" (click)="carousel.index.set(i)"></button>
    }
  `,
})
export class FewCarouselIndicators {
  protected readonly carousel = inject(FewCarousel);
  protected readonly indices = computed(() => Array.from({ length: this.carousel.count() }, (_, i) => i));
}

/** Importe tudo de uma vez: `imports: [FEW_CAROUSEL]`. */
export const FEW_CAROUSEL = [FewCarousel, FewCarouselViewport, FewCarouselContent, FewCarouselItem, FewCarouselPrevious, FewCarouselNext, FewCarouselIndicators] as const;
