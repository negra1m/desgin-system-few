// Hosts de demonstração/teste da categoria "Estrutura" (pasta components/layout). Um @Component por id do registry, selector few-demo-<id>.
import { Component, signal, type Type } from '@angular/core';
import { FEW_CARD } from '../components/layout/card.js';
import { FEW_SEPARATOR } from '../components/layout/separator.js';
import { FEW_ASPECT_RATIO } from '../components/layout/aspect-ratio.js';
import { FEW_SCROLL_AREA } from '../components/layout/scroll-area.js';
import { FEW_STACK, type StackDirection } from '../components/layout/stack.js';
import { FEW_GRID } from '../components/layout/grid.js';
import { FEW_TOOLBAR } from '../components/layout/toolbar.js';
import { FEW_APP_SHELL } from '../components/layout/app-shell.js';

@Component({
  selector: 'few-demo-card',
  imports: [FEW_CARD],
  template: `
    <div class="demo-row">
      <div fewCard variant="outlined" padding="sm">
        <div fewCardHeader>
          <h4 fewCardTitle>Outlined</h4>
          <p fewCardDescription>Borda visível, fundo da superfície.</p>
          <div fewCardAction><span class="few-badge">novo</span></div>
        </div>
        <div fewCardContent>Conteúdo do cartão.</div>
      </div>
      <div fewCard variant="soft" padding="sm">
        <div fewCardHeader>
          <h4 fewCardTitle>Soft</h4>
          <p fewCardDescription>Fundo suave, sem borda.</p>
        </div>
        <div fewCardContent>Conteúdo do cartão.</div>
      </div>
    </div>
    <div fewCard variant="elevated" padding="md">
      <div fewCardHeader><h3 fewCardTitle>Elevated</h3></div>
      <div fewCardFooter><span class="few-muted">Rodapé do cartão</span></div>
    </div>
  `,
})
export class DemoCard {}

@Component({
  selector: 'few-demo-separator',
  imports: [FEW_SEPARATOR],
  template: `
    <p class="few-muted">Horizontal</p>
    <div fewSeparator orientation="horizontal"></div>
    <p class="few-muted">Com rótulo</p>
    <div fewSeparator label="ou">ou</div>
    <div class="demo-row" style="height: 48px">
      <span>Esquerda</span>
      <div fewSeparator orientation="vertical"></div>
      <span>Direita</span>
    </div>
  `,
})
export class DemoSeparator {}

@Component({
  selector: 'few-demo-aspect-ratio',
  imports: [FEW_ASPECT_RATIO],
  template: `
    <div class="demo-narrow" fewAspectRatio [ratio]="ratio()">
      <div style="width:100%;height:100%;display:grid;place-items:center;background:var(--few-soft)">16:9</div>
    </div>
  `,
})
export class DemoAspectRatio {
  protected readonly ratio = signal(16 / 9);
}

@Component({
  selector: 'few-demo-scroll-area',
  imports: [FEW_SCROLL_AREA],
  template: `
    <div fewScrollArea type="hover" style="height: 180px; border: 1px solid var(--few-line); border-radius: var(--few-radius)">
      <div fewScrollAreaViewport label="Lista de exemplo" style="height: 100%; padding: 12px">
        @for (item of itens; track item) {
          <div class="few-muted">{{ item }}</div>
        }
      </div>
    </div>
  `,
})
export class DemoScrollArea {
  protected readonly itens = Array.from({ length: 16 }, (_, index) => `Item ${index + 1}`);
}

@Component({
  selector: 'few-demo-stack',
  imports: [FEW_STACK],
  template: `
    <button type="button" class="few-button" (click)="toggle()">Direção: {{ direction() === 'row' ? 'linha' : 'coluna' }}</button>
    <div fewStack [direction]="direction()" [gap]="4" style="padding: 12px; border: 1px dashed var(--few-line)">
      <div class="few-badge">Um</div>
      <div class="few-badge">Dois</div>
      <div class="few-badge">Três</div>
    </div>
  `,
})
export class DemoStack {
  protected readonly direction = signal<StackDirection>('column');
  protected toggle() { this.direction.set(this.direction() === 'row' ? 'column' : 'row'); }
}

@Component({
  selector: 'few-demo-grid',
  imports: [FEW_GRID],
  template: `
    <div fewGrid columns="auto" minChildWidth="96px" [gap]="3">
      @for (item of itens; track item) {
        <div style="background: var(--few-soft); border-radius: var(--few-radius); padding: 12px; text-align: center">{{ item }}</div>
      }
      <div fewGridItem [colSpan]="2">
        <div style="background: var(--few-surface); border: 1px solid var(--few-line); padding: 12px; text-align: center">colSpan=2</div>
      </div>
    </div>
  `,
})
export class DemoGrid {
  protected readonly itens = [1, 2, 3, 4, 5];
}

@Component({
  selector: 'few-demo-toolbar',
  imports: [FEW_TOOLBAR],
  template: `
    <div fewToolbar label="Formatação de texto">
      <div fewToolbarGroup>
        <button type="button" fewToolbarButton>N</button>
        <button type="button" fewToolbarButton>I</button>
        <button type="button" fewToolbarButton>S</button>
      </div>
      <div fewToolbarSeparator></div>
      <a href="#" fewToolbarLink>Ajuda</a>
    </div>
    <p class="few-muted" style="margin-top: 8px">Setas movem o foco entre os itens.</p>
  `,
})
export class DemoToolbar {}

@Component({
  selector: 'few-demo-app-shell',
  imports: [FEW_APP_SHELL],
  template: `
    <div class="demo-narrow" style="border: 1px solid var(--few-line); overflow: hidden">
      <div fewAppShell sidebarWidth="120px" style="min-height: 260px">
        <header fewAppShellHeader>
          <button type="button" fewAppShellSidebarTrigger>☰</button>
          <strong>Painel</strong>
        </header>
        <aside fewAppShellSidebar>
          <nav>
            <span class="few-muted">Início</span>
            <span class="few-muted">Ajustes</span>
          </nav>
        </aside>
        <main fewAppShellMain id="main-content" style="padding: 16px">
          Conteúdo principal. Abaixo de 768px a sidebar vira off-canvas com fundo escurecido e fecha com Esc.
        </main>
        <footer fewAppShellFooter>Few Company</footer>
      </div>
    </div>
  `,
})
export class DemoAppShell {}

export const LAYOUT_DEMOS: Record<string, Type<unknown>> = {
  card: DemoCard,
  separator: DemoSeparator,
  'aspect-ratio': DemoAspectRatio,
  'scroll-area': DemoScrollArea,
  stack: DemoStack,
  grid: DemoGrid,
  toolbar: DemoToolbar,
  'app-shell': DemoAppShell,
};
