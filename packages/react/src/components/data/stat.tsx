"use client";
// Stat: substitui o MetricCard antigo (git show HEAD:packages/ui/src/index.tsx). MetricCard fica como atalho @deprecated.
import type { ComponentProps } from 'react';
import type { Tone } from '@fewcompany/core';
import { Slot, Slottable } from '../../lib/slot.js';
import { cx } from '../../lib/cx.js';

export interface StatProps extends ComponentProps<'div'> { asChild?: boolean; tone?: Tone }
function StatRoot({ asChild, tone = 'neutral', className, ...props }: StatProps) {
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} className={cx('few-stat', className)} data-tone={tone} />;
}

export interface StatLabelProps extends ComponentProps<'p'> { asChild?: boolean }
function StatLabel({ asChild, className, ...props }: StatLabelProps) {
  const Comp = asChild ? Slot : 'p';
  return <Comp {...props} className={cx('few-stat-label', 'few-label', className)} />;
}

export interface StatValueProps extends ComponentProps<'p'> { asChild?: boolean }
function StatValue({ asChild, className, ...props }: StatValueProps) {
  const Comp = asChild ? Slot : 'p';
  return <Comp {...props} className={cx('few-stat-value', className)} />;
}

export interface StatChangeProps extends ComponentProps<'span'> { asChild?: boolean; direction?: 'up' | 'down' | 'flat'; tone?: Tone }
function StatChange({ asChild, direction = 'flat', tone, className, children, ...props }: StatChangeProps) {
  const resolvedTone = tone ?? (direction === 'up' ? 'success' : direction === 'down' ? 'danger' : 'neutral');
  const arrow = direction === 'up' ? '↑' : direction === 'down' ? '↓' : '→';
  const Comp = asChild ? Slot : 'span';
  return <Comp {...props} className={cx('few-stat-change', className)} data-direction={direction} data-tone={resolvedTone}>
    <span aria-hidden="true" className="few-stat-change-icon">{arrow}</span>
    <Slottable>{children}</Slottable>
  </Comp>;
}

export interface StatDescriptionProps extends ComponentProps<'p'> { asChild?: boolean }
function StatDescription({ asChild, className, ...props }: StatDescriptionProps) {
  const Comp = asChild ? Slot : 'p';
  return <Comp {...props} className={cx('few-stat-description', 'few-muted', className)} />;
}

export interface StatIconProps extends ComponentProps<'span'> { asChild?: boolean }
function StatIcon({ asChild, className, ...props }: StatIconProps) {
  const Comp = asChild ? Slot : 'span';
  return <Comp {...props} aria-hidden="true" className={cx('few-stat-icon', className)} />;
}

/** Stat composto: <Stat tone="success"><Stat.Label/><Stat.Value/><Stat.Change direction="up"/></Stat> */
export const Stat = Object.assign(StatRoot, { Root: StatRoot, Label: StatLabel, Value: StatValue, Change: StatChange, Description: StatDescription, Icon: StatIcon });
export { StatRoot, StatLabel, StatValue, StatChange, StatDescription, StatIcon };

export interface MetricCardProps { label: string; value: string; change?: string; tone?: Tone; className?: string }
/** @deprecated Use `Stat` (Root/Label/Value/Change) diretamente. Mantido para compatibilidade com o MetricCard antigo. */
export function MetricCard({ label, value, change, tone = 'neutral', className }: MetricCardProps) {
  const direction = tone === 'success' ? 'up' : tone === 'danger' ? 'down' : 'flat';
  return <StatRoot tone={tone} className={className}>
    <StatLabel>{label}</StatLabel>
    <StatValue>{value}</StatValue>
    {change && <StatChange direction={direction} tone={tone}>{change}</StatChange>}
  </StatRoot>;
}
