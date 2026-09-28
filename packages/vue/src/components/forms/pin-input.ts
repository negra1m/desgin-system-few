// Ver docs/composition-vue.md. Fonte da verdade: packages/react/src/components/forms/pin-input.tsx
import { defineComponent, h, mergeProps, ref } from 'vue';
import { distributePin, nextPinIndex } from '@fewcompany/core';
import { createContext } from '../../lib/context.js';
import { useControllable } from '../../lib/use-controllable.js';
import { renderPrimitive, dataAttr } from '../../lib/primitive.js';

interface PinInputContextValue {
  length: number; value: () => string; disabled: () => boolean | undefined; mask: () => boolean | undefined;
  setChar: (index: number, char: string) => void; setMany: (index: number, text: string) => void;
  refs: Array<HTMLInputElement | null>;
}
const [providePinInput, usePinInput] = createContext<PinInputContextValue>('FewPinInput');

export const FewPinInput = defineComponent({
  name: 'FewPinInput',
  inheritAttrs: false,
  props: {
    asChild: Boolean, length: { type: Number, default: 4 },
    value: { type: String, default: undefined }, defaultValue: { type: String, default: '' },
    mask: Boolean, disabled: Boolean,
  },
  emits: { 'update:value': (_value: string) => true, complete: (_value: string) => true },
  setup(props, { slots, attrs, emit }) {
    const [current, setCurrent] = useControllable<string>(() => props.value, props.defaultValue, v => emit('update:value', v));
    const refs: Array<HTMLInputElement | null> = [];
    function commit(next: string) {
      setCurrent(next);
      if (next.length === props.length && !next.includes('')) emit('complete', next);
    }
    function setChar(index: number, char: string) {
      // Não usa distributePin aqui: com texto vazio (limpar 1 casa no Backspace) ele não escreve nada
      // (''.split('') === []), então a escrita de uma única casa é feita diretamente.
      const chars = current.value.split('');
      while (chars.length < props.length) chars.push('');
      chars[index] = char;
      commit(chars.slice(0, props.length).join(''));
      if (char && index + 1 < props.length) refs[index + 1]?.focus();
    }
    function setMany(index: number, text: string) {
      const digits = text.replace(/\s/g, '');
      const chars = distributePin(current.value.split(''), digits, index, props.length);
      commit(chars.join(''));
      refs[nextPinIndex(index, digits.length, props.length)]?.focus();
    }
    providePinInput({ length: props.length, value: () => current.value, disabled: () => props.disabled, mask: () => props.mask, setChar, setMany, refs });
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, {
      role: 'group', class: 'few-pin-input', 'data-disabled': dataAttr(props.disabled),
    }), slots);
  },
});

export const FewPinInputInput = defineComponent({
  name: 'FewPinInputInput',
  inheritAttrs: false,
  props: { index: { type: Number, required: true } },
  setup(props, { attrs }) {
    const ctx = usePinInput('FewPinInputInput');
    const isDisabled = () => { const own = attrs['disabled']; return own !== undefined ? Boolean(own) : ctx.disabled(); };
    const char = () => ctx.value()[props.index] ?? '';
    function handleInput(event: Event) {
      const raw = (event.currentTarget as HTMLInputElement).value;
      const last = raw.slice(-1);
      ctx.setChar(props.index, /[a-zA-Z0-9]/.test(last) ? last : '');
    }
    function handleKeydown(event: KeyboardEvent) {
      if (event.defaultPrevented) return;
      if (event.key === 'Backspace' && !char() && props.index > 0) { event.preventDefault(); ctx.setChar(props.index - 1, ''); ctx.refs[props.index - 1]?.focus(); }
      else if (event.key === 'ArrowLeft' && props.index > 0) { event.preventDefault(); ctx.refs[props.index - 1]?.focus(); }
      else if (event.key === 'ArrowRight' && props.index + 1 < ctx.length) { event.preventDefault(); ctx.refs[props.index + 1]?.focus(); }
    }
    function handlePaste(event: ClipboardEvent) {
      event.preventDefault();
      ctx.setMany(props.index, event.clipboardData?.getData('text') ?? '');
    }
    return () => h('input', mergeProps(attrs, {
      ref: (el: unknown) => { ctx.refs[props.index] = el as HTMLInputElement | null; },
      type: ctx.mask() ? 'password' : 'text', inputmode: 'numeric',
      autocomplete: props.index === 0 ? 'one-time-code' : 'off', maxlength: 1,
      disabled: isDisabled() || undefined, value: char(),
      onInput: handleInput, onKeydown: handleKeydown, onPaste: handlePaste,
      class: 'few-input few-pin-input-field',
      'aria-label': (attrs['aria-label'] as string | undefined) ?? `Dígito ${props.index + 1} de ${ctx.length}`,
    }));
  },
});
