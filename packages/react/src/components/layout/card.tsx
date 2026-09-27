"use client";
// Card: ver docs/composition.md. Migra Card + CardHeader de packages/ui (git show HEAD:packages/ui/src/index.tsx) para partes compostas.
import type { ComponentProps, ElementType, ReactNode } from 'react';
import { Slot } from '../../lib/slot.js';
import { cx } from '../../lib/cx.js';

export interface CardProps extends ComponentProps<'div'> {
  asChild?: boolean;
  variant?: 'elevated' | 'outlined' | 'soft';
  padding?: 'sm' | 'md' | 'lg';
}
/** Card.Root: use asChild com <a>/<button> para um cartão clicável — hover e foco vêm do CSS por seletor de tag. */
function CardRoot({ asChild, variant = 'outlined', padding = 'md', className, ...props }: CardProps) {
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} className={cx('few-card', className)} data-variant={variant} data-padding={padding} />;
}

export interface CardHeaderPartProps extends ComponentProps<'div'> { asChild?: boolean }
/** Card.Header: contêiner de Title/Description/Action. Action se alinha à direita via CSS (:has). */
function CardHeaderPart({ asChild, className, ...props }: CardHeaderPartProps) {
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} className={cx('few-card-header', className)} />;
}

export interface CardTitleProps extends ComponentProps<'h3'> { asChild?: boolean; level?: 1 | 2 | 3 | 4 | 5 | 6 }
function CardTitle({ asChild, level = 3, className, ...props }: CardTitleProps) {
  const Comp = asChild ? Slot : (`h${level}` as ElementType);
  return <Comp {...props} className={cx('few-card-title', className)} />;
}

export interface CardDescriptionProps extends ComponentProps<'p'> { asChild?: boolean }
function CardDescription({ asChild, className, ...props }: CardDescriptionProps) {
  const Comp = asChild ? Slot : 'p';
  return <Comp {...props} className={cx('few-card-description', className)} />;
}

export interface CardActionProps extends ComponentProps<'div'> { asChild?: boolean }
/** Card.Action: some dentro de Card.Header e se alinha à direita (grid-column 2, span das duas linhas). */
function CardAction({ asChild, className, ...props }: CardActionProps) {
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} className={cx('few-card-action', className)} />;
}

export interface CardContentProps extends ComponentProps<'div'> { asChild?: boolean }
function CardContent({ asChild, className, ...props }: CardContentProps) {
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} className={cx('few-card-content', className)} />;
}

export interface CardFooterProps extends ComponentProps<'div'> { asChild?: boolean }
function CardFooter({ asChild, className, ...props }: CardFooterProps) {
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} className={cx('few-card-footer', className)} />;
}

/** Card composto: <Card variant="outlined"><Card.Header><Card.Title>Título</Card.Title><Card.Action>…</Card.Action></Card.Header><Card.Content>…</Card.Content></Card> */
export const Card = Object.assign(CardRoot, { Root: CardRoot, Header: CardHeaderPart, Title: CardTitle, Description: CardDescription, Action: CardAction, Content: CardContent, Footer: CardFooter });
export { CardRoot, CardHeaderPart, CardTitle, CardDescription, CardAction, CardContent, CardFooter };

/**
 * @deprecated Migre para as partes: `<Card.Header><Card.Title/><Card.Description/><Card.Action/></Card.Header>`.
 * Atalho por props mantido só para compatibilidade com o Card antigo (packages/ui/src/index.tsx).
 * Nome reservado: por isso a parte de header não tem export plano `CardHeader` (só `Card.Header`/`CardHeaderPart`).
 */
export interface CardHeaderProps extends Omit<ComponentProps<'div'>, 'title'> { title: ReactNode; description?: ReactNode; action?: ReactNode }
export function CardHeader({ title, description, action, ...props }: CardHeaderProps) {
  return (
    <CardHeaderPart {...props}>
      <CardTitle>{title}</CardTitle>
      {description ? <CardDescription>{description}</CardDescription> : null}
      {action ? <CardAction>{action}</CardAction> : null}
    </CardHeaderPart>
  );
}
