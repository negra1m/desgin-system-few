// TagsInput (ver docs/composition-angular.md). Fonte da verdade: packages/react/src/components/forms/tags-input.tsx.
import { Component, Directive, booleanAttribute, computed, inject, input, model } from '@angular/core';
import { addTags, splitTags } from '@fewcompany/core';
import { dataAttr } from '../../lib/attrs.js';
import { fewId } from '../../lib/ids.js';

/** Raiz: `<div fewTagsInput [(value)]="tags" [max]="5">…</div>`. Enter/vírgula adiciona; Backspace vazio apaga a última. */
@Directive({
  selector: '[fewTagsInput]',
  exportAs: 'fewTagsInput',
  host: { class: 'few-tags-input', '[attr.data-disabled]': 'dataAttr(disabled())' },
})
export class FewTagsInput {
  readonly baseId = fewId('tags-input');
  readonly value = model<string[]>([]);
  readonly max = input<number>();
  readonly allowDuplicates = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  protected readonly dataAttr = dataAttr;

  addTag(raw: string) {
    const next = addTags(this.value(), splitTags(raw), { max: this.max(), allowDuplicates: this.allowDuplicates() });
    if (next.length !== this.value().length) this.value.set(next);
  }
  removeAt(index: number) { this.value.set(this.value().filter((_, i) => i !== index)); }
  removeLast() { if (this.value().length) this.value.set(this.value().slice(0, -1)); }
}

/** `<label fewTagsInputLabel>Tags</label>`: `for` aponta para o input real. */
@Component({ selector: 'label[fewTagsInputLabel]', host: { class: 'few-form-label', '[attr.for]': 'inputId' }, template: `<ng-content></ng-content>` })
export class FewTagsInputLabel {
  private readonly tags = inject(FewTagsInput);
  protected get inputId() { return `${this.tags.baseId}-input`; }
}

/** `<span fewTagsInputItem [index]="i"></span>`: sem conteúdo projetado, mostra a própria tag. */
@Component({ selector: 'span[fewTagsInputItem]', exportAs: 'fewTagsInputItem', host: { class: 'few-tags-input-item' }, template: `<ng-content>{{ value() }}</ng-content>` })
export class FewTagsInputItem {
  private readonly tags = inject(FewTagsInput);
  readonly index = input.required<number>();
  readonly value = computed(() => this.tags.value()[this.index()]);
}

// Adaptação documentada: aria-label fixo ("Remover <tag>"), sem override via props.
@Component({
  selector: 'button[fewTagsInputItemDelete]',
  host: { class: 'few-tags-input-item-delete', type: 'button', '[attr.aria-label]': 'ariaLabel', '(click)': 'onClick()' },
  template: `<ng-content>&times;</ng-content>`,
})
export class FewTagsInputItemDelete {
  private readonly tags = inject(FewTagsInput);
  private readonly item = inject(FewTagsInputItem);
  protected get ariaLabel() { return `Remover ${this.item.value() ?? ''}`; }
  protected onClick() { this.tags.removeAt(this.item.index()); }
}

@Directive({
  selector: 'input[fewTagsInputInput]',
  host: {
    class: 'few-input few-tags-input-input',
    '[attr.id]': 'id',
    '[disabled]': 'tags.disabled()',
    '(keydown)': 'onKeydown($event)',
  },
})
export class FewTagsInputInput {
  private readonly tags = inject(FewTagsInput);
  protected get id() { return `${this.tags.baseId}-input`; }
  protected onKeydown(event: KeyboardEvent) {
    if (event.defaultPrevented) return;
    const el = event.target as HTMLInputElement;
    if (event.key === 'Enter' || event.key === ',') {
      if (el.value.trim()) { event.preventDefault(); this.tags.addTag(el.value); el.value = ''; }
    } else if (event.key === 'Backspace' && el.value === '') {
      this.tags.removeLast();
    }
  }
}

/** Importe tudo de uma vez: `imports: [FEW_TAGS_INPUT]`. */
export const FEW_TAGS_INPUT = [FewTagsInput, FewTagsInputLabel, FewTagsInputItem, FewTagsInputItemDelete, FewTagsInputInput] as const;
