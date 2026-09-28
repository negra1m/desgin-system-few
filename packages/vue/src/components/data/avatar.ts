// Avatar: name -> iniciais quando a imagem falha/não existe (ver docs/composition-vue.md).
import { defineComponent, mergeProps, onScopeDispose, ref, watch, type PropType } from 'vue';
import type { Size } from '@fewcompany/core';
import { getInitials } from '@fewcompany/core';
import { createContext } from '../../lib/context.js';
import { renderPrimitive } from '../../lib/primitive.js';

type ImageLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error';
interface AvatarContextValue { status: () => ImageLoadingStatus; setStatus: (status: ImageLoadingStatus) => void; name: () => string | undefined }
const [provideAvatar, useAvatarCtx] = createContext<AvatarContextValue>('FewAvatar');

export const FewAvatar = defineComponent({
  name: 'FewAvatar',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    size: { type: String as PropType<Size | 'xl'>, default: 'md' },
    shape: { type: String as PropType<'circle' | 'square'>, default: 'circle' },
    name: { type: String, default: undefined },
  },
  setup(props, { slots, attrs }) {
    const status = ref<ImageLoadingStatus>('idle');
    provideAvatar({ status: () => status.value, setStatus: (next: ImageLoadingStatus) => { status.value = next; }, name: () => props.name });
    return () => renderPrimitive('span', props.asChild, mergeProps(attrs, {
      role: props.name ? 'img' : undefined,
      'aria-label': props.name,
      class: 'few-avatar',
      'data-size': props.size,
      'data-shape': props.shape,
    }), slots);
  },
});

export const FewAvatarImage = defineComponent({
  name: 'FewAvatarImage',
  inheritAttrs: false,
  props: { asChild: Boolean },
  emits: ['loadingStatusChange'],
  setup(props, { slots, attrs, emit }) {
    const avatar = useAvatarCtx('FewAvatar.Image');
    watch(() => attrs['src'], () => { avatar.setStatus('loading'); emit('loadingStatusChange', 'loading'); }, { immediate: true });
    function handleLoad() { avatar.setStatus('loaded'); emit('loadingStatusChange', 'loaded'); }
    function handleError() { avatar.setStatus('error'); emit('loadingStatusChange', 'error'); }
    return () => renderPrimitive('img', props.asChild, mergeProps(attrs, {
      alt: (attrs['alt'] as string | undefined) ?? '',
      'data-state': avatar.status(),
      class: 'few-avatar-image',
      onLoad: handleLoad,
      onError: handleError,
    }), slots);
  },
});

export const FewAvatarFallback = defineComponent({
  name: 'FewAvatarFallback',
  inheritAttrs: false,
  props: { asChild: Boolean, delayMs: { type: Number, default: 0 } },
  setup(props, { slots, attrs }) {
    const avatar = useAvatarCtx('FewAvatar.Fallback');
    const canShow = ref(props.delayMs === 0);
    let timer: ReturnType<typeof setTimeout> | undefined;
    watch(() => props.delayMs, (delayMs) => {
      if (typeof window === 'undefined') return;
      window.clearTimeout(timer);
      if (delayMs === 0) { canShow.value = true; return; }
      canShow.value = false;
      timer = setTimeout(() => { canShow.value = true; }, delayMs);
    }, { immediate: true });
    onScopeDispose(() => { if (typeof window !== 'undefined') window.clearTimeout(timer); });
    return () => {
      if (avatar.status() === 'loaded' || !canShow.value) return null;
      const name = avatar.name();
      return renderPrimitive('span', props.asChild, mergeProps(attrs, {
        'aria-hidden': name ? undefined : true,
        class: 'few-avatar-fallback',
      }), slots, (children) => (children.length ? children : name ? [getInitials(name)] : []));
    };
  },
});

export const FewAvatarStatus = defineComponent({
  name: 'FewAvatarStatus',
  inheritAttrs: false,
  props: { asChild: Boolean, status: { type: String as PropType<'online' | 'offline' | 'busy' | 'away'>, default: 'offline' } },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('span', props.asChild, mergeProps(attrs, { 'aria-hidden': 'true', class: 'few-avatar-status', 'data-status': props.status }), slots);
  },
});
