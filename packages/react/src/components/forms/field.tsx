"use client";
import { Children, isValidElement, useId, type ComponentProps, type ReactElement } from 'react';
import { Slot } from '../../lib/slot.js';
import { createContext } from '../../lib/context.js';
import { cx, dataAttr } from '../../lib/cx.js';
import { Label, type LabelProps } from './label.js';

interface FieldContextValue { baseId: string; invalid: boolean; required?: boolean; hasDescription: boolean; hasError: boolean }
const [FieldProvider, useField] = createContext<FieldContextValue>('Field');

export interface FieldProps extends ComponentProps<'div'> {
  asChild?: boolean;
  /** Marca o campo como inválido: Field.Control passa aria-invalid ao filho. */
  invalid?: boolean;
  required?: boolean;
}
/**
 * Detecta Field.Description/Field.Error entre os filhos diretos para montar o aria-describedby
 * de Field.Control de forma síncrona (funciona em SSR, sem depender de efeitos).
 */
function FieldRoot({ asChild, invalid = false, required, className, children, ...props }: FieldProps) {
  const baseId = useId();
  const list = Children.toArray(children);
  const hasDescription = list.some(child => isValidElement(child) && child.type === FieldDescription);
  const hasError = list.some(child => isValidElement(child) && child.type === FieldError);
  const Comp = asChild ? Slot : 'div';
  return (
    <FieldProvider value={{ baseId, invalid, required, hasDescription, hasError }}>
      <Comp {...props} className={cx('few-field', className)} data-invalid={dataAttr(invalid)}>{children}</Comp>
    </FieldProvider>
  );
}

function FieldLabel(props: LabelProps) {
  const { baseId, required } = useField('Field.Label');
  return <Label required={required} {...props} htmlFor={`${baseId}-control`} />;
}

/** Slot: injeta id, aria-describedby (Description + Error), aria-invalid e aria-required no filho. */
function FieldControl({ children }: { children: ReactElement }) {
  const { baseId, invalid, required, hasDescription, hasError } = useField('Field.Control');
  const describedBy = cx(hasDescription && `${baseId}-description`, hasError && `${baseId}-error`) || undefined;
  return (
    <Slot id={`${baseId}-control`} aria-describedby={describedBy} aria-invalid={invalid || undefined} aria-required={required || undefined}>
      {children}
    </Slot>
  );
}

export interface FieldDescriptionProps extends ComponentProps<'p'> { asChild?: boolean }
function FieldDescription({ asChild, className, ...props }: FieldDescriptionProps) {
  const { baseId } = useField('Field.Description');
  const Comp = asChild ? Slot : 'p';
  return <Comp {...props} id={`${baseId}-description`} className={cx('few-field-description few-muted', className)} />;
}

export interface FieldErrorProps extends ComponentProps<'p'> { asChild?: boolean }
function FieldError({ asChild, className, children, ...props }: FieldErrorProps) {
  const { baseId } = useField('Field.Error');
  if (!children) return null;
  const Comp = asChild ? Slot : 'p';
  return <Comp {...props} id={`${baseId}-error`} role="alert" className={cx('few-field-error', className)}>{children}</Comp>;
}

/** Field composto: <Field><Field.Label/><Field.Control><Input/></Field.Control><Field.Error/></Field> */
export const Field = Object.assign(FieldRoot, { Root: FieldRoot, Label: FieldLabel, Control: FieldControl, Description: FieldDescription, Error: FieldError });
export { FieldRoot, FieldLabel, FieldControl, FieldDescription, FieldError };
