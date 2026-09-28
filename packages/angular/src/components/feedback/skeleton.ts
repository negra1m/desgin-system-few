// Skeleton (ver docs/composition-angular.md). Fonte da verdade: packages/react/src/components/feedback/skeleton.tsx.
// O "asChild" do React aqui não é o Slot/troca-de-tag do resto da lib (que não existe no Angular): é um wrapper
// literal que reserva o layout do conteúdo real por baixo do esqueleto. Por isso o input equivalente chama-se
// `wrap`, não `asChild` — evita confundir com a convenção "asChild não existe" do restante dos componentes.
import { Component, booleanAttribute, computed, input, numberAttribute } from '@angular/core';

export type SkeletonVariant = 'text' | 'circle' | 'rect';

/** Número vira "px" (mesma convenção do CSSProperties do React); string passa direto. */
function toCssLength(value: string | number | undefined): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${value}px` : value;
}

/**
 * Componente simples. `<span fewSkeleton variant="text" [lines]="3"></span>` ou
 * `<span fewSkeleton wrap><few-avatar /></span>` para reservar o layout do conteúdo projetado.
 */
@Component({
  selector: '[fewSkeleton]',
  host: {
    'aria-hidden': 'true',
    '[class]': 'hostClasses()',
    '[style.width]': 'hostWidth()',
    '[style.height]': 'hostHeight()',
  },
  template: `
    @if (wrap()) {
      <span class="few-skeleton-content"><ng-content /></span>
      <span [class]="overlayClasses()"></span>
    } @else if (isLines()) {
      @for (line of lineIndexes(); track line) {
        <span
          class="few-skeleton few-skeleton--text"
          [class.few-skeleton--static]="!animate()"
          [style.width]="line === lines() - 1 ? (lineWidth() ?? '70%') : lineWidth()"
          [style.height]="lineHeight()"
        ></span>
      }
    }
  `,
})
export class FewSkeleton {
  readonly variant = input<SkeletonVariant>('text');
  readonly width = input<string | number>();
  readonly height = input<string | number>();
  /** Repete linhas de texto (só variant="text"; ignorado com `wrap`). */
  readonly lines = input(1, { transform: numberAttribute });
  /** Anima o pulse. Desligue para um frame estático (ex.: captura de tela). */
  readonly animate = input(true, { transform: booleanAttribute });
  /** Envolve o conteúdo projetado: esconde-o (aria-hidden) e mostra o esqueleto por cima, no mesmo espaço. */
  readonly wrap = input(false, { transform: booleanAttribute });

  protected readonly isLines = computed(() => !this.wrap() && this.variant() === 'text' && this.lines() > 1);
  protected readonly lineIndexes = computed(() => Array.from({ length: this.lines() }, (_, index) => index));

  protected readonly hostClasses = computed(() => {
    if (this.wrap()) return 'few-skeleton-wrap';
    if (this.isLines()) return 'few-skeleton-lines';
    return `few-skeleton few-skeleton--${this.variant()}${this.animate() ? '' : ' few-skeleton--static'}`;
  });
  protected readonly overlayClasses = computed(() => `few-skeleton few-skeleton-overlay few-skeleton--${this.variant()}${this.animate() ? '' : ' few-skeleton--static'}`);
  protected readonly lineWidth = computed(() => toCssLength(this.width()));
  protected readonly lineHeight = computed(() => toCssLength(this.height()));
  protected readonly hostWidth = computed(() => (this.isLines() ? undefined : this.lineWidth()));
  protected readonly hostHeight = computed(() => (this.isLines() ? undefined : this.lineHeight()));
}

export const FEW_SKELETON = [FewSkeleton] as const;
