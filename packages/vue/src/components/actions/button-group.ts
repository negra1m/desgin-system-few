// Implementação Vue de ButtonGroup (ver docs/composition-vue.md). Fonte da verdade: packages/react/src/components/actions/button-group.tsx.
import { defineComponent, mergeProps, type PropType } from 'vue';
import type { Orientation, Size } from '@fewcompany/core';
import { createContext } from '../../lib/context.js';
import { renderPrimitive, dataAttr } from '../../lib/primitive.js';
import type { ButtonVariant } from './button.js';

interface ButtonGroupContext { variant: () => ButtonVariant | undefined; size: () => Size | undefined }
const [provideButtonGroup, , useButtonGroupOptionalContext] = createContext<ButtonGroupContext>('FewButtonGroup');
export { useButtonGroupOptionalContext };

/** Agrupa FewButton/FewIconButton com bordas coladas. `<FewButtonGroup><FewButton>Um</FewButton><FewButton>Dois</FewButton></FewButtonGroup>` */
export const FewButtonGroup = defineComponent({
  name: 'FewButtonGroup',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    orientation: { type: String as PropType<Orientation>, default: 'horizontal' },
    /** Cola as bordas dos botões (radius só nas pontas). Padrão true. */
    attached: { type: Boolean, default: true },
    /** Propagado por contexto para FewButton/FewIconButton filhos que não definem o próprio size. */
    size: { type: String as PropType<Size>, default: undefined },
    /** Propagado por contexto para FewButton/FewIconButton filhos que não definem a própria variant. */
    variant: { type: String as PropType<ButtonVariant>, default: undefined },
  },
  setup(props, { slots, attrs }) {
    provideButtonGroup({ variant: () => props.variant, size: () => props.size });
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, {
      role: 'group',
      class: 'few-button-group',
      'data-orientation': props.orientation,
      'data-attached': dataAttr(props.attached),
    }), slots);
  },
});
