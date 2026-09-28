// Ver docs/composition-vue.md. Fonte da verdade: packages/react/src/components/typography/code.tsx.
import { defineComponent, h, mergeProps, onScopeDispose, ref, type PropType, type VNodeArrayChildren } from 'vue';
import { renderPrimitive } from '../../lib/primitive.js';

export type CodeVariant = 'soft' | 'outline';

/** Code: código inline (`code`) ou em bloco (`pre>code`, rolagem por teclado, cópia opcional). */
export const FewCode = defineComponent({
  name: 'FewCode',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    /** Estilo do código inline. Sem efeito quando `block` está ativo. */
    variant: { type: String as PropType<CodeVariant>, default: 'soft' },
    /** Renderiza um bloco (pre>code) com rolagem horizontal, em vez de código inline. */
    block: Boolean,
    /** Linguagem do trecho, exposta só como data-lang (sem syntax highlight). */
    lang: { type: String, default: undefined },
    /** Mostra um botão de copiar. Só tem efeito com `block`. */
    copyable: Boolean,
  },
  setup(props, { slots, attrs }) {
    const codeHost = ref<HTMLElement | null>(null);
    const copied = ref(false);
    let timer: ReturnType<typeof setTimeout> | undefined;
    onScopeDispose(() => { if (timer !== undefined) clearTimeout(timer); });

    async function handleCopy() {
      const text = codeHost.value?.textContent ?? '';
      try {
        await navigator.clipboard.writeText(text);
        copied.value = true;
        timer = setTimeout(() => { copied.value = false; }, 2000);
      } catch {
        /* clipboard indisponível (permissão/contexto não seguro); botão fica sem feedback de sucesso */
      }
    }

    return () => {
      if (!props.block) {
        return renderPrimitive('code', props.asChild, mergeProps(attrs, {
          class: 'few-code', 'data-variant': props.variant, 'data-lang': props.lang,
        }), slots);
      }

      const wrap = (children: VNodeArrayChildren): VNodeArrayChildren => {
        const content: VNodeArrayChildren = props.asChild ? [...children] : [h('code', { ref: codeHost, class: 'few-code-code' }, children)];
        if (props.copyable) {
          content.push(h('button', { type: 'button', class: 'few-code-copy', onClick: handleCopy, 'aria-label': 'Copiar código' }, copied.value ? 'Copiado' : 'Copiar'));
          content.push(h('span', { role: 'status', 'aria-live': 'polite', class: 'few-sr-only' }, copied.value ? 'Copiado' : ''));
        }
        return content;
      };

      return renderPrimitive('pre', props.asChild, mergeProps(attrs, {
        tabindex: 0, class: 'few-code', 'data-block': '', 'data-lang': props.lang,
      }), slots, wrap);
    };
  },
});
