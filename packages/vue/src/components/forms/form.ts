// Ver docs/composition-vue.md. Fonte da verdade: packages/react/src/components/forms/form.tsx
import { defineComponent, mergeProps } from 'vue';
import { renderPrimitive } from '../../lib/primitive.js';

export interface FormSubmitValues { [key: string]: FormDataEntryValue }

/** Raiz: <FewForm @submit="(event, values) => {}"><Field.../><FewFormSubmit>Enviar</FewFormSubmit></FewForm> */
export const FewForm = defineComponent({
  name: 'FewForm',
  inheritAttrs: false,
  props: { asChild: Boolean, novalidate: { type: Boolean, default: undefined } },
  emits: { submit: (_event: Event, _values: FormSubmitValues) => true },
  setup(props, { slots, attrs, emit }) {
    function handleSubmit(event: Event) {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(event.currentTarget as HTMLFormElement)) as FormSubmitValues;
      emit('submit', event, values);
    }
    return () => renderPrimitive('form', props.asChild, mergeProps(attrs, {
      novalidate: props.novalidate || undefined, class: 'few-form', onSubmit: handleSubmit,
    }), slots);
  },
});

export const FewFormSubmit = defineComponent({
  name: 'FewFormSubmit',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('button', props.asChild, mergeProps(attrs, { type: 'submit', class: 'few-form-submit' }), slots);
  },
});
