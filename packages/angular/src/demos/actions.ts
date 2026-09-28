// Hosts de demonstração/teste da categoria "Ações" (pasta components/actions). Um @Component por id do registry, selector few-demo-<id>.
import { Component, type Type } from '@angular/core';
import { FewButton } from '../components/actions/button.js';
import { FewButtonGroup } from '../components/actions/button-group.js';
import { FewIconButton } from '../components/actions/icon-button.js';
import { FewToggle } from '../components/actions/toggle.js';
import { FEW_TOGGLE_GROUP } from '../components/actions/toggle-group.js';
import { FEW_SPLIT_BUTTON } from '../components/actions/split-button.js';
import { FewLink } from '../components/actions/link.js';

@Component({
  selector: 'few-demo-button',
  imports: [FewButton],
  template: `
    <div class="demo-stack">
      <div class="demo-row">
        <button fewButton variant="primary">Primário</button>
        <button fewButton variant="secondary">Secundário</button>
        <button fewButton variant="ghost">Discreto</button>
        <button fewButton variant="danger">Excluir conta</button>
        <button fewButton variant="link">Ver detalhes</button>
      </div>
      <div class="demo-row">
        <button fewButton size="sm">Pequeno</button>
        <button fewButton size="md">Médio</button>
        <button fewButton size="lg">Grande</button>
      </div>
      <div class="demo-row">
        <button fewButton loading>Salvando alterações</button>
        <a fewButton variant="secondary" href="#exemplo">Renderizado como link</a>
      </div>
    </div>
  `,
})
export class DemoButton {}

@Component({
  selector: 'few-demo-icon-button',
  imports: [FewIconButton],
  template: `
    <div class="demo-row">
      <button fewIconButton aria-label="Curtir" variant="secondary">♡</button>
      <button fewIconButton aria-label="Editar" variant="ghost" shape="square">✎</button>
      <button fewIconButton aria-label="Excluir" variant="danger">🗑</button>
      <button fewIconButton aria-label="Carregando" loading></button>
    </div>
  `,
})
export class DemoIconButton {}

@Component({
  selector: 'few-demo-button-group',
  imports: [FewButtonGroup, FewButton],
  template: `
    <div class="demo-stack">
      <div fewButtonGroup attached>
        <button fewButton variant="primary">Lista</button>
        <button fewButton variant="secondary">Grade</button>
      </div>
      <div fewButtonGroup attached orientation="vertical" size="sm" variant="secondary">
        <button fewButton>Um</button>
        <button fewButton>Dois</button>
        <button fewButton>Três</button>
      </div>
    </div>
  `,
})
export class DemoButtonGroup {}

@Component({
  selector: 'few-demo-toggle',
  imports: [FewToggle],
  template: `
    <div class="demo-row">
      <button fewToggle aria-label="Negrito" [pressed]="true"><strong>N</strong></button>
      <button fewToggle aria-label="Itálico"><em>I</em></button>
      <button fewToggle size="sm">Favorito</button>
    </div>
  `,
})
export class DemoToggle {}

@Component({
  selector: 'few-demo-toggle-group',
  imports: [FEW_TOGGLE_GROUP],
  template: `
    <div class="demo-stack">
      <div fewToggleGroup type="single" [value]="'left'" aria-label="Alinhamento do texto">
        <button fewToggleGroupItem value="left">Esquerda</button>
        <button fewToggleGroupItem value="center">Centro</button>
        <button fewToggleGroupItem value="right">Direita</button>
      </div>
      <div fewToggleGroup type="multiple" [value]="['few']" aria-label="Marcadores">
        <button fewToggleGroupItem value="few">Few</button>
        <button fewToggleGroupItem value="ui">UI</button>
        <button fewToggleGroupItem value="beta">Beta</button>
      </div>
    </div>
  `,
})
export class DemoToggleGroup {}

@Component({
  selector: 'few-demo-split-button',
  imports: [FEW_SPLIT_BUTTON],
  template: `
    <div fewSplitButton class="demo-narrow">
      <button fewSplitButtonAction>Publicar</button>
      <button fewSplitButtonTrigger aria-label="Mais ações de publicação"></button>
      <div fewSplitButtonContent>
        <button fewSplitButtonItem>Salvar como rascunho</button>
        <button fewSplitButtonItem>Agendar publicação</button>
        <button fewSplitButtonItem disabled>Duplicar (em breve)</button>
      </div>
    </div>
  `,
})
export class DemoSplitButton {}

@Component({
  selector: 'few-demo-link',
  imports: [FewLink],
  template: `
    <div class="demo-stack">
      <div class="demo-row">
        <a fewLink href="#exemplo">Link padrão</a>
        <a fewLink href="#exemplo" variant="muted">Link discreto</a>
        <a fewLink href="#exemplo" variant="brand">Link de marca</a>
      </div>
      <div class="demo-row">
        <a fewLink href="#exemplo" underline="always">Sempre sublinhado</a>
        <a fewLink href="#exemplo" underline="none">Sem sublinhado</a>
      </div>
      <a fewLink href="https://fewcompany.com" external>Site da Few Company</a>
    </div>
  `,
})
export class DemoLink {}

export const ACTIONS_DEMOS: Record<string, Type<unknown>> = {
  button: DemoButton,
  'icon-button': DemoIconButton,
  'button-group': DemoButtonGroup,
  toggle: DemoToggle,
  'toggle-group': DemoToggleGroup,
  'split-button': DemoSplitButton,
  link: DemoLink,
};
