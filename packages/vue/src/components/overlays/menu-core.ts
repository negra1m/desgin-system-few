// Núcleo interno compartilhado por DropdownMenu, ContextMenu e Menubar (não exportado no barrel da categoria).
// Content/Item/CheckboxItem/RadioGroup/RadioItem/ItemIndicator/Label/Group/Separator/Shortcut. Cada componente
// "público" (dropdown-menu.ts, context-menu.ts, menubar.ts) tem seu próprio contexto de abertura/âncora e só
// reaproveita estas peças de renderização + teclado. Fonte da verdade: React
// packages/react/src/components/overlays/menu-core.tsx.
import { computed, defineComponent, mergeProps, onScopeDispose, ref, watch, type PropType, type Ref } from 'vue';
import { typeaheadIndex, type FloatingAlign, type FloatingSide } from '@fewcompany/core';
import { createContext } from '../../lib/context.js';
import { useControllable } from '../../lib/use-controllable.js';
import { useId } from '../../lib/ids.js';
import { renderPrimitive, dataAttr, dataState } from '../../lib/primitive.js';
import { useDismiss } from '../../lib/use-dismiss.js';
import { usePosition } from '../../lib/use-position.js';
import { useTopLayer } from '../../lib/use-top-layer.js';
import { moveFocus, focusableItems } from '../../lib/roving.js';

const ITEM_SELECTOR = '[role^="menuitem"]';

interface MenuContentContext { close: () => void }
const [provideMenuContent, useMenuContent] = createContext<MenuContentContext>('FewMenuContent (interno)');

/** Conteúdo flutuante de menu (role=menu): popover manual, posicionamento, dismiss, roving focus (setas/Home/End), typeahead, Tab fecha. */
export const MenuContentCore = defineComponent({
  name: 'FewMenuContentCore',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    open: { type: Boolean, required: true },
    onOpenChange: { type: Function as PropType<(open: boolean) => void>, required: true },
    anchorRef: { type: Object as PropType<Ref<Element | null | undefined>>, required: true },
    dismissRefs: { type: Array as PropType<Array<Ref<Element | null | undefined>>>, default: () => [] },
    side: { type: String as PropType<FloatingSide>, default: 'bottom' },
    align: { type: String as PropType<FloatingAlign>, default: 'start' },
    offset: { type: Number, default: 4 },
    loop: { type: Boolean, default: true },
  },
  setup(props, { slots, attrs }) {
    const host = ref<HTMLElement | null>(null);
    let typed = '';
    let typedTimer: ReturnType<typeof setTimeout> | undefined;
    const position = usePosition(() => props.open, props.anchorRef, host, () => ({ side: props.side, align: props.align, offset: props.offset }));
    useTopLayer(() => props.open, host);
    useDismiss(() => props.open, () => props.onOpenChange(false), () => [host.value, props.anchorRef.value, ...props.dismissRefs.map(r => r.value)]);
    watch([() => props.open, host], ([open]) => {
      if (!open || typeof document === 'undefined') return;
      focusableItems(host.value, ITEM_SELECTOR)[0]?.focus();
    }, { flush: 'post', immediate: true });
    onScopeDispose(() => clearTimeout(typedTimer));
    provideMenuContent({ close: () => props.onOpenChange(false) });
    function handleKeydown(event: KeyboardEvent) {
      if (event.defaultPrevented) return;
      if (event.key === 'Tab') { props.onOpenChange(false); return; }
      const moved = moveFocus(host.value, ITEM_SELECTOR, event.key, { orientation: 'vertical', loop: props.loop });
      if (moved) { event.preventDefault(); return; }
      if (event.key.length === 1 && event.key !== ' ') {
        clearTimeout(typedTimer);
        typed += event.key;
        typedTimer = setTimeout(() => { typed = ''; }, 500);
        const items = focusableItems(host.value, ITEM_SELECTOR);
        const labels = items.map(item => item.textContent?.trim() ?? '');
        const current = items.indexOf(document.activeElement as HTMLElement);
        const index = typeaheadIndex(labels, typed, current < 0 ? 0 : current);
        if (index !== null) { items[index]?.focus(); event.preventDefault(); }
      }
    }
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, {
      ref: host, popover: 'manual', role: 'menu', 'data-state': dataState(props.open), 'data-side': position.value.side, class: 'few-menu',
      style: { position: 'fixed', top: `${position.value.top}px`, left: `${position.value.left}px`, ...(position.value.width !== undefined ? { width: `${position.value.width}px` } : {}) },
      onKeydown: handleKeydown,
    }), slots);
  },
});

export const MenuItemCore = defineComponent({
  name: 'FewMenuItem',
  inheritAttrs: false,
  props: { asChild: Boolean, disabled: Boolean },
  emits: ['select'],
  setup(props, { slots, attrs, emit }) {
    const menu = useMenuContent('Menu.Item');
    function select() {
      if (props.disabled) return;
      let prevented = false;
      emit('select', { preventDefault: () => { prevented = true; }, get defaultPrevented() { return prevented; } });
      if (!prevented) menu.close();
    }
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, {
      role: 'menuitem', tabindex: -1, 'aria-disabled': props.disabled || undefined, 'data-disabled': dataAttr(props.disabled), class: 'few-menu-item',
      onMouseenter: (event: MouseEvent) => { if (!props.disabled) (event.currentTarget as HTMLElement).focus(); },
      onClick: () => select(),
      onKeydown: (event: KeyboardEvent) => { if (!event.defaultPrevented && !props.disabled && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); select(); } },
    }), slots);
  },
});

interface MenuItemCheckedContext { checked: () => boolean }
const [provideMenuItemChecked, useMenuItemChecked] = createContext<MenuItemCheckedContext>('FewMenuCheckboxItem/RadioItem');

export const MenuCheckboxItemCore = defineComponent({
  name: 'FewMenuCheckboxItem',
  inheritAttrs: false,
  props: {
    asChild: Boolean, disabled: Boolean,
    checked: { type: Boolean, default: undefined }, defaultChecked: { type: Boolean, default: false },
  },
  emits: { 'update:checked': (checked: boolean) => typeof checked === 'boolean' },
  setup(props, { slots, attrs, emit }) {
    const [checked, setChecked] = useControllable(() => props.checked, props.defaultChecked, v => emit('update:checked', v));
    provideMenuItemChecked({ checked: () => checked.value });
    function toggle() { if (!props.disabled) setChecked(!checked.value); }
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, {
      role: 'menuitemcheckbox', 'aria-checked': checked.value, tabindex: -1, 'aria-disabled': props.disabled || undefined, 'data-disabled': dataAttr(props.disabled),
      'data-state': checked.value ? 'checked' : 'unchecked', class: 'few-menu-item',
      onMouseenter: (event: MouseEvent) => { if (!props.disabled) (event.currentTarget as HTMLElement).focus(); },
      onClick: () => toggle(),
      onKeydown: (event: KeyboardEvent) => { if (!event.defaultPrevented && !props.disabled && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); toggle(); } },
    }), slots);
  },
});

interface MenuRadioGroupContext { value: () => string; setValue: (value: string) => void }
const [provideMenuRadioGroup, useMenuRadioGroup] = createContext<MenuRadioGroupContext>('FewMenuRadioGroup');

export const MenuRadioGroupCore = defineComponent({
  name: 'FewMenuRadioGroup',
  inheritAttrs: false,
  props: { asChild: Boolean, value: { type: String, default: undefined }, defaultValue: { type: String, default: '' } },
  emits: { 'update:value': (value: string) => typeof value === 'string' },
  setup(props, { slots, attrs, emit }) {
    const [value, setValue] = useControllable(() => props.value, props.defaultValue, v => emit('update:value', v));
    provideMenuRadioGroup({ value: () => value.value, setValue });
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { role: 'group', class: 'few-menu-group' }), slots);
  },
});

export const MenuRadioItemCore = defineComponent({
  name: 'FewMenuRadioItem',
  inheritAttrs: false,
  props: { asChild: Boolean, disabled: Boolean, value: { type: String, required: true } },
  setup(props, { slots, attrs }) {
    const group = useMenuRadioGroup('FewMenuRadioItem');
    const checked = computed(() => group.value() === props.value);
    provideMenuItemChecked({ checked: () => checked.value });
    function select() { if (!props.disabled) group.setValue(props.value); }
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, {
      role: 'menuitemradio', 'aria-checked': checked.value, tabindex: -1, 'aria-disabled': props.disabled || undefined, 'data-disabled': dataAttr(props.disabled),
      'data-state': checked.value ? 'checked' : 'unchecked', class: 'few-menu-item',
      onMouseenter: (event: MouseEvent) => { if (!props.disabled) (event.currentTarget as HTMLElement).focus(); },
      onClick: () => select(),
      onKeydown: (event: KeyboardEvent) => { if (!event.defaultPrevented && !props.disabled && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); select(); } },
    }), slots);
  },
});

/** Só renderiza quando o CheckboxItem/RadioItem pai está marcado (ou sempre, com `forceMount`). */
export const MenuItemIndicatorCore = defineComponent({
  name: 'FewMenuItemIndicator',
  inheritAttrs: false,
  props: { asChild: Boolean, forceMount: Boolean },
  setup(props, { slots, attrs }) {
    const item = useMenuItemChecked('FewMenuItemIndicator');
    return () => {
      if (!item.checked() && !props.forceMount) return null;
      return renderPrimitive('span', props.asChild, mergeProps(attrs, { 'aria-hidden': 'true', 'data-state': item.checked() ? 'checked' : 'unchecked', class: 'few-menu-item-indicator' }), slots);
    };
  },
});

interface MenuGroupContext { labelId: () => string | undefined; setLabelId: (id: string) => void }
const [provideMenuGroup, , useOptionalMenuGroup] = createContext<MenuGroupContext>('FewMenuGroup (interno)');

export const MenuGroupCore = defineComponent({
  name: 'FewMenuGroup',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const labelId = ref<string | undefined>(undefined);
    provideMenuGroup({ labelId: () => labelId.value, setLabelId: id => { labelId.value = id; } });
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { role: 'group', 'aria-labelledby': labelId.value, class: 'few-menu-group' }), slots);
  },
});

export const MenuLabelCore = defineComponent({
  name: 'FewMenuLabel',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const group = useOptionalMenuGroup();
    const id = useId('menu-label');
    group?.setLabelId(id);
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { id, class: 'few-menu-label' }), slots);
  },
});

export const MenuSeparatorCore = defineComponent({
  name: 'FewMenuSeparator',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { role: 'separator', 'aria-orientation': 'horizontal', class: 'few-menu-separator' }), slots);
  },
});

export const MenuShortcutCore = defineComponent({
  name: 'FewMenuShortcut',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    return () => renderPrimitive('kbd', props.asChild, mergeProps(attrs, { class: 'few-menu-shortcut' }), slots);
  },
});
