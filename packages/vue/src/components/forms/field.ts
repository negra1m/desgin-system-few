// Ver docs/composition-vue.md. Fonte da verdade: packages/react/src/components/forms/field.tsx
import { defineComponent, h, mergeProps, ref } from 'vue';
import { createContext } from '../../lib/context.js';
import { useId } from '../../lib/ids.js';
import { renderPrimitive, slotNodes, dataAttr } from '../../lib/primitive.js';
import { FewLabel } from './label.js';

interface FieldContextValue {
  baseId: string; invalid: () => boolean; required: () => boolean | undefined;
  hasDescription: () => boolean; hasError: () => boolean;
}
const [provideField, useField] = createContext<FieldContextValue>('FewField');

/**
 * Raiz: detecta FewFieldDescription/FewFieldError entre os filhos diretos do slot (recomputado a cada
 * render, como no React) para montar o aria-describedby de FewFieldControl.
 */
export const FewField = defineComponent({
  name: 'FewField',
  inheritAttrs: false,
  props: { asChild: Boolean, invalid: { type: Boolean, default: false }, required: { type: Boolean, default: undefined } },
  setup(props, { slots, attrs }) {
    const baseId = useId('field');
    const hasDescription = ref(false);
    const hasError = ref(false);
    provideField({
      baseId, invalid: () => props.invalid, required: () => props.required,
      hasDescription: () => hasDescription.value, hasError: () => hasError.value,
    });
    return () => {
      const children = slotNodes(slots.default?.());
      hasDescription.value = children.some(node => node.type === FewFieldDescription);
      hasError.value = children.some(node => node.type === FewFieldError);
      return renderPrimitive('div', props.asChild, mergeProps(attrs, {
        class: 'few-field', 'data-invalid': dataAttr(props.invalid),
      }), { default: () => children });
    };
  },
});

export const FewFieldLabel = defineComponent({
  name: 'FewFieldLabel',
  inheritAttrs: false,
  props: { asChild: Boolean, required: { type: Boolean, default: undefined } },
  setup(props, { slots, attrs }) {
    const field = useField('FewFieldLabel');
    return () => h(FewLabel, mergeProps(attrs, {
      asChild: props.asChild, required: props.required ?? field.required(), for: `${field.baseId}-control`,
    }), slots);
  },
});

/** Slot: injeta id, aria-describedby (Description + Error), aria-invalid e aria-required no filho. */
export const FewFieldControl = defineComponent({
  name: 'FewFieldControl',
  setup(_props, { slots }) {
    const field = useField('FewFieldControl');
    return () => {
      const describedBy = [
        field.hasDescription() ? `${field.baseId}-description` : null,
        field.hasError() ? `${field.baseId}-error` : null,
      ].filter(Boolean).join(' ') || undefined;
      return renderPrimitive('div', true, {
        id: `${field.baseId}-control`,
        'aria-describedby': describedBy,
        'aria-invalid': field.invalid() || undefined,
        'aria-required': field.required() || undefined,
      }, slots);
    };
  },
});

export const FewFieldDescription = defineComponent({
  name: 'FewFieldDescription',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const field = useField('FewFieldDescription');
    return () => renderPrimitive('p', props.asChild, mergeProps(attrs, {
      id: `${field.baseId}-description`, class: 'few-field-description few-muted',
    }), slots);
  },
});

/** Desmonta quando sem conteúdo (mesmo comportamento de retornar null no React). */
export const FewFieldError = defineComponent({
  name: 'FewFieldError',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const field = useField('FewFieldError');
    return () => {
      const children = slotNodes(slots.default?.());
      if (!children.length) return null;
      return renderPrimitive('p', props.asChild, mergeProps(attrs, {
        id: `${field.baseId}-error`, role: 'alert', class: 'few-field-error',
      }), { default: () => children });
    };
  },
});
