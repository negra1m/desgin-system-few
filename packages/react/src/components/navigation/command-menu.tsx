"use client";
import { useEffect, useId, useLayoutEffect, useRef, useState, type ComponentProps, type KeyboardEvent, type MouseEvent, type RefObject, type SyntheticEvent } from 'react';
import { commandScore, nextIndex, normalizeText } from '@fewcompany/core';
import { Slot } from '../../lib/slot.js';
import { createContext } from '../../lib/context.js';
import { useControllableState } from '../../lib/use-controllable-state.js';
import { cx, dataAttr } from '../../lib/cx.js';

interface CommandContextValue {
  baseId: string;
  query: string; setQuery: (query: string) => void;
  activeId: string | null; setActiveId: (id: string | null) => void;
  listRef: RefObject<HTMLDivElement | null>;
  empty: boolean;
}
const [CommandProvider, useCommand] = createContext<CommandContextValue>('CommandMenu');

export interface CommandMenuProps extends Omit<ComponentProps<'dialog'>, 'open'> {
  asChild?: boolean;
  open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void;
  /** Ativa o atalho global Ctrl/Cmd+K para abrir e fechar. */
  shortcut?: boolean;
  /** Rótulo acessível do diálogo. */
  label?: string;
}
function CommandMenuRoot({ asChild, open: openProp, defaultOpen = false, onOpenChange, shortcut = false, label = 'Comandos', className, onClose, onCancel, ...props }: CommandMenuProps) {
  const baseId = useId();
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [empty, setEmpty] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!shortcut) return;
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setOpen(current => !current); }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [shortcut, setOpen]);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) { previouslyFocused.current = document.activeElement as HTMLElement | null; if (!dialog.open) dialog.showModal(); }
    else if (dialog.open) { dialog.close(); previouslyFocused.current?.focus(); }
  }, [open]);

  useLayoutEffect(() => { if (open) { setQuery(''); setActiveId(null); } }, [open]);

  useLayoutEffect(() => {
    const container = listRef.current;
    if (!container) return;
    const options = Array.from(container.querySelectorAll<HTMLElement>('[role="option"]'));
    setEmpty(options.length === 0);
    setActiveId(current => (current && options.some(option => option.id === current)) ? current : (options[0]?.id ?? null));
  }, [query, open]);

  function handleClose(event: SyntheticEvent<HTMLDialogElement>) { onClose?.(event); setOpen(false); }

  const Comp = asChild ? Slot : 'dialog';
  return <CommandProvider value={{ baseId, query, setQuery, activeId, setActiveId, listRef, empty }}>
    <Comp {...props} ref={dialogRef} aria-label={label} className={cx('few-command', className)} onClose={handleClose} onCancel={onCancel} />
  </CommandProvider>;
}

export interface CommandInputProps extends Omit<ComponentProps<'input'>, 'value' | 'onChange'> { asChild?: boolean }
function CommandInput({ asChild, className, onKeyDown, ...props }: CommandInputProps) {
  const { baseId, query, setQuery, activeId, setActiveId, listRef } = useCommand('CommandMenu.Input');
  const Comp = asChild ? Slot : 'input';
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === 'Enter') { event.preventDefault(); (activeId ? document.getElementById(activeId) : null)?.click(); return; }
    const options = Array.from(listRef.current?.querySelectorAll<HTMLElement>('[role="option"]') ?? []);
    if (!options.length) return;
    const current = activeId ? options.findIndex(option => option.id === activeId) : -1;
    const next = nextIndex(event.key, current < 0 ? 0 : current, options.length, { orientation: 'vertical', loop: false });
    if (next === null) return;
    event.preventDefault();
    const target = options[next];
    setActiveId(target.id);
    target.scrollIntoView({ block: 'nearest' });
  }
  return <Comp {...props} type="text" role="combobox" aria-expanded="true" aria-controls={`${baseId}-list`} aria-autocomplete="list"
    aria-activedescendant={activeId ?? undefined} autoComplete="off" spellCheck={false}
    value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={handleKeyDown} className={cx('few-command-input', className)} />;
}

export interface CommandListProps extends ComponentProps<'div'> { asChild?: boolean }
function CommandList({ asChild, className, ...props }: CommandListProps) {
  const { baseId, listRef } = useCommand('CommandMenu.List');
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} ref={listRef} id={`${baseId}-list`} role="listbox" className={cx('few-command-list', className)} />;
}

export interface CommandGroupProps extends ComponentProps<'div'> { asChild?: boolean }
function CommandGroup({ asChild, className, ...props }: CommandGroupProps) {
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} role="group" className={cx('few-command-group', className)} />;
}

export interface CommandGroupHeadingProps extends ComponentProps<'div'> { asChild?: boolean }
function CommandGroupHeading({ asChild, className, ...props }: CommandGroupHeadingProps) {
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} className={cx('few-command-group-heading', className)} />;
}

export interface CommandItemProps extends Omit<ComponentProps<'div'>, 'onSelect'> {
  asChild?: boolean;
  /** Texto pesquisável (sem acento) e identificador entregue a onSelect. */
  value: string;
  keywords?: string[];
  disabled?: boolean;
  onSelect?: (value: string) => void;
}
function CommandItem({ asChild, value, keywords, disabled, onSelect, className, id: idProp, onClick, onMouseEnter, ...props }: CommandItemProps) {
  const { baseId, query, activeId, setActiveId } = useCommand('CommandMenu.Item');
  const matches = commandScore(value, query, keywords) !== null;
  if (!matches) return null;
  const id = idProp ?? `${baseId}-item-${normalizeText(value).replace(/\s+/g, '-')}`;
  const active = activeId === id;
  const Comp = asChild ? Slot : 'div';
  function handleClick(event: MouseEvent<HTMLDivElement>) {
    onClick?.(event);
    if (event.defaultPrevented || disabled) return;
    onSelect?.(value);
  }
  function handleMouseEnter(event: MouseEvent<HTMLDivElement>) {
    onMouseEnter?.(event);
    if (!disabled) setActiveId(id);
  }
  return <Comp {...props} id={id} role="option" aria-selected={active} aria-disabled={disabled ? true : undefined} data-disabled={dataAttr(disabled)}
    data-state={active ? 'active' : undefined} className={cx('few-command-item', className)} onClick={handleClick} onMouseEnter={handleMouseEnter} />;
}

export interface CommandEmptyProps extends ComponentProps<'div'> { asChild?: boolean }
function CommandEmpty({ asChild, className, children, ...props }: CommandEmptyProps) {
  const { empty } = useCommand('CommandMenu.Empty');
  if (!empty) return null;
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} role="status" className={cx('few-command-empty', className)}>{children ?? 'Nada encontrado.'}</Comp>;
}

export interface CommandSeparatorProps extends ComponentProps<'div'> { asChild?: boolean }
function CommandSeparator({ asChild, className, ...props }: CommandSeparatorProps) {
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} role="separator" aria-orientation="horizontal" className={cx('few-command-separator', className)} />;
}

export interface CommandShortcutProps extends ComponentProps<'kbd'> { asChild?: boolean }
function CommandShortcut({ asChild, className, ...props }: CommandShortcutProps) {
  const Comp = asChild ? Slot : 'kbd';
  return <Comp {...props} className={cx('few-command-shortcut', className)} />;
}

/** CommandMenu composto: <CommandMenu open={open} onOpenChange={setOpen} shortcut><CommandMenu.Input /><CommandMenu.List><CommandMenu.Empty>Nada encontrado.</CommandMenu.Empty><CommandMenu.Group><CommandMenu.GroupHeading>Ações</CommandMenu.GroupHeading><CommandMenu.Item value="Novo projeto" onSelect={run}>Novo projeto</CommandMenu.Item></CommandMenu.Group></CommandMenu.List></CommandMenu> */
export const CommandMenu = Object.assign(CommandMenuRoot, {
  Root: CommandMenuRoot, Input: CommandInput, List: CommandList, Group: CommandGroup, GroupHeading: CommandGroupHeading,
  Item: CommandItem, Empty: CommandEmpty, Separator: CommandSeparator, Shortcut: CommandShortcut,
});
export { CommandMenuRoot, CommandInput, CommandList, CommandGroup, CommandGroupHeading, CommandItem, CommandEmpty, CommandSeparator, CommandShortcut };
