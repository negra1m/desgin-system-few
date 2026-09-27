"use client";
import type { ComponentProps } from 'react';
import type { Size } from '@fewcompany/core';
import { Slot } from '../../lib/slot.js';
import { createContext } from '../../lib/context.js';
import { cx } from '../../lib/cx.js';

interface EmptyStateContextValue { size: Size }
const [EmptyStateProvider, useEmptyState] = createContext<EmptyStateContextValue>('EmptyState');
void useEmptyState;

export interface EmptyStateProps extends ComponentProps<'div'> { asChild?: boolean; size?: Size }
function EmptyStateRoot({ asChild, size = 'md', className, ...props }: EmptyStateProps) {
  const Comp = asChild ? Slot : 'div';
  return (
    <EmptyStateProvider value={{ size }}>
      <Comp {...props} className={cx('few-empty', `few-empty--${size}`, className)} data-size={size} />
    </EmptyStateProvider>
  );
}

export interface EmptyStateIconProps extends ComponentProps<'span'> { asChild?: boolean }
function EmptyStateIcon({ asChild, className, children, ...props }: EmptyStateIconProps) {
  const Comp = asChild ? Slot : 'span';
  return <Comp {...props} aria-hidden="true" className={cx('few-empty-icon', className)}>{children ?? '↗'}</Comp>;
}

export interface EmptyStateTitleProps extends ComponentProps<'h3'> { asChild?: boolean }
function EmptyStateTitle({ asChild, className, ...props }: EmptyStateTitleProps) {
  const Comp = asChild ? Slot : 'h3';
  return <Comp {...props} className={cx('few-empty-title', className)} />;
}

export interface EmptyStateDescriptionProps extends ComponentProps<'p'> { asChild?: boolean }
function EmptyStateDescription({ asChild, className, ...props }: EmptyStateDescriptionProps) {
  const Comp = asChild ? Slot : 'p';
  return <Comp {...props} className={cx('few-empty-description', 'few-muted', className)} />;
}

export interface EmptyStateActionsProps extends ComponentProps<'div'> { asChild?: boolean }
function EmptyStateActions({ asChild, className, ...props }: EmptyStateActionsProps) {
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} className={cx('few-empty-actions', className)} />;
}

/** EmptyState composto: <EmptyState><EmptyState.Icon /><EmptyState.Title>…</EmptyState.Title><EmptyState.Description>…</EmptyState.Description><EmptyState.Actions>…</EmptyState.Actions></EmptyState> */
export const EmptyState = Object.assign(EmptyStateRoot, { Root: EmptyStateRoot, Icon: EmptyStateIcon, Title: EmptyStateTitle, Description: EmptyStateDescription, Actions: EmptyStateActions });
export { EmptyStateRoot, EmptyStateIcon, EmptyStateTitle, EmptyStateDescription, EmptyStateActions };
