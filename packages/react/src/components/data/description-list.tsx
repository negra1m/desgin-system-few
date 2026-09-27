"use client";
// DescriptionList: pares termo/detalhe (ver docs/composition.md).
import type { ComponentProps, CSSProperties } from 'react';
import { Slot } from '../../lib/slot.js';
import { cx } from '../../lib/cx.js';

export interface DescriptionListProps extends ComponentProps<'dl'> { asChild?: boolean; layout?: 'vertical' | 'horizontal'; columns?: number }
function DescriptionListRoot({ asChild, layout = 'vertical', columns = 1, style, className, ...props }: DescriptionListProps) {
  const Comp = asChild ? Slot : 'dl';
  const mergedStyle = { ...(columns > 1 ? { '--few-dl-columns': columns } : null), ...style } as CSSProperties;
  return <Comp {...props} style={mergedStyle} className={cx('few-description-list', className)} data-layout={layout} />;
}

export interface DescriptionListItemProps extends ComponentProps<'div'> { asChild?: boolean }
function DescriptionListItem({ asChild, className, ...props }: DescriptionListItemProps) {
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} className={cx('few-description-list-item', className)} />;
}

export interface DescriptionListTermProps extends ComponentProps<'dt'> { asChild?: boolean }
function DescriptionListTerm({ asChild, className, ...props }: DescriptionListTermProps) {
  const Comp = asChild ? Slot : 'dt';
  return <Comp {...props} className={cx('few-description-list-term', className)} />;
}

export interface DescriptionListDetailsProps extends ComponentProps<'dd'> { asChild?: boolean }
function DescriptionListDetails({ asChild, className, ...props }: DescriptionListDetailsProps) {
  const Comp = asChild ? Slot : 'dd';
  return <Comp {...props} className={cx('few-description-list-details', className)} />;
}

/** DescriptionList composto: <DescriptionList><DescriptionList.Item><DescriptionList.Term/><DescriptionList.Details/></DescriptionList.Item></DescriptionList> */
export const DescriptionList = Object.assign(DescriptionListRoot, { Root: DescriptionListRoot, Item: DescriptionListItem, Term: DescriptionListTerm, Details: DescriptionListDetails });
export { DescriptionListRoot, DescriptionListItem, DescriptionListTerm, DescriptionListDetails };
