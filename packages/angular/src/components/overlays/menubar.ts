// Menubar: barra horizontal de menus (Arquivo, Editar…). Roving focus horizontal entre Triggers; ArrowLeft/Right
// troca o menu aberto; hover troca quando algum já está aberto. Núcleo reusado de menu-core.ts (peças Item/... —
// importe-as de './dropdown-menu.js' ou './menu-core.js', não reexportadas aqui para não duplicar no barrel).
// Simplificação assumida (igual ao React): todo Trigger fica com tabindex 0 (toolbar simples) em vez do único
// tab-stop do roving-tabindex "estrito" — teclado permanece 100% operável (setas, Home/End, Enter/Espaço, Escape).
// Espelha packages/react/src/components/overlays/menubar.tsx.
import { Directive, ElementRef, booleanAttribute, computed, forwardRef, inject, input, model, signal } from '@angular/core';
import type { FloatingAlign, FloatingSide } from '@fewcompany/core';
import { dataState } from '../../lib/attrs.js';
import { fewId } from '../../lib/ids.js';
import { moveFocus } from '../../lib/roving.js';
import { FewMenuContent, setupMenuContent } from './menu-core.js';

const TRIGGER_SELECTOR = ':scope > [role="menuitem"]';

@Directive({ selector: '[fewMenubar]', host: { class: 'few-menubar', role: 'menubar', '(keydown)': 'onKeydown($event)' } })
export class FewMenubar {
  readonly value = model<string | null>(null);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  setValue(value: string | null): void { this.value.set(value); }
  protected onKeydown(event: KeyboardEvent): void {
    if (event.defaultPrevented) return;
    const target = moveFocus(this.el.nativeElement, TRIGGER_SELECTOR, event.key, { orientation: 'horizontal', loop: true });
    if (!target) return;
    event.preventDefault();
    if (this.value() !== null) this.value.set(target.dataset['menubarValue'] ?? null);
  }
}

/** `Menubar.Menu`: só contexto (identifica o menu para o Trigger e o Content). `<div fewMenubarMenu value="file">`. */
@Directive({ selector: '[fewMenubarMenu]', exportAs: 'fewMenubarMenu' })
export class FewMenubarMenu {
  readonly value = input.required<string>();
  readonly baseId = fewId('menubar-menu');
  private readonly triggerElementState = signal<HTMLElement | null>(null);
  get contentId(): string { return `${this.baseId}-menubar-menu`; }
  triggerElement(): HTMLElement | null { return this.triggerElementState(); }
  setTriggerElement(element: HTMLElement): void { this.triggerElementState.set(element); }
}

@Directive({
  selector: '[fewMenubarTrigger]',
  host: {
    class: 'few-menubar-trigger', type: 'button', role: 'menuitem', '[attr.tabindex]': '0',
    '[attr.data-menubar-value]': 'menuItem.value()', '[attr.aria-haspopup]': "'menu'", '[attr.aria-expanded]': 'open()',
    '[attr.aria-controls]': 'open() ? menuItem.contentId : null', '[attr.data-state]': 'dataState(open())',
    '(click)': 'onClick()', '(mouseenter)': 'onMouseEnter()',
  },
})
export class FewMenubarTrigger {
  private readonly root = inject(FewMenubar);
  protected readonly menuItem = inject(FewMenubarMenu);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly dataState = dataState;
  protected readonly open = computed(() => this.root.value() === this.menuItem.value());
  constructor() { this.menuItem.setTriggerElement(this.el.nativeElement); }
  protected onClick(): void { this.root.setValue(this.open() ? null : this.menuItem.value()); }
  protected onMouseEnter(): void { if (this.root.value() !== null && this.root.value() !== this.menuItem.value()) this.root.setValue(this.menuItem.value()); }
}

@Directive({
  selector: '[fewMenubarContent]',
  providers: [{ provide: FewMenuContent, useExisting: forwardRef(() => FewMenubarContent) }],
  host: {
    class: 'few-menu few-menubar-menu', role: 'menu', popover: 'manual',
    '[id]': 'menuItem.contentId', '[attr.data-state]': 'open() ? "open" : "closed"', '[attr.data-side]': 'core.position().side',
    '[style.position]': "'fixed'", '[style.top.px]': 'core.position().top', '[style.left.px]': 'core.position().left',
    '(keydown)': 'core.onKeyDown($event)',
  },
})
export class FewMenubarContent implements FewMenuContent {
  private readonly root = inject(FewMenubar);
  protected readonly menuItem = inject(FewMenubarMenu);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly side = input<FloatingSide>('bottom');
  readonly align = input<FloatingAlign>('start');
  readonly offset = input(4);
  readonly loop = input(true, { transform: booleanAttribute });
  protected readonly open = computed(() => this.root.value() === this.menuItem.value());
  protected readonly core = setupMenuContent({
    open: this.open,
    anchor: () => this.menuItem.triggerElement(),
    element: () => this.el.nativeElement,
    onDismiss: () => this.root.setValue(null),
    options: () => ({ side: this.side(), align: this.align(), offset: this.offset(), loop: this.loop() }),
  });
  close(): void { this.root.setValue(null); }
}

/** Importe tudo de uma vez: `imports: [FEW_MENUBAR, FEW_MENU_PARTS]` (peças Item/... vêm de menu-core.ts). */
export const FEW_MENUBAR = [FewMenubar, FewMenubarMenu, FewMenubarTrigger, FewMenubarContent] as const;
