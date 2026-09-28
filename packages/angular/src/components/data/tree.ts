// Tree: árvore acessível (WAI-ARIA APG Tree View) com seleção, expansão e digitação (ver docs/composition-angular.md).
// Fonte da verdade: packages/react/src/components/data/tree.tsx. Nível de aninhamento propagado por DI (FewTreeLevel),
// equivalente ao Context de nível do React.
import { Component, Directive, ElementRef, Optional, SkipSelf, afterNextRender, booleanAttribute, computed, contentChild, inject, input, model, signal } from '@angular/core';
import { nextIndex, typeaheadIndex } from '@fewcompany/core';
import { dataAttr } from '../../lib/attrs.js';
import { focusableItems } from '../../lib/roving.js';

/** Nível de aninhamento (1 = raiz). Cada `Tree.ItemContent` fornece um novo nível (nível do pai + 1) para os filhos. */
export class FewTreeLevel {
  constructor(readonly level: number = 1) {}
}

@Directive({
  selector: '[fewTree]',
  exportAs: 'fewTree',
  host: {
    class: 'few-tree',
    role: 'tree',
    '[attr.aria-multiselectable]': 'multiple() || null',
    '(keydown)': 'onKeydown($event)',
    '(focusin)': 'onFocusIn($event)',
  },
})
export class FewTree {
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  /** Ids selecionados. */
  readonly value = model<string[]>([]);
  /** Ids expandidos. */
  readonly expanded = model<string[]>([]);
  readonly multiple = input(false, { transform: booleanAttribute });

  private readonly expandedSet = computed(() => new Set(this.expanded()));
  private readonly activeIdSig = signal<string | null>(null);
  readonly activeId = this.activeIdSig.asReadonly();

  private typeBuffer = '';
  private typeTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    afterNextRender(() => {
      if (this.activeIdSig() !== null) return;
      const first = this.hostRef.nativeElement.querySelector<HTMLElement>('[role="treeitem"]');
      const id = first?.dataset['itemId'];
      if (id) this.activeIdSig.set(id);
    });
  }

  isSelected(id: string) { return this.value().includes(id); }
  isExpanded(id: string) { return this.expandedSet().has(id); }
  select(id: string, additive: boolean) {
    this.value.update(current => {
      if (!this.multiple() || !additive) return [id];
      return current.includes(id) ? current.filter(x => x !== id) : [...current, id];
    });
  }
  setExpanded(id: string, open: boolean) {
    this.expanded.update(current => (open ? (current.includes(id) ? current : [...current, id]) : current.filter(x => x !== id)));
  }
  setActiveId(id: string) { this.activeIdSig.set(id); }

  protected onFocusIn(event: FocusEvent) {
    const item = (event.target as HTMLElement).closest<HTMLElement>('[role="treeitem"]');
    const id = item?.dataset['itemId'];
    if (id) this.setActiveId(id);
  }

  protected onKeydown(event: KeyboardEvent) {
    if (event.defaultPrevented) return;
    const container = this.hostRef.nativeElement;
    const items = focusableItems(container, '[role="treeitem"]');
    const current = document.activeElement as HTMLElement | null;
    const index = current ? items.indexOf(current) : -1;
    const id = current?.dataset['itemId'];
    const isOpen = current?.getAttribute('aria-expanded') === 'true';
    const isBranch = current?.hasAttribute('aria-expanded') ?? false;
    const level = Number(current?.getAttribute('aria-level') ?? '1');

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
      const next = nextIndex(event.key, index < 0 ? 0 : index, items.length, { orientation: 'vertical' });
      if (next !== null) { event.preventDefault(); items[next]?.focus(); }
      return;
    }
    if (event.key === 'ArrowRight') {
      if (isBranch && !isOpen && id) { event.preventDefault(); this.setExpanded(id, true); }
      else if (isBranch && isOpen) { event.preventDefault(); items[index + 1]?.focus(); }
      return;
    }
    if (event.key === 'ArrowLeft') {
      if (isBranch && isOpen && id) { event.preventDefault(); this.setExpanded(id, false); }
      else if (level > 1) {
        for (let i = index - 1; i >= 0; i--) {
          const parentLevel = Number(items[i].getAttribute('aria-level') ?? '1');
          if (parentLevel < level) { event.preventDefault(); items[i].focus(); break; }
        }
      }
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      if (id) { event.preventDefault(); this.select(id, event.ctrlKey || event.metaKey); }
      return;
    }
    if (event.key.length === 1 && /\S/.test(event.key) && !event.ctrlKey && !event.metaKey) {
      window.clearTimeout(this.typeTimer);
      this.typeBuffer += event.key.toLowerCase();
      const labels = items.map(item => item.textContent?.trim() ?? '');
      const found = typeaheadIndex(labels, this.typeBuffer, index < 0 ? 0 : index);
      if (found !== null) { event.preventDefault(); items[found]?.focus(); }
      this.typeTimer = setTimeout(() => { this.typeBuffer = ''; }, 500);
    }
  }
}

/** `<div fewTreeItem [value]="id">`: injeta o `FewTree` mais próximo e o nível corrente (via `FewTreeLevel`). */
@Directive({
  selector: '[fewTreeItem]',
  host: {
    class: 'few-tree-item',
    role: 'treeitem',
    '[attr.data-item-id]': 'value()',
    '[attr.aria-level]': 'level',
    '[attr.aria-selected]': 'tree.isSelected(value())',
    '[attr.aria-expanded]': 'isBranch() ? tree.isExpanded(value()) : null',
    '[attr.aria-disabled]': 'disabled() || null',
    '[attr.tabindex]': 'tree.activeId() === value() ? 0 : -1',
    '[attr.data-state]': 'isBranch() ? (tree.isExpanded(value()) ? "open" : "closed") : null',
    '[attr.data-disabled]': 'dataAttr(disabled())',
  },
})
export class FewTreeItem {
  protected readonly tree = inject(FewTree);
  private readonly levelCtx = inject(FewTreeLevel, { optional: true });
  protected readonly level = this.levelCtx?.level ?? 1;
  readonly value = input.required<string>();
  readonly disabled = input(false, { transform: booleanAttribute });
  private readonly contentRef = contentChild(FewTreeItemContent, { descendants: false });
  /** É um "branch" (nó com filhos) quando projeta um `Tree.ItemContent` direto. */
  readonly isBranch = computed(() => !!this.contentRef());
  readonly open = computed(() => this.isBranch() && this.tree.isExpanded(this.value()));
  protected readonly dataAttr = dataAttr;
}

/** `<div fewTreeItemTrigger>`: clique seleciona e alterna expansão; desenha a seta quando é branch. */
@Component({
  selector: '[fewTreeItemTrigger]',
  host: { class: 'few-tree-item-trigger', '(click)': 'onClick($event)' },
  template: `
    @if (item.isBranch()) {
      <span aria-hidden="true" class="few-tree-item-arrow" [attr.data-state]="item.open() ? 'open' : 'closed'"></span>
    }
    <ng-content></ng-content>
  `,
})
export class FewTreeItemTrigger {
  protected readonly tree = inject(FewTree);
  protected readonly item = inject(FewTreeItem);
  protected onClick(event: MouseEvent) {
    this.tree.select(this.item.value(), event.ctrlKey || event.metaKey);
    this.tree.setActiveId(this.item.value());
    if (this.item.isBranch()) this.tree.setExpanded(this.item.value(), !this.item.open());
  }
}

/**
 * `<div fewTreeItemContent>`: filhos do item. Fica no DOM com `[hidden]` quando fechado (equivale a `forceMount`);
 * fornece `FewTreeLevel` (nível do pai + 1) para os `Tree.Item` filhos.
 */
@Directive({
  selector: '[fewTreeItemContent]',
  providers: [{
    provide: FewTreeLevel,
    // Sem FewTreeLevel acima, o conteúdo pertence a um item de nível 1: filhos ficam no nível 2.
    useFactory: (parent: FewTreeLevel | null) => new FewTreeLevel((parent?.level ?? 1) + 1),
    deps: [[new Optional(), new SkipSelf(), FewTreeLevel]],
  }],
  host: {
    class: 'few-tree-item-content',
    role: 'group',
    '[hidden]': '!item.open()',
  },
})
export class FewTreeItemContent {
  protected readonly item = inject(FewTreeItem);
}

/** Importe tudo de uma vez: `imports: [FEW_TREE]`. */
export const FEW_TREE = [FewTree, FewTreeItem, FewTreeItemTrigger, FewTreeItemContent] as const;
