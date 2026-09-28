// AlertDialog: mesma base do Dialog (<dialog> nativo), mas role=alertdialog, sem fechar no clique fora, Cancel/Action
// em vez de Close, foco inicial no Cancel (autofocus nativo, lido pelo showModal() a cada abertura).
// Espelha packages/react/src/components/overlays/alert-dialog.tsx.
import { Directive, DestroyRef, ElementRef, effect, inject, model, signal } from '@angular/core';
import { fewId } from '../../lib/ids.js';

/** Raiz: `<div fewAlertDialog [(open)]="aberto">`. Sempre modal, sem fechar no clique fora. */
@Directive({ selector: '[fewAlertDialog]', exportAs: 'fewAlertDialog' })
export class FewAlertDialog {
  readonly open = model(false);
  readonly baseId = fewId('alert-dialog');
  private readonly hasDescriptionState = signal(false);
  readonly hasDescription = this.hasDescriptionState.asReadonly();
  private readonly triggerElement = signal<HTMLElement | null>(null);
  get titleId(): string { return `${this.baseId}-title`; }
  get descriptionId(): string { return `${this.baseId}-description`; }
  setOpen(open: boolean): void { this.open.set(open); }
  setHasDescription(value: boolean): void { this.hasDescriptionState.set(value); }
  setTriggerElement(element: HTMLElement): void { this.triggerElement.set(element); }
  focusTrigger(): void { this.triggerElement()?.focus(); }
}

@Directive({
  selector: '[fewAlertDialogTrigger]',
  host: {
    class: 'few-alert-dialog-trigger', type: 'button',
    '[attr.aria-haspopup]': "'dialog'", '[attr.aria-expanded]': 'alertDialog.open()',
    '(click)': 'onClick()',
  },
})
export class FewAlertDialogTrigger {
  protected readonly alertDialog = inject(FewAlertDialog);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  constructor() { this.alertDialog.setTriggerElement(this.el.nativeElement); }
  protected onClick(): void { this.alertDialog.setOpen(true); }
}

/** Content: `<dialog fewAlertDialogContent>`. Sem fechar no clique fora — só Cancel/Action/Escape. */
@Directive({
  selector: 'dialog[fewAlertDialogContent]',
  host: {
    class: 'few-alert-dialog', role: 'alertdialog',
    '[attr.aria-labelledby]': 'alertDialog.titleId', '[attr.aria-describedby]': 'alertDialog.hasDescription() ? alertDialog.descriptionId : null',
    '(cancel)': 'onCancel($event)', '(close)': 'onClose()',
  },
})
export class FewAlertDialogContent {
  protected readonly alertDialog = inject(FewAlertDialog);
  private readonly el = inject<ElementRef<HTMLDialogElement>>(ElementRef);
  constructor() {
    effect(() => {
      const el = this.el.nativeElement;
      if (typeof document === 'undefined' || typeof el.showModal !== 'function') return;
      const open = this.alertDialog.open();
      if (open && !el.open) el.showModal();
      if (!open && el.open) el.close();
    });
  }
  protected onCancel(event: Event): void { event.preventDefault(); this.alertDialog.setOpen(false); }
  protected onClose(): void { this.alertDialog.setOpen(false); this.alertDialog.focusTrigger(); }
}

@Directive({ selector: '[fewAlertDialogTitle]', host: { class: 'few-alert-dialog-title', '[id]': 'alertDialog.titleId' } })
export class FewAlertDialogTitle {
  protected readonly alertDialog = inject(FewAlertDialog);
}

@Directive({ selector: '[fewAlertDialogDescription]', host: { class: 'few-alert-dialog-description few-muted', '[id]': 'alertDialog.descriptionId' } })
export class FewAlertDialogDescription {
  protected readonly alertDialog = inject(FewAlertDialog);
  constructor() {
    this.alertDialog.setHasDescription(true);
    inject(DestroyRef).onDestroy(() => this.alertDialog.setHasDescription(false));
  }
}

/** Recebe o foco inicial (autofocus nativo lido pelo showModal() a cada abertura). */
@Directive({ selector: '[fewAlertDialogCancel]', host: { class: 'few-alert-dialog-cancel', type: 'button', autofocus: '', '(click)': 'alertDialog.setOpen(false)' } })
export class FewAlertDialogCancel {
  protected readonly alertDialog = inject(FewAlertDialog);
}

/**
 * Ação principal: fecha o diálogo ao clicar. Simplificação assumida (sem `asChild`/Slot): o `(click)` do próprio
 * consumidor no mesmo elemento roda como um listener independente — não há como checar `preventDefault()` dele
 * para cancelar o fechamento, diferente do React (que embrulha o onClick do consumidor).
 */
@Directive({ selector: '[fewAlertDialogAction]', host: { class: 'few-alert-dialog-action', type: 'button', '(click)': 'alertDialog.setOpen(false)' } })
export class FewAlertDialogAction {
  protected readonly alertDialog = inject(FewAlertDialog);
}

/** Importe tudo de uma vez: `imports: [FEW_ALERT_DIALOG]`. */
export const FEW_ALERT_DIALOG = [
  FewAlertDialog, FewAlertDialogTrigger, FewAlertDialogContent, FewAlertDialogTitle, FewAlertDialogDescription, FewAlertDialogCancel, FewAlertDialogAction,
] as const;
