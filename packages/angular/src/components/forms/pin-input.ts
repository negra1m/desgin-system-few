// PinInput (ver docs/composition-angular.md). Fonte da verdade: packages/react/src/components/forms/pin-input.tsx.
// Os slots (`fewPinInputInput`) são descobertos via `contentChildren` (equivalente ao array de refs do React)
// para permitir focar o slot correto após digitar/colar/apagar.
import { Directive, ElementRef, booleanAttribute, computed, contentChildren, inject, input, model, output } from '@angular/core';
import { distributePin, nextPinIndex } from '@fewcompany/core';
import { dataAttr } from '../../lib/attrs.js';

/** Raiz: `<div fewPinInput [length]="4" (complete)="onComplete($event)">…</div>`. */
@Directive({
  selector: '[fewPinInput]',
  exportAs: 'fewPinInput',
  host: { class: 'few-pin-input', role: 'group', '[attr.data-disabled]': 'dataAttr(disabled())' },
})
export class FewPinInput {
  readonly value = model('');
  readonly length = input(4);
  readonly mask = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly complete = output<string>();
  private readonly items = contentChildren(FewPinInputInput, { descendants: false });
  protected readonly dataAttr = dataAttr;

  private commit(next: string) {
    this.value.set(next);
    if (next.length === this.length() && !next.includes('')) this.complete.emit(next);
  }
  setChar(index: number, char: string) {
    const chars = this.value().split('');
    while (chars.length < this.length()) chars.push('');
    chars[index] = char;
    this.commit(chars.slice(0, this.length()).join(''));
    if (char && index + 1 < this.length()) this.focusItem(index + 1);
  }
  setMany(index: number, text: string) {
    const digits = text.replace(/\s/g, '');
    const chars = distributePin(this.value().split(''), digits, index, this.length());
    this.commit(chars.join(''));
    this.focusItem(nextPinIndex(index, digits.length, this.length()));
  }
  focusItem(index: number) { this.items()[index]?.focus(); }
}

/** `<input fewPinInputInput [index]="0">`. */
@Directive({
  selector: 'input[fewPinInputInput]',
  host: {
    class: 'few-input few-pin-input-field',
    inputmode: 'numeric', maxlength: '1',
    '[attr.type]': "pinInput.mask() ? 'password' : 'text'",
    '[attr.autocomplete]': "index() === 0 ? 'one-time-code' : 'off'",
    '[disabled]': 'pinInput.disabled()',
    '[value]': 'char()',
    '[attr.aria-label]': 'ariaLabel',
    '(input)': 'onInput($event)',
    '(keydown)': 'onKeydown($event)',
    '(paste)': 'onPaste($event)',
  },
})
export class FewPinInputInput {
  protected readonly pinInput = inject(FewPinInput);
  private readonly hostEl = inject<ElementRef<HTMLInputElement>>(ElementRef);
  readonly index = input.required<number>();
  protected readonly char = computed(() => this.pinInput.value()[this.index()] ?? '');
  protected get ariaLabel() { return `Dígito ${this.index() + 1} de ${this.pinInput.length()}`; }

  focus() { this.hostEl.nativeElement.focus(); }

  protected onInput(event: Event) {
    const raw = (event.target as HTMLInputElement).value;
    const last = raw.slice(-1);
    this.pinInput.setChar(this.index(), /[a-zA-Z0-9]/.test(last) ? last : '');
  }
  protected onKeydown(event: KeyboardEvent) {
    if (event.defaultPrevented) return;
    const i = this.index();
    if (event.key === 'Backspace' && !this.char() && i > 0) { event.preventDefault(); this.pinInput.setChar(i - 1, ''); this.pinInput.focusItem(i - 1); }
    else if (event.key === 'ArrowLeft' && i > 0) { event.preventDefault(); this.pinInput.focusItem(i - 1); }
    else if (event.key === 'ArrowRight' && i + 1 < this.pinInput.length()) { event.preventDefault(); this.pinInput.focusItem(i + 1); }
  }
  protected onPaste(event: ClipboardEvent) {
    event.preventDefault();
    this.pinInput.setMany(this.index(), event.clipboardData?.getData('text') ?? '');
  }
}

/** Importe tudo de uma vez: `imports: [FEW_PIN_INPUT]`. */
export const FEW_PIN_INPUT = [FewPinInput, FewPinInputInput] as const;
