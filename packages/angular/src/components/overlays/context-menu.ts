// ContextMenu: menu na posição do ponteiro (botão direito ou toque longo). Núcleo reusado de menu-core.ts (mesmas
// peças Item/CheckboxItem/RadioGroup/... de dropdown-menu.ts — não reexportadas aqui para não duplicar símbolos
// no barrel; importe-as de './dropdown-menu.js' ou './menu-core.js'). Espelha
// packages/react/src/components/overlays/context-menu.tsx.
import { Directive, DestroyRef, ElementRef, booleanAttribute, effect, forwardRef, inject, input, model, signal } from '@angular/core';
import type { FloatingAlign, FloatingSide } from '@fewcompany/core';
import { fewId } from '../../lib/ids.js';
import { FewMenuContent, setupMenuContent } from './menu-core.js';

interface Point { x: number; y: number }

/** Raiz: `<div fewContextMenu [(open)]="aberto">`. */
@Directive({ selector: '[fewContextMenu]', exportAs: 'fewContextMenu' })
export class FewContextMenu {
  readonly open = model(false);
  readonly baseId = fewId('context-menu');
  private readonly pointState = signal<Point>({ x: 0, y: 0 });
  get contentId(): string { return `${this.baseId}-context-menu`; }
  point(): Point { return this.pointState(); }
  setOpen(open: boolean): void { this.open.set(open); }
  openAt(x: number, y: number): void { this.pointState.set({ x, y }); this.open.set(true); }
}

/** Área que escuta o clique com botão direito (e, opcionalmente, toque longo) para abrir o menu na posição do ponteiro. */
@Directive({
  selector: '[fewContextMenuTrigger]',
  host: {
    // tabindex garante que o teclado alcance a área (Menu/Shift+F10 disparam "contextmenu" nativo no elemento focado).
    class: 'few-context-menu-trigger', '[attr.tabindex]': '0',
    '(contextmenu)': 'onContextMenu($event)', '(pointerdown)': 'onPointerDown($event)',
    '(pointerup)': 'onPointerUp()', '(pointerleave)': 'onPointerLeave()',
  },
})
export class FewContextMenuTrigger {
  private readonly menu = inject(FewContextMenu);
  /** Toque longo (mobile) também abre o menu. Padrão true. */
  readonly longPress = input(true, { transform: booleanAttribute });
  private timer?: ReturnType<typeof setTimeout>;
  protected onContextMenu(event: MouseEvent): void {
    if (event.defaultPrevented) return;
    event.preventDefault();
    this.menu.openAt(event.clientX, event.clientY);
  }
  protected onPointerDown(event: PointerEvent): void {
    if (!this.longPress() || event.pointerType !== 'touch') return;
    const { clientX, clientY } = event;
    this.timer = setTimeout(() => this.menu.openAt(clientX, clientY), 500);
  }
  protected onPointerUp(): void { window.clearTimeout(this.timer); }
  protected onPointerLeave(): void { window.clearTimeout(this.timer); }
}

@Directive({
  selector: '[fewContextMenuContent]',
  providers: [{ provide: FewMenuContent, useExisting: forwardRef(() => FewContextMenuContent) }],
  host: {
    class: 'few-menu few-context-menu', role: 'menu', popover: 'manual',
    '[id]': 'menu.contentId', '[attr.data-state]': 'menu.open() ? "open" : "closed"', '[attr.data-side]': 'core.position().side',
    '[style.position]': "'fixed'", '[style.top.px]': 'core.position().top', '[style.left.px]': 'core.position().left',
    '(keydown)': 'core.onKeyDown($event)',
  },
})
export class FewContextMenuContent implements FewMenuContent {
  private readonly menu = inject(FewContextMenu);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly side = input<FloatingSide>('bottom');
  readonly align = input<FloatingAlign>('start');
  readonly offset = input(2);
  readonly loop = input(true, { transform: booleanAttribute });
  /**
   * Âncora virtual na posição do ponteiro. Diferente do React (que renderiza um `<span>` irmão via JSX), uma
   * diretiva de atributo Angular só modifica o próprio elemento — por isso o `<span>` é criado imperativamente e
   * anexado a `document.body` (posição fixed, o pai no DOM não importa visualmente) e removido ao destruir.
   */
  private readonly anchorEl: HTMLElement | null = typeof document !== 'undefined' ? document.createElement('span') : null;
  protected readonly core: ReturnType<typeof setupMenuContent>;
  constructor() {
    if (this.anchorEl) {
      this.anchorEl.setAttribute('aria-hidden', 'true');
      this.anchorEl.className = 'few-context-menu-anchor';
      this.anchorEl.style.position = 'fixed';
      this.anchorEl.style.width = '0';
      this.anchorEl.style.height = '0';
      document.body.appendChild(this.anchorEl);
      inject(DestroyRef).onDestroy(() => this.anchorEl?.remove());
    }
    effect(() => {
      if (!this.anchorEl) return;
      const point = this.menu.point();
      this.anchorEl.style.left = `${point.x}px`;
      this.anchorEl.style.top = `${point.y}px`;
    });
    this.core = setupMenuContent({
      open: this.menu.open,
      anchor: () => this.anchorEl,
      element: () => this.el.nativeElement,
      onDismiss: () => this.menu.setOpen(false),
      options: () => ({ side: this.side(), align: this.align(), offset: this.offset(), loop: this.loop() }),
    });
  }
  close(): void { this.menu.setOpen(false); }
}

/** Importe tudo de uma vez: `imports: [FEW_CONTEXT_MENU, FEW_MENU_PARTS]` (peças Item/... vêm de menu-core.ts). */
export const FEW_CONTEXT_MENU = [FewContextMenu, FewContextMenuTrigger, FewContextMenuContent] as const;
