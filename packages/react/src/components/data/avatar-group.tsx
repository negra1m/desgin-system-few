"use client";
// AvatarGroup: empilha Avatars e mostra "+N" a partir de `max` (ver docs/composition.md).
import { Children, isValidElement, type ComponentProps, type CSSProperties } from 'react';
import type { Size } from '@fewcompany/core';
import { Slot } from '../../lib/slot.js';
import { createContext } from '../../lib/context.js';
import { cx } from '../../lib/cx.js';

interface AvatarGroupContextValue { max?: number; total: number; size: Size | 'xl' }
const [AvatarGroupProvider, useAvatarGroupCtx] = createContext<AvatarGroupContextValue>('AvatarGroup');

export interface AvatarGroupProps extends ComponentProps<'div'> { asChild?: boolean; max?: number; size?: Size | 'xl'; spacing?: string | number }
function AvatarGroupRoot({ asChild, max, size = 'md', spacing, style, className, children, ...props }: AvatarGroupProps) {
  const all = Children.toArray(children);
  const items = all.filter(child => !(isValidElement(child) && child.type === AvatarGroupOverflow));
  const overflowNode = all.find(child => isValidElement(child) && child.type === AvatarGroupOverflow);
  const total = items.length;
  const visible = typeof max === 'number' ? items.slice(0, max) : items;
  const mergedStyle = { ...(spacing !== undefined ? { '--few-avatar-group-spacing': typeof spacing === 'number' ? `${spacing}px` : spacing } : null), ...style } as CSSProperties;
  const Comp = asChild ? Slot : 'div';
  return <AvatarGroupProvider value={{ max, total, size }}>
    <Comp {...props} role="group" style={mergedStyle} className={cx('few-avatar-group', className)} data-size={size}>
      {visible}
      {overflowNode}
    </Comp>
  </AvatarGroupProvider>;
}

export interface AvatarGroupOverflowProps extends ComponentProps<'span'> { asChild?: boolean }
function AvatarGroupOverflow({ asChild, className, children, ...props }: AvatarGroupOverflowProps) {
  const { max, total, size } = useAvatarGroupCtx('AvatarGroup.Overflow');
  const extra = typeof max === 'number' ? total - max : 0;
  if (extra <= 0) return null;
  const Comp = asChild ? Slot : 'span';
  return <Comp {...props} className={cx('few-avatar', 'few-avatar-group-overflow', className)} data-size={size}>{children ?? `+${extra}`}</Comp>;
}

/** AvatarGroup composto: <AvatarGroup.Root max={3}>{avatars}<AvatarGroup.Overflow/></AvatarGroup.Root> */
export const AvatarGroup = Object.assign(AvatarGroupRoot, { Root: AvatarGroupRoot, Overflow: AvatarGroupOverflow });
export { AvatarGroupRoot, AvatarGroupOverflow };
