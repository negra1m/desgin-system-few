// Ver docs/composition-vue.md. Fonte da verdade: packages/react/src/components/forms/tags-input.tsx
import { createTextVNode, defineComponent, h, mergeProps, type PropType } from 'vue';
import { addTags, splitTags } from '@fewcompany/core';
import { createContext } from '../../lib/context.js';
import { useControllable } from '../../lib/use-controllable.js';
import { useId } from '../../lib/ids.js';
import { renderPrimitive, dataAttr } from '../../lib/primitive.js';
import { FewLabel } from './label.js';

interface TagsInputContextValue {
  value: () => string[]; addTag: (raw: string) => void; removeAt: (index: number) => void; removeLast: () => void;
  disabled: () => boolean | undefined; baseId: string;
}
const [provideTagsInput, useTagsInput] = createContext<TagsInputContextValue>('FewTagsInput');

export const FewTagsInput = defineComponent({
  name: 'FewTagsInput',
  inheritAttrs: false,
  props: {
    asChild: Boolean, value: { type: Array as PropType<string[]>, default: undefined }, defaultValue: { type: Array as PropType<string[]>, default: () => [] },
    max: { type: Number, default: undefined }, allowDuplicates: { type: Boolean, default: false }, disabled: Boolean,
  },
  emits: { 'update:value': (_value: string[]) => true },
  setup(props, { slots, attrs, emit }) {
    const baseId = useId('tags-input');
    const [current, setCurrent] = useControllable<string[]>(() => props.value, props.defaultValue, v => emit('update:value', v));
    function addTag(raw: string) {
      const next = addTags(current.value, splitTags(raw), { max: props.max, allowDuplicates: props.allowDuplicates });
      if (next.length !== current.value.length) setCurrent(next);
    }
    function removeAt(index: number) { setCurrent(current.value.filter((_, i) => i !== index)); }
    function removeLast() { if (current.value.length) setCurrent(current.value.slice(0, -1)); }
    provideTagsInput({ value: () => current.value, addTag, removeAt, removeLast, disabled: () => props.disabled, baseId });
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, {
      'data-disabled': dataAttr(props.disabled), class: 'few-tags-input',
    }), slots);
  },
});

export const FewTagsInputLabel = defineComponent({
  name: 'FewTagsInputLabel',
  inheritAttrs: false,
  props: { asChild: Boolean, required: { type: Boolean, default: undefined } },
  setup(props, { slots, attrs }) {
    const ctx = useTagsInput('FewTagsInputLabel');
    return () => h(FewLabel, mergeProps(attrs, { asChild: props.asChild, required: props.required, for: `${ctx.baseId}-input` }), slots);
  },
});

interface TagItemContextValue { index: number; value: () => string | undefined }
const [provideTagItem, useTagItem] = createContext<TagItemContextValue>('FewTagsInputItem');

export const FewTagsInputItem = defineComponent({
  name: 'FewTagsInputItem',
  inheritAttrs: false,
  props: { asChild: Boolean, index: { type: Number, required: true } },
  setup(props, { slots, attrs }) {
    const ctx = useTagsInput('FewTagsInputItem');
    provideTagItem({ index: props.index, value: () => ctx.value()[props.index] });
    return () => {
      const tag = ctx.value()[props.index];
      if (tag === undefined) return null;
      const content = props.asChild ? slots : { default: () => { const c = slots.default?.() ?? []; return c.length ? c : [createTextVNode(tag)]; } };
      return renderPrimitive('span', props.asChild, mergeProps(attrs, { class: 'few-tags-input-item' }), content);
    };
  },
});

export const FewTagsInputItemDelete = defineComponent({
  name: 'FewTagsInputItemDelete',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const item = useTagItem('FewTagsInputItemDelete');
    const ctx = useTagsInput('FewTagsInputItemDelete');
    return () => {
      const value = item.value() ?? '';
      const content = props.asChild ? slots : { default: () => { const c = slots.default?.() ?? []; return c.length ? c : [createTextVNode('×')]; } };
      return renderPrimitive('button', props.asChild, mergeProps(attrs, {
        type: 'button', 'aria-label': (attrs['aria-label'] as string | undefined) ?? `Remover ${value}`, class: 'few-tags-input-item-delete',
        onClick: () => ctx.removeAt(item.index),
      }), content);
    };
  },
});

export const FewTagsInputInput = defineComponent({
  name: 'FewTagsInputInput',
  inheritAttrs: false,
  setup(_props, { attrs }) {
    const ctx = useTagsInput('FewTagsInputInput');
    function handleKeydown(event: KeyboardEvent) {
      if (event.defaultPrevented) return;
      const input = event.currentTarget as HTMLInputElement;
      if (event.key === 'Enter' || event.key === ',') {
        if (input.value.trim()) { event.preventDefault(); ctx.addTag(input.value); input.value = ''; }
      } else if (event.key === 'Backspace' && input.value === '') {
        ctx.removeLast();
      }
    }
    return () => {
      const explicitDisabled = attrs['disabled'];
      const isDisabled = explicitDisabled !== undefined ? Boolean(explicitDisabled) : ctx.disabled();
      return h('input', mergeProps(attrs, {
        id: `${ctx.baseId}-input`, disabled: isDisabled || undefined, onKeydown: handleKeydown, class: 'few-input few-tags-input-input',
      }));
    };
  },
});
