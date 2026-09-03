import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";

export interface SidebarNavProps extends React.HTMLAttributes<HTMLUListElement> {
  children: React.ReactNode;
}

/** Lista de enlaces del menú lateral. Sus hijos son `SidebarNavItem`. */
export const SidebarNav = React.forwardRef<HTMLUListElement, SidebarNavProps>(
  ({ className, children, ...props }, ref) => (
    <ul ref={ref} className={cn("flex flex-col gap-2xs", className)} {...props}>
      {children}
    </ul>
  ),
);
SidebarNav.displayName = "SidebarNav";

export interface SidebarNavGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Encabezado del grupo. Se oculta con el menú plegado. */
  label: React.ReactNode;
  children: React.ReactNode;
}

/** Sección con título dentro del menú, para menús largos. */
export const SidebarNavGroup = React.forwardRef<HTMLDivElement, SidebarNavGroupProps>(
  ({ label, className, children, ...props }, ref) => {
    const { collapsed } = useSidebar();
    return (
      <div ref={ref} className={cn("flex flex-col gap-2xs", className)} {...props}>
        {collapsed ? (
          // Plegado no hay sitio para el título: una línea separa los grupos.
          <hr className="mx-auto my-2xs w-6 border-sidebar-border" />
        ) : (
          <p className="px-sm pt-xs text-ui-caption font-semibold uppercase tracking-wide text-sidebar-muted">
            {label}
          </p>
        )}
        {children}
      </div>
    );
  },
);
SidebarNavGroup.displayName = "SidebarNavGroup";

export interface SidebarNavItemProps extends React.HTMLAttributes<HTMLElement> {
  /** Icono del enlace. Se mantiene visible con el menú plegado. */
  icon?: React.ReactNode;
  /** Marca el destino actual: pinta el estado activo y pone `aria-current="page"`. */
  active?: boolean;
  /** Contador o distintivo al final de la fila. Se oculta con el menú plegado. */
  badge?: React.ReactNode;
  /**
   * Usa el hijo como elemento del enlace, para el `Link`/`NavLink` del router de
   * cada aplicación. La librería no conoce ningún router.
   * @example <SidebarNavItem asChild icon={<HomeIcon />}><NavLink to="/">Inicio</NavLink></SidebarNavItem>
   */
  asChild?: boolean;
  /** Destino cuando no se usa `asChild`. @default "#" */
  href?: string;
  children: React.ReactNode;
}

/**
 * Un enlace del menú lateral, con el estado activo, el foco y el modo plegado
 * ya resueltos.
 *
 * Existe porque sin él cada aplicación escribe quince líneas de clases para lo
 * mismo, y termina con un hover distinto en cada producto. Al pulsarlo desde el
 * panel móvil, el panel se cierra solo.
 */
export const SidebarNavItem = React.forwardRef<HTMLElement, SidebarNavItemProps>(
  ({ icon, active = false, badge, asChild = false, href = "#", className, children, onClick, ...props }, ref) => {
    const { collapsed, closeMobile } = useSidebar();
    const Component = asChild ? Slot : "a";

    const content = (
      <>
        {icon ? (
          <span aria-hidden="true" className="grid size-4 shrink-0 place-items-center [&_svg]:size-4">
            {icon}
          </span>
        ) : null}
        {/* Plegado el texto deja de verse, pero el enlace conserva su nombre. */}
        <span className={cn("min-w-0 flex-1 truncate", collapsed && "sr-only")}>{children}</span>
        {badge && !collapsed ? <span className="shrink-0">{badge}</span> : null}
      </>
    );

    return (
      <li>
        <Component
          ref={ref as React.Ref<HTMLAnchorElement>}
          {...(asChild ? {} : { href })}
          aria-current={active ? "page" : undefined}
          title={collapsed && typeof children === "string" ? children : undefined}
          onClick={(event: React.MouseEvent<HTMLElement>) => {
            onClick?.(event);
            // Navegar desde el panel móvil debe cerrarlo: si no, el contenido
            // cambia detrás de un panel que sigue tapándolo.
            closeMobile();
          }}
          className={cn(
            "flex w-full items-center gap-sm rounded-md px-sm py-xs text-ui-body-sm transition-colors duration-normal",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
            active
              ? "bg-sidebar-active font-medium text-sidebar-active-foreground"
              : "text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground",
            collapsed && "justify-center px-0",
            className,
          )}
          {...props}
        >
          {content}
        </Component>
      </li>
    );
  },
);
SidebarNavItem.displayName = "SidebarNavItem";
