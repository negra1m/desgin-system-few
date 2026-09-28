// Popover: não modal, sobre popover="manual" + setupTopLayer (top layer nativo, herda tema) em vez de Portal.
// Posiciona com setupPosition, fecha com setupDismiss. Espelha packages/react/src/components/overlays/popover.tsx.
import { Directive, ElementRef, effect, inject, input, model, signal } from '@angular/core';
import type { FloatingAlign, FloatingSide } from '@fewcompany/core';
import { dataState } from '../../lib/attrs.js';
import { fewId } from '../../lib/ids.js';
import { focusableItems } from '../../lib/roving.js';
import { setupDismiss } from '../../lib/dismiss.js';
import { setupPosition } from '../../lib/position.js';
import { setupTopLayer } from '../../lib/top-layer.js';

/** Raiz: `<div fewPopover [(open)]="aberto">`. Não modal — não bloqueia o resto da página. */
@Directive({ selector: '[fewPopover]', exportAs: 'fewPopover' })
export class FewPopover {
  readonly open = model(false);
  readonly baseId = fewId('popover');
  private readonly sideState = signal<FloatingSide>('bottom');
  private readonly anchorElementState = signal<Element | null>(null);
  private readonly triggerElement = signal<HTMLElement | null>(null);
  get contentId(): string { return `${this.baseId}-popover`; }
  setOpen(open: boolean): void { this.open.set(open); }
  setSide(side: FloatingSide): void { this.sideState.set(side); }
  side(): FloatingSide { return this.sideState(); }
  /** Usado pelo `fewPopoverAnchor` (âncora explícita), sempre sobrescreve. */
  setAnchorElement(element: Element): void { this.anchorElementState.set(element); }
  /** Usado pelo Trigger: só define a âncora se nenhum `fewPopoverAnchor` já definiu uma. */
  setAnchorFallback(element: Element): void { if (!this.anchorElementState()) this.anchorElementState.set(element); }
  anchorElement(): Element | null { return this.anchorElementState(); }
  setTriggerElement(element: HTMLElement): void { this.triggerElement.set(element); }
  focusTrigger(): void { this.triggerElement()?.focus(); }
}

/** Ancora o posicionamento em outro elemento que não o Trigger (opcional). */
@Directive({ selector: '[fewPopoverAnchor]', host: { class: 'few-popover-anchor' } })
export class FewPopoverAnchor {
  private readonly popover = inject(FewPopover);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  constructor() { this.popover.setAnchorElement(this.el.nativeElement); }
}

@Directive({
  selector: '[fewPopoverTrigger]',
  host: {
    class: 'few-popover-trigger', type: 'button',
    '[attr.aria-haspopup]': "'dialog'", '[attr.aria-expanded]': 'popover.open()',
    '[attr.aria-controls]': 'popover.open() ? popover.contentId : null',
    '(click)': 'onClick()',
  },
})
export class FewPopoverTrigger {
  protected readonly popover = inject(FewPopover);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  constructor() {
    this.popover.setAnchorFallback(this.el.nativeElement);
    this.popover.setTriggerElement(this.el.nativeElement);
  }
  protected onClick(): void { this.popover.setOpen(!this.popover.open()); }
}

@Directive({
  selector: '[fewPopoverContent]',
  host: {
    class: 'few-popover', role: 'dialog', '[attr.tabindex]': '-1', popover: 'manual',
    '[id]': 'popover.contentId', '[attr.data-state]': 'dataState(popover.open())', '[attr.data-side]': 'position().side',
    '[style.position]': "'fixed'", '[style.top.px]': 'position().top', '[style.left.px]': 'position().left',
    '(keydown)': 'onKeyDown($event)',
  },
})
export class FewPopoverContent {
  protected readonly popover = inject(FewPopover);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly side = input<FloatingSide>('bottom');
  readonly align = input<FloatingAlign>('center');
  readonly offset = input(8);
  protected readonly dataState = dataState;
  protected readonly position = setupPosition(this.popover.open, () => this.popover.anchorElement(), () => this.el.nativeElement, () => ({ side: this.side(), align: this.align(), offset: this.offset() }));
  constructor() {
    setupTopLayer(this.popover.open, () => this.el.nativeElement);
    setupDismiss(this.popover.open, () => this.popover.setOpen(false), () => [this.el.nativeElement, this.popover.anchorElement()]);
    effect(() => this.popover.setSide(this.position().side));
    effect(() => {
      if (!this.popover.open() || typeof document === 'undefined') return;
      const el = this.el.nativeElement;
      queueMicrotask(() => { (focusableItems(el, 'a[href],button,input,textarea,select,[tabindex]')[0] ?? el).focus(); });
    });
    effect(() => { if (!this.popover.open()) this.popover.focusTrigger(); });
  }
  protected onKeyDown(event: KeyboardEvent): void {
    if (event.defaultPrevented) return;
    if (event.key === 'Escape') { event.preventDefault(); this.popover.setOpen(false); }
  }
}

@Directive({ selector: '[fewPopoverClose]', host: { class: 'few-popover-close', type: 'button', '(click)': 'popover.setOpen(false)' } })
export class FewPopoverClose {
  protected readonly popover = inject(FewPopover);
}

/** Seta decorativa; a direção é lida em CSS via `data-side` (herdado do Content através do Root). */
@Directive({ selector: '[fewPopoverArrow]', host: { class: 'few-popover-arrow', 'aria-hidden': 'true', '[attr.data-side]': 'popover.side()' } })
export class FewPopoverArrow {
  protected readonly popover = inject(FewPopover);
}

/** Importe tudo de uma vez: `imports: [FEW_POPOVER]`. */
export const FEW_POPOVER = [FewPopover, FewPopoverAnchor, FewPopoverTrigger, FewPopoverContent, FewPopoverClose, FewPopoverArrow] as const;
