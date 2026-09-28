// Calendar: grade de dias (role=grid) com roving tabindex (Calendar.Day) e navegação completa por teclado.
// Toda a matemática de datas vem do core (calendarGrid, isSameDay, addDays/Months/Years, isInRange,
// isDateDisabled); aqui só ligamos estado a DOM e usamos Intl para nomes de mês/dia (Intl fica no Vue).
// GridHead/GridBody renderizam sozinhos por padrão (usando o core), mas aceitam slot default para composição manual.
// Fonte da verdade: packages/react/src/components/pickers/calendar.tsx.
import { computed, defineComponent, h, mergeProps, ref, watch, type PropType, type Slots, type VNodeArrayChildren } from 'vue';
import { addDays, addMonths, addYears, calendarGrid, isDateDisabled, isInRange, isSameDay, startOfMonth, type DateRange } from '@fewcompany/core';
import { createContext } from '../../lib/context.js';
import { useControllable } from '../../lib/use-controllable.js';
import { useId } from '../../lib/ids.js';
import { renderPrimitive, dataAttr } from '../../lib/primitive.js';

function withDefault(slots: Slots, fallback: () => VNodeArrayChildren): Slots {
  return { default: () => { const kids = slots.default?.() ?? []; return kids.length ? kids : fallback(); } } as unknown as Slots;
}

export type CalendarMode = 'single' | 'range' | 'multiple';
export type CalendarValue = Date | Date[] | DateRange;

interface CalendarContext {
  baseId: string;
  mode: () => CalendarMode;
  value: () => CalendarValue | undefined;
  selectDate: (date: Date) => void;
  month: () => Date; setMonth: (month: Date) => void;
  focusedDate: () => Date; setFocusedDate: (date: Date) => void;
  focusRef: import('vue').Ref<boolean>;
  min: () => Date | undefined; max: () => Date | undefined; disabledDates: () => ((date: Date) => boolean) | undefined;
  weekStartsOn: () => number; locale: () => string;
}
const [provideCalendar, useCalendar] = createContext<CalendarContext>('FewCalendar');

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

/** Raiz: `<FewCalendar mode="single" v-model:value="date">`. `weekStartsOn`: 0 = domingo … 6 = sábado. */
export const FewCalendar = defineComponent({
  name: 'FewCalendar',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    mode: { type: String as PropType<CalendarMode>, default: 'single' },
    value: { type: [Date, Array, Object] as unknown as PropType<CalendarValue>, default: undefined },
    defaultValue: { type: [Date, Array, Object] as unknown as PropType<CalendarValue>, default: undefined },
    min: { type: Date, default: undefined },
    max: { type: Date, default: undefined },
    disabledDates: { type: Function as PropType<(date: Date) => boolean>, default: undefined },
    weekStartsOn: { type: Number, default: 0 },
    /** Locale do Intl para nomes de mês/semana (o headless não usa Intl). */
    locale: { type: String, default: 'pt-BR' },
    month: { type: Date, default: undefined },
    defaultMonth: { type: Date, default: undefined },
  },
  emits: { 'update:value': (value: CalendarValue) => Boolean(value) || value === undefined, 'update:month': (month: Date) => month instanceof Date },
  setup(props, { slots, attrs, emit }) {
    const baseId = useId('calendar');
    const initialDefault: CalendarValue | undefined = props.defaultValue ?? (props.mode === 'multiple' ? [] : props.mode === 'range' ? {} : undefined);
    const [value, setValue] = useControllable<CalendarValue | undefined>(() => props.value, initialDefault, v => emit('update:value', v as CalendarValue));
    const initialMonth = startOfMonth(props.defaultMonth ?? initialFocusFromValue(props.mode, value.value));
    const [month, setMonth] = useControllable<Date>(() => props.month, initialMonth, m => emit('update:month', m));
    const focusedDate = ref<Date>(initialFocusFromValue(props.mode, value.value));
    const focusRef = ref(false);
    function selectDate(date: Date) {
      if (isDateDisabled(date, { min: props.min, max: props.max, disabledDates: props.disabledDates })) return;
      if (props.mode === 'multiple') {
        const arr = Array.isArray(value.value) ? value.value as Date[] : [];
        setValue(arr.some(d => isSameDay(d, date)) ? arr.filter(d => !isSameDay(d, date)) : [...arr, date]);
      } else if (props.mode === 'range') {
        const range = (value.value && !Array.isArray(value.value)) ? value.value as DateRange : {};
        if (!range.from || range.to) setValue({ from: date, to: undefined });
        else setValue(date.getTime() < range.from.getTime() ? { from: date, to: range.from } : { from: range.from, to: date });
      } else {
        setValue(date);
      }
    }
    provideCalendar({
      baseId, mode: () => props.mode, value: () => value.value, selectDate, month: () => month.value, setMonth,
      focusedDate: () => focusedDate.value, setFocusedDate: (d: Date) => { focusedDate.value = d; }, focusRef,
      min: () => props.min, max: () => props.max, disabledDates: () => props.disabledDates,
      weekStartsOn: () => props.weekStartsOn, locale: () => props.locale,
    });
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { role: 'group', 'aria-label': 'Calendário', class: 'few-calendar' }), slots);
  },
});

export const FewCalendarHeader = defineComponent({
  name: 'FewCalendarHeader',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) { return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { class: 'few-calendar-header' }), slots); },
});

export const FewCalendarPrevButton = defineComponent({
  name: 'FewCalendarPrevButton',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const ctx = useCalendar('FewCalendarPrevButton');
    return () => renderPrimitive('button', props.asChild, mergeProps(attrs, {
      type: 'button', 'aria-label': (attrs['aria-label'] as string | undefined) ?? 'Mês anterior', class: 'few-calendar-nav',
      onClick: () => ctx.setMonth(addMonths(ctx.month(), -1)),
    }), withDefault(slots, () => ['‹']));
  },
});

export const FewCalendarNextButton = defineComponent({
  name: 'FewCalendarNextButton',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const ctx = useCalendar('FewCalendarNextButton');
    return () => renderPrimitive('button', props.asChild, mergeProps(attrs, {
      type: 'button', 'aria-label': (attrs['aria-label'] as string | undefined) ?? 'Próximo mês', class: 'few-calendar-nav',
      onClick: () => ctx.setMonth(addMonths(ctx.month(), 1)),
    }), withDefault(slots, () => ['›']));
  },
});

export const FewCalendarHeading = defineComponent({
  name: 'FewCalendarHeading',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const ctx = useCalendar('FewCalendarHeading');
    return () => {
      if (props.asChild || slots.default) return renderPrimitive('div', props.asChild, mergeProps(attrs, { id: `${ctx.baseId}-heading`, class: 'few-calendar-heading' }), slots);
      const label = capitalize(new Intl.DateTimeFormat(ctx.locale(), { month: 'long', year: 'numeric' }).format(ctx.month()));
      return h('div', mergeProps(attrs, { id: `${ctx.baseId}-heading`, 'aria-live': 'polite', class: 'few-calendar-heading' }), label);
    };
  },
});

export const FewCalendarGrid = defineComponent({
  name: 'FewCalendarGrid',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const ctx = useCalendar('FewCalendarGrid');
    return () => renderPrimitive('table', props.asChild, mergeProps(attrs, { role: 'grid', 'aria-labelledby': `${ctx.baseId}-heading`, class: 'few-calendar-grid' }), slots);
  },
});

export const FewCalendarRow = defineComponent({
  name: 'FewCalendarRow',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) { return () => renderPrimitive('tr', props.asChild, mergeProps(attrs, { role: 'row', class: 'few-calendar-row' }), slots); },
});

export const FewCalendarHeadCell = defineComponent({
  name: 'FewCalendarHeadCell',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) { return () => renderPrimitive('th', props.asChild, mergeProps(attrs, { scope: 'col', class: 'few-calendar-head-cell' }), slots); },
});

export const FewCalendarCell = defineComponent({
  name: 'FewCalendarCell',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) { return () => renderPrimitive('td', props.asChild, mergeProps(attrs, { role: 'gridcell', class: 'few-calendar-cell' }), slots); },
});

export const FewCalendarDay = defineComponent({
  name: 'FewCalendarDay',
  inheritAttrs: false,
  props: { asChild: Boolean, date: { type: Date, required: true }, disabled: { type: Boolean, default: undefined } },
  setup(props, { slots, attrs }) {
    const ctx = useCalendar('FewCalendarDay');
    const host = ref<HTMLButtonElement | null>(null);
    const today = computed(() => isSameDay(props.date, new Date()));
    const outsideMonth = computed(() => props.date.getMonth() !== ctx.month().getMonth() || props.date.getFullYear() !== ctx.month().getFullYear());
    const selected = computed(() => isDateSelected(ctx.mode(), ctx.value(), props.date));
    const range = computed(() => ctx.mode() === 'range' && ctx.value() && !Array.isArray(ctx.value()) ? ctx.value() as DateRange : undefined);
    const rangeStart = computed(() => Boolean(range.value?.from && isSameDay(props.date, range.value.from)));
    const rangeEnd = computed(() => Boolean(range.value?.to && isSameDay(props.date, range.value.to)));
    const inRange = computed(() => Boolean(range.value && isInRange(props.date, range.value)));
    const disabled = computed(() => props.disabled ?? isDateDisabled(props.date, { min: ctx.min(), max: ctx.max(), disabledDates: ctx.disabledDates() }));
    const focused = computed(() => isSameDay(props.date, ctx.focusedDate()));
    watch(focused, (isFocused) => { if (isFocused && ctx.focusRef.value) host.value?.focus(); }, { flush: 'post' });
    function onKeydown(event: KeyboardEvent) {
      if (event.defaultPrevented || disabled.value) return;
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); ctx.selectDate(props.date); return; }
      let next: Date | null = null;
      if (event.key === 'ArrowLeft') next = addDays(props.date, -1);
      else if (event.key === 'ArrowRight') next = addDays(props.date, 1);
      else if (event.key === 'ArrowUp') next = addDays(props.date, -7);
      else if (event.key === 'ArrowDown') next = addDays(props.date, 7);
      else if (event.key === 'Home') next = addDays(props.date, -((props.date.getDay() - ctx.weekStartsOn() + 7) % 7));
      else if (event.key === 'End') next = addDays(props.date, 6 - ((props.date.getDay() - ctx.weekStartsOn() + 7) % 7));
      else if (event.key === 'PageUp') next = event.shiftKey ? addYears(props.date, -1) : addMonths(props.date, -1);
      else if (event.key === 'PageDown') next = event.shiftKey ? addYears(props.date, 1) : addMonths(props.date, 1);
      if (next) {
        event.preventDefault();
        ctx.focusRef.value = true;
        ctx.setFocusedDate(next);
        if (next.getMonth() !== ctx.month().getMonth() || next.getFullYear() !== ctx.month().getFullYear()) ctx.setMonth(startOfMonth(next));
      }
    }
    return () => renderPrimitive('button', props.asChild, mergeProps(attrs, {
      ref: host, type: 'button', tabindex: focused.value ? 0 : -1, disabled: disabled.value || undefined, 'aria-selected': selected.value,
      'aria-current': today.value ? 'date' : undefined, 'data-today': dataAttr(today.value), 'data-outside-month': dataAttr(outsideMonth.value),
      'data-in-range': dataAttr(inRange.value), 'data-range-start': dataAttr(rangeStart.value), 'data-range-end': dataAttr(rangeEnd.value), 'data-disabled': dataAttr(disabled.value),
      class: 'few-calendar-day',
      onClick: () => { if (disabled.value) return; ctx.selectDate(props.date); ctx.focusRef.value = true; ctx.setFocusedDate(props.date); },
      onKeydown,
    }), withDefault(slots, () => [String(props.date.getDate())]));
  },
});

export const FewCalendarGridHead = defineComponent({
  name: 'FewCalendarGridHead',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const ctx = useCalendar('FewCalendarGridHead');
    return () => {
      if (slots.default) return renderPrimitive('thead', props.asChild, mergeProps(attrs, { class: 'few-calendar-grid-head' }), slots);
      const formatter = new Intl.DateTimeFormat(ctx.locale(), { weekday: 'short' });
      const referenceSunday = new Date(2024, 0, 7);
      const labels = Array.from({ length: 7 }, (_, i) => capitalize(formatter.format(addDays(referenceSunday, (i + ctx.weekStartsOn()) % 7)).replace('.', '')));
      return h('thead', mergeProps(attrs, { class: 'few-calendar-grid-head' }), [
        h(FewCalendarRow, null, () => labels.map((label, i) => h(FewCalendarHeadCell, { key: `${label}-${i}` }, () => label))),
      ]);
    };
  },
});

export const FewCalendarGridBody = defineComponent({
  name: 'FewCalendarGridBody',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const ctx = useCalendar('FewCalendarGridBody');
    return () => {
      if (slots.default) return renderPrimitive('tbody', props.asChild, mergeProps(attrs, { class: 'few-calendar-grid-body' }), slots);
      const weeks = calendarGrid(ctx.month().getFullYear(), ctx.month().getMonth(), ctx.weekStartsOn());
      return h('tbody', mergeProps(attrs, { class: 'few-calendar-grid-body' }), weeks.map(week =>
        h(FewCalendarRow, { key: week[0].toISOString() }, () => week.map(date =>
          h(FewCalendarCell, { key: date.toISOString() }, () => h(FewCalendarDay, { date }))))));
    };
  },
});
