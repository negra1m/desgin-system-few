// Form (ver docs/composition-angular.md). Fonte da verdade: packages/react/src/components/forms/form.tsx.
// Adaptação documentada: sempre chama preventDefault e emite os valores (via FormData); o React só previne
// o submit nativo quando um onSubmit é passado. Sem listener em `(formSubmit)`, o consumidor simplesmente ignora o evento.
import { Directive, output } from '@angular/core';

/** `<form fewForm (formSubmit)="onSubmit($event)">…<button fewFormSubmit>Enviar</button></form>`. */
@Directive({
  selector: 'form[fewForm]',
  host: { class: 'few-form', '(submit)': 'onSubmit($event)' },
})
export class FewForm {
  readonly formSubmit = output<Record<string, FormDataEntryValue>>();
  protected onSubmit(event: Event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.target as HTMLFormElement));
    this.formSubmit.emit(values);
  }
}

@Directive({ selector: 'button[fewFormSubmit]', host: { class: 'few-form-submit', type: 'submit' } })
export class FewFormSubmit {}

/** Importe tudo de uma vez: `imports: [FEW_FORM]`. */
export const FEW_FORM = [FewForm, FewFormSubmit] as const;
