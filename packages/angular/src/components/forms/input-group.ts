// InputGroup (ver docs/composition-angular.md). Fonte da verdade: packages/react/src/components/forms/input-group.tsx.
import { Directive, booleanAttribute, input } from '@angular/core';
import { dataAttr } from '../../lib/attrs.js';

/** Raiz que unifica a borda: `<div fewInputGroup>…</div>`. A ordem dos filhos no template decide o lado (start/end). */
@Directive({
  selector: '[fewInputGroup]',
  host: {
    class: 'few-input-group',
    '[attr.data-invalid]': 'dataAttr(invalid())',
    '[attr.data-disabled]': 'dataAttr(disabled())',
  },
})
export class FewInputGroup {
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  protected readonly dataAttr = dataAttr;
}

/** Prefixo/sufixo textual: `<span fewInputGroupAddon>R$</span>`. */
@Directive({ selector: 'span[fewInputGroupAddon]', host: { class: 'few-input-group-addon' } })
export class FewInputGroupAddon {}

/** Ícone/botão dentro do grupo. `side` é só para a borda; a posição real é a ordem no template. */
@Directive({ selector: 'span[fewInputGroupElement]', host: { class: 'few-input-group-element', '[attr.data-side]': 'side()' } })
export class FewInputGroupElement {
  readonly side = input<'start' | 'end'>('end');
}

/** Aplicar junto de `fewInput` no `<input>` real: `<input fewInput fewInputGroupInput>`. */
@Directive({ selector: 'input[fewInputGroupInput]', host: { class: 'few-input-group-input' } })
export class FewInputGroupInput {}

/** Importe tudo de uma vez: `imports: [FEW_INPUT_GROUP]`. */
export const FEW_INPUT_GROUP = [FewInputGroup, FewInputGroupAddon, FewInputGroupElement, FewInputGroupInput] as const;
