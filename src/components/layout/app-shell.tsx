import * as React from "react";
import { Menu as MenuIcon, PanelLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { Sheet } from "@/components/ui/sidebar";
import { SidebarProvider, type SidebarState } from "./sidebar-context";

/** Carácter cromático del menú lateral. Ver `[data-sidebar]` en globals.css. */
export type SidebarVariant = "graphite" | "ink" | "smoke";

export interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Navegación principal: los enlaces del menú lateral. */
  sidebar: React.ReactNode;
  /** Cabecera del menú lateral. Normalmente un `SidebarBrand`. */
  brand?: React.ReactNode;
  /** Pie del menú lateral. Normalmente un `AppVersion`. */
  sidebarFooter?: React.ReactNode;
  /** Contenido de la barra superior, alineado a la derecha. */
  topbar?: React.ReactNode;
  /** Contenido a la izquierda de la barra superior, junto al botón de menú. */
  topbarStart?: React.ReactNode;
  /** @default "graphite" */
  variant?: SidebarVariant;
  /**
   * Clave para recordar el plegado en este dispositivo. Ponla distinta por
   * aplicación: dos productos en el mismo navegador no deben pisarse la
   * preferencia. Sin clave, el plegado no se recuerda.
   */
  storageKey?: string;
  /** Estado inicial cuando no hay preferencia guardada. @default false */
  defaultCollapsed?: boolean;
  /** Plegado controlado. Si se pasa, manda sobre la preferencia guardada. */
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  children: React.ReactNode;
}

const storageKeyFor = (key: string) => `ui-shell:${key}:collapsed`;
const groupsKeyFor = (key: string) => `ui-shell:${key}:groups`;

function readStoredGroups(key: string | undefined): readonly string[] {
  if (!key || typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(groupsKeyFor(key));
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function readStoredCollapsed(key: string | undefined, fallback: boolean): boolean {
  if (!key || typeof window === "undefined") return fallback;
  try {
    const stored = window.localStorage.getItem(storageKeyFor(key));
    return stored === null ? fallback : stored === "true";
  } catch {
    // Navegador con almacenamiento bloqueado: el menú sigue funcionando.
    return fallback;
  }
}

/**
 * Armazón de aplicación: menú lateral, barra superior y área de contenido.
 *
 * Resuelve de una vez lo que cada aplicación estaba escribiendo por su cuenta:
 * el plegado con la preferencia recordada por dispositivo, la animación de
 * ancho, el panel móvil y el carácter cromático del menú. La navegación la
 * pone el producto —esta librería no conoce su router— vía `sidebar`.
 *
 * El menú es oscuro en tema claro y en oscuro: es un plano distinto de la
 * interfaz. Elige su carácter con `variant` y afínalo redefiniendo los tokens
 * `--sidebar-*` bajo tu propio `[data-sidebar]`.
 *
 * @example
 * ```tsx
 * <AppShell
 *   variant="ink"
 *   storageKey="midivisa"
 *   brand={<SidebarBrand name="Acme S.A." groups={grupos} />}
 *   sidebarFooter={<AppVersion version={APP_VERSION} buildDate={BUILD_DATE} />}
 *   sidebar={<NavLinks />}
 *   topbar={<UserMenu />}
 * >
 *   <PageContainer>…</PageContainer>
 * </AppShell>
 * ```
 */
export const AppShell = React.forwardRef<HTMLDivElement, AppShellProps>(
  (
    {
      sidebar,
      brand,
      sidebarFooter,
      topbar,
      topbarStart,
      variant = "graphite",
      storageKey,
      defaultCollapsed = false,
      collapsed: controlledCollapsed,
      onCollapsedChange,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const [internalCollapsed, setInternalCollapsed] = React.useState(() =>
      readStoredCollapsed(storageKey, defaultCollapsed),
    );
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const collapsed = controlledCollapsed ?? internalCollapsed;

    // Las secciones cerradas se recuerdan junto al plegado del menú: es la
    // misma preferencia de este dispositivo sobre esta aplicación.
    const [closedGroups, setClosedGroups] = React.useState<readonly string[]>(() =>
      readStoredGroups(storageKey),
    );

    const toggleGroup = (groupId: string, open: boolean) => {
      setClosedGroups((current) => {
        const next = open ? current.filter((id) => id !== groupId) : [...current, groupId];
        if (storageKey && typeof window !== "undefined") {
          try {
            window.localStorage.setItem(groupsKeyFor(storageKey), JSON.stringify(next));
          } catch {
            // Las secciones siguen abriéndose aunque no se puedan recordar.
          }
        }
        return next;
      });
    };

    const setCollapsed = (next: boolean) => {
      if (controlledCollapsed === undefined) setInternalCollapsed(next);
      onCollapsedChange?.(next);
      if (!storageKey || typeof window === "undefined") return;
      try {
        window.localStorage.setItem(storageKeyFor(storageKey), String(next));
      } catch {
        // El plegado sigue funcionando aunque no se pueda recordar.
      }
    };

    // El menú se pinta dos veces —fijo y dentro del panel móvil—, así que cada
    // copia necesita su propio nombre: dos landmarks de navegación con el mismo
    // nombre accesible son indistinguibles para quien navega por landmarks.
    const navigation = (label: string) => (
      <div className="flex h-full min-h-0 flex-col gap-xs">
        {brand ? <div className="shrink-0">{brand}</div> : null}
        <nav aria-label={label} className="min-h-0 flex-1 overflow-y-auto px-2xs [scrollbar-width:thin]">
          {sidebar}
        </nav>
        {sidebarFooter ? (
          <div className="shrink-0 border-t border-sidebar-border px-sm py-xs text-sidebar-muted">
            {sidebarFooter}
          </div>
        ) : null}
      </div>
    );

    // El estado viaja por contexto y no como props del contenido: así los
    // enlaces saben si el menú está plegado sin que la aplicación tenga que
    // levantar `collapsed`, que es lo que dejaría `storageKey` sin efecto.
    const desktopState: SidebarState = {
      collapsed,
      closeMobile: () => setMobileOpen(false),
      inMobilePanel: false,
      closedGroups,
      toggleGroup,
    };
    const mobileState: SidebarState = {
      collapsed: false,
      closeMobile: () => setMobileOpen(false),
      inMobilePanel: true,
      closedGroups,
      toggleGroup,
    };

    return (
      <div ref={ref} className={cn("flex min-h-screen w-full bg-ground", className)} {...props}>
        {/* Menú fijo. Oculto en pantallas estrechas: allí se abre como panel. */}
        <aside
          data-sidebar={variant}
          data-state={collapsed ? "collapsed" : "expanded"}
          style={{ backdropFilter: "blur(var(--sidebar-blur))" }}
          className={cn(
            // La columna se estira con el contenido: así la franja oscura llega
            // hasta abajo por muy larga que sea la página. Lo que se queda a la
            // vista es su contenido, no la columna.
            "hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex",
            // La animación de ancho vive aquí y no en cada aplicación.
            "transition-[width] duration-normal ease-standard motion-reduce:transition-none",
            collapsed ? "w-[4.5rem]" : "w-64",
          )}
        >
          {/* Pegado arriba y del alto de la ventana: sin esto el menú se sube
              con el desplazamiento y el pie con la versión queda fuera de
              vista. El desplazamiento interno lo tiene el <nav>. */}
          <div className="sticky top-0 flex h-screen flex-col py-sm">
            <SidebarProvider value={desktopState}>{navigation("Navegación principal")}</SidebarProvider>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-sm border-b border-border bg-surface px-md">
            <button
              type="button"
              aria-label="Abrir el menú"
              onClick={() => setMobileOpen(true)}
              className="grid size-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring md:hidden"
            >
              <MenuIcon aria-hidden="true" className="size-5" />
            </button>
            <button
              type="button"
              aria-label={collapsed ? "Desplegar el menú" : "Plegar el menú"}
              aria-expanded={!collapsed}
              onClick={() => setCollapsed(!collapsed)}
              className="hidden size-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring md:grid"
            >
              <PanelLeft aria-hidden="true" className="size-5" />
            </button>
            {topbarStart}
            <div className="ml-auto flex items-center gap-xs">{topbar}</div>
          </header>

          <main className="min-w-0 flex-1">{children}</main>
        </div>

        {/* Panel móvil: el mismo menú, con el mismo carácter. `surface={false}`
            deja que los tokens del menú pinten el fondo en vez de la
            superficie `raised` que trae el Sheet por defecto. */}
        <Sheet
          open={mobileOpen}
          onOpenChange={setMobileOpen}
          position="left"
          surface={false}
          data-sidebar={variant}
          style={{ backdropFilter: "blur(var(--sidebar-blur))" }}
          className="w-72 border-r border-sidebar-border bg-sidebar p-sm text-sidebar-foreground"
        >
          <SidebarProvider value={mobileState}>{navigation("Navegación principal (panel)")}</SidebarProvider>
        </Sheet>
      </div>
    );
  },
);
AppShell.displayName = "AppShell";
