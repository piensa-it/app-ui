import * as React from "react";
import { Menu as MenuIcon, PanelLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { Sheet } from "@/components/ui/sidebar";
import { SidebarProvider, type SidebarState } from "./sidebar-context";

/** Carácter cromático del menú lateral. Ver `[data-sidebar]` en globals.css. */
export type SidebarVariant = "graphite" | "ink" | "smoke";

/**
 * Forma del armazón (#113).
 *
 * - `docked`: menú fijo al borde, plegable a iconos. El de siempre.
 * - `floating`: el menú es una tarjeta con radio, borde y sombra, separada
 *   de los bordes por un paso de espaciado.
 * - `rail`: riel de 5,5 rem, siempre plegado, con la etiqueta bajo el icono.
 */
export type AppShellLayout = "docked" | "floating" | "rail";

/**
 * Tono del menú. `dark` es la regla: el menú es un plano distinto y no cambia
 * con el tema. `light` es la excepción explícita: el menú toma los tokens de
 * la página y la sigue. Ver DESIGN.md > "Armazón".
 */
export type SidebarTone = "dark" | "light";

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
  /** Forma del armazón. @default "docked" */
  layout?: AppShellLayout;
  /** Tono del menú. @default "dark" */
  sidebarTone?: SidebarTone;
  /** Contenido centrado en la barra superior, entre `topbarStart` y `topbar`: el buscador. */
  topbarCenter?: React.ReactNode;
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

/** Ancho de la columna del menú por forma y estado. Flotante suma su margen. */
const WIDTHS: Record<AppShellLayout, { expanded: string; collapsed: string }> = {
  docked: { expanded: "w-64", collapsed: "w-[4.5rem]" },
  floating: { expanded: "w-[calc(16rem_+_var(--space-sm))]", collapsed: "w-[calc(4.5rem_+_var(--space-sm))]" },
  // Medio rem más que el plegado: las etiquetas en español no caben en 5 rem.
  rail: { expanded: "w-22", collapsed: "w-22" },
};

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
      topbarCenter,
      variant = "graphite",
      layout = "docked",
      sidebarTone = "dark",
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
    // El riel es un menú siempre plegado: ni preferencia ni botón.
    const rail = layout === "rail";
    const collapsed = rail ? true : (controlledCollapsed ?? internalCollapsed);
    const tone = sidebarTone === "light" ? "light" : undefined;

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
      <div className="flex h-full min-h-0 flex-col gap-ui-xs">
        {brand ? <div className="shrink-0">{brand}</div> : null}
        <nav aria-label={label} className="min-h-0 flex-1 overflow-y-auto px-ui-2xs [scrollbar-width:thin]">
          {sidebar}
        </nav>
        {sidebarFooter ? (
          <div className="shrink-0 border-t border-sidebar-border px-ui-sm py-ui-xs text-sidebar-muted">
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
      rail,
      closeMobile: () => setMobileOpen(false),
      inMobilePanel: false,
      closedGroups,
      toggleGroup,
    };
    // En el panel móvil hay sitio: el riel se abre como el menú normal, con
    // la etiqueta al lado del icono.
    const mobileState: SidebarState = {
      collapsed: false,
      rail: false,
      closeMobile: () => setMobileOpen(false),
      inMobilePanel: true,
      closedGroups,
      toggleGroup,
    };

    return (
      <div ref={ref} data-layout={layout} className={cn("flex min-h-screen w-full bg-ground", className)} {...props}>
        {/* Menú fijo. Oculto en pantallas estrechas: allí se abre como panel. */}
        <aside
          data-sidebar={variant}
          data-sidebar-tone={tone}
          data-state={collapsed ? "collapsed" : "expanded"}
          style={{ backdropFilter: "blur(var(--sidebar-blur))" }}
          className={cn(
            // La columna se estira con el contenido: así la franja oscura llega
            // hasta abajo por muy larga que sea la página. Lo que se queda a la
            // vista es su contenido, no la columna.
            "hidden shrink-0 flex-col text-sidebar-foreground md:flex",
            // Flotante, la columna es transparente y la tarjeta de dentro
            // lleva el fondo: así el borde y la sombra rodean al menú entero.
            layout === "floating" ? "p-ui-sm pr-0" : "border-r border-sidebar-border bg-sidebar",
            // La animación de ancho vive aquí y no en cada aplicación.
            "transition-[width] duration-normal ease-standard motion-reduce:transition-none",
            WIDTHS[layout][collapsed ? "collapsed" : "expanded"],
          )}
        >
          {/* Pegado arriba y del alto de la ventana: sin esto el menú se sube
              con el desplazamiento y el pie con la versión queda fuera de
              vista. El desplazamiento interno lo tiene el <nav>. */}
          <div
            className={cn(
              "sticky flex flex-col py-ui-sm",
              layout === "floating"
                ? "top-ui-sm h-[calc(100vh_-_var(--space-sm)_*_2)] overflow-hidden rounded-xl border border-sidebar-border bg-sidebar shadow-raised"
                : "top-0 h-screen",
            )}
          >
            <SidebarProvider value={desktopState}>{navigation("Navegación principal")}</SidebarProvider>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header
            className={cn(
              "sticky top-0 z-40 flex h-16 shrink-0 items-center gap-ui-sm px-ui-md",
              // Flotante, la barra es la propia página: con superficie y borde
              // dejaba una costura justo donde empieza la columna del menú.
              layout === "floating" ? "bg-ground" : "border-b border-border bg-surface",
            )}
          >
            <button
              type="button"
              aria-label="Abrir el menú"
              onClick={() => setMobileOpen(true)}
              className="grid size-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring md:hidden"
            >
              <MenuIcon aria-hidden="true" className="size-5" />
            </button>
            {rail ? null : (
              <button
                type="button"
                aria-label={collapsed ? "Desplegar el menú" : "Plegar el menú"}
                aria-expanded={!collapsed}
                onClick={() => setCollapsed(!collapsed)}
                className="hidden size-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring md:grid"
              >
                <PanelLeft aria-hidden="true" className="size-5" />
              </button>
            )}
            {topbarStart}
            {topbarCenter ? (
              <div className="mx-auto hidden min-w-0 flex-1 items-center justify-center px-ui-md md:flex">{topbarCenter}</div>
            ) : null}
            <div className={cn("flex items-center gap-ui-xs", !topbarCenter && "ml-auto")}>{topbar}</div>
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
          data-sidebar-tone={tone}
          style={{ backdropFilter: "blur(var(--sidebar-blur))" }}
          className="w-72 border-r border-sidebar-border bg-sidebar p-ui-sm text-sidebar-foreground"
        >
          <SidebarProvider value={mobileState}>{navigation("Navegación principal (panel)")}</SidebarProvider>
        </Sheet>
      </div>
    );
  },
);
AppShell.displayName = "AppShell";
