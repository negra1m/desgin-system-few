// Agrupa Button/IconButton com bordas coladas. Fonte da verdade: packages/react/src/components/actions/button-group.tsx.
import { Directive, booleanAttribute, input } from '@angular/core';
import type { Orientation, Size } from '@fewcompany/core';
import { dataAttr } from '../../lib/attrs.js';
import type { ButtonVariant } from './button.js';

/** `<div fewButtonGroup><button fewButton>Um</button><button fewButton>Dois</button></div>` */
@Directive({
  selector: '[fewButtonGroup]',
  exportAs: 'fewButtonGroup',
  host: {
    class: 'few-button-group',
    role: 'group',
    '[attr.data-orientation]': 'orientation()',
    '[attr.data-attached]': 'dataAttr(attached())',
  },
})
export class FewButtonGroup {
  readonly orientation = input<Orientation>('horizontal');
  /** Cola as bordas dos botões (radius só nas pontas). Padrão true. */
  readonly attached = input(true, { transform: booleanAttribute });
  /** Propagado por injeção para Button/IconButton filhos que não definem o próprio size. */
  readonly size = input<Size>();
  /** Propagado por injeção para Button/IconButton filhos que não definem a própria variant. */
  readonly variant = input<ButtonVariant>();
  protected readonly dataAttr = dataAttr;
}
