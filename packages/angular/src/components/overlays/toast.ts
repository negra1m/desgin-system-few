// Toast: fila de notificações efêmeras. Sem âncora/trigger — o Viewport é quem empilha (fixed, aria-live) e
// renderiza a fila do serviço; Toast.Root fica dentro dele (sem Portal: herda o tema do contêiner). Fila (máximo
// visível, ordem) vem do headless: enqueueToast/dismissToast/orderToasts em '@fewcompany/core'. Espelha
// packages/react/src/components/overlays/toast.tsx, com o Provider/useToast() do React como `FewToastService`
// (providedIn: 'root') — ver mapeamento em docs/composition-angular.md.
import { Component, DestroyRef, Directive, ElementRef, Injectable, computed, effect, inject, input, model, signal } from '@angular/core';
import { dismissToast, enqueueToast, orderToasts, type ToastTone } from '@fewcompany/core';
import { dataState } from '../../lib/attrs.js';

export type { ToastTone };

export interface FewToastInput { title?: string; description?: string; tone?: ToastTone; duration?: number }
export interface FewToastRecord extends FewToastInput { id: string }

/** `toast({ title, description, tone, duration })` imperativo + `dismiss(id)`. Injete com `inject(FewToastService)`. */
@Injectable({ providedIn: 'root' })
export class FewToastService {
  private counter = 0;
  private readonly queueState = signal<FewToastRecord[]>([]);
  readonly queue = this.queueState.asReadonly();
  /** Duração padrão (ms) de cada toast; cada instância pode sobrescrever via `[duration]`. */
  duration = 5000;
  /** Máximo de toasts visíveis simultaneamente na fila. */
  maxVisible = 3;
  toast(input: FewToastInput): string {
    const id = `toast-${++this.counter}`;
    this.queueState.update(current => enqueueToast(current, { id, ...input }, this.maxVisible));
    return id;
  }
  dismiss(id: string): void { this.queueState.update(current => dismissToast(current, id)); }
}

/** Toast.Root: auto-dismiss por `duration`, pausado no hover/foco. Fica dentro de um `fewToastViewport`. */
@Directive({
  selector: '[fewToastRoot]',
  exportAs: 'fewToastRoot',
  host: {
    '[class]': "'few-toast few-tone--' + tone()", '[attr.role]': "tone() === 'danger' || tone() === 'warning' ? 'alert' : 'status'",
    '[attr.data-state]': 'dataState(open())', '[attr.data-tone]': 'tone()', '[hidden]': '!open()',
    '(mouseenter)': 'paused.set(true)', '(mouseleave)': 'paused.set(false)', '(focus)': 'paused.set(true)', '(blur)': 'paused.set(false)',
  },
})
export class FewToastRoot {
  readonly open = model(true);
  readonly tone = input<ToastTone>('neutral');
  readonly duration = input(5000);
  protected readonly dataState = dataState;
  protected readonly paused = signal(false);
  setOpen(open: boolean): void { this.open.set(open); }
  constructor() {
    effect((onCleanup) => {
      if (!this.open() || this.paused() || this.duration() === Infinity) return;
      const timer = setTimeout(() => this.setOpen(false), this.duration());
      onCleanup(() => clearTimeout(timer));
    });
  }
}

@Directive({ selector: '[fewToastTitle]', host: { class: 'few-toast-title' } })
export class FewToastTitle {}

@Directive({ selector: '[fewToastDescription]', host: { class: 'few-toast-description few-muted' } })
export class FewToastDescription {}

@Directive({ selector: '[fewToastAction]', host: { class: 'few-toast-action', type: 'button', '[attr.aria-label]': 'altText() ?? null' } })
export class FewToastAction {
  /** Texto alternativo para leitores de tela, quando o rótulo visível não é suficiente (ex.: ação com ícone). */
  readonly altText = input<string | undefined>(undefined);
}

@Directive({ selector: '[fewToastClose]', host: { class: 'few-toast-close', type: 'button', '(click)': 'root.setOpen(false)' } })
export class FewToastClose {
  protected readonly root = inject(FewToastRoot);
}

export type ToastViewportPosition = 'top-right' | 'bottom-right' | 'bottom-center';

/**
 * Região aria-live=polite onde os toasts aparecem: `<div fewToastViewport>`. Atalho F8 (global) foca o viewport
 * (padrão Radix Toast). Renderiza a fila de `FewToastService` automaticamente; toasts compostos manualmente com
 * `<div fewToastRoot>` também podem ficar aqui dentro (`<ng-content>`) para herdar o posicionamento fixo.
 */
@Component({
  selector: '[fewToastViewport]',
  imports: [FewToastRoot, FewToastTitle, FewToastDescription, FewToastClose],
  host: {
    class: 'few-toast-viewport', role: 'region', 'aria-live': 'polite', 'aria-label': 'Notificações',
    '[attr.tabindex]': '-1', '[attr.data-position]': 'position()',
  },
  template: `
    @for (item of orderedQueue(); track item.id) {
      <div fewToastRoot [tone]="item.tone ?? 'neutral'" [duration]="item.duration ?? toastService.duration" (openChange)="onOpenChange(item.id, $event)">
        @if (item.title) { <div fewToastTitle>{{ item.title }}</div> }
        @if (item.description) { <div fewToastDescription>{{ item.description }}</div> }
        <button fewToastClose aria-label="Fechar notificação">×</button>
      </div>
    }
    <ng-content />
  `,
})
export class FewToastViewport {
  protected readonly toastService = inject(FewToastService);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly position = input<ToastViewportPosition>('bottom-right');
  protected readonly orderedQueue = computed(() => orderToasts(this.toastService.queue()));
  constructor() {
    if (typeof document === 'undefined') return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'F8') { event.preventDefault(); this.el.nativeElement.focus(); } };
    document.addEventListener('keydown', onKeyDown);
    inject(DestroyRef).onDestroy(() => document.removeEventListener('keydown', onKeyDown));
  }
  protected onOpenChange(id: string, open: boolean): void { if (!open) this.toastService.dismiss(id); }
}

/** Importe tudo de uma vez: `imports: [FEW_TOAST]`. Dispare toasts com `inject(FewToastService).toast(...)`. */
export const FEW_TOAST = [FewToastRoot, FewToastTitle, FewToastDescription, FewToastAction, FewToastClose, FewToastViewport] as const;
