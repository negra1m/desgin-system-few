"use client";
// Avatar: migra o Avatar antigo (name -> iniciais, git show HEAD:packages/ui/src/index.tsx) para o padrão composto.
import { useEffect, useState, type ComponentProps } from 'react';
import type { Size } from '@fewcompany/core';
import { getInitials } from '@fewcompany/core';
import { Slot } from '../../lib/slot.js';
import { createContext } from '../../lib/context.js';
import { cx } from '../../lib/cx.js';

type ImageLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error';
interface AvatarContextValue { status: ImageLoadingStatus; setStatus: (status: ImageLoadingStatus) => void; name?: string }
const [AvatarProvider, useAvatarCtx] = createContext<AvatarContextValue>('Avatar');

export interface AvatarProps extends ComponentProps<'span'> { asChild?: boolean; size?: Size | 'xl'; shape?: 'circle' | 'square'; name?: string }
function AvatarRoot({ asChild, size = 'md', shape = 'circle', name, className, ...props }: AvatarProps) {
  const [status, setStatus] = useState<ImageLoadingStatus>('idle');
  const Comp = asChild ? Slot : 'span';
  return <AvatarProvider value={{ status, setStatus, name }}>
    <Comp {...props} role={name ? 'img' : undefined} aria-label={name} className={cx('few-avatar', className)} data-size={size} data-shape={shape} />
  </AvatarProvider>;
}

export interface AvatarImageProps extends ComponentProps<'img'> { asChild?: boolean; onLoadingStatusChange?: (status: ImageLoadingStatus) => void }
function AvatarImage({ asChild, onLoadingStatusChange, className, src, onLoad, onError, ...props }: AvatarImageProps) {
  const { status, setStatus } = useAvatarCtx('Avatar.Image');
  useEffect(() => { setStatus('loading'); onLoadingStatusChange?.('loading'); }, [src]);
  const Comp = asChild ? Slot : 'img';
  return <Comp {...props} src={src} alt={props.alt ?? ''} data-state={status} className={cx('few-avatar-image', className)}
    onLoad={(event) => { onLoad?.(event); setStatus('loaded'); onLoadingStatusChange?.('loaded'); }}
    onError={(event) => { onError?.(event); setStatus('error'); onLoadingStatusChange?.('error'); }} />;
}

export interface AvatarFallbackProps extends ComponentProps<'span'> { asChild?: boolean; delayMs?: number }
function AvatarFallback({ asChild, delayMs = 0, className, children, ...props }: AvatarFallbackProps) {
  const { status, name } = useAvatarCtx('Avatar.Fallback');
  const [canShow, setCanShow] = useState(delayMs === 0);
  useEffect(() => {
    if (delayMs === 0) { setCanShow(true); return; }
    setCanShow(false);
    const id = window.setTimeout(() => setCanShow(true), delayMs);
    return () => window.clearTimeout(id);
  }, [delayMs]);
  if (status === 'loaded' || !canShow) return null;
  const Comp = asChild ? Slot : 'span';
  return <Comp {...props} aria-hidden={name ? undefined : true} className={cx('few-avatar-fallback', className)}>{children ?? (name ? getInitials(name) : null)}</Comp>;
}

export interface AvatarStatusProps extends ComponentProps<'span'> { asChild?: boolean; status?: 'online' | 'offline' | 'busy' | 'away' }
function AvatarStatus({ asChild, status = 'offline', className, ...props }: AvatarStatusProps) {
  const Comp = asChild ? Slot : 'span';
  return <Comp {...props} aria-hidden="true" className={cx('few-avatar-status', className)} data-status={status} />;
}

/** Avatar composto: <Avatar.Root name="Ana Lima"><Avatar.Image src="…"/><Avatar.Fallback/><Avatar.Status status="online"/></Avatar.Root> */
export const Avatar = Object.assign(AvatarRoot, { Root: AvatarRoot, Image: AvatarImage, Fallback: AvatarFallback, Status: AvatarStatus });
export { AvatarRoot, AvatarImage, AvatarFallback, AvatarStatus };
