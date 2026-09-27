"use client";
import { useId, type ComponentProps, type KeyboardEvent } from 'react';
import { addTags, splitTags } from '@fewcompany/core';
import { Slot } from '../../lib/slot.js';
import { createContext } from '../../lib/context.js';
import { useControllableState } from '../../lib/use-controllable-state.js';
import { cx, dataAttr } from '../../lib/cx.js';
import { Label, type LabelProps } from './label.js';

interface TagsInputContextValue {
  value: string[]; addTag: (raw: string) => void; removeAt: (index: number) => void; removeLast: () => void;
  disabled?: boolean; baseId: string;
}
const [TagsInputProvider, useTagsInput] = createContext<TagsInputContextValue>('TagsInput');

export interface TagsInputProps extends Omit<ComponentProps<'div'>, 'defaultValue'> {
  asChild?: boolean;
  value?: string[]; defaultValue?: string[]; onValueChange?: (value: string[]) => void;
  max?: number; allowDuplicates?: boolean; disabled?: boolean;
}
function TagsInputRoot({ asChild, value, defaultValue = [], onValueChange, max, allowDuplicates = false, disabled, className, ...props }: TagsInputProps) {
  const baseId = useId();
  const [current, setCurrent] = useControllableState({ value, defaultValue, onChange: onValueChange });
  function addTag(raw: string) {
    const next = addTags(current, splitTags(raw), { max, allowDuplicates });
    if (next.length !== current.length) setCurrent(next);
  }
  function removeAt(index: number) { setCurrent(current.filter((_, i) => i !== index)); }
  function removeLast() { if (current.length) setCurrent(current.slice(0, -1)); }
  const Comp = asChild ? Slot : 'div';
  return (
    <TagsInputProvider value={{ value: current, addTag, removeAt, removeLast, disabled, baseId }}>
      <Comp {...props} data-disabled={dataAttr(disabled)} className={cx('few-tags-input', className)} />
    </TagsInputProvider>
  );
}

function TagsInputLabel(props: LabelProps) {
  const { baseId } = useTagsInput('TagsInput.Label');
  return <Label {...props} htmlFor={`${baseId}-input`} />;
}

interface TagItemContextValue { index: number; value: string }
const [TagItemProvider, useTagItem] = createContext<TagItemContextValue>('TagsInput.Item');

export interface TagsInputItemProps extends ComponentProps<'span'> { asChild?: boolean; index: number }
function TagsInputItem({ asChild, index, className, children, ...props }: TagsInputItemProps) {
  const { value } = useTagsInput('TagsInput.Item');
  const tag = value[index];
  if (tag === undefined) return null;
  const Comp = asChild ? Slot : 'span';
  return (
    <TagItemProvider value={{ index, value: tag }}>
      <Comp {...props} className={cx('few-tags-input-item', className)}>{children ?? tag}</Comp>
    </TagItemProvider>
  );
}

export interface TagsInputItemDeleteProps extends ComponentProps<'button'> { asChild?: boolean }
function TagsInputItemDelete({ asChild, className, onClick, children, ...props }: TagsInputItemDeleteProps) {
  const { index, value } = useTagItem('TagsInput.ItemDelete');
  const { removeAt } = useTagsInput('TagsInput.ItemDelete');
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp {...props} type="button" aria-label={props['aria-label'] ?? `Remover ${value}`} className={cx('few-tags-input-item-delete', className)}
      onClick={(event) => { onClick?.(event); if (!event.defaultPrevented) removeAt(index); }}>
      {children ?? '×'}
    </Comp>
  );
}

export interface TagsInputFieldProps extends ComponentProps<'input'> {}
function TagsInputInput({ className, onKeyDown, disabled, ...props }: TagsInputFieldProps) {
  const { addTag, removeLast, disabled: ctxDisabled, baseId } = useTagsInput('TagsInput.Input');
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const input = event.currentTarget;
    if (event.key === 'Enter' || event.key === ',') {
      if (input.value.trim()) { event.preventDefault(); addTag(input.value); input.value = ''; }
    } else if (event.key === 'Backspace' && input.value === '') {
      removeLast();
    }
  }
  return (
    <input {...props} id={`${baseId}-input`} disabled={disabled ?? ctxDisabled} onKeyDown={handleKeyDown} className={cx('few-input', 'few-tags-input-input', className)} />
  );
}

/** TagsInput composto: Root(value, onValueChange) > Label + Item(ItemDelete)[] + Input. Enter/vírgula adiciona; Backspace com campo vazio apaga a última. */
export const TagsInput = Object.assign(TagsInputRoot, { Root: TagsInputRoot, Label: TagsInputLabel, Item: TagsInputItem, ItemDelete: TagsInputItemDelete, Input: TagsInputInput });
export { TagsInputRoot, TagsInputLabel, TagsInputItem, TagsInputItemDelete, TagsInputInput };
