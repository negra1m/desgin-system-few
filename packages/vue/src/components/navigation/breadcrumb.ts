// Trilha de navegação. Sem estado/contexto: composição pura de elementos (ver breadcrumb.tsx no React).
import { defineComponent, mergeProps } from 'vue';
import { renderPrimitive } from '../../lib/primitive.js';

/** Raiz: <FewBreadcrumb><FewBreadcrumbList>...</FewBreadcrumbList></FewBreadcrumb> */
export const FewBreadcrumb = defineComponent({
  name: 'FewBreadcrumb',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('nav', props.asChild, mergeProps(attrs, {
      'aria-label': (attrs['aria-label'] as string | undefined) ?? 'Trilha', class: 'few-breadcrumb',
    }), slots);
  },
});

export const FewBreadcrumbList = defineComponent({
  name: 'FewBreadcrumbList',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('ol', props.asChild, mergeProps(attrs, { class: 'few-breadcrumb-list' }), slots);
  },
});

export const FewBreadcrumbItem = defineComponent({
  name: 'FewBreadcrumbItem',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('li', props.asChild, mergeProps(attrs, { class: 'few-breadcrumb-item' }), slots);
  },
});

/** Link de um nível intermediário. Use asChild para compor com o RouterLink/NuxtLink. */
export const FewBreadcrumbLink = defineComponent({
  name: 'FewBreadcrumbLink',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('a', props.asChild, mergeProps(attrs, { class: 'few-breadcrumb-link' }), slots);
  },
});

/** Página atual: não é um link navegável, é anunciada via aria-current="page". */
export const FewBreadcrumbPage = defineComponent({
  name: 'FewBreadcrumbPage',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('span', props.asChild, mergeProps(attrs, {
      role: 'link', 'aria-disabled': 'true', 'aria-current': 'page', class: 'few-breadcrumb-page',
    }), slots);
  },
});

export const FewBreadcrumbSeparator = defineComponent({
  name: 'FewBreadcrumbSeparator',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('span', props.asChild, mergeProps(attrs, {
      role: 'presentation', 'aria-hidden': 'true', class: 'few-breadcrumb-separator',
    }), slots, children => children.length ? children : ['/']);
  },
});

export const FewBreadcrumbEllipsis = defineComponent({
  name: 'FewBreadcrumbEllipsis',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('span', props.asChild, mergeProps(attrs, {
      role: 'presentation', 'aria-hidden': 'true', class: 'few-breadcrumb-ellipsis',
    }), slots, children => children.length ? children : ['…']);
  },
});
