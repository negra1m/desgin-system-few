"use client";
import { useEffect, useState, type ComponentProps, type MouseEvent } from 'react';
import { Slot } from '../../lib/slot.js';
import { createContext } from '../../lib/context.js';
import { useControllableState } from '../../lib/use-controllable-state.js';
import { useDismiss } from '../../lib/use-dismiss.js';
import { cx, dataAttr } from '../../lib/cx.js';

type SidebarSide = 'left' | 'right';
type SidebarCollapsible = 'offcanvas' | 'icon' | 'none';

interface SidebarContextValue {
  collapsed: boolean; setCollapsed: (value: boolean | ((previous: boolean) => boolean)) => void;
  side: SidebarSide; collapsible: SidebarCollapsible;
  mobileOpen: boolean; setMobileOpen: (value: boolean | ((previous: boolean) => boolean)) => void;
}
const [SidebarProvider, useSidebar] = createContext<SidebarContextValue>('Sidebar');

/** Verdadeiro abaixo de 768px. SSR-safe (assume false até o efeito rodar no cliente). */
function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return isMobile;
}

export interface SidebarProps extends Omit<ComponentProps<'div'>, 'defaultValue'> {
  asChild?: boolean;
  collapsed?: boolean; defaultCollapsed?: boolean; onCollapsedChange?: (collapsed: boolean) => void;
  side?: SidebarSide;
  /** offcanvas: painel deslizante em telas < 768px. icon: encolhe para a largura de ícones no desktop (também vira off-canvas no mobile). none: nunca colapsa. */
  collapsible?: SidebarCollapsible;
}
function SidebarRoot({ asChild, collapsed: collapsedProp, defaultCollapsed = false, onCollapsedChange, side = 'left', collapsible = 'offcanvas', className, ...props }: SidebarProps) {
  const [collapsed, setCollapsed] = useControllableState({ value: collapsedProp, defaultValue: defaultCollapsed, onChange: onCollapsedChange });
  const [mobileOpen, setMobileOpen] = useState(false);
  useDismiss(mobileOpen, () => setMobileOpen(false), [], { outside: false });
  const Comp = asChild ? Slot : 'div';
  return <SidebarProvider value={{ collapsed, setCollapsed, side, collapsible, mobileOpen, setMobileOpen }}>
    {mobileOpen && collapsible !== 'none' && <div className="few-sidebar-backdrop" data-state="open" onClick={() => setMobileOpen(false)} />}
    <Comp {...props} data-side={side} data-collapsible={collapsible} data-state={collapsed ? 'collapsed' : 'expanded'} data-mobile-open={dataAttr(mobileOpen)}
      className={cx('few-sidebar', className)} />
  </SidebarProvider>;
}

export interface SidebarHeaderProps extends ComponentProps<'div'> { asChild?: boolean }
function SidebarHeader({ asChild, className, ...props }: SidebarHeaderProps) {
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} className={cx('few-sidebar-header', className)} />;
}

export interface SidebarContentProps extends ComponentProps<'div'> { asChild?: boolean }
function SidebarContent({ asChild, className, ...props }: SidebarContentProps) {
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} className={cx('few-sidebar-content', className)} />;
}

export interface SidebarFooterProps extends ComponentProps<'div'> { asChild?: boolean }
function SidebarFooter({ asChild, className, ...props }: SidebarFooterProps) {
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} className={cx('few-sidebar-footer', className)} />;
}

export interface SidebarGroupProps extends ComponentProps<'div'> { asChild?: boolean }
function SidebarGroup({ asChild, className, ...props }: SidebarGroupProps) {
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} className={cx('few-sidebar-group', className)} />;
}

export interface SidebarGroupLabelProps extends ComponentProps<'div'> { asChild?: boolean }
function SidebarGroupLabel({ asChild, className, ...props }: SidebarGroupLabelProps) {
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} className={cx('few-sidebar-group-label', className)} />;
}

export interface SidebarMenuProps extends ComponentProps<'ul'> { asChild?: boolean }
function SidebarMenu({ asChild, className, ...props }: SidebarMenuProps) {
  const Comp = asChild ? Slot : 'ul';
  return <Comp {...props} className={cx('few-sidebar-menu', className)} />;
}

export interface SidebarMenuItemProps extends ComponentProps<'li'> { asChild?: boolean }
function SidebarMenuItem({ asChild, className, ...props }: SidebarMenuItemProps) {
  const Comp = asChild ? Slot : 'li';
  return <Comp {...props} className={cx('few-sidebar-menu-item', className)} />;
}

/** Item de menu. Envolva o rótulo em <span> (sem aria-hidden) para que ele suma automaticamente no modo colapsado "icon". `tooltip` vira title só quando colapsado. */
export interface SidebarMenuButtonProps extends ComponentProps<'button'> { asChild?: boolean; isActive?: boolean; tooltip?: string }
function SidebarMenuButton({ asChild, isActive, tooltip, className, ...props }: SidebarMenuButtonProps) {
  const { collapsed, collapsible } = useSidebar('Sidebar.MenuButton');
  const showTooltip = Boolean(tooltip) && collapsed && collapsible === 'icon';
  const Comp = asChild ? Slot : 'button';
  return <Comp {...props} type="button" title={showTooltip ? tooltip : undefined} aria-current={isActive ? 'page' : undefined} data-active={dataAttr(isActive)}
    className={cx('few-sidebar-menu-button', className)} />;
}

export interface SidebarMenuBadgeProps extends ComponentProps<'span'> { asChild?: boolean }
function SidebarMenuBadge({ asChild, className, ...props }: SidebarMenuBadgeProps) {
  const Comp = asChild ? Slot : 'span';
  return <Comp {...props} className={cx('few-sidebar-menu-badge', className)} />;
}

export interface SidebarSeparatorProps extends ComponentProps<'div'> { asChild?: boolean }
function SidebarSeparator({ asChild, className, ...props }: SidebarSeparatorProps) {
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} role="separator" aria-orientation="horizontal" className={cx('few-sidebar-separator', className)} />;
}

/** Alterna collapsed no desktop e mobileOpen em telas < 768px. */
export interface SidebarTriggerProps extends ComponentProps<'button'> { asChild?: boolean }
function SidebarTrigger({ asChild, className, children, onClick, 'aria-label': ariaLabel = 'Alternar barra lateral', ...props }: SidebarTriggerProps) {
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useSidebar('Sidebar.Trigger');
  const isMobile = useIsMobile();
  const expanded = isMobile ? mobileOpen : !collapsed;
  const Comp = asChild ? Slot : 'button';
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (isMobile) setMobileOpen(open => !open); else setCollapsed(value => !value);
  }
  return <Comp {...props} type="button" aria-label={ariaLabel} aria-expanded={expanded} className={cx('few-sidebar-trigger', className)} onClick={handleClick}>{children ?? '☰'}</Comp>;
}

/** Faixa fina na borda, alternativa de clique ao Trigger para expandir/colapsar no desktop. Decorativa para leitores de tela. */
export interface SidebarRailProps extends ComponentProps<'button'> { asChild?: boolean }
function SidebarRail({ asChild, className, onClick, ...props }: SidebarRailProps) {
  const { collapsed, setCollapsed } = useSidebar('Sidebar.Rail');
  const Comp = asChild ? Slot : 'button';
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    setCollapsed(value => !value);
  }
  return <Comp {...props} type="button" tabIndex={-1} aria-hidden="true" data-state={collapsed ? 'collapsed' : 'expanded'} className={cx('few-sidebar-rail', className)} onClick={handleClick} />;
}

/** Sidebar composto: <Sidebar collapsible="icon"><Sidebar.Header><Sidebar.Trigger /></Sidebar.Header><Sidebar.Content><Sidebar.Group><Sidebar.GroupLabel>Menu</Sidebar.GroupLabel><Sidebar.Menu><Sidebar.MenuItem><Sidebar.MenuButton isActive>Visão geral</Sidebar.MenuButton></Sidebar.MenuItem></Sidebar.Menu></Sidebar.Group></Sidebar.Content></Sidebar> */
export const Sidebar = Object.assign(SidebarRoot, {
  Root: SidebarRoot, Header: SidebarHeader, Content: SidebarContent, Footer: SidebarFooter, Group: SidebarGroup, GroupLabel: SidebarGroupLabel,
  Menu: SidebarMenu, MenuItem: SidebarMenuItem, MenuButton: SidebarMenuButton, MenuBadge: SidebarMenuBadge, Separator: SidebarSeparator, Trigger: SidebarTrigger, Rail: SidebarRail,
});
export {
  SidebarRoot, SidebarHeader, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuBadge, SidebarSeparator, SidebarTrigger, SidebarRail,
};
