"use client";
import { useEffect, useId, useRef, type ReactNode, type ComponentProps, type CSSProperties } from 'react';
export { tokens, type FewTheme } from './tokens.js';
export { registry } from './registry.js';
const cx = (...values: (string | undefined | false)[]) => values.filter(Boolean).join(' ');
export type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

export interface ButtonProps extends ComponentProps<'button'> { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm' | 'md' | 'lg'; loading?: boolean }
export function Button({ variant = 'primary', size = 'md', loading = false, disabled, children, className, type = 'button', ...props }: ButtonProps) {
  return <button {...props} type={type} className={cx('few-button', `few-button--${variant}`, `few-button--${size}`, className)} disabled={disabled || loading} aria-busy={loading || undefined}>{loading && <span className="few-spinner" aria-hidden="true" />}{children}</button>;
}
export function Badge({ tone = 'neutral', className, children, ...props }: ComponentProps<'span'> & { tone?: Tone }) {
  return <span {...props} className={cx('few-badge', `few-tone--${tone}`, className)}><span className="few-dot" aria-hidden="true" />{children}</span>;
}
export function Card({ className, ...props }: ComponentProps<'div'>) { return <div {...props} className={cx('few-card', className)} />; }
export function CardHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) { return <div className="few-card-header"><div><h3>{title}</h3>{description && <p className="few-muted">{description}</p>}</div>{action}</div>; }
export function Input({ className, ...props }: ComponentProps<'input'>) { return <input {...props} className={cx('few-input', className)} />; }
export function Textarea({ className, ...props }: ComponentProps<'textarea'>) { return <textarea {...props} className={cx('few-input', 'few-textarea', className)} />; }
export function Select({ className, ...props }: ComponentProps<'select'>) { return <select {...props} className={cx('few-input', className)} />; }
export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: (props: { id: string; 'aria-describedby'?: string; 'aria-invalid'?: true }) => ReactNode }) {
  const id = useId();
  return <div className="few-field"><label htmlFor={id}>{label}</label>{children({ id, 'aria-describedby': error || hint ? `${id}-help` : undefined, 'aria-invalid': error ? true : undefined })}{(error || hint) && <p id={`${id}-help`} className={error ? 'few-error' : 'few-muted'} role={error ? 'alert' : undefined}>{error || hint}</p>}</div>;
}
export function Checkbox({ label, className, ...props }: Omit<ComponentProps<'input'>, 'type'> & { label: string }) { return <label className={cx('few-check', className)}><input {...props} type="checkbox" /><span>{label}</span></label>; }
export function Switch({ label, className, ...props }: Omit<ComponentProps<'input'>, 'type' | 'role'> & { label: string }) { return <label className={cx('few-switch', className)}><input {...props} type="checkbox" role="switch" /><span className="few-switch-track" aria-hidden="true" /><span>{label}</span></label>; }
export function Alert({ title, tone = 'info', children, action, className }: { title: string; tone?: Tone; children?: ReactNode; action?: ReactNode; className?: string }) { return <div className={cx('few-alert', `few-tone--${tone}`, className)} role={tone === 'danger' ? 'alert' : 'status'}><span className="few-alert-icon" aria-hidden="true">{tone === 'success' ? '✓' : tone === 'danger' ? '!' : 'i'}</span><div><strong>{title}</strong>{children && <div className="few-alert-body">{children}</div>}{action && <div className="few-alert-action">{action}</div>}</div></div>; }
export interface TabItem { id: string; label: string; content: ReactNode }
export function Tabs({ items, value, onValueChange, label = 'Abas' }: { items: TabItem[]; value: string; onValueChange: (id: string) => void; label?: string }) {
  const id = useId();
  return <div className="few-tabs"><div role="tablist" aria-label={label}>{items.map((item, index) => <button key={item.id} type="button" role="tab" id={`${id}-${item.id}`} aria-controls={`${id}-${item.id}-panel`} aria-selected={item.id === value} tabIndex={item.id === value ? 0 : -1} onClick={() => onValueChange(item.id)} onKeyDown={(event) => {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % items.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + items.length) % items.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = items.length - 1;
    else return;
    event.preventDefault(); onValueChange(items[next].id); document.getElementById(`${id}-${items[next].id}`)?.focus();
  }}>{item.label}</button>)}</div>{items.map(item => <div key={item.id} role="tabpanel" id={`${id}-${item.id}-panel`} aria-labelledby={`${id}-${item.id}`} hidden={value !== item.id} tabIndex={0}>{item.content}</div>)}</div>;
}
export function Dialog({ open, onOpenChange, title, description, children }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; description?: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null); const id = useId();
  useEffect(() => { if (open && !ref.current?.open) ref.current?.showModal(); if (!open && ref.current?.open) ref.current.close(); }, [open]);
  return <dialog ref={ref} className="few-dialog" aria-labelledby={`${id}-title`} aria-describedby={description ? `${id}-description` : undefined} onCancel={(event) => { event.preventDefault(); onOpenChange(false); }} onClose={() => onOpenChange(false)}><div className="few-card-header"><h2 id={`${id}-title`}>{title}</h2><Button variant="ghost" aria-label="Fechar diálogo" onClick={() => onOpenChange(false)}>×</Button></div>{description && <p id={`${id}-description`} className="few-muted">{description}</p>}{children}</dialog>;
}
export function MetricCard({ label, value, change, tone = 'neutral' }: { label: string; value: string; change?: string; tone?: Tone }) { return <Card><p className="few-label">{label}</p><p className="few-metric">{value}</p>{change && <Badge tone={tone}>{change}</Badge>}</Card>; }
export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) { return <div className="few-empty"><span aria-hidden="true" className="few-empty-symbol">↗</span><h3>{title}</h3><p className="few-muted">{description}</p>{action}</div>; }
export function Skeleton({ width = '100%', height = 16, className }: { width?: CSSProperties['width']; height?: CSSProperties['height']; className?: string }) { return <span aria-hidden="true" className={cx('few-skeleton', className)} style={{ width, height }} />; }
export function Progress({ value, label }: { value: number; label: string }) { const safeValue = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0)); return <div className="few-progress-wrap"><div className="few-card-header"><span>{label}</span><span>{safeValue}%</span></div><progress className="few-progress" max={100} value={safeValue} aria-label={label} /></div>; }
export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) { return <span role="img" aria-label={name} className={cx('few-avatar', `few-avatar--${size}`)}>{name.split(' ').filter(Boolean).slice(0, 2).map(word => word[0]).join('').toUpperCase()}</span>; }
export interface Column<T> { key: string; label: string; render: (row: T) => ReactNode }
export function DataTable<T>({ caption, columns, rows, rowKey, emptyMessage = 'Nenhum registro encontrado.' }: { caption: string; columns: Column<T>[]; rows: T[]; rowKey: (row: T) => string; emptyMessage?: string }) { return <div className="few-table-wrap" tabIndex={0} role="region" aria-label={caption}><table className="few-table"><caption>{caption}</caption><thead><tr>{columns.map(column => <th key={column.key} scope="col">{column.label}</th>)}</tr></thead><tbody>{rows.length ? rows.map(row => <tr key={rowKey(row)}>{columns.map(column => <td key={column.key}>{column.render(row)}</td>)}</tr>) : <tr><td colSpan={columns.length}>{emptyMessage}</td></tr>}</tbody></table></div>; }
