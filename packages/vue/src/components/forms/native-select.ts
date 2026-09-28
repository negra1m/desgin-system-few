// Ver docs/composition-vue.md. Fonte da verdade: packages/react/src/components/forms/native-select.tsx
import { defineComponent, h, mergeProps, type PropType } from 'vue';
import type { Size } from '@fewcompany/core';
import { dataAttr } from '../../lib/primitive.js';

/** <select> nativo com chevron. Composto internamente; asChild não é necessário (não há elemento único para trocar). */
export const FewNativeSelect = defineComponent({
  name: 'FewNativeSelect',
  inheritAttrs: false,
  props: { size: { type: String as PropType<Size>, default: 'md' }, invalid: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    return () => {
      const ariaInvalid = attrs['aria-invalid'];
      const isInvalid = Boolean(props.invalid || (ariaInvalid && ariaInvalid !== 'false'));
      return h('span', {
        class: `few-native-select few-native-select--${props.size}`,
        'data-invalid': dataAttr(isInvalid), 'data-disabled': dataAttr(attrs['disabled']),
      }, [
        h('select', mergeProps(attrs, { class: 'few-native-select-control', 'aria-invalid': isInvalid || undefined }), slots.default?.() ?? []),
        h('svg', { 'aria-hidden': 'true', viewBox: '0 0 20 20', class: 'few-native-select-chevron' }, [
          h('path', { d: 'M5 7.5l5 5 5-5', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.6', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
        ]),
      ]);
    };
  },
});
