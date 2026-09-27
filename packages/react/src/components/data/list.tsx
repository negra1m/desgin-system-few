"use client";
// List: lista genérica composta (ver docs/composition.md).
import type { ComponentProps } from 'react';
import { Slot } from '../../lib/slot.js';
import { cx, dataAttr } from '../../lib/cx.js';

export interface ListProps extends ComponentProps<'ul'> { asChild?: boolean; ordered?: boolean; variant?: 'plain' | 'divided' | 'card'; interactive?: boolean }
function ListRoot({ asChild, ordered = false, variant = 'plain', interactive = false, className, ...props }: ListProps) {
  const Comp = asChild ? Slot : ((ordered ? 'ol' : 'ul') as 'ul');
  return <Comp {...props} className={cx('few-list', `few-list--${variant}`, className)} data-interactive={dataAttr(interactive)} />;
}

export interface ListItemProps extends ComponentProps<'li'> { asChild?: boolean; selected?: boolean; disabled?: boolean }
function ListItem({ asChild, selected, disabled, className, ...props }: ListItemProps) {
  const Comp = asChild ? Slot : 'li';
  return <Comp {...props} className={cx('few-list-item', className)} data-state={selected ? 'selected' : undefined} data-disabled={dataAttr(disabled)} aria-disabled={disabled || undefined} />;
}

export interface ListItemIconProps extends ComponentProps<'span'> { asChild?: boolean }
function ListItemIcon({ asChild, className, ...props }: ListItemIconProps) {
  const Comp = asChild ? Slot : 'span';
  return <Comp {...props} aria-hidden="true" className={cx('few-list-item-icon', className)} />;
}

export interface ListItemContentProps extends ComponentProps<'div'> { asChild?: boolean }
function ListItemContent({ asChild, className, ...props }: ListItemContentProps) {
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} className={cx('few-list-item-content', className)} />;
}

export interface ListItemTitleProps extends ComponentProps<'p'> { asChild?: boolean }
function ListItemTitle({ asChild, className, ...props }: ListItemTitleProps) {
  const Comp = asChild ? Slot : 'p';
  return <Comp {...props} className={cx('few-list-item-title', className)} />;
}

export interface ListItemDescriptionProps extends ComponentProps<'p'> { asChild?: boolean }
function ListItemDescription({ asChild, className, ...props }: ListItemDescriptionProps) {
  const Comp = asChild ? Slot : 'p';
  return <Comp {...props} className={cx('few-list-item-description', 'few-muted', className)} />;
}

export interface ListItemActionProps extends ComponentProps<'div'> { asChild?: boolean }
function ListItemAction({ asChild, className, ...props }: ListItemActionProps) {
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} className={cx('few-list-item-action', className)} />;
}

/** List composto: <List><List.Item><List.ItemContent><List.ItemTitle/></List.ItemContent></List.Item></List> */
export const List = Object.assign(ListRoot, { Root: ListRoot, Item: ListItem, ItemIcon: ListItemIcon, ItemContent: ListItemContent, ItemTitle: ListItemTitle, ItemDescription: ListItemDescription, ItemAction: ListItemAction });
export { ListRoot, ListItem, ListItemIcon, ListItemContent, ListItemTitle, ListItemDescription, ListItemAction };
