"use client";
// Implementação de referência do padrão composto (ver docs/composition.md).
import { useId, useRef, type ComponentProps, type KeyboardEvent } from 'react';
import type { Orientation } from '@fewcompany/core';
import { Slot } from '../../lib/slot.js';
import { createContext } from '../../lib/context.js';
import { useControllableState } from '../../lib/use-controllable-state.js';
import { cx, dataAttr } from '../../lib/cx.js';
import { moveFocus } from '../../lib/roving.js';

interface TabsContextValue { baseId: string; value: string; setValue: (value: string) => void; orientation: Orientation; activation: 'automatic' | 'manual' }
const [TabsProvider, useTabs] = createContext<TabsContextValue>('Tabs');

export interface TabsProps extends Omit<ComponentProps<'div'>, 'defaultValue' | 'dir'> {
  asChild?: boolean;
  value?: string; defaultValue?: string; onValueChange?: (value: string) => void;
  orientation?: Orientation;
  /** automatic: seta seleciona; manual: seta só move o foco, Enter/Espaço seleciona. */
  activation?: 'automatic' | 'manual';
}
function TabsRoot({ asChild, value: valueProp, defaultValue = '', onValueChange, orientation = 'horizontal', activation = 'automatic', className, ...props }: TabsProps) {
  const baseId = useId();
  const [value, setValue] = useControllableState({ value: valueProp, defaultValue, onChange: onValueChange });
  const Comp = asChild ? Slot : 'div';
  return <TabsProvider value={{ baseId, value, setValue, orientation, activation }}><Comp {...props} className={cx('few-tabs', className)} data-orientation={orientation} /></TabsProvider>;
}

export interface TabsListProps extends ComponentProps<'div'> { asChild?: boolean; loop?: boolean }
function TabsList({ asChild, loop = true, className, onKeyDown, ...props }: TabsListProps) {
  const { orientation, activation, setValue } = useTabs('Tabs.List');
  const ref = useRef<HTMLDivElement>(null);
  const Comp = asChild ? Slot : 'div';
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const target = moveFocus(ref.current, '[role="tab"]', event.key, { orientation, loop });
    if (!target) return;
    event.preventDefault();
    if (activation === 'automatic' && target.dataset.value !== undefined) setValue(target.dataset.value);
  }
  return <Comp {...props} ref={ref} role="tablist" aria-orientation={orientation} className={cx('few-tabs-list', className)} data-orientation={orientation} onKeyDown={handleKeyDown} />;
}

export interface TabsTriggerProps extends ComponentProps<'button'> { asChild?: boolean; value: string }
function TabsTrigger({ asChild, value, className, disabled, onClick, ...props }: TabsTriggerProps) {
  const { baseId, value: selected, setValue } = useTabs('Tabs.Trigger');
  const active = selected === value;
  const Comp = asChild ? Slot : 'button';
  return <Comp {...props} type="button" role="tab" id={`${baseId}-tab-${value}`} aria-selected={active} aria-controls={`${baseId}-panel-${value}`} tabIndex={active ? 0 : -1} disabled={disabled}
    data-state={active ? 'active' : 'inactive'} data-value={value} data-disabled={dataAttr(disabled)} className={cx('few-tabs-trigger', className)}
    onClick={(event) => { onClick?.(event); if (!event.defaultPrevented && !disabled) setValue(value); }} />;
}

export interface TabsContentProps extends ComponentProps<'div'> { asChild?: boolean; value: string; /** Mantém o painel montado quando inativo (hidden). */ forceMount?: boolean }
function TabsContent({ asChild, value, forceMount, className, children, ...props }: TabsContentProps) {
  const { baseId, value: selected } = useTabs('Tabs.Content');
  const active = selected === value;
  if (!active && !forceMount) return null;
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} role="tabpanel" id={`${baseId}-panel-${value}`} aria-labelledby={`${baseId}-tab-${value}`} hidden={!active} tabIndex={0} data-state={active ? 'active' : 'inactive'} className={cx('few-tabs-content', className)}>{children}</Comp>;
}

/** Tabs composto: <Tabs defaultValue="a"><Tabs.List><Tabs.Trigger value="a" /></Tabs.List><Tabs.Content value="a" /></Tabs> */
export const Tabs = Object.assign(TabsRoot, { Root: TabsRoot, List: TabsList, Trigger: TabsTrigger, Content: TabsContent });
export { TabsRoot, TabsList, TabsTrigger, TabsContent };
