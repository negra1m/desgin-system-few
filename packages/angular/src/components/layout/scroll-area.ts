// ScrollArea: ver docs/composition-angular.md. Espelha packages/react/src/components/layout/scroll-area.tsx.
// Rola nativamente; Scrollbar/Thumb do React só existem por compatibilidade (renderizam null) e não têm equivalente aqui.
import { DestroyRef, Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';
import type { Orientation } from '@fewcompany/core';

type ScrollAreaType = 'auto' | 'always' | 'scroll' | 'hover';

/** Raiz: `<div fewScrollArea type="hover">`. Só guarda type/orientation para data-* — sem lógica de scroll. */
@Directive({
  selector: '[fewScrollArea]',
  exportAs: 'fewScrollArea',
  host: { class: 'few-scroll-area', '[attr.data-type]': 'type()', '[attr.data-orientation]': 'orientation()' },
})
export class FewScrollArea {
  readonly type = input<ScrollAreaType>('hover');
  readonly orientation = input<Orientation | 'both'>('vertical');
}

/**
 * Viewport: overflow nativo, tabIndex 0 + role="region". Marca data-overflow-top/bottom conforme o scroll
 * (sombras de borda via CSS). Listener registrado em afterNextRender (só client, sem SSR).
 */
@Directive({
  selector: '[fewScrollAreaViewport]',
  host: { class: 'few-scroll-area-viewport', role: 'region', tabindex: '0', '[attr.aria-label]': 'label()' },
})
export class FewScrollAreaViewport {
  /** Injeção só para garantir que o Viewport está dentro de um fewScrollArea (paridade com useScrollArea do React). */
  private readonly scrollArea = inject(FewScrollArea);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  /** aria-label da região rolável (obrigatório: viewport tem tabIndex=0 e role="region"). */
  readonly label = input.required<string>();

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const el = this.host.nativeElement;
      const update = () => {
        const top = el.scrollTop > 1;
        const bottom = el.scrollTop + el.clientHeight < el.scrollHeight - 1;
        if (top) el.dataset['overflowTop'] = ''; else delete el.dataset['overflowTop'];
        if (bottom) el.dataset['overflowBottom'] = ''; else delete el.dataset['overflowBottom'];
      };
      update();
      el.addEventListener('scroll', update);
      const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
      observer?.observe(el);
      destroyRef.onDestroy(() => { el.removeEventListener('scroll', update); observer?.disconnect(); });
    });
  }
}

/** Importe tudo de uma vez: `imports: [FEW_SCROLL_AREA]`. */
export const FEW_SCROLL_AREA = [FewScrollArea, FewScrollAreaViewport] as const;
