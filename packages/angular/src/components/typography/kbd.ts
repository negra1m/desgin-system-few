// Ver docs/composition-angular.md. Fonte da verdade: packages/react/src/components/typography/kbd.tsx.
import { Component, computed, input } from '@angular/core';
import { normalizeKbdKeys, type KbdPlatform } from '@fewcompany/core';

export type KbdSize = 'sm' | 'md';
export type { KbdPlatform };

/**
 * Atalho de teclado com aparência de tecla física: `<kbd fewKbd [keys]="['Mod','K']" platform="mac">`.
 * Sem `keys`, projeta o conteúdo (`<ng-content>`) tal como informado pelo consumidor.
 */
@Component({
  selector: 'kbd[fewKbd]',
  host: {
    class: 'few-kbd',
    '[attr.data-size]': 'size()',
  },
  template: `
    @if (sequence(); as keys) {
      @for (key of keys; track $index) {
        <span class="few-kbd-key">@if ($index > 0) {<span class="few-kbd-sep" aria-hidden="true">+</span>}{{ key }}</span>
      }
    } @else {
      <ng-content />
    }
  `,
})
export class FewKbd {
  /** Sequência de teclas, renderizada com separador "+". Ignorado quando o consumidor projeta conteúdo (sem `keys`). */
  readonly keys = input<string[]>();
  /** Plataforma usada para normalizar `keys` (ex.: Cmd no mac). Sem detecção automática. */
  readonly platform = input<KbdPlatform>('other');
  readonly size = input<KbdSize>('md');
  protected readonly sequence = computed(() => {
    const keys = this.keys();
    return keys ? normalizeKbdKeys(keys, this.platform()) : null;
  });
}

export const FEW_KBD = [FewKbd] as const;
