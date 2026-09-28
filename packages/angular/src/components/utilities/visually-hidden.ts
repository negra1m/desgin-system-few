import { Directive } from '@angular/core';

/** Conteúdo só para leitores de tela: `<span fewVisuallyHidden>Buscar</span>`. Equivale ao VisuallyHidden do React. */
@Directive({ selector: '[fewVisuallyHidden]', host: { class: 'few-sr-only' } })
export class FewVisuallyHidden {}
