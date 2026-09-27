"use client";
// DatePicker: Input com digitação dd/mm/aaaa (parse/format puros do core) + Content posicionado com um
// Calendar dentro. DatePicker não importa Calendar: o consumidor compõe os dois e mantém o mesmo
// value/onValueChange nos dois lados (ver demo). Ver docs/composition.md.
import { useEffect, useId, useRef, useState, type ComponentProps, type RefObject } from 'react';
import { formatDate, isDateDisabled, parseDate, type DateRange } from '@fewcompany/core';
import { Slot } from '../../lib/slot.js';
import { createContext } from '../../lib/context.js';
import { useControllableState } from '../../lib/use-controllable-state.js';
import { cx, dataAttr } from '../../lib/cx.js';
import { useDismiss } from '../../lib/use-dismiss.js';
import { usePosition, type Side, type Align } from '../../lib/use-position.js';
import { useTopLayer } from '../../lib/use-top-layer.js';

export type DatePickerMode = 'single' | 'range';
export type DatePickerValue = Date | DateRange | undefined;

interface DatePickerContextValue {
  baseId: string;
  mode: DatePickerMode;
  value: DatePickerValue; setValue: (value: DatePickerValue) => void;
  open: boolean; setOpen: (open: boolean) => void;
  disabled?: boolean;
  min?: Date; max?: Date;
  inputText: string; setInputText: (text: string) => void;
  fieldRef: RefObject<HTMLDivElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
}
const [DatePickerProvider, useDatePicker] = createContext<DatePickerContextValue>('DatePicker');

function formatValue(mode: DatePickerMode, value: DatePickerValue): string {
  if (!value) return '';
  if (mode === 'range') {
    const range = value as DateRange;
    if (!range.from) return '';
    return range.to ? `${formatDate(range.from)} – ${formatDate(range.to)}` : formatDate(range.from);
  }
  return value instanceof Date ? formatDate(value) : '';
}

export interface DatePickerProps extends Omit<ComponentProps<'div'>, 'defaultValue' | 'onChange'> {
  asChild?: boolean;
  mode?: DatePickerMode;
  value?: DatePickerValue; defaultValue?: DatePickerValue; onValueChange?: (value: DatePickerValue) => void;
  open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void;
  min?: Date; max?: Date; disabled?: boolean;
}
function DatePickerRoot({ asChild, mode = 'single', value: valueProp, defaultValue, onValueChange, open: openProp, defaultOpen = false, onOpenChange, min, max, disabled, className, children, ...props }: DatePickerProps) {
  const baseId = useId();
  const [value, setValue] = useControllableState<DatePickerValue>({ value: valueProp, defaultValue, onChange: onValueChange });
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const [inputText, setInputText] = useState(() => formatValue(mode, value));
  useEffect(() => { setInputText(formatValue(mode, value)); }, [mode, value]);
  const fieldRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const Comp = asChild ? Slot : 'div';
  return (
    <DatePickerProvider value={{ baseId, mode, value, setValue, open, setOpen, disabled, min, max, inputText, setInputText, fieldRef, inputRef, contentRef }}>
      <Comp {...props} ref={fieldRef} className={cx('few-date-picker', className)} data-disabled={dataAttr(disabled)}>{children}</Comp>
    </DatePickerProvider>
  );
}

export interface DatePickerTriggerProps extends ComponentProps<'button'> { asChild?: boolean }
function DatePickerTrigger({ asChild, className, onClick, children, ...props }: DatePickerTriggerProps) {
  const ctx = useDatePicker('DatePicker.Trigger');
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp {...props} type="button" aria-haspopup="dialog" aria-expanded={ctx.open} aria-controls={`${ctx.baseId}-content`}
      disabled={ctx.disabled} data-state={ctx.open ? 'open' : 'closed'} className={cx('few-date-picker-trigger', className)}
      onClick={(event) => { onClick?.(event); if (event.defaultPrevented || ctx.disabled) return; ctx.setOpen(!ctx.open); }}>
      {children ?? '📅'}
    </Comp>
  );
}

export interface DatePickerInputProps extends Omit<ComponentProps<'input'>, 'value' | 'defaultValue'> { asChild?: boolean }
function DatePickerInput({ asChild, className, onChange, onFocus, onBlur, onKeyDown, disabled: disabledProp, ...props }: DatePickerInputProps) {
  const ctx = useDatePicker('DatePicker.Input');
  const disabled = disabledProp ?? ctx.disabled;
  const [touched, setTouched] = useState(false);
  const invalid = ctx.mode === 'single' && touched && ctx.inputText.trim().length > 0 && parseDate(ctx.inputText) === null;
  const Comp = asChild ? Slot : 'input';
  return (
    <Comp {...props} ref={ctx.inputRef} type="text" inputMode="numeric" id={`${ctx.baseId}-input`} autoComplete="off"
      role="combobox" aria-haspopup="dialog" aria-expanded={ctx.open} aria-controls={`${ctx.baseId}-content`} aria-invalid={invalid || undefined}
      disabled={disabled} value={ctx.inputText} data-invalid={dataAttr(invalid)} className={cx('few-date-picker-input', className)}
      onFocus={(event) => { onFocus?.(event); if (!disabled) ctx.setOpen(true); }}
      onBlur={(event) => { onBlur?.(event); setTouched(true); }}
      onChange={(event) => {
        onChange?.(event);
        if (event.defaultPrevented) return;
        const text = event.target.value;
        ctx.setInputText(text);
        if (ctx.mode !== 'single') return;
        const parsed = parseDate(text);
        if (parsed && !isDateDisabled(parsed, { min: ctx.min, max: ctx.max })) ctx.setValue(parsed);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (event.key === 'Enter') { setTouched(true); if (ctx.mode === 'single' && parseDate(ctx.inputText)) ctx.setOpen(false); }
      }} />
  );
}

export interface DatePickerContentProps extends ComponentProps<'div'> { asChild?: boolean; side?: Side; align?: Align }
function DatePickerContent({ asChild, side = 'bottom', align = 'start', className, style, ...props }: DatePickerContentProps) {
  const ctx = useDatePicker('DatePicker.Content');
  const position = usePosition(ctx.fieldRef, ctx.contentRef, { side, align, open: ctx.open });
  useTopLayer(ctx.contentRef, ctx.open);
  useDismiss(ctx.open, () => ctx.setOpen(false), [ctx.fieldRef, ctx.contentRef]);
  useEffect(() => {
    if (!ctx.open) return;
    const container = ctx.contentRef.current;
    container?.querySelector<HTMLElement>('button[tabindex="0"]')?.focus();
  }, [ctx.open]);
  const Comp = asChild ? Slot : 'div';
  return (
    <Comp {...props} ref={ctx.contentRef} popover="manual" role="dialog" aria-label="Escolher data" id={`${ctx.baseId}-content`}
      data-state={ctx.open ? 'open' : 'closed'} data-side={position.side} className={cx('few-date-picker-content', className)}
      style={{ ...position.style, ...style }} />
  );
}

export interface DatePickerClearProps extends ComponentProps<'button'> { asChild?: boolean }
function DatePickerClear({ asChild, className, onClick, children, ...props }: DatePickerClearProps) {
  const ctx = useDatePicker('DatePicker.Clear');
  const hasValue = ctx.mode === 'single' ? ctx.value instanceof Date : Boolean((ctx.value as DateRange | undefined)?.from);
  const Comp = asChild ? Slot : 'button';
  if (!hasValue) return null;
  return (
    <Comp {...props} type="button" aria-label="Limpar data" className={cx('few-date-picker-clear', className)}
      onClick={(event) => { onClick?.(event); if (event.defaultPrevented) return; ctx.setValue(undefined); ctx.setInputText(''); ctx.inputRef.current?.focus(); }}>
      {children ?? '×'}
    </Comp>
  );
}

/** DatePicker composto: <DatePicker value={date} onValueChange={setDate}><DatePicker.Input placeholder="dd/mm/aaaa"/><DatePicker.Trigger/><DatePicker.Clear/><DatePicker.Content><Calendar mode="single" value={date} onValueChange={setDate}>…</Calendar></DatePicker.Content></DatePicker> */
export const DatePicker = Object.assign(DatePickerRoot, {
  Root: DatePickerRoot, Trigger: DatePickerTrigger, Input: DatePickerInput, Content: DatePickerContent, Clear: DatePickerClear,
});
export { DatePickerRoot, DatePickerTrigger, DatePickerInput, DatePickerContent, DatePickerClear };
