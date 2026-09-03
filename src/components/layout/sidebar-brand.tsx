import * as React from "react";
import { ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";
import {
  Menu,
  MenuContent,
  MenuItemGroupLabel,
  MenuRadioItem,
  MenuRadioItemGroup,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu";

export interface SidebarBrandOption {
  value: string;
  label: React.ReactNode;
  /**
   * Qué hace la opción. Escríbelo siempre que la opción cambie el
   * comportamiento del sistema y no solo lo que se mira: "datos de ensayo, sin
   * efecto real" evita el clic accidental que un interruptor mudo no evita.
   */
  description?: React.ReactNode;
  /**
   * Distintivo que se muestra en la cabecera cuando esta opción está elegida.
   * Evita declarar el entorno dos veces: la opción y el distintivo son lo
   * mismo visto desde dos sitios.
   */
  badge?: { label: React.ReactNode; tone?: "neutral" | "warning" | "danger" };
  disabled?: boolean;
}

export interface SidebarBrandGroup {
  id: string;
  /** Encabezado del grupo dentro del menú: "Empresa", "Entorno", "Sucursal"… */
  label: React.ReactNode;
  /** Opción seleccionada. */
  value?: string;
  options: SidebarBrandOption[];
  onChange?: (value: string) => void;
}

export interface SidebarBrandProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Nombre de la organización. */
  name: string;
  /** Logo. Si se omite, se dibujan las iniciales de `name`. */
  logo?: React.ReactNode;
  /** Iniciales a mostrar sin logo. Por defecto se derivan de `name`. */
  initials?: string;
  /**
   * Distintivo de entorno: "UAT", "Pruebas", "Local". Si se omite, se deriva
   * del `badge` de la opción elegida en cualquiera de los grupos.
   */
  environment?: { label: React.ReactNode; tone?: "neutral" | "warning" | "danger" };
  /**
   * Grupos de opciones del menú. Son arbitrarios: empresa, entorno, sucursal,
   * periodo… Sin grupos, el componente es solo una etiqueta y no pinta ningún
   * control.
   */
  groups?: SidebarBrandGroup[];
  /**
   * Contenido extra al final del menú, después de un separador. Van
   * `MenuItem`s: se renderiza dentro del `MenuContent`.
   * @example footer={<MenuItem onSelect={cerrarSesion}>Cerrar sesión</MenuItem>}
   */
  footer?: React.ReactNode;
  /**
   * Muestra solo la marca, sin el nombre. Dentro de `AppShell` se toma del
   * estado del menú: no hace falta pasarlo ni levantar ese estado.
   */
  collapsed?: boolean;
}

const TONES = {
  neutral: "bg-sidebar-accent text-sidebar-accent-foreground",
  warning: "bg-warning text-warning-foreground",
  danger: "bg-destructive text-destructive-foreground",
} as const;

/** Dos primeras iniciales del nombre, ignorando las formas societarias. */
function initialsFrom(name: string): string {
  const ignored = /^(s\.?a\.?s?|ltda|inc|llc|corp|s\.?l|c\.?a|gmbh)\.?$/i;
  const words = name
    .split(/\s+/)
    .filter((word) => word.length > 0 && !ignored.test(word.replace(/[.,]/g, "")));
  const source = words.length > 0 ? words : name.split(/\s+/);
  // Con una sola palabra ("Acme S.A." → "Acme") dos letras se leen mejor que
  // una suelta en el cuadro.
  if (source.length === 1) return (source[0] ?? "").slice(0, 2).toLocaleUpperCase();
  return source
    .slice(0, 2)
    .map((word) => word[0]?.toLocaleUpperCase() ?? "")
    .join("");
}

/**
 * Identidad de la organización en la cabecera del menú lateral: logo o
 * iniciales, nombre, distintivo de entorno y un único menú con todo lo que se
 * puede cambiar desde ahí.
 *
 * La fila entera es UN solo control. Dos controles compartiendo esos dos
 * centímetros —un selector de empresa y un interruptor de entorno, por
 * ejemplo— se activan sin querer; y un interruptor no dice qué pasa al
 * activarlo. Aquí el entorno es una opción más, con su marca de selección y su
 * descripción.
 *
 * @example
 * ```tsx
 * <SidebarBrand
 *   name="Acme S.A."
 *   environment={{ label: "UAT", tone: "warning" }}
 *   groups={[
 *     { id: "empresa", label: "Empresa", value: empresa, options: empresas, onChange: setEmpresa },
 *     { id: "entorno", label: "Entorno", value: entorno, options: [
 *       { value: "prd", label: "Producción", description: "Datos reales de la operación" },
 *       { value: "uat", label: "Pruebas (UAT)", description: "Datos de ensayo, sin efecto real" },
 *     ], onChange: setEntorno },
 *   ]}
 * />
 * ```
 */
export const SidebarBrand = React.forwardRef<HTMLDivElement, SidebarBrandProps>(
  ({ name, logo, initials, environment, groups, footer, collapsed: collapsedProp, className, ...props }, ref) => {
    const sidebar = useSidebar();
    const collapsed = collapsedProp ?? sidebar.collapsed;
    const mark = (
      <span
        aria-hidden={logo ? undefined : "true"}
        className={cn(
          "grid size-9 shrink-0 place-items-center overflow-hidden rounded-md",
          "bg-sidebar-accent text-ui-body-sm font-semibold text-sidebar-accent-foreground",
        )}
      >
        {logo ?? initials ?? initialsFrom(name)}
      </span>
    );

    // El distintivo sale de la opción elegida salvo que se declare uno aparte:
    // así el entorno no se mantiene sincronizado a mano en dos sitios.
    const derived = groups
      ?.flatMap((group) => group.options.filter((option) => option.value === group.value))
      .find((option) => option.badge)?.badge;
    const shown = environment ?? derived;

    const badge = shown ? (
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-ui-caption font-semibold uppercase tracking-wide",
          TONES[shown.tone ?? "neutral"],
        )}
      >
        {shown.label}
      </span>
    ) : null;

    const identity = (
      <>
        {mark}
        {collapsed ? null : (
          <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
            <span className="w-full truncate text-ui-body-sm font-semibold text-sidebar-foreground">
              {name}
            </span>
            {badge}
          </span>
        )}
      </>
    );

    if (!groups || groups.length === 0) {
      return (
        <div ref={ref} className={cn("flex items-center gap-sm px-2xs py-xs", className)} {...props}>
          {identity}
        </div>
      );
    }

    return (
      <div ref={ref} className={cn("px-2xs py-xs", className)} {...props}>
        <Menu>
          <MenuTrigger>
            <button
              type="button"
              // Con el menú plegado el nombre desaparece de la vista, pero no
              // del nombre accesible del control.
              aria-label={collapsed ? name : undefined}
              className={cn(
                "flex w-full items-center gap-sm rounded-md p-2xs text-left",
                "transition-colors duration-normal",
                "hover:bg-sidebar-hover",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
              )}
            >
              {identity}
              {collapsed ? null : (
                <ChevronsUpDown
                  aria-hidden="true"
                  className="size-4 shrink-0 text-sidebar-muted"
                />
              )}
            </button>
          </MenuTrigger>
          <MenuContent className="w-72">
            {groups.map((group, index) => (
              <React.Fragment key={group.id}>
                {index > 0 ? <MenuSeparator /> : null}
                <MenuRadioItemGroup
                  value={group.value}
                  onValueChange={(details) => group.onChange?.(details.value)}
                >
                  {/* La etiqueta va dentro del grupo: Ark la asocia por
                      contexto y así el lector de pantalla anuncia a qué
                      pertenece cada opción. */}
                  <MenuItemGroupLabel>{group.label}</MenuItemGroupLabel>
                  {group.options.map((option) => (
                    <MenuRadioItem key={option.value} value={option.value} disabled={option.disabled}>
                      <span className="flex flex-col gap-0.5">
                        <span>{option.label}</span>
                        {option.description ? (
                          <span className="text-ui-caption text-muted-foreground">{option.description}</span>
                        ) : null}
                      </span>
                    </MenuRadioItem>
                  ))}
                </MenuRadioItemGroup>
              </React.Fragment>
            ))}
            {footer ? (
              <>
                <MenuSeparator />
                {footer}
              </>
            ) : null}
          </MenuContent>
        </Menu>
      </div>
    );
  },
);
SidebarBrand.displayName = "SidebarBrand";
