// DropdownMenu: menu acionado por um botão. Núcleo de Content/Item/etc. vem de menu-core.ts (reusado por
// ContextMenu e Menubar); este arquivo reexporta essas peças (menu-core.ts não entra direto no barrel da
// categoria — ver comentário em menu-core.ts). Espelha packages/react/src/components/overlays/dropdown-menu.tsx.
import { Directive, ElementRef, booleanAttribute, forwardRef, inject, input, model, signal } from '@angular/core';
import type { FloatingAlign, FloatingSide } from '@fewcompany/core';
import { fewId } from '../../lib/ids.js';
import { FewMenuContent, setupMenuContent, FEW_MENU_PARTS } from './menu-core.js';

/** Raiz: `<div fewDropdownMenu [(open)]="aberto">`. */
@Directive({ selector: '[fewDropdownMenu]', exportAs: 'fewDropdownMenu' })
export class FewDropdownMenu {
  readonly open = model(false);
  readonly baseId = fewId('dropdown-menu');
  private readonly triggerElementState = signal<HTMLElement | null>(null);
  get contentId(): string { return `${this.baseId}-menu`; }
  setOpen(open: boolean): void { this.open.set(open); }
  triggerElement(): HTMLElement | null { return this.triggerElementState(); }
  setTriggerElement(element: HTMLElement): void { this.triggerElementState.set(element); }
}

/** ArrowDown abre o menu (Enter/Espaço já funcionam nativamente, é um `<button>`). */
@Directive({
  selector: '[fewDropdownMenuTrigger]',
  host: {
    class: 'few-dropdown-menu-trigger', type: 'button',
    '[attr.aria-haspopup]': "'menu'", '[attr.aria-expanded]': 'menu.open()',
    '[attr.aria-controls]': 'menu.open() ? menu.contentId : null',
    '(click)': 'onClick()', '(keydown)': 'onKeydown($event)',
  },
})
export class FewDropdownMenuTrigger {
  protected readonly menu = inject(FewDropdownMenu);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  constructor() { this.menu.setTriggerElement(this.el.nativeElement); }
  protected onClick(): void { this.menu.setOpen(!this.menu.open()); }
  protected onKeydown(event: KeyboardEvent): void {
    if (event.defaultPrevented) return;
    if (event.key === 'ArrowDown') { event.preventDefault(); this.menu.setOpen(true); }
  }
}

@Directive({
  selector: '[fewDropdownMenuContent]',
  providers: [{ provide: FewMenuContent, useExisting: forwardRef(() => FewDropdownMenuContent) }],
  host: {
    class: 'few-menu few-dropdown-menu', role: 'menu', popover: 'manual',
    '[id]': 'menu.contentId', '[attr.data-state]': 'menu.open() ? "open" : "closed"', '[attr.data-side]': 'core.position().side',
    '[style.position]': "'fixed'", '[style.top.px]': 'core.position().top', '[style.left.px]': 'core.position().left',
    '(keydown)': 'core.onKeyDown($event)',
  },
})
export class FewDropdownMenuContent implements FewMenuContent {
  private readonly menu = inject(FewDropdownMenu);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly side = input<FloatingSide>('bottom');
  readonly align = input<FloatingAlign>('start');
  readonly offset = input(4);
  readonly loop = input(true, { transform: booleanAttribute });
  protected readonly core = setupMenuContent({
    open: this.menu.open,
    anchor: () => this.menu.triggerElement(),
    element: () => this.el.nativeElement,
    onDismiss: () => this.menu.setOpen(false),
    options: () => ({ side: this.side(), align: this.align(), offset: this.offset(), loop: this.loop() }),
  });
  close(): void { this.menu.setOpen(false); }
}

export * from './menu-core.js';

/** Importe tudo de uma vez: `imports: [FEW_DROPDOWN_MENU]` (inclui Item/CheckboxItem/RadioGroup/... de menu-core.ts). */
export const FEW_DROPDOWN_MENU = [FewDropdownMenu, FewDropdownMenuTrigger, FewDropdownMenuContent, ...FEW_MENU_PARTS] as const;
