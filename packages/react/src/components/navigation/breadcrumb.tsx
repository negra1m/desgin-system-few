"use client";
import type { ComponentProps } from 'react';
import { Slot } from '../../lib/slot.js';
import { cx } from '../../lib/cx.js';

export interface BreadcrumbProps extends ComponentProps<'nav'> { asChild?: boolean }
function BreadcrumbRoot({ asChild, className, 'aria-label': ariaLabel = 'Trilha', ...props }: BreadcrumbProps) {
  const Comp = asChild ? Slot : 'nav';
  return <Comp {...props} aria-label={ariaLabel} className={cx('few-breadcrumb', className)} />;
}

export interface BreadcrumbListProps extends ComponentProps<'ol'> { asChild?: boolean }
function BreadcrumbList({ asChild, className, ...props }: BreadcrumbListProps) {
  const Comp = asChild ? Slot : 'ol';
  return <Comp {...props} className={cx('few-breadcrumb-list', className)} />;
}

export interface BreadcrumbItemProps extends ComponentProps<'li'> { asChild?: boolean }
function BreadcrumbItem({ asChild, className, ...props }: BreadcrumbItemProps) {
  const Comp = asChild ? Slot : 'li';
  return <Comp {...props} className={cx('few-breadcrumb-item', className)} />;
}

/** Link de um nível intermediário. Use asChild para compor com o Link do Next (`<Breadcrumb.Link asChild><Link href="/">Início</Link></Breadcrumb.Link>`). */
export interface BreadcrumbLinkProps extends ComponentProps<'a'> { asChild?: boolean }
function BreadcrumbLink({ asChild, className, ...props }: BreadcrumbLinkProps) {
  const Comp = asChild ? Slot : 'a';
  return <Comp {...props} className={cx('few-breadcrumb-link', className)} />;
}

/** Página atual: não é um link navegável, é anunciada via aria-current="page". */
export interface BreadcrumbPageProps extends ComponentProps<'span'> { asChild?: boolean }
function BreadcrumbPage({ asChild, className, ...props }: BreadcrumbPageProps) {
  const Comp = asChild ? Slot : 'span';
  return <Comp {...props} role="link" aria-disabled="true" aria-current="page" className={cx('few-breadcrumb-page', className)} />;
}

export interface BreadcrumbSeparatorProps extends ComponentProps<'span'> { asChild?: boolean }
function BreadcrumbSeparator({ asChild, className, children, ...props }: BreadcrumbSeparatorProps) {
  const Comp = asChild ? Slot : 'span';
  return <Comp {...props} role="presentation" aria-hidden="true" className={cx('few-breadcrumb-separator', className)}>{children ?? '/'}</Comp>;
}

export interface BreadcrumbEllipsisProps extends ComponentProps<'span'> { asChild?: boolean }
function BreadcrumbEllipsis({ asChild, className, children, ...props }: BreadcrumbEllipsisProps) {
  const Comp = asChild ? Slot : 'span';
  return <Comp {...props} role="presentation" aria-hidden="true" className={cx('few-breadcrumb-ellipsis', className)}>{children ?? '…'}</Comp>;
}

/** Breadcrumb composto: <Breadcrumb><Breadcrumb.List><Breadcrumb.Item><Breadcrumb.Link href="/">Início</Breadcrumb.Link></Breadcrumb.Item><Breadcrumb.Separator /><Breadcrumb.Item><Breadcrumb.Page>Atual</Breadcrumb.Page></Breadcrumb.Item></Breadcrumb.List></Breadcrumb> */
export const Breadcrumb = Object.assign(BreadcrumbRoot, { Root: BreadcrumbRoot, List: BreadcrumbList, Item: BreadcrumbItem, Link: BreadcrumbLink, Page: BreadcrumbPage, Separator: BreadcrumbSeparator, Ellipsis: BreadcrumbEllipsis });
export { BreadcrumbRoot, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis };
