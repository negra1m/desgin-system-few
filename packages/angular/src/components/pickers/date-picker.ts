// DatePicker: Input com digitação dd/mm/aaaa (parse/format puros do core) + Content posicionado; o
// consumidor coloca um `<div fewCalendar>` dentro do Content, ligado ao mesmo `value` (ver demo). O
// DatePicker não importa Calendar. Fonte da verdade: packages/react/src/components/pickers/date-picker.tsx.
// Ver docs/composition-angular.md.
import {
  Component, Directive, ElementRef, booleanAttribute, computed, effect, inject, input, model, signal,
} from '@angular/core';
import { formatDate, isDateDisabled, parseDate, type DateRange, type FloatingAlign, type FloatingSide } from '@fewcompany/core';
import { fewId } from '../../lib/ids.js';
import { setupDismiss } from '../../lib/dismiss.js';
import { setupPosition } from '../../lib/position.js';
import { setupTopLayer } from '../../lib/top-layer.js';
import { dataAttr, dataState } from '../../lib/attrs.js';

export type DatePickerMode = 'single' | 'range';
export type DatePickerValue = Date | DateRange | undefined;

function formatValue(mode: DatePickerMode, value: DatePickerValue): string {
  if (!value) return '';
  if (mode === 'range') {
    const range = value as DateRange;
    if (!range.from) return '';
    return range.to ? `${formatDate(range.from)} – ${formatDate(range.to)}` : formatDate(range.from);
  }
  return value instanceof Date ? formatDate(value) : '';
}

/** Raiz: `<div fewDatePicker mode="single" [(value)]="data">`. O próprio host serve de âncora de posição (fieldRef). */
@Directive({ selector: '[fewDatePicker]', exportAs: 'fewDatePicker', host: { class: 'few-date-picker', '[attr.data-disabled]': 'dataAttr(disabled())' } })
export class FewDatePicker {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly mode = input<DatePickerMode>('single');
  readonly value = model<DatePickerValue>(undefined);
  readonly open = model(false);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly min = input<Date>();
  readonly max = input<Date>();
  readonly baseId = fewId('date-picker');
  protected readonly dataAttr = dataAttr;

  private readonly inputTextState = signal('');
  readonly inputText = this.inputTextState.asReadonly();
  private readonly inputElementState = signal<HTMLInputElement | null>(null);

  constructor() {
    // Mantém o texto do Input sincronizado com o value (equivalente ao useEffect(() => setInputText(formatValue(...)), [mode, value]) do React).
    effect(() => { this.inputTextState.set(formatValue(this.mode(), this.value())); });
  }

  get fieldElement(): HTMLElement { return this.el.nativeElement; }
  get contentId(): string { return `${this.baseId}-content`; }
  get inputId(): string { return `${this.baseId}-input`; }
  setOpen(open: boolean): void { this.open.set(open); }
  setValue(value: DatePickerValue): void { this.value.set(value); }
  setInputText(text: string): void { this.inputTextState.set(text); }
  setInputElement(element: HTMLInputElement): void { this.inputElementState.set(element); }
  focusInput(): void { this.inputElementState()?.focus(); }
}

/** Sem conteúdo projetado, mostra "📅". */
@Component({
  selector: '[fewDatePickerTrigger]',
  host: {
    class: 'few-date-picker-trigger', type: 'button',
    '[attr.aria-haspopup]': "'dialog'", '[attr.aria-expanded]': 'datePicker.open()', '[attr.aria-controls]': 'datePicker.contentId',
    '[attr.disabled]': 'datePicker.disabled() ? "" : null', '[attr.data-state]': 'dataState(datePicker.open())',
    '(click)': 'onClick()',
  },
  template: `<ng-content />@if (noContent()) {<span>📅</span>}`,
})
export class FewDatePickerTrigger {
  protected readonly datePicker = inject(FewDatePicker);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly dataState = dataState;
  protected readonly noContent = signal(false);
  ngAfterContentInit(): void { this.noContent.set(!this.el.nativeElement.textContent?.trim()); }
  protected onClick(): void { if (!this.datePicker.disabled()) this.datePicker.setOpen(!this.datePicker.open()); }
}

@Directive({
  selector: 'input[fewDatePickerInput]',
  host: {
    class: 'few-date-picker-input', type: 'text', inputmode: 'numeric', role: 'combobox', autocomplete: 'off',
    '[id]': 'datePicker.inputId', '[attr.aria-haspopup]': "'dialog'", '[attr.aria-expanded]': 'datePicker.open()',
    '[attr.aria-controls]': 'datePicker.contentId', '[attr.aria-invalid]': 'invalid() || null',
    '[attr.disabled]': 'isDisabled() ? "" : null', '[value]': 'datePicker.inputText()', '[attr.data-invalid]': 'dataAttr(invalid())',
    '(focus)': 'onFocus()', '(blur)': 'onBlur()', '(input)': 'onInput($event)', '(keydown)': 'onKeydown($event)',
  },
})
export class FewDatePickerInput {
  protected readonly datePicker = inject(FewDatePicker);
  private readonly el = inject<ElementRef<HTMLInputElement>>(ElementRef);
  /** Sobrepõe o `disabled` do Root quando definido. */
  readonly disabled = input<boolean>();
  protected readonly dataAttr = dataAttr;
  private readonly touched = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() ?? this.datePicker.disabled());
  protected readonly invalid = computed(() =>
    this.datePicker.mode() === 'single' && this.touched() && this.datePicker.inputText().trim().length > 0 && parseDate(this.datePicker.inputText()) === null);

  constructor() { this.datePicker.setInputElement(this.el.nativeElement); }
  protected onFocus(): void { if (!this.isDisabled()) this.datePicker.setOpen(true); }
  protected onBlur(): void { this.touched.set(true); }
  protected onInput(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    this.datePicker.setInputText(text);
    if (this.datePicker.mode() !== 'single') return;
    const parsed = parseDate(text);
    if (parsed && !isDateDisabled(parsed, { min: this.datePicker.min(), max: this.datePicker.max() })) this.datePicker.setValue(parsed);
  }
  protected onKeydown(event: KeyboardEvent): void {
    if (event.defaultPrevented) return;
    if (event.key === 'Enter') {
      this.touched.set(true);
      if (this.datePicker.mode() === 'single' && parseDate(this.datePicker.inputText())) this.datePicker.setOpen(false);
    }
  }
}

@Directive({
  selector: '[fewDatePickerContent]',
  host: {
    class: 'few-date-picker-content', role: 'dialog', popover: 'manual', 'aria-label': 'Escolher data',
    '[id]': 'datePicker.contentId', '[attr.data-state]': 'dataState(datePicker.open())', '[attr.data-side]': 'position().side',
    '[style.position]': "'fixed'", '[style.top.px]': 'position().top', '[style.left.px]': 'position().left',
  },
})
export class FewDatePickerContent {
  protected readonly datePicker = inject(FewDatePicker);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly side = input<FloatingSide>('bottom');
  readonly align = input<FloatingAlign>('start');
  protected readonly dataState = dataState;
  protected readonly position = setupPosition(
    this.datePicker.open, () => this.datePicker.fieldElement, () => this.el.nativeElement,
    () => ({ side: this.side(), align: this.align() }),
  );
  constructor() {
    setupTopLayer(this.datePicker.open, () => this.el.nativeElement);
    setupDismiss(this.datePicker.open, () => this.datePicker.setOpen(false), () => [this.datePicker.fieldElement, this.el.nativeElement]);
    effect(() => {
      if (!this.datePicker.open() || typeof document === 'undefined') return;
      queueMicrotask(() => { this.el.nativeElement.querySelector<HTMLElement>('button[tabindex="0"]')?.focus(); });
    });
  }
}

/** Fica oculto quando não há valor definido. Sem conteúdo projetado, mostra "×". */
@Component({
  selector: '[fewDatePickerClear]',
  host: { class: 'few-date-picker-clear', type: 'button', 'aria-label': 'Limpar data', '[hidden]': '!hasValue()', '(click)': 'onClick()' },
  template: `<ng-content />@if (noContent()) {<span>×</span>}`,
})
export class FewDatePickerClear {
  private readonly datePicker = inject(FewDatePicker);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly noContent = signal(false);
  protected readonly hasValue = computed(() => {
    const mode = this.datePicker.mode();
    const value = this.datePicker.value();
    return mode === 'single' ? value instanceof Date : Boolean((value as DateRange | undefined)?.from);
  });
  ngAfterContentInit(): void { this.noContent.set(!this.el.nativeElement.textContent?.trim()); }
  protected onClick(): void { this.datePicker.setValue(undefined); this.datePicker.setInputText(''); this.datePicker.focusInput(); }
}

/** Importe tudo de uma vez: `imports: [FEW_DATE_PICKER]`. */
export const FEW_DATE_PICKER = [FewDatePicker, FewDatePickerTrigger, FewDatePickerInput, FewDatePickerContent, FewDatePickerClear] as const;
