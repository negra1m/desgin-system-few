"use client";
// Calendar: grade de dias (role=grid) com roving tabindex (Calendar.Day) e navegação completa por teclado.
// Toda a matemática de datas vem do core (calendarGrid, isSameDay, addDays/Months/Years, isInRange,
// isDateDisabled); aqui só ligamos estado a DOM e usamos Intl para nomes de mês/dia (Intl fica no React).
// GridHead/GridBody renderizam sozinhos por padrão (usando o core), mas aceitam children para composição manual.
// Ver docs/composition.md.
import { useCallback, useEffect, useId, useRef, useState, type ComponentProps, type KeyboardEvent, type MutableRefObject } from 'react';
import { addDays, addMonths, addYears, calendarGrid, isDateDisabled, isInRange, isSameDay, startOfMonth, type DateRange } from '@fewcompany/core';
import { Slot } from '../../lib/slot.js';
import { createContext } from '../../lib/context.js';
import { useControllableState } from '../../lib/use-controllable-state.js';
import { cx, dataAttr } from '../../lib/cx.js';

export type CalendarMode = 'single' | 'range' | 'multiple';
export type CalendarValue = Date | Date[] | DateRange;

interface CalendarContextValue {
  baseId: string;
  mode: CalendarMode;
  value: CalendarValue | undefined;
  selectDate: (date: Date) => void;
  month: Date; setMonth: (month: Date) => void;
  focusedDate: Date; setFocusedDate: (date: Date) => void;
  focusRef: MutableRefObject<boolean>;
  min?: Date; max?: Date; disabledDates?: (date: Date) => boolean;
  weekStartsOn: number; locale: string;
}
const [CalendarProvider, useCalendar] = createContext<CalendarContextValue>('Calendar');

const capitalize = (text: string) => text.length ? text.charAt(0).toUpperCase() + text.slice(1) : text;

function isDateSelected(mode: CalendarMode, value: CalendarValue | undefined, date: Date): boolean {
  if (!value) return false;
  if (mode === 'multiple') return Array.isArray(value) && value.some(d => isSameDay(d, date));
  if (mode === 'range') { const range = value as DateRange; return Boolean((range.from && isSameDay(range.from, date)) || (range.to && isSameDay(range.to, date))); }
  return value instanceof Date && isSameDay(value, date);
}

function initialFocusFromValue(mode: CalendarMode, value: CalendarValue | undefined): Date {
  if (mode === 'multiple' && Array.isArray(value) && value[0]) return value[0];
  if (mode === 'range' && value && !Array.isArray(value) && (value as DateRange).from) return (value as DateRange).from as Date;
  if (mode === 'single' && value instanceof Date) return value;
  return new Date();
}

export interface CalendarProps extends Omit<ComponentProps<'div'>, 'defaultValue' | 'onChange'> {
  asChild?: boolean;
  mode?: CalendarMode;
  value?: CalendarValue; defaultValue?: CalendarValue; onValueChange?: (value: CalendarValue) => void;
  min?: Date; max?: Date; disabledDates?: (date: Date) => boolean;
  /** 0 = domingo … 6 = sábado. */
  weekStartsOn?: number;
  /** Locale do Intl para nomes de mês/semana (o headless não usa Intl). */
  locale?: string;
  month?: Date; defaultMonth?: Date; onMonthChange?: (month: Date) => void;
}
function CalendarRoot({ asChild, mode = 'single', value: valueProp, defaultValue, onValueChange, min, max, disabledDates, weekStartsOn = 0, locale = 'pt-BR', month: monthProp, defaultMonth, onMonthChange, className, children, ...props }: CalendarProps) {
  const baseId = useId();
  const defaultForMode: CalendarValue | undefined = mode === 'multiple' ? [] : mode === 'range' ? {} : undefined;
  const [value, setValue] = useControllableState<CalendarValue | undefined>({ value: valueProp, defaultValue: defaultValue ?? defaultForMode, onChange: onValueChange as (value: CalendarValue | undefined) => void });
  const [month, setMonth] = useControllableState<Date>({ value: monthProp, defaultValue: startOfMonth(defaultMonth ?? initialFocusFromValue(mode, value)), onChange: onMonthChange });
  const [focusedDate, setFocusedDate] = useState<Date>(() => initialFocusFromValue(mode, value));
  const focusRef = useRef(false);
  const selectDate = useCallback((date: Date) => {
    if (isDateDisabled(date, { min, max, disabledDates })) return;
    if (mode === 'multiple') {
      const arr = Array.isArray(value) ? value : [];
      setValue(arr.some(d => isSameDay(d, date)) ? arr.filter(d => !isSameDay(d, date)) : [...arr, date]);
    } else if (mode === 'range') {
      const range = (value && !Array.isArray(value)) ? value as DateRange : {};
      if (!range.from || range.to) setValue({ from: date, to: undefined });
      else setValue(date.getTime() < range.from.getTime() ? { from: date, to: range.from } : { from: range.from, to: date });
    } else {
      setValue(date);
    }
  }, [mode, value, setValue, min, max, disabledDates]);
  const Comp = asChild ? Slot : 'div';
  return (
    <CalendarProvider value={{ baseId, mode, value, selectDate, month, setMonth, focusedDate, setFocusedDate, focusRef, min, max, disabledDates, weekStartsOn, locale }}>
      <Comp {...props} role="group" aria-label="Calendário" className={cx('few-calendar', className)}>{children}</Comp>
    </CalendarProvider>
  );
}

export interface CalendarHeaderProps extends ComponentProps<'div'> { asChild?: boolean }
function CalendarHeader({ asChild, className, ...props }: CalendarHeaderProps) {
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} className={cx('few-calendar-header', className)} />;
}

export interface CalendarNavButtonProps extends ComponentProps<'button'> { asChild?: boolean }
function CalendarPrevButton({ asChild, className, onClick, children, 'aria-label': ariaLabel, ...props }: CalendarNavButtonProps) {
  const ctx = useCalendar('Calendar.PrevButton');
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp {...props} type="button" aria-label={ariaLabel ?? 'Mês anterior'} className={cx('few-calendar-nav', className)}
      onClick={(event) => { onClick?.(event); if (event.defaultPrevented) return; ctx.setMonth(addMonths(ctx.month, -1)); }}>
      {children ?? '‹'}
    </Comp>
  );
}
function CalendarNextButton({ asChild, className, onClick, children, 'aria-label': ariaLabel, ...props }: CalendarNavButtonProps) {
  const ctx = useCalendar('Calendar.NextButton');
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp {...props} type="button" aria-label={ariaLabel ?? 'Próximo mês'} className={cx('few-calendar-nav', className)}
      onClick={(event) => { onClick?.(event); if (event.defaultPrevented) return; ctx.setMonth(addMonths(ctx.month, 1)); }}>
      {children ?? '›'}
    </Comp>
  );
}

export interface CalendarHeadingProps extends ComponentProps<'div'> { asChild?: boolean }
function CalendarHeading({ asChild, className, children, ...props }: CalendarHeadingProps) {
  const ctx = useCalendar('Calendar.Heading');
  const Comp = asChild ? Slot : 'div';
  if (asChild || children !== undefined) return <Comp {...props} id={`${ctx.baseId}-heading`} className={cx('few-calendar-heading', className)}>{children}</Comp>;
  const label = capitalize(new Intl.DateTimeFormat(ctx.locale, { month: 'long', year: 'numeric' }).format(ctx.month));
  return <div {...props} id={`${ctx.baseId}-heading`} aria-live="polite" className={cx('few-calendar-heading', className)}>{label}</div>;
}

export interface CalendarGridProps extends ComponentProps<'table'> { asChild?: boolean }
function CalendarGrid({ asChild, className, ...props }: CalendarGridProps) {
  const ctx = useCalendar('Calendar.Grid');
  const Comp = asChild ? Slot : 'table';
  return <Comp {...props} role="grid" aria-labelledby={`${ctx.baseId}-heading`} className={cx('few-calendar-grid', className)} />;
}

export interface CalendarGridHeadProps extends ComponentProps<'thead'> { asChild?: boolean }
function CalendarGridHead({ asChild, className, children, ...props }: CalendarGridHeadProps) {
  const ctx = useCalendar('Calendar.GridHead');
  const Comp = asChild ? Slot : 'thead';
  if (children !== undefined) return <Comp {...props} className={cx('few-calendar-grid-head', className)}>{children}</Comp>;
  const formatter = new Intl.DateTimeFormat(ctx.locale, { weekday: 'short' });
  const referenceSunday = new Date(2024, 0, 7);
  const labels = Array.from({ length: 7 }, (_, i) => capitalize(formatter.format(addDays(referenceSunday, (i + ctx.weekStartsOn) % 7)).replace('.', '')));
  return (
    <Comp {...props} className={cx('few-calendar-grid-head', className)}>
      <CalendarRow>{labels.map((label, i) => <CalendarHeadCell key={`${label}-${i}`}>{label}</CalendarHeadCell>)}</CalendarRow>
    </Comp>
  );
}

export interface CalendarHeadCellProps extends ComponentProps<'th'> { asChild?: boolean }
function CalendarHeadCell({ asChild, className, ...props }: CalendarHeadCellProps) {
  const Comp = asChild ? Slot : 'th';
  return <Comp {...props} scope="col" className={cx('few-calendar-head-cell', className)} />;
}

export interface CalendarGridBodyProps extends ComponentProps<'tbody'> { asChild?: boolean }
function CalendarGridBody({ asChild, className, children, ...props }: CalendarGridBodyProps) {
  const ctx = useCalendar('Calendar.GridBody');
  const Comp = asChild ? Slot : 'tbody';
  if (children !== undefined) return <Comp {...props} className={cx('few-calendar-grid-body', className)}>{children}</Comp>;
  const weeks = calendarGrid(ctx.month.getFullYear(), ctx.month.getMonth(), ctx.weekStartsOn);
  return (
    <Comp {...props} className={cx('few-calendar-grid-body', className)}>
      {weeks.map(week => (
        <CalendarRow key={week[0].toISOString()}>
          {week.map(date => <CalendarCell key={date.toISOString()}><CalendarDay date={date} /></CalendarCell>)}
        </CalendarRow>
      ))}
    </Comp>
  );
}

export interface CalendarRowProps extends ComponentProps<'tr'> { asChild?: boolean }
function CalendarRow({ asChild, className, ...props }: CalendarRowProps) {
  const Comp = asChild ? Slot : 'tr';
  return <Comp {...props} role="row" className={cx('few-calendar-row', className)} />;
}

export interface CalendarCellProps extends ComponentProps<'td'> { asChild?: boolean }
function CalendarCell({ asChild, className, ...props }: CalendarCellProps) {
  const Comp = asChild ? Slot : 'td';
  return <Comp {...props} role="gridcell" className={cx('few-calendar-cell', className)} />;
}

export interface CalendarDayProps extends ComponentProps<'button'> { asChild?: boolean; date: Date }
function CalendarDay({ asChild, date, className, disabled: disabledProp, tabIndex, onClick, onKeyDown, children, ...props }: CalendarDayProps) {
  const ctx = useCalendar('Calendar.Day');
  const today = isSameDay(date, new Date());
  const outsideMonth = date.getMonth() !== ctx.month.getMonth() || date.getFullYear() !== ctx.month.getFullYear();
  const selected = isDateSelected(ctx.mode, ctx.value, date);
  const range = ctx.mode === 'range' && ctx.value && !Array.isArray(ctx.value) ? ctx.value as DateRange : undefined;
  const rangeStart = Boolean(range?.from && isSameDay(date, range.from));
  const rangeEnd = Boolean(range?.to && isSameDay(date, range.to));
  const inRange = Boolean(range && isInRange(date, range));
  const disabled = disabledProp ?? isDateDisabled(date, { min: ctx.min, max: ctx.max, disabledDates: ctx.disabledDates });
  const focused = isSameDay(date, ctx.focusedDate);
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (focused && ctx.focusRef.current) ref.current?.focus(); }, [ctx.focusedDate, focused, ctx.focusRef]);
  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented || disabled) return;
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); ctx.selectDate(date); return; }
    let next: Date | null = null;
    if (event.key === 'ArrowLeft') next = addDays(date, -1);
    else if (event.key === 'ArrowRight') next = addDays(date, 1);
    else if (event.key === 'ArrowUp') next = addDays(date, -7);
    else if (event.key === 'ArrowDown') next = addDays(date, 7);
    else if (event.key === 'Home') next = addDays(date, -((date.getDay() - ctx.weekStartsOn + 7) % 7));
    else if (event.key === 'End') next = addDays(date, 6 - ((date.getDay() - ctx.weekStartsOn + 7) % 7));
    else if (event.key === 'PageUp') next = event.shiftKey ? addYears(date, -1) : addMonths(date, -1);
    else if (event.key === 'PageDown') next = event.shiftKey ? addYears(date, 1) : addMonths(date, 1);
    if (next) {
      event.preventDefault();
      ctx.focusRef.current = true;
      ctx.setFocusedDate(next);
      if (next.getMonth() !== ctx.month.getMonth() || next.getFullYear() !== ctx.month.getFullYear()) ctx.setMonth(startOfMonth(next));
    }
  }
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp {...props} ref={ref} type="button" tabIndex={tabIndex ?? (focused ? 0 : -1)} disabled={disabled} aria-selected={selected}
      aria-current={today ? 'date' : undefined} data-today={dataAttr(today)} data-outside-month={dataAttr(outsideMonth)}
      data-in-range={dataAttr(inRange)} data-range-start={dataAttr(rangeStart)} data-range-end={dataAttr(rangeEnd)} data-disabled={dataAttr(disabled)}
      className={cx('few-calendar-day', className)}
      onClick={(event) => { onClick?.(event); if (event.defaultPrevented || disabled) return; ctx.selectDate(date); ctx.focusRef.current = true; ctx.setFocusedDate(date); }}
      onKeyDown={handleKeyDown}>
      {children ?? date.getDate()}
    </Comp>
  );
}

/** Calendar composto: <Calendar mode="single" value={date} onValueChange={setDate}><Calendar.Header><Calendar.PrevButton/><Calendar.Heading/><Calendar.NextButton/></Calendar.Header><Calendar.Grid><Calendar.GridHead/><Calendar.GridBody/></Calendar.Grid></Calendar> */
export const Calendar = Object.assign(CalendarRoot, {
  Root: CalendarRoot, Header: CalendarHeader, PrevButton: CalendarPrevButton, NextButton: CalendarNextButton, Heading: CalendarHeading,
  Grid: CalendarGrid, GridHead: CalendarGridHead, HeadCell: CalendarHeadCell, GridBody: CalendarGridBody, Row: CalendarRow, Cell: CalendarCell, Day: CalendarDay,
});
export {
  CalendarRoot, CalendarHeader, CalendarPrevButton, CalendarNextButton, CalendarHeading,
  CalendarGrid, CalendarGridHead, CalendarHeadCell, CalendarGridBody, CalendarRow, CalendarCell, CalendarDay,
};
