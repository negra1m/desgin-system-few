// Ver docs/composition-angular.md. Fonte da verdade: packages/react/src/components/navigation/command-menu.tsx.
import { Component, Directive, DestroyRef, ElementRef, booleanAttribute, computed, effect, inject, input, model, output, signal } from '@angular/core';
import { commandScore, nextIndex, normalizeText } from '@fewcompany/core';
import { fewId } from '../../lib/ids.js';
import { dataAttr } from '../../lib/attrs.js';

/** Raiz: `<dialog fewCommandMenu [(open)]="open" shortcut>`. `showModal()/close()` em efeito sobre `open()`. Foco volta ao elemento que abriu o diálogo ao fechar. */
@Component({
  selector: 'dialog[fewCommandMenu]',
  exportAs: 'fewCommandMenu',
  host: { class: 'few-command', '[attr.aria-label]': 'label()', '(close)': 'onClose()' },
  template: `<ng-content />`,
})
export class FewCommandMenu {
  private readonly elementRef = inject<ElementRef<HTMLDialogElement>>(ElementRef);
  readonly open = model(false);
  /** Ativa o atalho global Ctrl/Cmd+K para abrir e fechar. */
  readonly shortcut = input(false, { transform: booleanAttribute });
  /** Rótulo acessível do diálogo. */
  readonly label = input('Comandos');
  readonly baseId = fewId('command');
  readonly query = signal('');
  readonly activeId = signal<string | null>(null);
  readonly empty = signal(false);
  /** Elemento da lista, preenchido por FewCommandList; usado para varrer as opções visíveis. */
  listElement: HTMLElement | null = null;
  private previouslyFocused: HTMLElement | null = null;

  constructor() {
    effect(() => {
      if (typeof document === 'undefined') return;
      const dialog = this.elementRef.nativeElement;
      if (this.open()) {
        if (!dialog.open) {
          this.previouslyFocused = document.activeElement as HTMLElement | null;
          dialog.showModal();
          this.query.set('');
          this.activeId.set(null);
        }
      } else if (dialog.open) {
        dialog.close();
        this.previouslyFocused?.focus();
      }
    });

    effect(() => {
      if (typeof document === 'undefined') return;
      this.query(); this.open();
      const container = this.listElement;
      if (!container) return;
      const options = Array.from(container.querySelectorAll<HTMLElement>('[role="option"]:not([hidden])'));
      this.empty.set(options.length === 0);
      const current = this.activeId();
      this.activeId.set(current && options.some(option => option.id === current) ? current : (options[0]?.id ?? null));
    });

    effect((onCleanup) => {
      if (typeof document === 'undefined' || !this.shortcut()) return;
      const onKeyDown = (event: KeyboardEvent) => {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); this.open.set(!this.open()); }
      };
      document.addEventListener('keydown', onKeyDown);
      onCleanup(() => document.removeEventListener('keydown', onKeyDown));
    });
  }

  setOpen(value: boolean) { this.open.set(value); }
  setQuery(query: string) { this.query.set(query); }
  setActiveId(id: string | null) { this.activeId.set(id); }
  protected onClose() { this.open.set(false); }
}

@Directive({
  selector: 'input[fewCommandInput]',
  host: {
    class: 'few-command-input', type: 'text', role: 'combobox', 'aria-expanded': 'true', autocomplete: 'off', spellcheck: 'false',
    '[attr.aria-controls]': 'listId', '[attr.aria-activedescendant]': 'command.activeId()',
    '[value]': 'command.query()', '(input)': 'onInput($event)', '(keydown)': 'onKeydown($event)',
  },
})
export class FewCommandInput {
  protected readonly command = inject(FewCommandMenu);
  protected get listId() { return `${this.command.baseId}-list`; }
  protected onInput(event: Event) { this.command.setQuery((event.target as HTMLInputElement).value); }
  protected onKeydown(event: KeyboardEvent) {
    if (event.defaultPrevented) return;
    if (event.key === 'Enter') {
      event.preventDefault();
      const id = this.command.activeId();
      (id ? document.getElementById(id) : null)?.click();
      return;
    }
    const options = Array.from(this.command.listElement?.querySelectorAll<HTMLElement>('[role="option"]:not([hidden])') ?? []);
    if (!options.length) return;
    const activeId = this.command.activeId();
    const current = activeId ? options.findIndex(option => option.id === activeId) : -1;
    const next = nextIndex(event.key, current < 0 ? 0 : current, options.length, { orientation: 'vertical', loop: false });
    if (next === null) return;
    event.preventDefault();
    const target = options[next];
    this.command.setActiveId(target.id);
    target.scrollIntoView({ block: 'nearest' });
  }
}

@Directive({ selector: '[fewCommandList]', host: { class: 'few-command-list', role: 'listbox', '[id]': 'id' } })
export class FewCommandList {
  private readonly command = inject(FewCommandMenu);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  protected get id() { return `${this.command.baseId}-list`; }
  constructor() {
    const el = this.elementRef.nativeElement;
    this.command.listElement = el;
    inject(DestroyRef).onDestroy(() => { if (this.command.listElement === el) this.command.listElement = null; });
  }
}

@Directive({ selector: '[fewCommandGroup]', host: { class: 'few-command-group', role: 'group' } })
export class FewCommandGroup {}

@Directive({ selector: '[fewCommandGroupHeading]', host: { class: 'few-command-group-heading' } })
export class FewCommandGroupHeading {}

/** Item pesquisável. `value` é o texto pesquisável (sem acento) e identificador entregue a `select`. Some do DOM (via `hidden`) quando não corresponde à busca. */
@Component({
  selector: '[fewCommandItem]',
  host: {
    class: 'few-command-item', role: 'option',
    '[id]': 'id()', '[hidden]': '!matches()',
    '[attr.aria-selected]': 'active()', '[attr.aria-disabled]': 'disabled() ? "true" : null', '[attr.data-disabled]': 'dataAttr(disabled())',
    '[attr.data-state]': 'active() ? "active" : null',
    '(click)': 'onClick()', '(mouseenter)': 'onMouseEnter()',
  },
  template: `<ng-content />`,
})
export class FewCommandItem {
  protected readonly command = inject(FewCommandMenu);
  readonly value = input.required<string>();
  readonly keywords = input<string[]>();
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly select = output<string>();
  protected readonly dataAttr = dataAttr;
  protected readonly matches = computed(() => commandScore(this.value(), this.command.query(), this.keywords() ?? []) !== null);
  protected readonly id = computed(() => `${this.command.baseId}-item-${normalizeText(this.value()).replace(/\s+/g, '-')}`);
  protected readonly active = computed(() => this.command.activeId() === this.id());
  protected onClick() { if (!this.disabled() && this.matches()) this.select.emit(this.value()); }
  protected onMouseEnter() { if (!this.disabled() && this.matches()) this.command.setActiveId(this.id()); }
}

/** Mensagem de nenhum resultado. Fica oculta (`hidden`) enquanto houver opções visíveis. Sem conteúdo projetado, mostra "Nada encontrado.". */
@Component({
  selector: '[fewCommandEmpty]',
  host: { class: 'few-command-empty', role: 'status', '[hidden]': '!command.empty()' },
  template: `<ng-content />@if (noContent()) {<span>Nada encontrado.</span>}`,
})
export class FewCommandEmpty {
  protected readonly command = inject(FewCommandMenu);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly noContent = signal(false);
  ngAfterContentInit() { this.noContent.set(!this.elementRef.nativeElement.textContent?.trim()); }
}

@Directive({ selector: '[fewCommandSeparator]', host: { class: 'few-command-separator', role: 'separator', 'aria-orientation': 'horizontal' } })
export class FewCommandSeparator {}

@Directive({ selector: '[fewCommandShortcut]', host: { class: 'few-command-shortcut' } })
export class FewCommandShortcut {}

/** Importe tudo de uma vez: `imports: [FEW_COMMAND_MENU]`. */
export const FEW_COMMAND_MENU = [
  FewCommandMenu, FewCommandInput, FewCommandList, FewCommandGroup, FewCommandGroupHeading, FewCommandItem, FewCommandEmpty, FewCommandSeparator, FewCommandShortcut,
] as const;
