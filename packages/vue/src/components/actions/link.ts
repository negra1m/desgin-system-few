// Implementação Vue de Link (ver docs/composition-vue.md). Fonte da verdade: packages/react/src/components/actions/link.tsx.
import { defineComponent, h, mergeProps, type PropType, type VNodeArrayChildren } from 'vue';
import { renderPrimitive, dataAttr } from '../../lib/primitive.js';

export type LinkVariant = 'default' | 'muted' | 'brand';
export type LinkUnderline = 'always' | 'hover' | 'none';

/** Link de texto. `<FewLink href="/painel">Ir</FewLink>` ou `<FewLink asChild><a href="/painel">Ir</a></FewLink>`. */
export const FewLink = defineComponent({
  name: 'FewLink',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    variant: { type: String as PropType<LinkVariant>, default: 'default' },
    underline: { type: String as PropType<LinkUnderline>, default: 'hover' },
    /** Abre em nova aba com rel seguro e mostra um indicador ↗. */
    external: { type: Boolean, default: false },
  },
  setup(props, { slots, attrs }) {
    const wrap = (children: VNodeArrayChildren): VNodeArrayChildren =>
      props.external ? [...children, h('span', { 'aria-hidden': 'true', class: 'few-link-icon' }, '↗')] : children;
    return () => {
      const target = props.external ? (attrs['target'] as string | undefined) ?? '_blank' : (attrs['target'] as string | undefined);
      const rel = props.external ? [attrs['rel'] as string | undefined, 'noopener', 'noreferrer'].filter(Boolean).join(' ') : attrs['rel'];
      return renderPrimitive('a', props.asChild, mergeProps(attrs, {
        target,
        rel,
        'data-external': dataAttr(props.external),
        class: ['few-link', `few-link--${props.variant}`, `few-link--underline-${props.underline}`],
      }), slots, wrap);
    };
  },
});
