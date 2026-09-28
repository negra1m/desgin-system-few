// DatePicker: Input com digitação dd/mm/aaaa (parse/format puros do core) + Content posicionado com um
// Calendar dentro. DatePicker não importa Calendar: o consumidor compõe os dois e mantém o mesmo
// value/v-model:value nos dois lados (ver demo). Fonte da verdade: packages/react/src/components/pickers/date-picker.tsx.
import { computed, defineComponent, mergeProps, ref, watch, type PropType, type Slots, type VNodeArrayChildren } from 'vue';
import { formatDate, isDateDisabled, parseDate, type DateRange } from '@fewcompany/core';
import type { FloatingAlign, FloatingSide } from '@fewcompany/core';
import { createContext } from '../../lib/context.js';
import { useControllable } from '../../lib/use-controllable.js';
import { useId } from '../../lib/ids.js';
import { useDismiss } from '../../lib/use-dismiss.js';
import { usePosition } from '../../lib/use-position.js';
import { useTopLayer } from '../../lib/use-top-layer.js';
import { renderPrimitive, dataAttr, dataState } from '../../lib/primitive.js';

function withDefault(slots: Slots, fallback: () => VNodeArrayChildren): Slots {
  return { default: () => { const kids = slots.default?.() ?? []; return kids.length ? kids : fallback(); } } as unknown as Slots;
}

export type DatePickerMode = 'single' | 'range';
export type DatePickerValue = Date | DateRange | undefined;

interface DatePickerContext {
  baseId: string;
  mode: () => DatePickerMode;
  value: () => DatePickerValue; setValue: (value: DatePickerValue) => void;
  open: () => boolean; setOpen: (open: boolean) => void;
  disabled: () => boolean | undefined;
  min: () => Date | undefined; max: () => Date | undefined;
  inputText: () => string; setInputText: (text: string) => void;
  fieldRef: import('vue').Ref<HTMLElement | null>;
  inputRef: import('vue').Ref<HTMLInputElement | null>;
  contentRef: import('vue').Ref<HTMLDivElement | null>;
}
const [provideDatePicker, useDatePicker] = createContext<DatePickerContext>('FewDatePicker');

function formatValue(mode: DatePickerMode, value: DatePickerValue): string {
  if (!value) return '';
  if (mode === 'range') {
    const range = value as DateRange;
    if (!range.from) return '';
    return range.to ? `${formatDate(range.from)} – ${formatDate(range.to)}` : formatDate(range.from);
  }
  return value instanceof Date ? formatDate(value) : '';
}

/**
 * Raiz: `<FewDatePicker v-model:value="date">`. Não inclui um `FewCalendar`: componha os dois ligando o
 * mesmo `value`/`update:value` (ver demo em `demos/pickers.ts`).
 */
export const FewDatePicker = defineComponent({
  name: 'FewDatePicker',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    mode: { type: String as PropType<DatePickerMode>, default: 'single' },
    value: { type: [Date, Object] as unknown as PropType<DatePickerValue>, default: undefined },
    defaultValue: { type: [Date, Object] as unknown as PropType<DatePickerValue>, default: undefined },
    open: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: false },
    min: { type: Date, default: undefined },
    max: { type: Date, default: undefined },
    disabled: Boolean,
  },
  emits: { 'update:value': (value: DatePickerValue) => value === undefined || Boolean(value), 'update:open': (open: boolean) => typeof open === 'boolean' },
  setup(props, { slots, attrs, emit }) {
    const baseId = useId('date-picker');
    const [value, setValue] = useControllable<DatePickerValue>(() => props.value, props.defaultValue, v => emit('update:value', v));
    const [open, setOpen] = useControllable(() => props.open, props.defaultOpen, v => emit('update:open', v));
    const inputText = ref(formatValue(props.mode, value.value));
    watch([value, () => props.mode], ([v, mode]) => { inputText.value = formatValue(mode, v); });
    const fieldRef = ref<HTMLElement | null>(null);
    const inputRef = ref<HTMLInputElement | null>(null);
    const contentRef = ref<HTMLDivElement | null>(null);
    provideDatePicker({
      baseId, mode: () => props.mode, value: () => value.value, setValue, open: () => open.value, setOpen, disabled: () => props.disabled,
      min: () => props.min, max: () => props.max, inputText: () => inputText.value, setInputText: (t: string) => { inputText.value = t; },
      fieldRef, inputRef, contentRef,
    });
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { ref: fieldRef, class: 'few-date-picker', 'data-disabled': dataAttr(props.disabled) }), slots);
  },
});

export const FewDatePickerTrigger = defineComponent({
  name: 'FewDatePickerTrigger',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const ctx = useDatePicker('FewDatePickerTrigger');
    return () => renderPrimitive('button', props.asChild, mergeProps(attrs, {
      type: 'button', 'aria-haspopup': 'dialog', 'aria-expanded': ctx.open(), 'aria-controls': `${ctx.baseId}-content`,
      disabled: ctx.disabled() || undefined, 'data-state': dataState(ctx.open()), class: 'few-date-picker-trigger',
      onClick: () => { if (!ctx.disabled()) ctx.setOpen(!ctx.open()); },
    }), withDefault(slots, () => ['📅']));
  },
});

export const FewDatePickerInput = defineComponent({
  name: 'FewDatePickerInput',
  inheritAttrs: false,
  props: { asChild: Boolean, disabled: { type: Boolean, default: undefined } },
  setup(props, { slots, attrs }) {
    const ctx = useDatePicker('FewDatePickerInput');
    const disabled = computed(() => props.disabled ?? ctx.disabled());
    const touched = ref(false);
    const invalid = computed(() => ctx.mode() === 'single' && touched.value && ctx.inputText().trim().length > 0 && parseDate(ctx.inputText()) === null);
    return () => renderPrimitive('input', props.asChild, mergeProps(attrs, {
      ref: ctx.inputRef, type: 'text', inputmode: 'numeric', id: `${ctx.baseId}-input`, autocomplete: 'off',
      role: 'combobox', 'aria-haspopup': 'dialog', 'aria-expanded': ctx.open(), 'aria-controls': `${ctx.baseId}-content`, 'aria-invalid': invalid.value || undefined,
      disabled: disabled.value || undefined, value: ctx.inputText(), 'data-invalid': dataAttr(invalid.value), class: 'few-date-picker-input',
      onFocus: () => { if (!disabled.value) ctx.setOpen(true); },
      onBlur: () => { touched.value = true; },
      onInput: (event: Event) => {
        const text = (event.target as HTMLInputElement).value;
        ctx.setInputText(text);
        if (ctx.mode() !== 'single') return;
        const parsed = parseDate(text);
        if (parsed && !isDateDisabled(parsed, { min: ctx.min(), max: ctx.max() })) ctx.setValue(parsed);
      },
      onKeydown: (event: KeyboardEvent) => {
        if (event.defaultPrevented) return;
        if (event.key === 'Enter') { touched.value = true; if (ctx.mode() === 'single' && parseDate(ctx.inputText())) ctx.setOpen(false); }
      },
    }), slots);
  },
});

export const FewDatePickerContent = defineComponent({
  name: 'FewDatePickerContent',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    side: { type: String as PropType<FloatingSide>, default: 'bottom' },
    align: { type: String as PropType<FloatingAlign>, default: 'start' },
  },
  setup(props, { slots, attrs }) {
    const ctx = useDatePicker('FewDatePickerContent');
    const position = usePosition(() => ctx.open(), ctx.fieldRef, ctx.contentRef, () => ({ side: props.side, align: props.align }));
    useTopLayer(() => ctx.open(), ctx.contentRef);
    useDismiss(() => ctx.open(), () => ctx.setOpen(false), () => [ctx.fieldRef.value, ctx.contentRef.value]);
    watch(() => ctx.open(), (isOpen) => {
      if (!isOpen) return;
      ctx.contentRef.value?.querySelector<HTMLElement>('button[tabindex="0"]')?.focus();
    }, { flush: 'post' });
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, {
      ref: ctx.contentRef, popover: 'manual', role: 'dialog', 'aria-label': 'Escolher data', id: `${ctx.baseId}-content`,
      'data-state': dataState(ctx.open()), 'data-side': position.value.side, class: 'few-date-picker-content',
      style: { position: 'fixed', top: `${position.value.top}px`, left: `${position.value.left}px` },
    }), slots);
  },
});

export const FewDatePickerClear = defineComponent({
  name: 'FewDatePickerClear',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const ctx = useDatePicker('FewDatePickerClear');
    return () => {
      const hasValue = ctx.mode() === 'single' ? ctx.value() instanceof Date : Boolean((ctx.value() as DateRange | undefined)?.from);
      if (!hasValue) return null;
      return renderPrimitive('button', props.asChild, mergeProps(attrs, {
        type: 'button', 'aria-label': 'Limpar data', class: 'few-date-picker-clear',
        onClick: () => { ctx.setValue(undefined); ctx.setInputText(''); ctx.inputRef.value?.focus(); },
      }), withDefault(slots, () => ['×']));
    };
  },
});
