"use client";
import type { ComponentProps } from 'react';
import type { Size } from '@fewcompany/core';
import { cx, dataAttr } from '../../lib/cx.js';

export interface NativeSelectProps extends Omit<ComponentProps<'select'>, 'size'> { size?: Size; invalid?: boolean }
/** <select> nativo com chevron. Composto internamente; asChild não é necessário (não há elemento único para trocar). */
export function NativeSelect({ size = 'md', invalid, className, children, ...props }: NativeSelectProps) {
  return (
    <span className={cx('few-native-select', `few-native-select--${size}`, className)} data-invalid={dataAttr(invalid)} data-disabled={dataAttr(props.disabled)}>
      <select {...props} className="few-native-select-control" aria-invalid={invalid || (props['aria-invalid'] && props['aria-invalid'] !== 'false') || undefined}>{children}</select>
      <svg aria-hidden="true" viewBox="0 0 20 20" className="few-native-select-chevron">
        <path d="M5 7.5l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
