// Hosts de demonstração/teste da categoria "Tipografia" (pasta components/typography). Um @Component por id do registry, selector few-demo-<id>.
import { Component, type Type } from '@angular/core';
import { FEW_HEADING } from '../components/typography/heading.js';
import { FEW_TEXT } from '../components/typography/text.js';
import { FEW_CODE } from '../components/typography/code.js';
import { FEW_KBD } from '../components/typography/kbd.js';

@Component({
  selector: 'few-demo-heading',
  imports: [FEW_HEADING],
  template: `
    <div class="demo-stack">
      <h2 fewHeading size="2xl">Catálogo Few UI</h2>
      <h3 fewHeading size="md" tone="muted">Subtítulo em tom neutro</h3>
      <h1 fewHeading size="2xl" tone="gradient">Gradiente da marca</h1>
    </div>
  `,
})
export class DemoHeading {}

@Component({
  selector: 'few-demo-text',
  imports: [FEW_TEXT],
  template: `
    <div class="demo-stack demo-narrow">
      <p fewText size="md">Texto de corpo padrão, tag p, tom ink.</p>
      <span fewText tone="success">Operação concluída com sucesso.</span>
      <div class="demo-row">
        <span fewText tabular>R$ 1.234,50</span>
        <span fewText tabular>R$    12,00</span>
      </div>
      <p fewText [lineClamp]="2" tone="muted">
        Esta descrição é longa de propósito para demonstrar o corte por número de linhas via lineClamp,
        sem cortar palavras no meio e sem exigir uma altura fixa no contêiner pai.
      </p>
      <p fewText truncate tone="muted">Uma linha só, truncada com reticências quando o texto não cabe no espaço disponível.</p>
    </div>
  `,
})
export class DemoText {}

@Component({
  selector: 'few-demo-code',
  imports: [FEW_CODE],
  template: `
    <div class="demo-stack">
      <p class="few-muted">Instale com <code fewCode>npm install &#64;fewcompany/angular</code> ou <code fewCode variant="outline">npx few add heading</code>.</p>
      <pre fewCodeBlock copyable lang="ts">export const heading = (level: number) => 'h' + level;</pre>
    </div>
  `,
})
export class DemoCode {}

@Component({
  selector: 'few-demo-kbd',
  imports: [FEW_KBD, FEW_TEXT],
  template: `
    <div class="demo-stack">
      <div class="demo-row">
        <span fewText class="few-muted">Buscar</span>
        <kbd fewKbd [keys]="['Mod', 'K']" platform="mac"></kbd>
      </div>
      <div class="demo-row">
        <span fewText class="few-muted">Salvar</span>
        <kbd fewKbd [keys]="['Mod', 'Shift', 'S']" size="sm"></kbd>
      </div>
    </div>
  `,
})
export class DemoKbd {}

export const TYPOGRAPHY_DEMOS: Record<string, Type<unknown>> = {
  heading: DemoHeading,
  text: DemoText,
  code: DemoCode,
  kbd: DemoKbd,
};
