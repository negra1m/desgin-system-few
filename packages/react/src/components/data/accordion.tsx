"use client";
// Accordion: painéis expansíveis com roving focus (ver docs/composition.md, padrão Radix Accordion).
import { useId, useRef, type ComponentProps, type KeyboardEvent } from 'react';
import type { Orientation } from '@fewcompany/core';
import { Slot } from '../../lib/slot.js';
import { createContext } from '../../lib/context.js';
import { useControllableState } from '../../lib/use-controllable-state.js';
import { cx, dataAttr } from '../../lib/cx.js';
import { moveFocus } from '../../lib/roving.js';

interface AccordionContextValue { baseId: string; type: 'single' | 'multiple'; values: string[]; toggle: (value: string) => void; orientation: Orientation }
const [AccordionProvider, useAccordionCtx] = createContext<AccordionContextValue>('Accordion');
interface AccordionItemContextValue { value: string; open: boolean; disabled: boolean }
const [AccordionItemProvider, useAccordionItemCtx] = createContext<AccordionItemContextValue>('Accordion.Item');

export interface AccordionProps extends Omit<ComponentProps<'div'>, 'defaultValue'> {
  asChild?: boolean;
  type?: 'single' | 'multiple';
  /** Só vale para `type="single"`: permite fechar o item aberto sem abrir outro. */
  collapsible?: boolean;
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  orientation?: Orientation;
}
function AccordionRoot({ asChild, type = 'single', collapsible = false, value, defaultValue, onValueChange, orientation = 'vertical', className, ...props }: AccordionProps) {
  const baseId = useId();
  const resolvedDefault = defaultValue ?? (type === 'multiple' ? [] : '');
  const [raw, setRaw] = useControllableState<string | string[]>({ value, defaultValue: resolvedDefault, onChange: onValueChange });
  const values = Array.isArray(raw) ? raw : raw ? [raw] : [];
  function toggle(itemValue: string) {
    if (type === 'multiple') {
      setRaw(current => {
        const list = Array.isArray(current) ? current : [];
        return list.includes(itemValue) ? list.filter(v => v !== itemValue) : [...list, itemValue];
      });
    } else {
      setRaw(current => (current === itemValue ? (collapsible ? '' : current) : itemValue));
    }
  }
  const Comp = asChild ? Slot : 'div';
  return <AccordionProvider value={{ baseId, type, values, toggle, orientation }}>
    <Comp {...props} className={cx('few-accordion', className)} data-orientation={orientation} />
  </AccordionProvider>;
}

export interface AccordionItemProps extends ComponentProps<'div'> { asChild?: boolean; value: string; disabled?: boolean }
function AccordionItem({ asChild, value, disabled = false, className, ...props }: AccordionItemProps) {
  const { values } = useAccordionCtx('Accordion.Item');
  const open = values.includes(value);
  const Comp = asChild ? Slot : 'div';
  return <AccordionItemProvider value={{ value, open, disabled }}>
    <Comp {...props} className={cx('few-accordion-item', className)} data-state={open ? 'open' : 'closed'} data-disabled={dataAttr(disabled)} />
  </AccordionItemProvider>;
}

export interface AccordionHeaderProps extends ComponentProps<'h3'> { asChild?: boolean; level?: 1 | 2 | 3 | 4 | 5 | 6 }
function AccordionHeader({ asChild, level = 3, className, ...props }: AccordionHeaderProps) {
  const Tag = (`h${level}`) as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  const Comp = asChild ? Slot : Tag;
  return <Comp {...props} className={cx('few-accordion-header', className)} />;
}

export interface AccordionTriggerProps extends ComponentProps<'button'> { asChild?: boolean }
function AccordionTrigger({ asChild, className, disabled, onClick, onKeyDown, ...props }: AccordionTriggerProps) {
  const { baseId, toggle, orientation } = useAccordionCtx('Accordion.Trigger');
  const { value, open, disabled: itemDisabled } = useAccordionItemCtx('Accordion.Trigger');
  const isDisabled = disabled || itemDisabled;
  const ref = useRef<HTMLButtonElement>(null);
  const Comp = asChild ? Slot : 'button';
  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const container = ref.current?.closest('.few-accordion') ?? null;
    const target = moveFocus(container, '.few-accordion-trigger', event.key, { orientation });
    if (target) event.preventDefault();
  }
  return <Comp {...props} ref={ref} type="button" id={`${baseId}-trigger-${value}`} aria-expanded={open} aria-controls={`${baseId}-content-${value}`}
    disabled={isDisabled} data-state={open ? 'open' : 'closed'} data-disabled={dataAttr(isDisabled)} className={cx('few-accordion-trigger', className)}
    onClick={(event) => { onClick?.(event); if (!event.defaultPrevented && !isDisabled) toggle(value); }}
    onKeyDown={handleKeyDown} />;
}

export interface AccordionContentProps extends ComponentProps<'div'> { asChild?: boolean }
function AccordionContent({ asChild, className, children, ...props }: AccordionContentProps) {
  const { baseId } = useAccordionCtx('Accordion.Content');
  const { value, open } = useAccordionItemCtx('Accordion.Content');
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} role="region" id={`${baseId}-content-${value}`} aria-labelledby={`${baseId}-trigger-${value}`} inert={open ? undefined : true}
    data-state={open ? 'open' : 'closed'} className={cx('few-accordion-content', className)}>
    <div className="few-accordion-content-inner">{children}</div>
  </Comp>;
}

/** Accordion composto: <Accordion type="single" collapsible><Accordion.Item value="a"><Accordion.Header><Accordion.Trigger/></Accordion.Header><Accordion.Content/></Accordion.Item></Accordion> */
export const Accordion = Object.assign(AccordionRoot, { Root: AccordionRoot, Item: AccordionItem, Header: AccordionHeader, Trigger: AccordionTrigger, Content: AccordionContent });
export { AccordionRoot, AccordionItem, AccordionHeader, AccordionTrigger, AccordionContent };
