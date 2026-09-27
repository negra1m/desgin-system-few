"use client";
// Table: primitiva composta de tabela acessível (ver docs/composition.md). DataTable é o atalho orientado a dados sobre esta base.
import type { ComponentProps, ReactNode } from 'react';
import { Slot } from '../../lib/slot.js';
import { cx, dataAttr } from '../../lib/cx.js';

export interface TableProps extends ComponentProps<'div'> {
  asChild?: boolean;
  /** Densidade do espaçamento de células. */
  density?: 'compact' | 'comfortable';
  /** Zebra nas linhas do corpo. */
  striped?: boolean;
  /** Fixa o cabeçalho ao rolar verticalmente. */
  stickyHeader?: boolean;
}
/**
 * Wrapper com rolagem horizontal (`role="region"`, focável) + `<table>`.
 * `asChild` aplica os atributos do wrapper diretamente na `<table>` (sem a div de rolagem) —
 * útil quando a tabela já vive dentro de um contêiner com overflow próprio.
 */
function TableRoot({ asChild, density = 'comfortable', striped = false, stickyHeader = false, className, children, ...props }: TableProps) {
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} role="region" tabIndex={0} className={cx('few-table-root', className)} data-density={density}>
    <table className={cx('few-table', striped && 'few-table--striped')} data-density={density} data-sticky-header={dataAttr(stickyHeader)}>{children}</table>
  </Comp>;
}

export interface TableCaptionProps extends ComponentProps<'caption'> { asChild?: boolean }
function TableCaption({ asChild, className, ...props }: TableCaptionProps) {
  const Comp = asChild ? Slot : 'caption';
  return <Comp {...props} className={cx('few-table-caption', className)} />;
}

export interface TableHeaderProps extends ComponentProps<'thead'> { asChild?: boolean }
function TableHeader({ asChild, className, ...props }: TableHeaderProps) {
  const Comp = asChild ? Slot : 'thead';
  return <Comp {...props} className={cx('few-table-header', className)} />;
}

export interface TableBodyProps extends ComponentProps<'tbody'> { asChild?: boolean }
function TableBody({ asChild, className, ...props }: TableBodyProps) {
  const Comp = asChild ? Slot : 'tbody';
  return <Comp {...props} className={cx('few-table-body', className)} />;
}

export interface TableFooterProps extends ComponentProps<'tfoot'> { asChild?: boolean }
function TableFooter({ asChild, className, ...props }: TableFooterProps) {
  const Comp = asChild ? Slot : 'tfoot';
  return <Comp {...props} className={cx('few-table-footer', className)} />;
}

export interface TableRowProps extends ComponentProps<'tr'> { asChild?: boolean; selected?: boolean }
function TableRow({ asChild, selected, className, ...props }: TableRowProps) {
  const Comp = asChild ? Slot : 'tr';
  return <Comp {...props} className={cx('few-table-row', className)} data-state={selected ? 'selected' : undefined} aria-selected={selected || undefined} />;
}

export interface TableHeadProps extends ComponentProps<'th'> {
  asChild?: boolean;
  numeric?: boolean;
  /** Ativa o botão interno de ordenação. Ignora `asChild` (o `<th>` precisa do `scope`). */
  sortable?: boolean;
  sortDirection?: 'ascending' | 'descending' | 'none';
  onSort?: () => void;
}
function TableHead({ asChild, numeric, sortable = false, sortDirection = 'none', onSort, className, children, ...props }: TableHeadProps) {
  const Comp = asChild && !sortable ? Slot : 'th';
  return <Comp {...props} scope="col" aria-sort={sortable ? sortDirection : undefined} data-numeric={dataAttr(numeric)} className={cx('few-table-head', className)}>
    {sortable
      ? <button type="button" className="few-table-sort" onClick={onSort} data-direction={sortDirection}>
          <span>{children}</span><span aria-hidden="true" className="few-table-sort-icon" />
        </button>
      : children}
  </Comp>;
}

export interface TableCellProps extends ComponentProps<'td'> { asChild?: boolean; numeric?: boolean }
function TableCell({ asChild, numeric, className, ...props }: TableCellProps) {
  const Comp = asChild ? Slot : 'td';
  return <Comp {...props} data-numeric={dataAttr(numeric)} className={cx('few-table-cell', className)} />;
}

export interface TableEmptyProps extends ComponentProps<'tr'> { asChild?: boolean; colSpan: number; children?: ReactNode }
function TableEmpty({ asChild, colSpan, className, children, ...props }: TableEmptyProps) {
  const Comp = asChild ? Slot : 'tr';
  return <Comp {...props} className={cx('few-table-empty', className)}><td colSpan={colSpan} className="few-table-empty-cell">{children}</td></Comp>;
}

/** Table composto: <Table.Root><Table.Caption/><Table.Header>…</Table.Header><Table.Body>…</Table.Body></Table.Root> */
export const Table = Object.assign(TableRoot, { Root: TableRoot, Caption: TableCaption, Header: TableHeader, Body: TableBody, Footer: TableFooter, Row: TableRow, Head: TableHead, Cell: TableCell, Empty: TableEmpty });
export { TableRoot, TableCaption, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableEmpty };
