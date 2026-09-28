// Tooltip: popover="manual" + setupTopLayer (top layer nativo) em vez de Portal, posicionado com setupPosition.
// Provider (opcional) compartilha o "skip delay": depois que um tooltip abre, os próximos abrem sem esperar o
// delay se o ponteiro migrar de um trigger para outro dentro de `skipDelayDuration`. Espelha
// packages/react/src/components/overlays/tooltip.tsx.
import { Directive, DestroyRef, ElementRef, booleanAttribute, effect, inject, input, model, signal } from '@angular/core';
import type { FloatingAlign, FloatingSide } from '@fewcompany/core';
import { dataState } from '../../lib/attrs.js';
import { fewId } from '../../lib/ids.js';
import { setupDismiss } from '../../lib/dismiss.js';
import { setupPosition } from '../../lib/position.js';
import { setupTopLayer } from '../../lib/top-layer.js';

/** Compartilha o delay de abertura entre vários `fewTooltip` (opcional): `<div fewTooltipProvider>`. */
@Directive({ selector: '[fewTooltipProvider]', exportAs: 'fewTooltipProvider' })
export class FewTooltipProvider {
  readonly delayDuration = input(700);
  readonly skipDelayDuration = input(300);
  private skipping = false;
  private skipTimer?: ReturnType<typeof setTimeout>;
  constructor() { inject(DestroyRef).onDestroy(() => clearTimeout(this.skipTimer)); }
  isSkipping(): boolean { return this.skipping; }
  onOpen(): void { this.skipping = true; clearTimeout(this.skipTimer); }
  onClose(): void {
    clearTimeout(this.skipTimer);
    this.skipTimer = setTimeout(() => { this.skipping = false; }, this.skipDelayDuration());
  }
}

/** Raiz: `<div fewTooltip [(open)]="aberto">`. */
@Directive({ selector: '[fewTooltip]', exportAs: 'fewTooltip' })
export class FewTooltip {
  private readonly provider = inject(FewTooltipProvider, { optional: true });
  readonly open = model(false);
  readonly delay = input<number | undefined>(undefined);
  readonly baseId = fewId('tooltip');
  private readonly sideState = signal<FloatingSide>('top');
  private readonly triggerElementState = signal<HTMLElement | null>(null);
  private openTimer?: ReturnType<typeof setTimeout>;
  get contentId(): string { return `${this.baseId}-tooltip`; }
  side(): FloatingSide { return this.sideState(); }
  setSide(side: FloatingSide): void { this.sideState.set(side); }
  triggerElement(): HTMLElement | null { return this.triggerElementState(); }
  setTriggerElement(element: HTMLElement): void { this.triggerElementState.set(element); }
  private effectiveDelay(): number { return this.delay() ?? this.provider?.delayDuration() ?? 700; }
  /** Abre no hover (com delay) ou imediatamente no foco (`immediate`), salvo se já estiver "pulando" o delay. */
  requestOpen(immediate = false): void {
    clearTimeout(this.openTimer);
    if (immediate || this.provider?.isSkipping()) { this.provider?.onOpen(); this.open.set(true); return; }
    this.openTimer = setTimeout(() => { this.provider?.onOpen(); this.open.set(true); }, this.effectiveDelay());
  }
  requestClose(): void {
    clearTimeout(this.openTimer);
    this.provider?.onClose();
    this.open.set(false);
  }
  constructor() { inject(DestroyRef).onDestroy(() => clearTimeout(this.openTimer)); }
}

/** Abre no hover (com delay) e no foco (imediato); fecha no blur, pointerleave, pointerdown ou Escape (via dismiss do Content). Não abre se `disabled`. */
@Directive({
  selector: '[fewTooltipTrigger]',
  host: {
    class: 'few-tooltip-trigger', type: 'button',
    '[attr.disabled]': 'disabled() ? "" : null', '[attr.aria-describedby]': 'tooltip.contentId',
    '(pointerenter)': 'onPointerEnter($event)', '(pointerleave)': 'tooltip.requestClose()',
    '(pointerdown)': 'tooltip.requestClose()', '(focus)': 'onFocus()', '(blur)': 'tooltip.requestClose()',
  },
})
export class FewTooltipTrigger {
  protected readonly tooltip = inject(FewTooltip);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly disabled = input(false, { transform: booleanAttribute });
  constructor() { this.tooltip.setTriggerElement(this.el.nativeElement); }
  protected onPointerEnter(event: PointerEvent): void { if (!this.disabled() && event.pointerType !== 'touch') this.tooltip.requestOpen(); }
  protected onFocus(): void { if (!this.disabled()) this.tooltip.requestOpen(true); }
}

@Directive({
  selector: '[fewTooltipContent]',
  host: {
    class: 'few-tooltip', role: 'tooltip', popover: 'manual',
    '[id]': 'tooltip.contentId', '[attr.data-state]': 'dataState(tooltip.open())', '[attr.data-side]': 'position().side',
    '[style.position]': "'fixed'", '[style.top.px]': 'position().top', '[style.left.px]': 'position().left',
  },
})
export class FewTooltipContent {
  protected readonly tooltip = inject(FewTooltip);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly side = input<FloatingSide>('top');
  readonly align = input<FloatingAlign>('center');
  readonly offset = input(6);
  protected readonly dataState = dataState;
  protected readonly position = setupPosition(this.tooltip.open, () => this.tooltip.triggerElement(), () => this.el.nativeElement, () => ({ side: this.side(), align: this.align(), offset: this.offset() }));
  constructor() {
    setupTopLayer(this.tooltip.open, () => this.el.nativeElement);
    setupDismiss(this.tooltip.open, () => this.tooltip.requestClose(), () => [this.tooltip.triggerElement(), this.el.nativeElement], { outside: false });
    effect(() => this.tooltip.setSide(this.position().side));
  }
}

@Directive({ selector: '[fewTooltipArrow]', host: { class: 'few-tooltip-arrow', 'aria-hidden': 'true', '[attr.data-side]': 'tooltip.side()' } })
export class FewTooltipArrow {
  protected readonly tooltip = inject(FewTooltip);
}

/** Importe tudo de uma vez: `imports: [FEW_TOOLTIP]`. */
export const FEW_TOOLTIP = [FewTooltipProvider, FewTooltip, FewTooltipTrigger, FewTooltipContent, FewTooltipArrow] as const;
