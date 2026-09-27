"use client";
import type { ComponentProps, FormEvent } from 'react';
import { Slot } from '../../lib/slot.js';
import { cx } from '../../lib/cx.js';

export interface FormProps extends Omit<ComponentProps<'form'>, 'onSubmit'> {
  asChild?: boolean;
  /** Além do evento, recebe os valores atuais do formulário (via FormData). preventDefault já é chamado antes. */
  onSubmit?: (event: FormEvent<HTMLFormElement>, values: Record<string, FormDataEntryValue>) => void;
}
function FormRoot({ asChild, noValidate, onSubmit, className, ...props }: FormProps) {
  const Comp = asChild ? Slot : 'form';
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!onSubmit) return;
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    onSubmit(event, values);
  }
  return <Comp {...props} noValidate={noValidate} className={cx('few-form', className)} onSubmit={handleSubmit} />;
}

export interface FormSubmitProps extends ComponentProps<'button'> { asChild?: boolean }
function FormSubmit({ asChild, className, ...props }: FormSubmitProps) {
  const Comp = asChild ? Slot : 'button';
  return <Comp {...props} type="submit" className={cx('few-form-submit', className)} />;
}

/** Form composto: <Form onSubmit={(e, values) => {}}><Field.../><Form.Submit>Enviar</Form.Submit></Form> */
export const Form = Object.assign(FormRoot, { Root: FormRoot, Submit: FormSubmit });
export { FormRoot, FormSubmit };
