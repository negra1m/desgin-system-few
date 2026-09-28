// Tree: árvore acessível (WAI-ARIA APG Tree View) com seleção, expansão e digitação (ver docs/composition-vue.md).
import { computed, defineComponent, h, mergeProps, onScopeDispose, ref, watchEffect, type PropType, type Slots } from 'vue';
import { nextIndex, typeaheadIndex } from '@fewcompany/core';
import { createContext } from '../../lib/context.js';
import { useControllable } from '../../lib/use-controllable.js';
import { renderPrimitive, dataAttr, slotNodes } from '../../lib/primitive.js';
import { focusableItems } from '../../lib/roving.js';

interface TreeContextValue {
  multiple: () => boolean;
  selected: () => string[];
  select: (id: string, additive: boolean) => void;
  expanded: () => Set<string>;
  setExpanded: (id: string, open: boolean) => void;
  activeId: () => string | null;
  setActiveId: (id: string) => void;
}
const [provideTree, useTree] = createContext<TreeContextValue>('FewTree');

interface TreeItemContextValue { id: () => string; open: () => boolean; isBranch: () => boolean }
const [provideTreeItem, useTreeItem] = createContext<TreeItemContextValue>('FewTree.Item');

interface TreeLevelContextValue { level: number }
const [provideTreeLevel, , useTreeLevelOptional] = createContext<TreeLevelContextValue>('FewTreeLevel');
/** Sem provider ancestral (nível de topo), assume nível 1 — mesmo default do `createContext` React. */
function useTreeLevel(): TreeLevelContextValue { return useTreeLevelOptional() ?? { level: 1 }; }

/** Raiz: `<FewTree v-model:value="selected" v-model:expanded="open">`. Sem `value`/`expanded`, usa `defaultValue`/`defaultExpanded`. */
export const FewTree = defineComponent({
  name: 'FewTree',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    value: { type: Array as PropType<string[]>, default: undefined },
    defaultValue: { type: Array as PropType<string[]>, default: () => [] },
    expanded: { type: Array as PropType<string[]>, default: undefined },
    defaultExpanded: { type: Array as PropType<string[]>, default: () => [] },
    multiple: { type: Boolean, default: false },
  },
  emits: {
    'update:value': (value: string[]) => Array.isArray(value),
    'update:expanded': (value: string[]) => Array.isArray(value),
  },
  setup(props, { slots, attrs, emit }) {
    const [selected, setSelected] = useControllable<string[]>(() => props.value, props.defaultValue, v => emit('update:value', v));
    const [expandedArr, setExpandedArr] = useControllable<string[]>(() => props.expanded, props.defaultExpanded, v => emit('update:expanded', v));
    const expandedSet = computed(() => new Set(expandedArr.value));
    const activeId = ref<string | null>(null);
    const host = ref<HTMLElement | null>(null);
    let typeBuffer = '';
    let typeTimer: ReturnType<typeof setTimeout> | undefined;

    watchEffect(() => {
      if (activeId.value !== null) return;
      const first = host.value?.querySelector<HTMLElement>('[role="treeitem"]');
      const id = first?.dataset['itemId'];
      if (id) activeId.value = id;
    }, { flush: 'post' });
    onScopeDispose(() => { if (typeof window !== 'undefined') window.clearTimeout(typeTimer); });

    function select(id: string, additive: boolean) {
      setSelected(current => {
        if (!props.multiple || !additive) return [id];
        return current.includes(id) ? current.filter(x => x !== id) : [...current, id];
      });
    }
    function setExpandedItem(id: string, open: boolean) {
      setExpandedArr(current => (open ? (current.includes(id) ? current : [...current, id]) : current.filter(x => x !== id)));
    }

    provideTree({
      multiple: () => props.multiple,
      selected: () => selected.value,
      select,
      expanded: () => expandedSet.value,
      setExpanded: setExpandedItem,
      activeId: () => activeId.value,
      setActiveId: (id: string) => { activeId.value = id; },
    });

    function handleFocus(event: FocusEvent) {
      const item = (event.target as HTMLElement).closest<HTMLElement>('[role="treeitem"]');
      const id = item?.dataset['itemId'];
      if (id) activeId.value = id;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented) return;
      const container = host.value;
      if (!container) return;
      const items = focusableItems(container, '[role="treeitem"]');
      const current = document.activeElement as HTMLElement | null;
      const index = current ? items.indexOf(current) : -1;
      const id = current?.dataset['itemId'];
      const isOpen = current?.getAttribute('aria-expanded') === 'true';
      const isBranch = current?.hasAttribute('aria-expanded') ?? false;
      const level = Number(current?.getAttribute('aria-level') ?? '1');

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
        const next = nextIndex(event.key, index < 0 ? 0 : index, items.length, { orientation: 'vertical' });
        if (next !== null) { event.preventDefault(); items[next]?.focus(); }
        return;
      }
      if (event.key === 'ArrowRight') {
        if (isBranch && !isOpen && id) { event.preventDefault(); setExpandedItem(id, true); }
        else if (isBranch && isOpen) { event.preventDefault(); items[index + 1]?.focus(); }
        return;
      }
      if (event.key === 'ArrowLeft') {
        if (isBranch && isOpen && id) { event.preventDefault(); setExpandedItem(id, false); }
        else if (level > 1) {
          for (let i = index - 1; i >= 0; i--) {
            const parentLevel = Number(items[i].getAttribute('aria-level') ?? '1');
            if (parentLevel < level) { event.preventDefault(); items[i].focus(); break; }
          }
        }
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        if (id) { event.preventDefault(); select(id, event.ctrlKey || event.metaKey); }
        return;
      }
      if (event.key.length === 1 && /\S/.test(event.key) && !event.ctrlKey && !event.metaKey) {
        window.clearTimeout(typeTimer);
        typeBuffer += event.key.toLowerCase();
        const labels = items.map(el => el.textContent?.trim() ?? '');
        const found = typeaheadIndex(labels, typeBuffer, index < 0 ? 0 : index);
        if (found !== null) { event.preventDefault(); items[found]?.focus(); }
        typeTimer = setTimeout(() => { typeBuffer = ''; }, 500);
      }
    }

    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, {
      ref: host, role: 'tree', 'aria-multiselectable': props.multiple || undefined, class: 'few-tree',
      onKeydown: handleKeyDown, onFocusin: handleFocus,
    }), slots);
  },
});

export const FewTreeItem = defineComponent({
  name: 'FewTreeItem',
  inheritAttrs: false,
  props: { asChild: Boolean, value: { type: String, required: true }, disabled: Boolean },
  setup(props, { slots, attrs }) {
    const tree = useTree('FewTree.Item');
    const { level } = useTreeLevel();
    const isBranchRef = ref(false);
    const open = computed(() => tree.expanded().has(props.value));
    const isSelected = computed(() => tree.selected().includes(props.value));
    provideTreeItem({ id: () => props.value, open: () => open.value, isBranch: () => isBranchRef.value });
    return () => {
      const children = slotNodes(slots.default?.());
      isBranchRef.value = children.some(node => node.type === FewTreeItemContent);
      return renderPrimitive('div', props.asChild, mergeProps(attrs, {
        role: 'treeitem', 'data-item-id': props.value, 'aria-level': level, 'aria-selected': isSelected.value,
        'aria-expanded': isBranchRef.value ? open.value : undefined, 'aria-disabled': props.disabled || undefined,
        tabindex: tree.activeId() === props.value ? 0 : -1,
        'data-state': isBranchRef.value ? (open.value ? 'open' : 'closed') : undefined, 'data-disabled': dataAttr(props.disabled),
        class: 'few-tree-item',
      }), { default: () => children } as Slots);
    };
  },
});

export const FewTreeItemTrigger = defineComponent({
  name: 'FewTreeItemTrigger',
  inheritAttrs: false,
  props: { asChild: Boolean },
  setup(props, { slots, attrs }) {
    const tree = useTree('FewTree.ItemTrigger');
    const item = useTreeItem('FewTree.ItemTrigger');
    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented) return;
      tree.select(item.id(), event.ctrlKey || event.metaKey);
      tree.setActiveId(item.id());
      if (item.isBranch()) tree.setExpanded(item.id(), !item.open());
    }
    return () => renderPrimitive('div', props.asChild, mergeProps(attrs, { class: 'few-tree-item-trigger', onClick: handleClick }), slots,
      (children) => [
        ...(item.isBranch() ? [h('span', { 'aria-hidden': 'true', class: 'few-tree-item-arrow', 'data-state': item.open() ? 'open' : 'closed' })] : []),
        ...children,
      ]);
  },
});

/** Painel filho: desmonta quando fechado, salvo `forceMount`. Empurra o nível (`aria-level`) dos `FewTreeItem` internos em +1. */
export const FewTreeItemContent = defineComponent({
  name: 'FewTreeItemContent',
  inheritAttrs: false,
  props: { asChild: Boolean, forceMount: Boolean },
  setup(props, { slots, attrs }) {
    const item = useTreeItem('FewTree.ItemContent');
    const { level } = useTreeLevel();
    provideTreeLevel({ level: level + 1 });
    return () => {
      if (!item.open() && !props.forceMount) return null;
      return renderPrimitive('div', props.asChild, mergeProps(attrs, { role: 'group', class: 'few-tree-item-content' }), slots);
    };
  },
});
