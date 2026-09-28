// Ver docs/composition-vue.md. Fonte da verdade: packages/react/src/components/typography/kbd.tsx.
import { defineComponent, h, mergeProps, type PropType, type VNodeArrayChildren } from 'vue';
import { normalizeKbdKeys, type KbdPlatform } from '@fewcompany/core';
import { renderPrimitive } from '../../lib/primitive.js';

export type KbdSize = 'sm' | 'md';
export type { KbdPlatform };

/** Kbd: atalho de teclado com aparência de tecla física, a partir do slot padrão ou de `keys`. */
export const FewKbd = defineComponent({
  name: 'FewKbd',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    /** Sequência de teclas, renderizada com separador "+". Ignorada quando o slot padrão é informado. */
    keys: { type: Array as PropType<string[]>, default: undefined },
    /** Plataforma usada para normalizar `keys` (ex.: Cmd no mac). Sem detecção automática. */
    platform: { type: String as PropType<KbdPlatform>, default: 'other' },
    size: { type: String as PropType<KbdSize>, default: 'md' },
  },
  setup(props, { slots, attrs }) {
    return () => {
      const hasChildren = !!slots.default;
      const sequence = !hasChildren && props.keys ? normalizeKbdKeys(props.keys, props.platform) : null;
      const wrap = (children: VNodeArrayChildren): VNodeArrayChildren => sequence
        ? sequence.map((key, index) => h('span', { key: `${key}-${index}`, class: 'few-kbd-key' }, [
            index > 0 ? h('span', { class: 'few-kbd-sep', 'aria-hidden': 'true' }, '+') : null,
            key,
          ]))
        : children;
      return renderPrimitive('kbd', props.asChild, mergeProps(attrs, { class: 'few-kbd', 'data-size': props.size }), slots, wrap);
    };
  },
});
