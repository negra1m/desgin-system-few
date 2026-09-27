"use client";
// AppShell: ver docs/composition.md. Não depende de Sidebar (outra categoria) — AppShell.Sidebar é só a região <aside>.
import { useEffect, useId, useRef, useState, type ComponentProps, type CSSProperties, type MouseEvent, type RefObject } from 'react';
import { Slot } from '../../lib/slot.js';
import { createContext } from '../../lib/context.js';
import { useControllableState } from '../../lib/use-controllable-state.js';
import { useDismiss } from '../../lib/use-dismiss.js';
import { cx, dataAttr } from '../../lib/cx.js';

type SidebarSide = 'left' | 'right';
interface AppShellContextValue { sidebarId: string; collapsed: boolean; setCollapsed: (collapsed: boolean) => void; sidebarSide: SidebarSide; sidebarRef: RefObject<HTMLElement | null> }
const [AppShellProvider, useAppShell] = createContext<AppShellContextValue>('AppShell');

export interface AppShellProps extends ComponentProps<'div'> {
  asChild?: boolean;
  sidebarWidth?: string;
  sidebarSide?: SidebarSide;
  sidebarCollapsed?: boolean;
  defaultSidebarCollapsed?: boolean;
  onSidebarCollapsedChange?: (collapsed: boolean) => void;
}
/**
 * AppShell.Root: grid com áreas header/sidebar/main/footer. Abaixo de 768px a sidebar vira off-canvas
 * (backdrop + Escape fecham). O backdrop é injetado automaticamente só quando `asChild` não é usado.
 */
function AppShellRoot({ asChild, sidebarWidth = '280px', sidebarSide = 'left', sidebarCollapsed, defaultSidebarCollapsed = false, onSidebarCollapsedChange, style, className, children, ...props }: AppShellProps) {
  const sidebarId = useId();
  const sidebarRef = useRef<HTMLElement>(null);
  const [collapsed, setCollapsed] = useControllableState({ value: sidebarCollapsed, defaultValue: defaultSidebarCollapsed, onChange: onSidebarCollapsedChange });
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);
  useDismiss(isMobile && !collapsed, () => setCollapsed(true), [], { outside: false });
  const Comp = asChild ? Slot : 'div';
  const vars = { '--few-app-shell-sidebar-width': sidebarWidth } as CSSProperties;
  return (
    <AppShellProvider value={{ sidebarId, collapsed, setCollapsed, sidebarSide, sidebarRef }}>
      <Comp {...props} className={cx('few-app-shell', className)} style={{ ...vars, ...style }} data-sidebar-side={sidebarSide} data-sidebar-collapsed={dataAttr(collapsed)}>
        {children}
        {!asChild && !collapsed ? <div className="few-app-shell-backdrop" aria-hidden="true" onClick={() => setCollapsed(true)} /> : null}
      </Comp>
    </AppShellProvider>
  );
}

export interface AppShellHeaderProps extends ComponentProps<'header'> { asChild?: boolean; sticky?: boolean }
function AppShellHeader({ asChild, sticky = false, className, ...props }: AppShellHeaderProps) {
  const Comp = asChild ? Slot : 'header';
  return <Comp {...props} className={cx('few-app-shell-header', className)} data-sticky={dataAttr(sticky)} />;
}

export type AppShellSidebarProps = ComponentProps<'aside'> & { asChild?: boolean };
/** AppShell.Sidebar: <aside> ligado ao SidebarTrigger por aria-controls. Fica `inert` quando colapsado (fora do off-canvas, sai da árvore de foco). */
function AppShellSidebar({ asChild, className, ...props }: AppShellSidebarProps) {
  const { sidebarId, collapsed, sidebarSide, sidebarRef } = useAppShell('AppShell.Sidebar');
  const Comp = asChild ? Slot : 'aside';
  return (
    <Comp
      {...props}
      ref={sidebarRef}
      id={sidebarId}
      inert={collapsed || undefined}
      className={cx('few-app-shell-sidebar', className)}
      data-side={sidebarSide}
      data-collapsed={dataAttr(collapsed)}
    />
  );
}

export interface AppShellMainProps extends ComponentProps<'main'> { asChild?: boolean }
/** AppShell.Main: passe `id="main-content"` para servir de alvo de skip link. */
function AppShellMain({ asChild, className, ...props }: AppShellMainProps) {
  const Comp = asChild ? Slot : 'main';
  return <Comp {...props} className={cx('few-app-shell-main', className)} />;
}

export interface AppShellFooterProps extends ComponentProps<'footer'> { asChild?: boolean }
function AppShellFooter({ asChild, className, ...props }: AppShellFooterProps) {
  const Comp = asChild ? Slot : 'footer';
  return <Comp {...props} className={cx('few-app-shell-footer', className)} />;
}

export interface AppShellSidebarTriggerProps extends ComponentProps<'button'> { asChild?: boolean }
function AppShellSidebarTrigger({ asChild, className, onClick, ...props }: AppShellSidebarTriggerProps) {
  const { sidebarId, collapsed, setCollapsed } = useAppShell('AppShell.SidebarTrigger');
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      {...props}
      type="button"
      aria-expanded={!collapsed}
      aria-controls={sidebarId}
      className={cx('few-app-shell-sidebar-trigger', className)}
      onClick={(event: MouseEvent<HTMLButtonElement>) => { onClick?.(event); if (!event.defaultPrevented) setCollapsed(!collapsed); }}
    />
  );
}

/** AppShell composto: <AppShell><AppShell.Header/><AppShell.Sidebar/><AppShell.Main/><AppShell.Footer/></AppShell> */
export const AppShell = Object.assign(AppShellRoot, {
  Root: AppShellRoot, Header: AppShellHeader, Sidebar: AppShellSidebar, Main: AppShellMain, Footer: AppShellFooter, SidebarTrigger: AppShellSidebarTrigger,
});
export { AppShellRoot, AppShellHeader, AppShellSidebar, AppShellMain, AppShellFooter, AppShellSidebarTrigger };
