// AvatarGroup: empilha Avatars e mostra "+N" a partir de `max` (ver docs/composition-vue.md).
import { defineComponent, mergeProps, ref, type PropType, type Slots } from 'vue';
import type { Size } from '@fewcompany/core';
import { createContext } from '../../lib/context.js';
import { renderPrimitive, slotNodes } from '../../lib/primitive.js';

interface AvatarGroupContextValue { max: () => number | undefined; total: () => number; size: () => Size | 'xl' }
const [provideAvatarGroup, useAvatarGroupCtx] = createContext<AvatarGroupContextValue>('FewAvatarGroup');

export const FewAvatarGroup = defineComponent({
  name: 'FewAvatarGroup',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    max: { type: Number, default: undefined },
    size: { type: String as PropType<Size | 'xl'>, default: 'md' },
    spacing: { type: [String, Number] as PropType<string | number>, default: undefined },
  },
  setup(props, { slots, attrs }) {
    const totalRef = ref(0);
    provideAvatarGroup({ max: () => props.max, total: () => totalRef.value, size: () => props.size });
    return () => {
      const all = slotNodes(slots.default?.());
      const items = all.filter(node => node.type !== FewAvatarGroupOverflow);
      const overflowNode = all.find(node => node.type === FewAvatarGroupOverflow);
      totalRef.value = items.length;
      const visible = typeof props.max === 'number' ? items.slice(0, props.max) : items;
      const style = props.spacing !== undefined ? { '--few-avatar-group-spacing': typeof props.spacing === 'number' ? `${props.spacing}px` : props.spacing } : undefined;
      const syntheticSlots = { default: () => [...visible, ...(overflowNode ? [overflowNode] : [])] } as Slots;
      return renderPrimitive('div', props.asChild, mergeProps(attrs, { role: 'group', class: 'few-avatar-group', 'data-size': props.size, style }), syntheticSlots);
    };
  },
});

export const FewAvatarGroupOverflow = defineComponent({
  name: 'FewAvatarGroupOverflow',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const group = useAvatarGroupCtx('FewAvatarGroup.Overflow');
    return () => {
      const max = group.max();
      const extra = typeof max === 'number' ? group.total() - max : 0;
      if (extra <= 0) return null;
      return renderPrimitive('span', props.asChild, mergeProps(attrs, { class: ['few-avatar', 'few-avatar-group-overflow'], 'data-size': group.size() }), slots,
        (children) => (children.length ? children : [`+${extra}`]));
    };
  },
});
