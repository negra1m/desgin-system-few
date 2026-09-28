// Drawer: mesma base do Dialog (<dialog> nativo, showModal/close), lateral. Animação via CSS (@starting-style,
// mesmo CSS do core); movimento reduzido já é zerado em base.css. Espelha
// packages/react/src/components/overlays/drawer.tsx.
import { Directive, DestroyRef, ElementRef, booleanAttribute, effect, inject, input, model, signal } from '@angular/core';
import { fewId } from '../../lib/ids.js';

export type DrawerSide = 'left' | 'right' | 'top' | 'bottom';

/** Raiz: `<div fewDrawer [(open)]="aberto" side="bottom">`. `side` fica no Root: estiliza Handle e Content juntos. */
@Directive({ selector: '[fewDrawer]', exportAs: 'fewDrawer' })
export class FewDrawer {
  readonly open = model(false);
  readonly side = input<DrawerSide>('right');
  readonly baseId = fewId('drawer');
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
  selector: '[fewDrawerTrigger]',
  host: {
    class: 'few-drawer-trigger', type: 'button',
    '[attr.aria-haspopup]': "'dialog'", '[attr.aria-expanded]': 'drawer.open()',
    '(click)': 'onClick()',
  },
})
export class FewDrawerTrigger {
  protected readonly drawer = inject(FewDrawer);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  constructor() { this.drawer.setTriggerElement(this.el.nativeElement); }
  protected onClick(): void { this.drawer.setOpen(true); }
}

/** Content: `<dialog fewDrawerContent>` — depende do `<dialog>` nativo. */
@Directive({
  selector: 'dialog[fewDrawerContent]',
  host: {
    class: 'few-drawer', '[attr.data-side]': 'drawer.side()', '[style.--few-drawer-size]': 'size() ?? null',
    '[attr.aria-labelledby]': 'drawer.titleId', '[attr.aria-describedby]': 'drawer.hasDescription() ? drawer.descriptionId : null',
    '(cancel)': 'onCancel($event)', '(close)': 'onClose()', '(click)': 'onClick($event)',
  },
})
export class FewDrawerContent {
  protected readonly drawer = inject(FewDrawer);
  private readonly el = inject<ElementRef<HTMLDialogElement>>(ElementRef);
  /** Tamanho via `--few-drawer-size` (largura em left/right, altura em top/bottom). Ex.: "420px", "70vh". */
  readonly size = input<string | undefined>(undefined);
  readonly dismissOnOutsideClick = input(true, { transform: booleanAttribute });
  constructor() {
    effect(() => {
      const el = this.el.nativeElement;
      if (typeof document === 'undefined' || typeof el.showModal !== 'function') return;
      const open = this.drawer.open();
      if (open && !el.open) el.showModal();
      if (!open && el.open) el.close();
    });
  }
  protected onCancel(event: Event): void { event.preventDefault(); this.drawer.setOpen(false); }
  protected onClose(): void { this.drawer.setOpen(false); this.drawer.focusTrigger(); }
  protected onClick(event: MouseEvent): void { if (this.dismissOnOutsideClick() && event.target === this.el.nativeElement) this.drawer.setOpen(false); }
}

@Directive({ selector: '[fewDrawerTitle]', host: { class: 'few-drawer-title', '[id]': 'drawer.titleId' } })
export class FewDrawerTitle {
  protected readonly drawer = inject(FewDrawer);
}

@Directive({ selector: '[fewDrawerDescription]', host: { class: 'few-drawer-description few-muted', '[id]': 'drawer.descriptionId' } })
export class FewDrawerDescription {
  protected readonly drawer = inject(FewDrawer);
  constructor() {
    this.drawer.setHasDescription(true);
    inject(DestroyRef).onDestroy(() => this.drawer.setHasDescription(false));
  }
}

@Directive({ selector: '[fewDrawerClose]', host: { class: 'few-drawer-close', type: 'button', '(click)': 'drawer.setOpen(false)' } })
export class FewDrawerClose {
  protected readonly drawer = inject(FewDrawer);
}

/** Indicador visual de arrasto (decorativo), comum em drawers `side="bottom"`. */
@Directive({ selector: '[fewDrawerHandle]', host: { class: 'few-drawer-handle', 'aria-hidden': 'true' } })
export class FewDrawerHandle {}

/** Importe tudo de uma vez: `imports: [FEW_DRAWER]`. */
export const FEW_DRAWER = [
  FewDrawer, FewDrawerTrigger, FewDrawerContent, FewDrawerTitle, FewDrawerDescription, FewDrawerClose, FewDrawerHandle,
] as const;
