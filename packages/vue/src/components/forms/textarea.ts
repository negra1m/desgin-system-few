// Ver docs/composition-vue.md. Fonte da verdade: packages/react/src/components/forms/textarea.tsx
import { defineComponent, h, mergeProps } from 'vue';
import { dataAttr } from '../../lib/primitive.js';

/** Textarea nativa. Sem asChild: é sempre um <textarea> real. */
export const FewTextarea = defineComponent({
  name: 'FewTextarea',
  inheritAttrs: false,
  props: {
    invalid: { type: Boolean, default: false },
    /** Cresce a altura conforme o conteúdo, sem barra de rolagem própria. */
    autoResize: { type: Boolean, default: false },
    rows: { type: Number, default: 3 },
  },
  setup(props, { attrs }) {
    function handleInput(event: Event) {
      if (!props.autoResize) return;
      const el = event.currentTarget as HTMLTextAreaElement;
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
    return () => {
      const ariaInvalid = attrs['aria-invalid'];
      const isInvalid = Boolean(props.invalid || (ariaInvalid && ariaInvalid !== 'false'));
      return h('textarea', mergeProps(attrs, {
        rows: props.rows,
        class: `few-input few-textarea${props.autoResize ? ' few-textarea--auto' : ''}`,
        'aria-invalid': isInvalid || undefined,
        'data-invalid': dataAttr(props.invalid),
        onInput: handleInput,
      }));
    };
  },
});
