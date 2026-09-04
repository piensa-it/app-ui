import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";

import "./sidebar.css";

export interface SidebarNavProps extends React.HTMLAttributes<HTMLUListElement> {
  children: React.ReactNode;
}

/** Lista de enlaces del menú lateral. Sus hijos son `SidebarNavItem`. */
export const SidebarNav = React.forwardRef<HTMLUListElement, SidebarNavProps>(
  ({ className, children, ...props }, ref) => (
    <ul ref={ref} className={cn("flex flex-col gap-ui-2xs", className)} {...props}>
      {children}
    </ul>
  ),
);
SidebarNav.displayName = "SidebarNav";

export interface SidebarNavGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Encabezado del grupo. Se oculta con el menú plegado. */
  label: React.ReactNode;
  /**
   * Permite abrir y cerrar la sección. Con muchas entradas repartidas en varias
   * secciones, tenerlas todas abiertas obliga a desplazar el menú para llegar
   * a la última.
   * @default false
   */
  collapsible?: boolean;
  /** Estado inicial cuando no hay preferencia guardada. @default true */
  defaultOpen?: boolean;
  /**
   * Identidad de la sección, para recordar si quedó cerrada. Si se omite se usa
   * la etiqueta, cuando es texto.
   */
  groupId?: string;
  children: React.ReactNode;
}

/** Sección con título dentro del menú, para menús largos. */
export const SidebarNavGroup = React.forwardRef<HTMLDivElement, SidebarNavGroupProps>(
  ({ label, collapsible = false, defaultOpen = true, groupId, className, children, ...props }, ref) => {
    const { collapsed, closedGroups, toggleGroup } = useSidebar();
    const contentId = React.useId();
    const id = groupId ?? (typeof label === "string" ? label : contentId);
    // La preferencia guardada manda sobre `defaultOpen`, que solo decide la
    // primera vez.
    const open = closedGroups.includes(id) ? false : defaultOpen;

    if (collapsed) {
      // Con el menú en iconos no hay sitio para el encabezado ni para el
      // control: los enlaces se muestran siempre y una línea separa secciones.
      // La raya ya agrupa, así que la separación es la mínima: sumarle el hueco
      // entero desperdiciaría la altura que el menú plegado quiere ahorrar.
      return (
        <div
          ref={ref}
          data-ui-sidebar-group="collapsed"
          className={cn("flex flex-col gap-ui-2xs", className)}
          {...props}
        >
          <hr className="mx-auto my-ui-2xs w-6 border-sidebar-border" />
          {children}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        data-ui-sidebar-group="expanded"
        className={cn("flex flex-col gap-ui-2xs", className)}
        {...props}
      >
        {collapsible ? (
          <button
            type="button"
            aria-expanded={open}
            aria-controls={contentId}
            onClick={() => toggleGroup(id, !open)}
            className={cn(
              "flex items-center justify-between gap-ui-xs rounded-md px-ui-sm pt-ui-xs text-ui-caption font-semibold uppercase tracking-wide",
              "text-sidebar-muted transition-colors hover:text-sidebar-foreground",
              "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
            )}
          >
            {label}
            <ChevronDown
              aria-hidden="true"
              className={cn("size-3.5 transition-transform duration-normal", !open && "-rotate-90")}
            />
          </button>
        ) : (
          <p className="px-ui-sm pt-ui-xs text-ui-caption font-semibold uppercase tracking-wide text-sidebar-muted">
            {label}
          </p>
        )}
        {/* Sin renderizar, no solo oculto: una sección cerrada no debe dejar
            enlaces alcanzables con el tabulador. */}
        {!collapsible || open ? (
          <div id={contentId} className="flex flex-col gap-ui-2xs">
            {children}
          </div>
        ) : null}
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
   *
   * Envuelve la etiqueta en un elemento —normalmente un `<span>`— en vez de
   * dejarla como texto suelto: es lo que permite ocultarla cuando el menú se
   * pliega, dejando solo el icono.
   *
   * El estado activo sigue decidiéndolo `active`: la librería no conoce el
   * router, así que la ruta actual la sabe la aplicación.
   *
   * @example
   * ```tsx
   * const { pathname } = useLocation();
   * <SidebarNavItem asChild icon={<HomeIcon />} active={pathname === "/inicio"}>
   *   <NavLink to="/inicio"><span>Inicio</span></NavLink>
   * </SidebarNavItem>
   * ```
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

    const iconNode = icon ? (
      <span aria-hidden="true" className="grid size-4 shrink-0 place-items-center [&_svg]:size-4">
        {icon}
      </span>
    ) : null;
    // Plegado el texto deja de verse, pero el enlace conserva su nombre.
    const labelClassName = cn("min-w-0 flex-1 truncate", collapsed && "sr-only");
    const badgeNode = badge && !collapsed ? <span className="shrink-0">{badge}</span> : null;

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
            "flex w-full items-center gap-ui-sm rounded-md px-ui-sm py-ui-xs text-ui-body-sm transition-colors duration-normal",
            "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
            active
              ? "bg-sidebar-active font-medium text-sidebar-active-foreground"
              : "text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground",
            collapsed && "justify-center px-0",
            // Con `asChild` el contenido es del consumidor y no se puede
            // envolver para ocultarlo al plegar. Se ocultan sus hijos salvo el
            // icono, que va marcado como decorativo: por eso la etiqueta debe
            // ir dentro de un elemento, no como texto suelto.
            collapsed && asChild && "[&>*:not([aria-hidden])]:sr-only",
            className,
          )}
          {...props}
        >
          {/* Los hijos van sueltos y no dentro de un fragmento: `Slot` busca el
              `Slottable` entre sus hijos directos y no mira dentro de un
              fragmento, así que envolverlos dejaba al enlace del consumidor sin
              clases y con el icono fuera. */}
          {iconNode}
          {asChild ? (
            // `Slottable` marca cuál de los hijos es el elemento a clonar.
            <Slottable>{React.isValidElement(children) ? children : <span>{children}</span>}</Slottable>
          ) : (
            <span className={labelClassName}>{children}</span>
          )}
          {badgeNode}
        </Component>
      </li>
    );
  },
);
SidebarNavItem.displayName = "SidebarNavItem";
