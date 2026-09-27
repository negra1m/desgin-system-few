"use client";
import type { ComponentProps, CSSProperties } from 'react';
import { clamp, progressPercent, progressValueText, type Tone, type Size } from '@fewcompany/core';
import { Slot } from '../../lib/slot.js';
import { createContext } from '../../lib/context.js';
import { cx } from '../../lib/cx.js';

interface ProgressContextValue { percent: number | null }
const [ProgressProvider, useProgress] = createContext<ProgressContextValue>('Progress');

export interface ProgressRootProps extends ComponentProps<'div'> {
  asChild?: boolean;
  /** null = indeterminado (sem valor conhecido). */
  value?: number | null;
  max?: number;
  size?: Size;
  tone?: Tone;
  /** Sobrescreve o aria-valuetext padrão ("72%"). */
  valueText?: string;
}
function ProgressRoot({ asChild, value = 0, max = 100, size = 'md', tone = 'info', valueText, className, ...props }: ProgressRootProps) {
  const percent = progressPercent(value, max);
  const now = value === null ? undefined : clamp(value, 0, max);
  const Comp = asChild ? Slot : 'div';
  return (
    <ProgressProvider value={{ percent }}>
      <Comp
        {...props}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={now}
        aria-valuetext={valueText ?? progressValueText(percent)}
        className={cx('few-progress', `few-tone--${tone}`, `few-progress--${size}`, className)}
        data-tone={tone}
        data-size={size}
        data-state={value === null ? 'indeterminate' : 'determinate'}
      />
    </ProgressProvider>
  );
}

export interface ProgressTrackProps extends ComponentProps<'div'> { asChild?: boolean }
function ProgressTrack({ asChild, className, ...props }: ProgressTrackProps) {
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} className={cx('few-progress-track', className)} />;
}

export interface ProgressIndicatorProps extends ComponentProps<'div'> { asChild?: boolean }
function ProgressIndicator({ asChild, className, style, ...props }: ProgressIndicatorProps) {
  const { percent } = useProgress('Progress.Indicator');
  const Comp = asChild ? Slot : 'div';
  const width: CSSProperties = percent === null ? {} : { width: `${percent}%` };
  return (
    <Comp
      {...props}
      className={cx('few-progress-indicator', className)}
      data-state={percent === null ? 'indeterminate' : 'determinate'}
      style={{ ...width, ...style }}
    />
  );
}

export interface ProgressLabelProps extends ComponentProps<'span'> { asChild?: boolean }
function ProgressLabel({ asChild, className, ...props }: ProgressLabelProps) {
  const Comp = asChild ? Slot : 'span';
  return <Comp {...props} className={cx('few-progress-label', className)} />;
}

export interface ProgressValueProps extends ComponentProps<'span'> { asChild?: boolean }
function ProgressValue({ asChild, className, children, ...props }: ProgressValueProps) {
  const { percent } = useProgress('Progress.Value');
  const Comp = asChild ? Slot : 'span';
  return <Comp {...props} className={cx('few-progress-value', className)}>{children ?? progressValueText(percent) ?? ''}</Comp>;
}

/** Progress composto: <Progress value={72}><Progress.Label>Perfil</Progress.Label><Progress.Track><Progress.Indicator /></Progress.Track><Progress.Value /></Progress> */
export const Progress = Object.assign(ProgressRoot, { Root: ProgressRoot, Track: ProgressTrack, Indicator: ProgressIndicator, Label: ProgressLabel, Value: ProgressValue });
export { ProgressRoot, ProgressTrack, ProgressIndicator, ProgressLabel, ProgressValue };
