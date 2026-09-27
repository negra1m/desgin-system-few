"use client";
import type { ComponentProps, KeyboardEvent, MouseEvent } from 'react';
import { stepStatus, type Orientation, type StepStatus } from '@fewcompany/core';
import { Slot } from '../../lib/slot.js';
import { createContext } from '../../lib/context.js';
import { useControllableState } from '../../lib/use-controllable-state.js';
import { cx, dataAttr } from '../../lib/cx.js';

interface StepsContextValue { value: number; setValue: ((value: number) => void) | null; orientation: Orientation }
const [StepsProvider, useSteps] = createContext<StepsContextValue>('Steps');

interface StepsItemContextValue { index: number; status: StepStatus }
const [StepsItemProvider, useStepsItem] = createContext<StepsItemContextValue>('Steps.Item');

export interface StepsProps extends Omit<ComponentProps<'ol'>, 'defaultValue'> {
  asChild?: boolean;
  /** Índice da etapa atual (0-based). */
  value?: number; defaultValue?: number; onValueChange?: (value: number) => void;
  orientation?: Orientation;
  /** Permite clicar em uma etapa para navegar até ela. Padrão: true quando onValueChange é informado. */
  clickable?: boolean;
}
function StepsRoot({ asChild, value: valueProp, defaultValue = 0, onValueChange, orientation = 'horizontal', clickable, className, ...props }: StepsProps) {
  const [value, setValue] = useControllableState({ value: valueProp, defaultValue, onChange: onValueChange });
  const interactive = clickable ?? Boolean(onValueChange);
  const Comp = asChild ? Slot : 'ol';
  return <StepsProvider value={{ value, setValue: interactive ? setValue : null, orientation }}>
    <Comp {...props} data-orientation={orientation} className={cx('few-steps', className)} />
  </StepsProvider>;
}

export interface StepsItemProps extends ComponentProps<'li'> { asChild?: boolean; index: number; disabled?: boolean }
function StepsItem({ asChild, index, disabled, className, onClick, onKeyDown, ...props }: StepsItemProps) {
  const { value, setValue, orientation } = useSteps('Steps.Item');
  const status = stepStatus(index, value);
  const interactive = Boolean(setValue) && !disabled;
  const Comp = asChild ? Slot : 'li';
  function handleClick(event: MouseEvent<HTMLLIElement>) {
    onClick?.(event);
    if (event.defaultPrevented || !interactive) return;
    setValue?.(index);
  }
  function handleKeyDown(event: KeyboardEvent<HTMLLIElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented || !interactive) return;
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setValue?.(index); }
  }
  return <StepsItemProvider value={{ index, status }}>
    <Comp {...props} data-state={status} data-orientation={orientation} data-disabled={dataAttr(disabled)}
      aria-current={status === 'current' ? 'step' : undefined}
      role={interactive ? 'button' : undefined} tabIndex={interactive ? 0 : undefined}
      className={cx('few-steps-item', className)} onClick={handleClick} onKeyDown={handleKeyDown} />
  </StepsItemProvider>;
}

export interface StepsIndicatorProps extends ComponentProps<'span'> { asChild?: boolean }
function StepsIndicator({ asChild, className, children, ...props }: StepsIndicatorProps) {
  const { index, status } = useStepsItem('Steps.Indicator');
  const Comp = asChild ? Slot : 'span';
  return <Comp {...props} aria-hidden="true" data-state={status} className={cx('few-steps-indicator', className)}>{children ?? (status === 'complete' ? '✓' : index + 1)}</Comp>;
}

export interface StepsTitleProps extends ComponentProps<'span'> { asChild?: boolean }
function StepsTitle({ asChild, className, ...props }: StepsTitleProps) {
  const { status } = useStepsItem('Steps.Title');
  const Comp = asChild ? Slot : 'span';
  return <Comp {...props} data-state={status} className={cx('few-steps-title', className)} />;
}

export interface StepsDescriptionProps extends ComponentProps<'span'> { asChild?: boolean }
function StepsDescription({ asChild, className, ...props }: StepsDescriptionProps) {
  const { status } = useStepsItem('Steps.Description');
  const Comp = asChild ? Slot : 'span';
  return <Comp {...props} data-state={status} className={cx('few-steps-description', className)} />;
}

export interface StepsSeparatorProps extends ComponentProps<'div'> { asChild?: boolean }
function StepsSeparator({ asChild, className, ...props }: StepsSeparatorProps) {
  const { orientation } = useSteps('Steps.Separator');
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} role="presentation" aria-hidden="true" data-orientation={orientation} className={cx('few-steps-separator', className)} />;
}

/** Steps composto: <Steps value={step} onValueChange={setStep}><Steps.Item index={0}><Steps.Indicator /><Steps.Title>Dados</Steps.Title></Steps.Item><Steps.Separator /><Steps.Item index={1}><Steps.Indicator /><Steps.Title>Pagamento</Steps.Title></Steps.Item></Steps> */
export const Steps = Object.assign(StepsRoot, { Root: StepsRoot, Item: StepsItem, Indicator: StepsIndicator, Title: StepsTitle, Description: StepsDescription, Separator: StepsSeparator });
export { StepsRoot, StepsItem, StepsIndicator, StepsTitle, StepsDescription, StepsSeparator };
