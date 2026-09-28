// Ver docs/composition-vue.md. Fonte da verdade: packages/react/src/components/forms/password-input.tsx
import { createTextVNode, defineComponent, h, mergeProps } from 'vue';
import { createContext } from '../../lib/context.js';
import { useControllable } from '../../lib/use-controllable.js';
import { renderPrimitive } from '../../lib/primitive.js';
import { FewInput } from './input.js';

interface PasswordInputContextValue { visible: () => boolean; setVisible: (visible: boolean) => void }
const [providePasswordInput, usePasswordInput] = createContext<PasswordInputContextValue>('FewPasswordInput');

export const FewPasswordInput = defineComponent({
  name: 'FewPasswordInput',
  inheritAttrs: false,
  props: { asChild: Boolean, visible: { type: Boolean, default: undefined }, defaultVisible: { type: Boolean, default: false } },
  emits: { 'update:visible': (_value: boolean) => true },
  setup(props, { slots, attrs, emit }) {
    const [current, setCurrent] = useControllable<boolean>(() => props.visible, props.defaultVisible, v => emit('update:visible', v));
    providePasswordInput({ visible: () => current.value, setVisible: setCurrent });
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { class: 'few-input-group few-password-input' }), slots);
  },
});

export const FewPasswordInputInput = defineComponent({
  name: 'FewPasswordInputInput',
  inheritAttrs: false,
  setup(_props, { attrs }) {
    const ctx = usePasswordInput('FewPasswordInputInput');
    return () => h(FewInput, mergeProps(attrs, { type: ctx.visible() ? 'text' : 'password', class: 'few-input-group-input' }));
  },
});

export const FewPasswordInputToggle = defineComponent({
  name: 'FewPasswordInputToggle',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const ctx = usePasswordInput('FewPasswordInputToggle');
    return () => {
      const visible = ctx.visible();
      const content = props.asChild ? slots : { default: () => { const c = slots.default?.() ?? []; return c.length ? c : [createTextVNode(visible ? 'Ocultar' : 'Mostrar')]; } };
      return renderPrimitive('button', props.asChild, mergeProps(attrs, {
        type: 'button', 'data-side': 'end', 'aria-pressed': visible,
        'aria-label': (attrs['aria-label'] as string | undefined) ?? (visible ? 'Ocultar senha' : 'Mostrar senha'),
        class: 'few-input-group-element few-password-input-toggle',
        onClick: () => ctx.setVisible(!visible),
      }), content);
    };
  },
});
