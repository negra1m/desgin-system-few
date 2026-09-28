// Dialog modal, sobre <dialog> nativo (ver docs/composition-angular.md #5). Espelha
// packages/react/src/components/overlays/dialog.tsx.
import { Directive, DestroyRef, ElementRef, booleanAttribute, effect, inject, input, model, signal } from '@angular/core';
import { fewId } from '../../lib/ids.js';

export type DialogSize = 'sm' | 'md' | 'lg' | 'full';

/** Raiz: `<div fewDialog [(open)]="aberto">`. Sem binding, o estado é interno (não controlado). */
@Directive({ selector: '[fewDialog]', exportAs: 'fewDialog' })
export class FewDialog {
  readonly open = model(false);
  readonly baseId = fewId('dialog');
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
  selector: '[fewDialogTrigger]',
  host: {
    class: 'few-dialog-trigger', type: 'button',
    '[attr.aria-haspopup]': "'dialog'", '[attr.aria-expanded]': 'dialog.open()',
    '(click)': 'onClick()',
  },
})
export class FewDialogTrigger {
  protected readonly dialog = inject(FewDialog);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  constructor() { this.dialog.setTriggerElement(this.el.nativeElement); }
  protected onClick(): void { this.dialog.setOpen(true); }
}

/** Content: `<dialog fewDialogContent>` — depende do elemento `<dialog>` nativo (showModal, ::backdrop, foco). */
@Directive({
  selector: 'dialog[fewDialogContent]',
  host: {
    class: 'few-dialog', '[attr.data-size]': 'size()',
    '[attr.aria-labelledby]': 'dialog.titleId', '[attr.aria-describedby]': 'dialog.hasDescription() ? dialog.descriptionId : null',
    '(cancel)': 'onCancel($event)', '(close)': 'onClose()', '(click)': 'onClick($event)',
  },
})
export class FewDialogContent {
  protected readonly dialog = inject(FewDialog);
  private readonly el = inject<ElementRef<HTMLDialogElement>>(ElementRef);
  readonly size = input<DialogSize>('md');
  /** Fecha ao clicar fora do conteúdo (na ::backdrop). Padrão true; AlertDialog não tem esse comportamento. */
  readonly dismissOnOutsideClick = input(true, { transform: booleanAttribute });
  constructor() {
    effect(() => {
      const el = this.el.nativeElement;
      if (typeof document === 'undefined' || typeof el.showModal !== 'function') return;
      const open = this.dialog.open();
      if (open && !el.open) el.showModal();
      if (!open && el.open) el.close();
    });
  }
  protected onCancel(event: Event): void { event.preventDefault(); this.dialog.setOpen(false); }
  protected onClose(): void { this.dialog.setOpen(false); this.dialog.focusTrigger(); }
  protected onClick(event: MouseEvent): void { if (this.dismissOnOutsideClick() && event.target === this.el.nativeElement) this.dialog.setOpen(false); }
}

@Directive({ selector: '[fewDialogTitle]', host: { class: 'few-dialog-title', '[id]': 'dialog.titleId' } })
export class FewDialogTitle {
  protected readonly dialog = inject(FewDialog);
}

@Directive({ selector: '[fewDialogDescription]', host: { class: 'few-dialog-description few-muted', '[id]': 'dialog.descriptionId' } })
export class FewDialogDescription {
  protected readonly dialog = inject(FewDialog);
  constructor() {
    this.dialog.setHasDescription(true);
    inject(DestroyRef).onDestroy(() => this.dialog.setHasDescription(false));
  }
}

@Directive({ selector: '[fewDialogClose]', host: { class: 'few-dialog-close', type: 'button', '(click)': 'dialog.setOpen(false)' } })
export class FewDialogClose {
  protected readonly dialog = inject(FewDialog);
}

/** Importe tudo de uma vez: `imports: [FEW_DIALOG]`. */
export const FEW_DIALOG = [FewDialog, FewDialogTrigger, FewDialogContent, FewDialogTitle, FewDialogDescription, FewDialogClose] as const;
