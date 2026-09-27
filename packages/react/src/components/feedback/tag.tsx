"use client";
import type { ComponentProps, KeyboardEvent, MouseEvent } from 'react';
import type { Tone } from '@fewcompany/core';
import { Slot } from '../../lib/slot.js';
import { createContext } from '../../lib/context.js';
import { cx, dataAttr } from '../../lib/cx.js';

export type TagVariant = 'solid' | 'soft' | 'outline';
export type TagSize = 'sm' | 'md';
interface TagContextValue { tone: Tone; variant: TagVariant; size: TagSize }
const [TagProvider, useTag] = createContext<TagContextValue>('Tag');
void useTag;

export interface TagRootProps extends Omit<ComponentProps<'span'>, 'onClick'> {
  asChild?: boolean;
  tone?: Tone;
  variant?: TagVariant;
  size?: TagSize;
  /** Presente = tag interativa (role="button", teclado Enter/Espaço). */
  onClick?: (event: MouseEvent<HTMLSpanElement> | KeyboardEvent<HTMLSpanElement>) => void;
}
function TagRoot({ asChild, tone = 'neutral', variant = 'soft', size = 'md', className, onClick, onKeyDown, ...props }: TagRootProps) {
  const interactive = Boolean(onClick);
  const Comp = asChild ? Slot : 'span';
  function handleKeyDown(event: KeyboardEvent<HTMLSpanElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented || !interactive) return;
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onClick?.(event); }
  }
  return (
    <TagProvider value={{ tone, variant, size }}>
      <Comp
        {...props}
        className={cx('few-tag', `few-tone--${tone}`, `few-tag--${variant}`, `few-tag--${size}`, className)}
        data-tone={tone}
        data-variant={variant}
        data-interactive={dataAttr(interactive)}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        onClick={onClick}
        onKeyDown={handleKeyDown}
      />
    </TagProvider>
  );
}

export interface TagLabelProps extends ComponentProps<'span'> { asChild?: boolean }
function TagLabel({ asChild, className, ...props }: TagLabelProps) {
  const Comp = asChild ? Slot : 'span';
  return <Comp {...props} className={cx('few-tag-label', className)} />;
}

export interface TagIconProps extends ComponentProps<'span'> { asChild?: boolean }
function TagIcon({ asChild, className, ...props }: TagIconProps) {
  const Comp = asChild ? Slot : 'span';
  return <Comp {...props} aria-hidden="true" className={cx('few-tag-icon', className)} />;
}

export interface TagCloseProps extends ComponentProps<'button'> {
  asChild?: boolean;
  onRemove?: () => void;
  /** Texto da tag, usado no aria-label padrão ("Remover {label}") quando aria-label não é passado. */
  label?: string;
}
function TagClose({ asChild, className, children, onClick, onRemove, label, 'aria-label': ariaLabel, ...props }: TagCloseProps) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      {...props}
      type="button"
      aria-label={ariaLabel ?? (label ? `Remover ${label}` : 'Remover')}
      className={cx('few-tag-close', className)}
      onClick={(event) => { onClick?.(event); if (!event.defaultPrevented) onRemove?.(); }}
    >
      {children ?? <span aria-hidden="true">×</span>}
    </Comp>
  );
}

/** Tag composto (chip removível): <Tag><Tag.Label>React</Tag.Label><Tag.Close label="React" onRemove={...} /></Tag> */
export const Tag = Object.assign(TagRoot, { Root: TagRoot, Label: TagLabel, Icon: TagIcon, Close: TagClose });
export { TagRoot, TagLabel, TagIcon, TagClose };
