"use client";
import type { ComponentProps } from 'react';
import { clamp, progressPercent, progressValueText, type Tone, type Size } from '@fewcompany/core';
import { Slot } from '../../lib/slot.js';
import { createContext } from '../../lib/context.js';
import { cx } from '../../lib/cx.js';

const SIZE_PX: Record<Size, number> = { sm: 32, md: 48, lg: 64 };
const THICKNESS_PX: Record<Size, number> = { sm: 3, md: 4, lg: 5 };

interface ProgressCircleContextValue { percent: number | null; size: number; thickness: number }
const [ProgressCircleProvider, useProgressCircle] = createContext<ProgressCircleContextValue>('ProgressCircle');

export interface ProgressCircleRootProps extends ComponentProps<'div'> {
  asChild?: boolean;
  /** null = indeterminado (gira sem valor conhecido). */
  value?: number | null;
  max?: number;
  size?: Size | number;
  /** Espessura do traço em px. Padrão calculado a partir do size. */
  thickness?: number;
  tone?: Tone;
  valueText?: string;
}
function ProgressCircleRoot({ asChild, value = 0, max = 100, size = 'md', thickness, tone = 'info', valueText, className, style, ...props }: ProgressCircleRootProps) {
  const percent = progressPercent(value, max);
  const now = value === null ? undefined : clamp(value, 0, max);
  const resolvedSize = typeof size === 'number' ? size : SIZE_PX[size];
  const resolvedThickness = thickness ?? (typeof size === 'number' ? Math.max(2, Math.round(resolvedSize / 12)) : THICKNESS_PX[size]);
  const Comp = asChild ? Slot : 'div';
  return (
    <ProgressCircleProvider value={{ percent, size: resolvedSize, thickness: resolvedThickness }}>
      <Comp
        {...props}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={now}
        aria-valuetext={valueText ?? progressValueText(percent)}
        className={cx('few-progress-circle', `few-tone--${tone}`, className)}
        data-tone={tone}
        data-state={value === null ? 'indeterminate' : 'determinate'}
        style={{ width: resolvedSize, height: resolvedSize, ...style }}
      />
    </ProgressCircleProvider>
  );
}

// Sem asChild aqui: SlotProps só aceita HTMLElement (ref e handlers), e <svg> é SVGSVGElement — não
// há como repassar via Slot sem quebrar o tipo. A troca de tag fica no Root (div), que aceita Slot normalmente.
export interface ProgressCircleCircleProps extends ComponentProps<'svg'> {}
function ProgressCircleCircle({ className, ...props }: ProgressCircleCircleProps) {
  const { percent, size, thickness } = useProgressCircle('ProgressCircle.Circle');
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const indeterminate = percent === null;
  const dash = indeterminate ? circumference * 0.25 : (circumference * percent) / 100;
  const center = size / 2;
  return (
    <svg
      {...props}
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      aria-hidden="true"
      className={cx('few-progress-circle-svg', className)}
      data-state={indeterminate ? 'indeterminate' : 'determinate'}
    >
      <circle className="few-progress-circle-track" cx={center} cy={center} r={radius} strokeWidth={thickness} fill="none" />
      <circle
        className="few-progress-circle-indicator"
        cx={center}
        cy={center}
        r={radius}
        strokeWidth={thickness}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference - dash}`}
        transform={`rotate(-90 ${center} ${center})`}
      />
    </svg>
  );
}

export interface ProgressCircleLabelProps extends ComponentProps<'span'> { asChild?: boolean }
function ProgressCircleLabel({ asChild, className, children, ...props }: ProgressCircleLabelProps) {
  const { percent } = useProgressCircle('ProgressCircle.Label');
  const Comp = asChild ? Slot : 'span';
  return <Comp {...props} className={cx('few-progress-circle-label', className)}>{children ?? progressValueText(percent) ?? ''}</Comp>;
}

/** ProgressCircle composto: <ProgressCircle value={72}><ProgressCircle.Circle /><ProgressCircle.Label /></ProgressCircle> */
export const ProgressCircle = Object.assign(ProgressCircleRoot, { Root: ProgressCircleRoot, Circle: ProgressCircleCircle, Label: ProgressCircleLabel });
export { ProgressCircleRoot, ProgressCircleCircle, ProgressCircleLabel };
