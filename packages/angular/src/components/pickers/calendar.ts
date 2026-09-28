// Calendar: grade de dias (role=grid) com roving tabindex (Calendar.Day) e navegação completa por teclado.
// Toda a matemática de datas vem do core (calendarGrid, isSameDay, addDays/Months/Years, isInRange,
// isDateDisabled); aqui só ligamos estado a DOM e usamos Intl para nomes de mês/dia (Intl fica no Angular,
// como no React). GridHead/GridBody renderizam sozinhos por padrão (usando o core), mas aceitam conteúdo
// projetado para composição manual. Fonte da verdade: packages/react/src/components/pickers/calendar.tsx.
// Ver docs/composition-angular.md.
import {
  Component, Directive, ElementRef, computed, effect, inject, input, model, signal,
} from '@angular/core';
import {
  addDays, addMonths, addYears, calendarGrid, isDateDisabled, isInRange, isSameDay, startOfMonth, type DateRange,
} from '@fewcompany/core';
import { fewId } from '../../lib/ids.js';
import { dataAttr } from '../../lib/attrs.js';

export type CalendarMode = 'single' | 'range' | 'multiple';
export type CalendarValue = Date | Date[] | DateRange;

function isDateSelected(mode: CalendarMode, value: CalendarValue | undefined, date: Date): boolean {
  if (!value) return false;
  if (mode === 'multiple') return Array.isArray(value) && value.some(d => isSameDay(d, date));
  if (mode === 'range') { const range = value as DateRange; return Boolean((range.from && isSameDay(range.from, date)) || (range.to && isSameDay(range.to, date))); }
  return value instanceof Date && isSameDay(value, date);
}

/** Data inicial de foco/mês, calculada uma única vez (equivalente ao `useState(initializer)` do React). */
function initialFocusFromValue(mode: CalendarMode, value: CalendarValue | undefined): Date {
  if (mode === 'multiple' && Array.isArray(value) && value[0]) return value[0];
  if (mode === 'range' && value && !Array.isArray(value) && (value as DateRange).from) return (value as DateRange).from as Date;
  if (mode === 'single' && value instanceof Date) return value;
  return new Date();
}

/** Raiz: `<div fewCalendar mode="single" [(value)]="data">`. */
@Directive({ selector: '[fewCalendar]', exportAs: 'fewCalendar', host: { class: 'few-calendar', role: 'group', 'aria-label': 'Calendário' } })
export class FewCalendar {
  readonly mode = input<CalendarMode>('single');
  readonly value = model<CalendarValue | undefined>(undefined);
  readonly min = input<Date>();
  readonly max = input<Date>();
  readonly disabledDates = input<(date: Date) => boolean>();
  /** 0 = domingo … 6 = sábado. */
  readonly weekStartsOn = input(0);
  /** Locale do Intl para nomes de mês/semana. */
  readonly locale = input('pt-BR');
  readonly month = model<Date>(startOfMonth(new Date()));
  readonly baseId = fewId('calendar');
  readonly focusedDate = signal<Date>(new Date());
  /** Equivalente ao `useRef(false)` do React: evita autofoco na primeira renderização. */
  focusOnRender = false;
  private initialized = false;

  constructor() {
    // Calcula o foco/mês inicial uma única vez, a partir dos valores já vinculados (equivalente ao
    // useState(() => initialFocusFromValue(mode, value)) do React, que também só roda na montagem).
    effect(() => {
      if (this.initialized) return;
      this.initialized = true;
      const initial = initialFocusFromValue(this.mode(), this.value());
      this.focusedDate.set(initial);
      this.month.set(startOfMonth(initial));
    });
  }

  selectDate(date: Date): void {
    if (isDateDisabled(date, { min: this.min(), max: this.max(), disabledDates: this.disabledDates() })) return;
    const mode = this.mode();
    const current = this.value();
    if (mode === 'multiple') {
      const arr = Array.isArray(current) ? current : [];
      this.value.set(arr.some(d => isSameDay(d, date)) ? arr.filter(d => !isSameDay(d, date)) : [...arr, date]);
    } else if (mode === 'range') {
      const range = current && !Array.isArray(current) ? current as DateRange : {};
      if (!range.from || range.to) this.value.set({ from: date, to: undefined });
      else this.value.set(date.getTime() < range.from.getTime() ? { from: date, to: range.from } : { from: range.from, to: date });
    } else {
      this.value.set(date);
    }
  }
  setMonth(month: Date): void { this.month.set(month); }
  setFocusedDate(date: Date): void { this.focusedDate.set(date); }
}

@Directive({ selector: '[fewCalendarHeader]', host: { class: 'few-calendar-header' } })
export class FewCalendarHeader {}

/** Sem conteúdo projetado, mostra "‹". */
@Component({
  selector: '[fewCalendarPrevButton]',
  host: { class: 'few-calendar-nav', type: 'button', '[attr.aria-label]': 'ariaLabel()', '(click)': 'onClick()' },
  template: `<ng-content />@if (noContent()) {<span>‹</span>}`,
})
export class FewCalendarPrevButton {
  private readonly calendar = inject(FewCalendar);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly ariaLabel = input('Mês anterior', { alias: 'aria-label' });
  protected readonly noContent = signal(false);
  ngAfterContentInit(): void { this.noContent.set(!this.el.nativeElement.textContent?.trim()); }
  protected onClick(): void { this.calendar.setMonth(addMonths(this.calendar.month(), -1)); }
}

/** Sem conteúdo projetado, mostra "›". */
@Component({
  selector: '[fewCalendarNextButton]',
  host: { class: 'few-calendar-nav', type: 'button', '[attr.aria-label]': 'ariaLabel()', '(click)': 'onClick()' },
  template: `<ng-content />@if (noContent()) {<span>›</span>}`,
})
export class FewCalendarNextButton {
  private readonly calendar = inject(FewCalendar);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly ariaLabel = input('Próximo mês', { alias: 'aria-label' });
  protected readonly noContent = signal(false);
  ngAfterContentInit(): void { this.noContent.set(!this.el.nativeElement.textContent?.trim()); }
  protected onClick(): void { this.calendar.setMonth(addMonths(this.calendar.month(), 1)); }
}

/** Sem conteúdo projetado, mostra "Mês de Ano" (Intl, capitalizado) com aria-live="polite". */
@Component({
  selector: '[fewCalendarHeading]',
  host: { class: 'few-calendar-heading', '[id]': 'id', '[attr.aria-live]': "noContent() ? 'polite' : null" },
  template: `<ng-content />@if (noContent()) {<span>{{ label() }}</span>}`,
})
export class FewCalendarHeading {
  private readonly calendar = inject(FewCalendar);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly noContent = signal(false);
  protected get id(): string { return `${this.calendar.baseId}-heading`; }
  protected readonly label = computed(() => {
    const text = new Intl.DateTimeFormat(this.calendar.locale(), { month: 'long', year: 'numeric' }).format(this.calendar.month());
    return text.length ? text.charAt(0).toUpperCase() + text.slice(1) : text;
  });
  ngAfterContentInit(): void { this.noContent.set(!this.el.nativeElement.textContent?.trim()); }
}

@Directive({ selector: '[fewCalendarGrid]', host: { class: 'few-calendar-grid', role: 'grid', '[attr.aria-labelledby]': 'headingId' } })
export class FewCalendarGrid {
  private readonly calendar = inject(FewCalendar);
  protected get headingId(): string { return `${this.calendar.baseId}-heading`; }
}

@Directive({ selector: '[fewCalendarRow]', host: { class: 'few-calendar-row', role: 'row' } })
export class FewCalendarRow {}

@Directive({ selector: '[fewCalendarHeadCell]', host: { class: 'few-calendar-head-cell', scope: 'col' } })
export class FewCalendarHeadCell {}

@Directive({ selector: '[fewCalendarCell]', host: { class: 'few-calendar-cell', role: 'gridcell' } })
export class FewCalendarCell {}

@Directive({
  selector: '[fewCalendarDay]',
  host: {
    class: 'few-calendar-day', type: 'button',
    '[attr.tabindex]': 'tabIndexValue()', '[attr.disabled]': 'disabled() ? "" : null',
    '[attr.aria-selected]': 'selected()', '[attr.aria-current]': "today() ? 'date' : null",
    '[attr.data-today]': 'dataAttr(today())', '[attr.data-outside-month]': 'dataAttr(outsideMonth())',
    '[attr.data-in-range]': 'dataAttr(inRange())', '[attr.data-range-start]': 'dataAttr(rangeStart())', '[attr.data-range-end]': 'dataAttr(rangeEnd())',
    '[attr.data-disabled]': 'dataAttr(disabled())',
    '(click)': 'onClick()', '(keydown)': 'onKeydown($event)',
  },
})
export class FewCalendarDay {
  private readonly calendar = inject(FewCalendar);
  private readonly el = inject<ElementRef<HTMLButtonElement>>(ElementRef);
  readonly date = input.required<Date>();
  protected readonly dataAttr = dataAttr;
  protected readonly today = computed(() => isSameDay(this.date(), new Date()));
  protected readonly outsideMonth = computed(() => {
    const d = this.date(), m = this.calendar.month();
    return d.getMonth() !== m.getMonth() || d.getFullYear() !== m.getFullYear();
  });
  protected readonly selected = computed(() => isDateSelected(this.calendar.mode(), this.calendar.value(), this.date()));
  private readonly range = computed<DateRange | undefined>(() => {
    const v = this.calendar.value();
    return this.calendar.mode() === 'range' && v && !Array.isArray(v) ? v as DateRange : undefined;
  });
  protected readonly rangeStart = computed(() => { const r = this.range(); return Boolean(r?.from && isSameDay(this.date(), r.from)); });
  protected readonly rangeEnd = computed(() => { const r = this.range(); return Boolean(r?.to && isSameDay(this.date(), r.to)); });
  protected readonly inRange = computed(() => { const r = this.range(); return Boolean(r && isInRange(this.date(), r)); });
  protected readonly disabled = computed(() => isDateDisabled(this.date(), { min: this.calendar.min(), max: this.calendar.max(), disabledDates: this.calendar.disabledDates() }));
  protected readonly focused = computed(() => isSameDay(this.date(), this.calendar.focusedDate()));
  protected readonly tabIndexValue = computed(() => this.focused() ? 0 : -1);

  constructor() {
    effect(() => {
      if (this.focused() && this.calendar.focusOnRender && typeof document !== 'undefined') this.el.nativeElement.focus();
    });
  }

  protected onClick(): void {
    if (this.disabled()) return;
    this.calendar.selectDate(this.date());
    this.calendar.focusOnRender = true;
    this.calendar.setFocusedDate(this.date());
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.defaultPrevented || this.disabled()) return;
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); this.calendar.selectDate(this.date()); return; }
    const date = this.date();
    let next: Date | null = null;
    if (event.key === 'ArrowLeft') next = addDays(date, -1);
    else if (event.key === 'ArrowRight') next = addDays(date, 1);
    else if (event.key === 'ArrowUp') next = addDays(date, -7);
    else if (event.key === 'ArrowDown') next = addDays(date, 7);
    else if (event.key === 'Home') next = addDays(date, -((date.getDay() - this.calendar.weekStartsOn() + 7) % 7));
    else if (event.key === 'End') next = addDays(date, 6 - ((date.getDay() - this.calendar.weekStartsOn() + 7) % 7));
    else if (event.key === 'PageUp') next = event.shiftKey ? addYears(date, -1) : addMonths(date, -1);
    else if (event.key === 'PageDown') next = event.shiftKey ? addYears(date, 1) : addMonths(date, 1);
    if (next) {
      event.preventDefault();
      this.calendar.focusOnRender = true;
      this.calendar.setFocusedDate(next);
      const m = this.calendar.month();
      if (next.getMonth() !== m.getMonth() || next.getFullYear() !== m.getFullYear()) this.calendar.setMonth(startOfMonth(next));
    }
  }
}

/** Sem conteúdo projetado, renderiza a linha de nomes dos dias da semana (Intl, a partir de `weekStartsOn`). */
@Component({
  selector: '[fewCalendarGridHead]',
  imports: [FewCalendarRow, FewCalendarHeadCell],
  host: { class: 'few-calendar-grid-head' },
  template: `
    <ng-content />
    @if (noContent()) {
      <tr fewCalendarRow>
        @for (label of labels(); track $index) {
          <th fewCalendarHeadCell>{{ label }}</th>
        }
      </tr>
    }
  `,
})
export class FewCalendarGridHead {
  private readonly calendar = inject(FewCalendar);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly noContent = signal(false);
  protected readonly labels = computed(() => {
    const formatter = new Intl.DateTimeFormat(this.calendar.locale(), { weekday: 'short' });
    const referenceSunday = new Date(2024, 0, 7);
    return Array.from({ length: 7 }, (_, i) => {
      const text = formatter.format(addDays(referenceSunday, (i + this.calendar.weekStartsOn()) % 7)).replace('.', '');
      return text.length ? text.charAt(0).toUpperCase() + text.slice(1) : text;
    });
  });
  ngAfterContentInit(): void { this.noContent.set(!this.el.nativeElement.textContent?.trim()); }
}

/** Sem conteúdo projetado, renderiza as semanas do mês corrente (core `calendarGrid`) com Calendar.Day. */
@Component({
  selector: '[fewCalendarGridBody]',
  imports: [FewCalendarRow, FewCalendarCell, FewCalendarDay],
  host: { class: 'few-calendar-grid-body' },
  template: `
    <ng-content />
    @if (noContent()) {
      @for (week of weeks(); track week[0].getTime()) {
        <tr fewCalendarRow>
          @for (date of week; track date.getTime()) {
            <td fewCalendarCell><button fewCalendarDay [date]="date"></button></td>
          }
        </tr>
      }
    }
  `,
})
export class FewCalendarGridBody {
  private readonly calendar = inject(FewCalendar);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly noContent = signal(false);
  protected readonly weeks = computed(() => calendarGrid(this.calendar.month().getFullYear(), this.calendar.month().getMonth(), this.calendar.weekStartsOn()));
  ngAfterContentInit(): void { this.noContent.set(!this.el.nativeElement.textContent?.trim()); }
}

/** Importe tudo de uma vez: `imports: [FEW_CALENDAR]`. */
export const FEW_CALENDAR = [
  FewCalendar, FewCalendarHeader, FewCalendarPrevButton, FewCalendarNextButton, FewCalendarHeading,
  FewCalendarGrid, FewCalendarGridHead, FewCalendarHeadCell, FewCalendarGridBody, FewCalendarRow, FewCalendarCell, FewCalendarDay,
] as const;
