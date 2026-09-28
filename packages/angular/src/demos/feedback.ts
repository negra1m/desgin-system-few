// Hosts de demonstração/teste da categoria "Feedback" (pasta components/feedback). Um @Component por id do registry,
// selector few-demo-<id>. Textos e exemplos espelham apps/catalog/demos/feedback.tsx (React) quando fazem sentido.
import { Component, signal, type Type } from '@angular/core';
import { FEW_ALERT } from '../components/feedback/alert.js';
import { FEW_BADGE } from '../components/feedback/badge.js';
import { FEW_TAG } from '../components/feedback/tag.js';
import { FEW_PROGRESS } from '../components/feedback/progress.js';
import { FEW_PROGRESS_CIRCLE } from '../components/feedback/progress-circle.js';
import { FEW_SPINNER } from '../components/feedback/spinner.js';
import { FEW_SKELETON } from '../components/feedback/skeleton.js';
import { FEW_EMPTY_STATE } from '../components/feedback/empty-state.js';

@Component({
  selector: 'few-demo-alert',
  imports: [FEW_ALERT],
  template: `
    <div class="demo-stack demo-narrow">
      @if (soft()) {
        <div fewAlert tone="success" variant="soft">
          <span fewAlertIcon></span>
          <strong fewAlertTitle>Salvo</strong>
          <div fewAlertDescription>Suas alterações foram salvas com sucesso.</div>
          <button fewAlertClose aria-label="Fechar aviso" (dismiss)="soft.set(false)"></button>
        </div>
      }
      @if (outline()) {
        <div fewAlert tone="danger" variant="outline">
          <span fewAlertIcon></span>
          <strong fewAlertTitle>Falha ao publicar</strong>
          <div fewAlertDescription>Verifique sua conexão e tente novamente.</div>
          <div fewAlertAction><button type="button" class="few-button few-button--secondary">Tentar de novo</button></div>
          <button fewAlertClose aria-label="Fechar aviso" (dismiss)="outline.set(false)"></button>
        </div>
      }
      @if (!soft() && !outline()) {
        <p class="few-muted">Os dois avisos foram fechados.</p>
      }
    </div>
  `,
})
export class DemoAlert {
  readonly soft = signal(true);
  readonly outline = signal(true);
}

@Component({
  selector: 'few-demo-badge',
  imports: [FEW_BADGE],
  template: `
    <div class="demo-stack">
      <div class="demo-row">
        <span fewBadge tone="neutral">Rascunho</span>
        <span fewBadge tone="success" dot>Ativo</span>
        <span fewBadge tone="warning">Pendente</span>
        <span fewBadge tone="danger">Bloqueado</span>
        <span fewBadge tone="info">Novo</span>
      </div>
      <div class="demo-row">
        <span fewBadge tone="success" variant="solid">Solid</span>
        <span fewBadge tone="success" variant="soft">Soft</span>
        <span fewBadge tone="success" variant="outline">Outline</span>
        <span fewBadge tone="info" size="sm">Pequeno</span>
      </div>
    </div>
  `,
})
export class DemoBadge {}

@Component({
  selector: 'few-demo-tag',
  imports: [FEW_TAG],
  template: `
    <div class="demo-stack">
      <div class="demo-row">
        @for (tag of tags(); track tag) {
          <span fewTag tone="info" variant="soft">
            <span fewTagLabel>{{ tag }}</span>
            <button fewTagClose [label]="tag" (remove)="remove(tag)"></button>
          </span>
        }
        @if (tags().length === 0) {
          <p class="few-muted">Todas as tags foram removidas.</p>
        }
      </div>
      <span fewTag tone="neutral" variant="outline" interactive (select)="restore()">
        <span fewTagLabel>Restaurar tags</span>
      </span>
    </div>
  `,
})
export class DemoTag {
  readonly tags = signal(['React', 'TypeScript', 'Acessibilidade']);
  remove(tag: string) { this.tags.update(current => current.filter(item => item !== tag)); }
  restore() { this.tags.set(['React', 'TypeScript', 'Acessibilidade']); }
}

@Component({
  selector: 'few-demo-progress',
  imports: [FEW_PROGRESS],
  template: `
    <div class="demo-stack demo-narrow">
      <div fewProgress [value]="indeterminate() ? null : value()" tone="info">
        <span fewProgressLabel>Importação de dados</span>
        <span fewProgressValue></span>
        <div fewProgressTrack><div fewProgressIndicator></div></div>
      </div>
      <div class="demo-row">
        <button type="button" class="few-button few-button--secondary" [disabled]="indeterminate()" (click)="value.set(Math.min(100, value() + 10))">+10%</button>
        <button type="button" class="few-button few-button--secondary" [disabled]="indeterminate()" (click)="value.set(Math.max(0, value() - 10))">-10%</button>
        <label class="few-muted"><input type="checkbox" [checked]="indeterminate()" (change)="indeterminate.set(!indeterminate())" /> Indeterminado</label>
      </div>
    </div>
  `,
})
export class DemoProgress {
  readonly value = signal(30);
  readonly indeterminate = signal(false);
  protected readonly Math = Math;
}

@Component({
  selector: 'few-demo-progress-circle',
  imports: [FEW_PROGRESS_CIRCLE],
  template: `
    <div class="demo-row">
      <div fewProgressCircle [value]="value()" tone="success" size="md">
        <svg fewProgressCircleCircle></svg>
        <span fewProgressCircleLabel></span>
      </div>
      <div fewProgressCircle [value]="null" tone="info" size="md">
        <svg fewProgressCircleCircle></svg>
      </div>
      <div class="demo-stack">
        <button type="button" class="few-button few-button--secondary" (click)="value.set(Math.min(100, value() + 15))">+15%</button>
        <button type="button" class="few-button few-button--secondary" (click)="value.set(Math.max(0, value() - 15))">-15%</button>
      </div>
    </div>
  `,
})
export class DemoProgressCircle {
  readonly value = signal(65);
  protected readonly Math = Math;
}

@Component({
  selector: 'few-demo-spinner',
  imports: [FEW_SPINNER],
  template: `
    <div class="demo-row">
      <span fewSpinner size="sm" label="Carregando"></span>
      <span fewSpinner size="md" tone="info" label="Carregando pedidos"></span>
      <span fewSpinner size="lg" tone="success" label="Enviando"></span>
    </div>
  `,
})
export class DemoSpinner {}

@Component({
  selector: 'few-demo-skeleton',
  imports: [FEW_SKELETON],
  template: `
    <div class="demo-stack demo-narrow">
      <label class="few-muted"><input type="checkbox" [checked]="loading()" (change)="loading.set(!loading())" /> Carregando</label>
      @if (loading()) {
        <div class="demo-row" style="align-items:flex-start">
          <span fewSkeleton variant="circle"></span>
          <span fewSkeleton variant="text" [lines]="3"></span>
        </div>
      } @else {
        <div class="demo-row" style="align-items:flex-start">
          <span aria-hidden="true" class="few-empty-icon" style="width:40px;height:40px;font-size:18px">VN</span>
          <p class="few-muted">Vinícius Negrão publicou 3 novos componentes no catálogo Few UI.</p>
        </div>
      }
    </div>
  `,
})
export class DemoSkeleton {
  readonly loading = signal(true);
}

@Component({
  selector: 'few-demo-empty-state',
  imports: [FEW_EMPTY_STATE],
  template: `
    <div class="demo-narrow">
      <div fewEmptyState size="sm">
        <span fewEmptyStateIcon></span>
        <h3 fewEmptyStateTitle>Nenhum projeto ainda</h3>
        <p fewEmptyStateDescription>Crie o primeiro projeto para começar a organizar seu trabalho.</p>
        <div fewEmptyStateActions>
          <button type="button" class="few-button" (click)="created.set(true)">+ Novo projeto</button>
        </div>
      </div>
      @if (created()) {
        <p class="few-muted">Projeto criado.</p>
      }
    </div>
  `,
})
export class DemoEmptyState {
  readonly created = signal(false);
}

export const FEEDBACK_DEMOS: Record<string, Type<unknown>> = {
  alert: DemoAlert,
  badge: DemoBadge,
  tag: DemoTag,
  progress: DemoProgress,
  'progress-circle': DemoProgressCircle,
  spinner: DemoSpinner,
  skeleton: DemoSkeleton,
  'empty-state': DemoEmptyState,
};
