// Demos/hosts de teste da categoria "Pickers" (pasta components/pickers). Um componente por id do registry.
import { defineComponent, h, ref, type Component } from 'vue';
import {
  FewSelect, FewSelectTrigger, FewSelectValue, FewSelectIcon, FewSelectContent, FewSelectViewport, FewSelectItem, FewSelectItemText, FewSelectItemIndicator,
  FewCombobox, FewComboboxInput, FewComboboxContent, FewComboboxItem, FewComboboxEmpty,
  FewMultiSelect, FewMultiSelectTrigger, FewMultiSelectValue, FewMultiSelectContent, FewMultiSelectSearch, FewMultiSelectSelectAll, FewMultiSelectItem, FewMultiSelectEmpty,
  FewCalendar, FewCalendarHeader, FewCalendarPrevButton, FewCalendarHeading, FewCalendarNextButton, FewCalendarGrid, FewCalendarGridHead, FewCalendarGridBody,
  FewDatePicker, FewDatePickerInput, FewDatePickerTrigger, FewDatePickerClear, FewDatePickerContent,
} from '../components/pickers/index.js';
import type { CalendarValue } from '../components/pickers/calendar.js';
import type { DatePickerValue } from '../components/pickers/date-picker.js';

export const DemoSelect = defineComponent({
  name: 'DemoSelect',
  setup() {
    return () => h(FewSelect, { defaultValue: 'md' }, () => [
      h(FewSelectTrigger, null, () => [h(FewSelectValue, { placeholder: 'Selecione um tamanho' }), h(FewSelectIcon)]),
      h(FewSelectContent, null, () => [
        h(FewSelectViewport, null, () => [
          h(FewSelectItem, { value: 'sm' }, () => [h(FewSelectItemText, null, () => 'Pequeno'), h(FewSelectItemIndicator)]),
          h(FewSelectItem, { value: 'md' }, () => [h(FewSelectItemText, null, () => 'Médio'), h(FewSelectItemIndicator)]),
          h(FewSelectItem, { value: 'lg', disabled: true }, () => [h(FewSelectItemText, null, () => 'Grande'), h(FewSelectItemIndicator)]),
        ]),
      ]),
    ]);
  },
});

export const DemoCombobox = defineComponent({
  name: 'DemoCombobox',
  setup() {
    return () => h(FewCombobox, { defaultValue: '' }, () => [
      h(FewComboboxInput, { placeholder: 'Buscar fruta…' }),
      h(FewComboboxContent, null, () => [
        h(FewComboboxItem, { value: 'maca' }, () => 'Maçã'),
        h(FewComboboxItem, { value: 'banana' }, () => 'Banana'),
        h(FewComboboxItem, { value: 'uva' }, () => 'Uva'),
        h(FewComboboxEmpty, null, () => 'Nada encontrado'),
      ]),
    ]);
  },
});

export const DemoMultiSelect = defineComponent({
  name: 'DemoMultiSelect',
  setup() {
    return () => h(FewMultiSelect, { defaultValue: ['vue'] }, () => [
      h(FewMultiSelectTrigger, null, () => h(FewMultiSelectValue, { placeholder: 'Selecione frameworks' })),
      h(FewMultiSelectContent, null, () => [
        h(FewMultiSelectSearch),
        h(FewMultiSelectSelectAll),
        h(FewMultiSelectItem, { value: 'vue' }, () => 'Vue'),
        h(FewMultiSelectItem, { value: 'react' }, () => 'React'),
        h(FewMultiSelectItem, { value: 'angular' }, () => 'Angular'),
        h(FewMultiSelectEmpty, null, () => 'Nada encontrado'),
      ]),
    ]);
  },
});

export const DemoCalendar = defineComponent({
  name: 'DemoCalendar',
  setup() {
    return () => h(FewCalendar, { mode: 'single', defaultValue: new Date() }, () => [
      h(FewCalendarHeader, null, () => [h(FewCalendarPrevButton), h(FewCalendarHeading), h(FewCalendarNextButton)]),
      h(FewCalendarGrid, null, () => [h(FewCalendarGridHead), h(FewCalendarGridBody)]),
    ]);
  },
});

export const DemoDatePicker = defineComponent({
  name: 'DemoDatePicker',
  setup() {
    const date = ref<Date | undefined>(undefined);
    return () => h(FewDatePicker, { value: date.value, 'onUpdate:value': (v: DatePickerValue) => { date.value = v as Date | undefined; } }, () => [
      h(FewDatePickerInput, { placeholder: 'dd/mm/aaaa' }),
      h(FewDatePickerTrigger),
      h(FewDatePickerClear),
      h(FewDatePickerContent, null, () => h(FewCalendar, { mode: 'single', value: date.value as CalendarValue, 'onUpdate:value': (v: CalendarValue) => { date.value = v as Date; } }, () => [
        h(FewCalendarHeader, null, () => [h(FewCalendarPrevButton), h(FewCalendarHeading), h(FewCalendarNextButton)]),
        h(FewCalendarGrid, null, () => [h(FewCalendarGridHead), h(FewCalendarGridBody)]),
      ])),
    ]);
  },
});

export const PICKERS_DEMOS: Record<string, Component> = {
  select: DemoSelect,
  combobox: DemoCombobox,
  'multi-select': DemoMultiSelect,
  calendar: DemoCalendar,
  'date-picker': DemoDatePicker,
};
