"use client";
import type { ComponentProps, MouseEvent } from 'react';
import { paginationRange } from '@fewcompany/core';
import { Slot } from '../../lib/slot.js';
import { createContext } from '../../lib/context.js';
import { useControllableState } from '../../lib/use-controllable-state.js';
import { cx, dataAttr } from '../../lib/cx.js';

interface PaginationContextValue { page: number; setPage: (page: number) => void; total: number; siblings: number }
const [PaginationProvider, usePagination, useOptionalPagination] = createContext<PaginationContextValue>('Pagination');

export interface PaginationProps extends Omit<ComponentProps<'nav'>, 'defaultValue'> {
  asChild?: boolean;
  /** Página atual (1-based). */
  page?: number; defaultPage?: number; onPageChange?: (page: number) => void;
  /** Total de páginas; quando > 0, Pagination.List se auto-preenche com paginationRange. */
  total?: number;
  /** Páginas vizinhas mostradas de cada lado da atual. */
  siblings?: number;
}
function PaginationRoot({ asChild, page: pageProp, defaultPage = 1, onPageChange, total = 0, siblings = 1, className, 'aria-label': ariaLabel = 'Paginação', ...props }: PaginationProps) {
  const [page, setPage] = useControllableState({ value: pageProp, defaultValue: defaultPage, onChange: onPageChange });
  const Comp = asChild ? Slot : 'nav';
  return <PaginationProvider value={{ page, setPage, total, siblings }}>
    <Comp {...props} aria-label={ariaLabel} className={cx('few-pagination', className)} />
  </PaginationProvider>;
}

/** Lista de páginas. Sem children, se auto-preenche a partir de total/siblings (paginationRange). Com children, composição manual. */
export interface PaginationListProps extends ComponentProps<'ul'> { asChild?: boolean }
function PaginationList({ asChild, className, children, ...props }: PaginationListProps) {
  const { page, total, siblings } = usePagination('Pagination.List');
  const Comp = asChild ? Slot : 'ul';
  const content = children ?? (total > 0 ? paginationRange(page, total, siblings).map((entry, index) => (
    <PaginationItem key={entry === 'ellipsis' ? `ellipsis-${index}` : entry}>
      {entry === 'ellipsis' ? <PaginationEllipsis /> : <PaginationLink page={entry} isActive={entry === page}>{entry}</PaginationLink>}
    </PaginationItem>
  )) : null);
  return <Comp {...props} className={cx('few-pagination-list', className)}>{content}</Comp>;
}

export interface PaginationItemProps extends ComponentProps<'li'> { asChild?: boolean }
function PaginationItem({ asChild, className, ...props }: PaginationItemProps) {
  const Comp = asChild ? Slot : 'li';
  return <Comp {...props} className={cx('few-pagination-item', className)} />;
}

export interface PaginationLinkProps extends ComponentProps<'a'> { asChild?: boolean; isActive?: boolean; page?: number }
function PaginationLink({ asChild, isActive, page, className, href, onClick, ...props }: PaginationLinkProps) {
  const pagination = useOptionalPagination();
  const active = isActive ?? (page !== undefined && pagination?.page === page);
  const Comp = asChild ? Slot : 'a';
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    event.preventDefault();
    if (page !== undefined) pagination?.setPage(page);
  }
  return <Comp {...props} href={href ?? '#'} aria-current={active ? 'page' : undefined} data-state={active ? 'active' : undefined} className={cx('few-pagination-link', className)} onClick={handleClick} />;
}

export interface PaginationPreviousProps extends ComponentProps<'a'> { asChild?: boolean }
function PaginationPrevious({ asChild, className, href, onClick, 'aria-label': ariaLabel = 'Página anterior', children, ...props }: PaginationPreviousProps) {
  const pagination = useOptionalPagination();
  const disabled = pagination ? pagination.page <= 1 : false;
  const Comp = asChild ? Slot : 'a';
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    event.preventDefault();
    if (!pagination || disabled) return;
    pagination.setPage(pagination.page - 1);
  }
  return <Comp {...props} href={href ?? '#'} aria-label={ariaLabel} aria-disabled={disabled ? true : undefined} data-disabled={dataAttr(disabled)} className={cx('few-pagination-previous', className)} onClick={handleClick}>{children ?? '‹ Anterior'}</Comp>;
}

export interface PaginationNextProps extends ComponentProps<'a'> { asChild?: boolean }
function PaginationNext({ asChild, className, href, onClick, 'aria-label': ariaLabel = 'Próxima página', children, ...props }: PaginationNextProps) {
  const pagination = useOptionalPagination();
  const disabled = pagination ? pagination.total > 0 && pagination.page >= pagination.total : false;
  const Comp = asChild ? Slot : 'a';
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    event.preventDefault();
    if (!pagination || disabled) return;
    pagination.setPage(pagination.page + 1);
  }
  return <Comp {...props} href={href ?? '#'} aria-label={ariaLabel} aria-disabled={disabled ? true : undefined} data-disabled={dataAttr(disabled)} className={cx('few-pagination-next', className)} onClick={handleClick}>{children ?? 'Próxima ›'}</Comp>;
}

export interface PaginationEllipsisProps extends ComponentProps<'span'> { asChild?: boolean }
function PaginationEllipsis({ asChild, className, children, ...props }: PaginationEllipsisProps) {
  const Comp = asChild ? Slot : 'span';
  return <Comp {...props} aria-hidden="true" className={cx('few-pagination-ellipsis', className)}>{children ?? '…'}</Comp>;
}

/** Pagination composto: <Pagination page={page} onPageChange={setPage} total={12}><Pagination.Previous /><Pagination.List /><Pagination.Next /></Pagination> */
export const Pagination = Object.assign(PaginationRoot, { Root: PaginationRoot, List: PaginationList, Item: PaginationItem, Link: PaginationLink, Previous: PaginationPrevious, Next: PaginationNext, Ellipsis: PaginationEllipsis });
export { PaginationRoot, PaginationList, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis };
