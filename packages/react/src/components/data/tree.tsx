"use client";
// Tree: árvore acessível (WAI-ARIA APG Tree View) com seleção, expansão e digitação (ver docs/composition.md).
import { Children, isValidElement, useEffect, useMemo, useRef, useState, type ComponentProps, type FocusEvent, type KeyboardEvent, type MouseEvent } from 'react';
import { nextIndex, typeaheadIndex } from '@fewcompany/core';
import { Slot, Slottable } from '../../lib/slot.js';
import { createContext } from '../../lib/context.js';
import { useControllableState } from '../../lib/use-controllable-state.js';
import { cx, dataAttr } from '../../lib/cx.js';
import { focusableItems } from '../../lib/roving.js';

interface TreeContextValue {
  multiple: boolean;
  selected: string[];
  select: (id: string, additive: boolean) => void;
  expanded: Set<string>;
  setExpanded: (id: string, open: boolean) => void;
  activeId: string | null;
  setActiveId: (id: string) => void;
}
const [TreeProvider, useTreeCtx] = createContext<TreeContextValue>('Tree');

interface TreeItemContextValue { id: string; open: boolean; isBranch: boolean }
const [TreeItemProvider, useTreeItemCtx] = createContext<TreeItemContextValue>('Tree.Item');

interface TreeLevelContextValue { level: number }
const [TreeLevelProvider, useTreeLevel] = createContext<TreeLevelContextValue>('Tree', { level: 1 });

export interface TreeProps extends Omit<ComponentProps<'div'>, 'defaultValue'> {
  asChild?: boolean;
  /** Ids selecionados. */
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  /** Ids expandidos. */
  expanded?: string[];
  defaultExpanded?: string[];
  onExpandedChange?: (expanded: string[]) => void;
  multiple?: boolean;
}
function TreeRoot({ asChild, value, defaultValue = [], onValueChange, expanded, defaultExpanded = [], onExpandedChange, multiple = false, className, onKeyDown, onFocus, ...props }: TreeProps) {
  const [selected, setSelected] = useControllableState<string[]>({ value, defaultValue, onChange: onValueChange });
  const [expandedArr, setExpandedArr] = useControllableState<string[]>({ value: expanded, defaultValue: defaultExpanded, onChange: onExpandedChange });
  const [activeId, setActiveId] = useState<string | null>(null);
  const expandedSet = useMemo(() => new Set(expandedArr), [expandedArr]);
  const ref = useRef<HTMLDivElement>(null);
  const typeBuffer = useRef('');
  const typeTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (activeId !== null) return;
    const first = ref.current?.querySelector<HTMLElement>('[role="treeitem"]');
    const id = first?.dataset.itemId;
    if (id) setActiveId(id);
  }, [activeId]);

  function select(id: string, additive: boolean) {
    setSelected(current => {
      if (!multiple || !additive) return [id];
      return current.includes(id) ? current.filter(x => x !== id) : [...current, id];
    });
  }
  function setExpandedItem(id: string, open: boolean) {
    setExpandedArr(current => open ? (current.includes(id) ? current : [...current, id]) : current.filter(x => x !== id));
  }

  function handleFocus(event: FocusEvent<HTMLDivElement>) {
    onFocus?.(event);
    const item = (event.target as HTMLElement).closest<HTMLElement>('[role="treeitem"]');
    const id = item?.dataset.itemId;
    if (id) setActiveId(id);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const container = ref.current;
    if (!container) return;
    const items = focusableItems(container, '[role="treeitem"]');
    const current = document.activeElement as HTMLElement | null;
    const index = current ? items.indexOf(current) : -1;
    const id = current?.dataset.itemId;
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
      window.clearTimeout(typeTimer.current);
      typeBuffer.current += event.key.toLowerCase();
      const labels = items.map(item => item.textContent?.trim() ?? '');
      const found = typeaheadIndex(labels, typeBuffer.current, index < 0 ? 0 : index);
      if (found !== null) { event.preventDefault(); items[found]?.focus(); }
      typeTimer.current = window.setTimeout(() => { typeBuffer.current = ''; }, 500);
    }
  }

  const Comp = asChild ? Slot : 'div';
  return <TreeProvider value={{ multiple, selected, select, expanded: expandedSet, setExpanded: setExpandedItem, activeId, setActiveId }}>
    <Comp {...props} ref={ref} role="tree" aria-multiselectable={multiple || undefined} className={cx('few-tree', className)} onKeyDown={handleKeyDown} onFocus={handleFocus} />
  </TreeProvider>;
}

export interface TreeItemProps extends ComponentProps<'div'> { asChild?: boolean; value: string; disabled?: boolean }
function TreeItem({ asChild, value, disabled, className, children, ...props }: TreeItemProps) {
  const ctx = useTreeCtx('Tree.Item');
  const { level } = useTreeLevel('Tree.Item');
  const isBranch = Children.toArray(children).some(child => isValidElement(child) && child.type === TreeItemContent);
  const open = ctx.expanded.has(value);
  const isSelected = ctx.selected.includes(value);
  const Comp = asChild ? Slot : 'div';
  return <TreeItemProvider value={{ id: value, open, isBranch }}>
    <Comp {...props} role="treeitem" data-item-id={value} aria-level={level} aria-selected={isSelected} aria-expanded={isBranch ? open : undefined}
      aria-disabled={disabled || undefined} tabIndex={ctx.activeId === value ? 0 : -1}
      data-state={isBranch ? (open ? 'open' : 'closed') : undefined} data-disabled={dataAttr(disabled)}
      className={cx('few-tree-item', className)}>{children}</Comp>
  </TreeItemProvider>;
}

export interface TreeItemTriggerProps extends ComponentProps<'div'> { asChild?: boolean }
function TreeItemTrigger({ asChild, className, children, onClick, ...props }: TreeItemTriggerProps) {
  const treeCtx = useTreeCtx('Tree.ItemTrigger');
  const itemCtx = useTreeItemCtx('Tree.ItemTrigger');
  const Comp = asChild ? Slot : 'div';
  function handleClick(event: MouseEvent<HTMLDivElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    treeCtx.select(itemCtx.id, event.ctrlKey || event.metaKey);
    treeCtx.setActiveId(itemCtx.id);
    if (itemCtx.isBranch) treeCtx.setExpanded(itemCtx.id, !itemCtx.open);
  }
  return <Comp {...props} className={cx('few-tree-item-trigger', className)} onClick={handleClick}>
    {itemCtx.isBranch && <span aria-hidden="true" className="few-tree-item-arrow" data-state={itemCtx.open ? 'open' : 'closed'} />}
    <Slottable>{children}</Slottable>
  </Comp>;
}

export interface TreeItemContentProps extends ComponentProps<'div'> { asChild?: boolean; forceMount?: boolean }
function TreeItemContent({ asChild, forceMount, className, children, ...props }: TreeItemContentProps) {
  const { open } = useTreeItemCtx('Tree.ItemContent');
  const { level } = useTreeLevel('Tree.ItemContent');
  if (!open && !forceMount) return null;
  const Comp = asChild ? Slot : 'div';
  return <TreeLevelProvider value={{ level: level + 1 }}>
    <Comp {...props} role="group" className={cx('few-tree-item-content', className)}>{children}</Comp>
  </TreeLevelProvider>;
}

/** Tree composto: <Tree><Tree.Item value="a"><Tree.ItemTrigger>Rótulo</Tree.ItemTrigger><Tree.ItemContent><Tree.Item value="a-1">…</Tree.Item></Tree.ItemContent></Tree.Item></Tree> */
export const Tree = Object.assign(TreeRoot, { Root: TreeRoot, Item: TreeItem, ItemTrigger: TreeItemTrigger, ItemContent: TreeItemContent });
export { TreeRoot, TreeItem, TreeItemTrigger, TreeItemContent };
