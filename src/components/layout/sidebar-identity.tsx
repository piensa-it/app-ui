import * as React from "react";
import { ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { initialsFrom } from "@/lib/initials";
import { Menu, MenuContent, MenuItemGroupLabel, MenuRadioItem, MenuRadioItemGroup, MenuTrigger } from "@/components/ui/menu";
import type { SidebarBrandOption } from "./sidebar-brand";
import { useSidebar } from "./sidebar-context";

export interface SidebarIdentitySystem {
  /** Nombre del sistema: CoreLink, Lynx, MiDivisa. */
  name: string;
  /** Logo. Si se omite, se dibujan las iniciales de `name`. */
  logo?: React.ReactNode;
  /** Iniciales a mostrar sin logo. Por defecto se derivan de `name`. */
  initials?: string;
}

export interface SidebarIdentitySegment {
  /** Rótulo del segmento: «Empresa», «Módulo». Se ve como sobretítulo y va al nombre accesible. */
  caption: string;
  /** Opción actual. */
  value?: string;
  /** Opciones. Con ellas el segmento es un menú con marca de selección y descripción. */
  options?: SidebarBrandOption[];
  onChange?: (value: string) => void;
  /**
   * Desvía el disparador: en vez del menú propio, llama a esto. Para abrir
   * un `AppSwitcher` con confirmación cuando elegir no es cambiar de pestaña
   * (#78). Manda sobre `options`.
   */
  onSelect?: () => void;
  /** Qué se muestra cuando `value` no coincide con ninguna opción. */
  label?: React.ReactNode;
}

export interface SidebarIdentityProps extends React.HTMLAttributes<HTMLDivElement> {
  system: SidebarIdentitySystem;
  /** Con qué empresa se trabaja. */
  company?: SidebarIdentitySegment;
  /** En qué módulo. Opcional: una aplicación pequeña lo omite y no queda hueco. */
  module?: SidebarIdentitySegment;
  /**
   * Distintivo de entorno junto a la compañía: «UAT», «Pruebas», «Local». El
   * sistema es el mismo para todas; el entorno se paraleliza por compañía,
   * por eso va ahí y no junto al nombre del sistema. Si se omite, se deriva
   * del `badge` de la opción de compañía elegida.
   */
  environment?: { label: React.ReactNode; tone?: "neutral" | "warning" | "danger"; uppercase?: boolean };
  /** Muestra solo la marca. Dentro de `AppShell` se toma del estado del menú. */
  collapsed?: boolean;
}

const TONES = {
  neutral: "bg-sidebar-accent text-sidebar-accent-foreground",
  warning: "bg-warning text-warning-foreground",
  danger: "bg-destructive text-destructive-foreground",
} as const;

/**
 * La identidad de la aplicación en la cabecera del menú lateral (#119): qué
 * sistema es, con qué compañía se trabaja —y en qué entorno de esa compañía—
 * y en qué módulo, y cambiar los dos últimos desde ahí. Va en el hueco `brand`
 * de `AppShell`.
 *
 * Una aplicación grande y una pequeña muestran lo mismo en el mismo sitio;
 * la pequeña omite el módulo y no queda hueco. Cada segmento es un control
 * —o una etiqueta, si no hay nada que elegir— y la compañía se cambia en un
 * solo sitio: con esto puesto, `SidebarBrand` ya no hace falta. La persona
 * no va aquí: vive arriba a la derecha, en `UserMenu`.
 *
 * Plegado deja la marca, con el sistema y la compañía en el nombre accesible;
 * si la compañía se puede cambiar, la marca sigue siendo su disparador.
 *
 * @example
 * ```tsx
 * <AppShell brand={
 *   <SidebarIdentity
 *     system={{ name: "MiDivisa" }}
 *     company={{ caption: "Compañía", value: empresa, options: empresas, onChange: setEmpresa }}
 *     module={{ caption: "Módulo", value: modulo, onSelect: abrirCambioDeModulo }}
 *   />
 * } … />
 * ```
 */
export const SidebarIdentity = React.forwardRef<HTMLDivElement, SidebarIdentityProps>(
  ({ system, company, module, environment, collapsed: collapsedProp, className, ...props }, ref) => {
    const sidebar = useSidebar();
    const collapsed = collapsedProp ?? sidebar.collapsed;

    const currentCompany = company?.options?.find((option) => option.value === company.value);
    const shown = environment ?? currentCompany?.badge;

    const mark = (
      <span
        aria-hidden={system.logo ? undefined : "true"}
        className={cn(
          "grid size-9 shrink-0 place-items-center overflow-hidden rounded-md",
          "bg-sidebar-accent text-ui-body-sm font-semibold text-sidebar-accent-foreground",
        )}
      >
        {system.logo ?? system.initials ?? initialsFrom(system.name)}
      </span>
    );

    // En línea con el nombre y de la altura de la línea: un distintivo en
    // fila aparte hacía al segmento de compañía más alto que el de módulo.
    const badge = shown ? (
      <span
        className={cn(
          "shrink-0 rounded-full px-1.5 text-ui-caption font-medium leading-4",
          shown.uppercase && "uppercase tracking-wide",
          TONES[shown.tone ?? "neutral"],
        )}
      >
        {shown.label}
      </span>
    ) : null;

    if (collapsed) {
      // Plegado, el sistema y la compañía siguen en el nombre accesible; si la
      // compañía se cambia desde aquí, la marca sigue siendo su disparador.
      const name = [system.name, segmentText(company), segmentText(module)].filter(Boolean).join(" · ");
      const interactive = company && Boolean(company.onSelect || company.options?.length);
      return (
        <div ref={ref} className={cn("flex justify-center py-ui-xs", className)} {...props}>
          {interactive ? (
            <SegmentControl segment={company!} ariaLabel={name} trigger={mark} />
          ) : (
            <span aria-label={name} role="img">
              {mark}
            </span>
          )}
        </div>
      );
    }

    return (
      // Mismo relleno que los enlaces de abajo (`px-ui-2xs` del nav más
      // `px-ui-sm` del ítem): la marca y los rótulos arrancan en la misma
      // columna que los iconos del menú.
      <div ref={ref} className={cn("flex flex-col gap-ui-2xs px-ui-2xs py-ui-xs", className)} {...props}>
        <div className="flex items-center gap-ui-sm px-ui-sm py-ui-2xs">
          {mark}
          <span className="w-full min-w-0 truncate text-ui-body-sm font-semibold text-sidebar-foreground">{system.name}</span>
        </div>
        {company ? <Segment segment={company} badge={badge} /> : null}
        {module ? <Segment segment={module} /> : null}
      </div>
    );
  },
);
SidebarIdentity.displayName = "SidebarIdentity";

function segmentText(segment?: SidebarIdentitySegment): string | undefined {
  if (!segment) return undefined;
  const current = segment.options?.find((option) => option.value === segment.value);
  const text = current?.label ?? segment.label ?? segment.value;
  return typeof text === "string" ? text : undefined;
}

/** Un segmento desplegado: rótulo arriba, valor abajo —y su distintivo—; control si hay algo que elegir. */
function Segment({ segment, badge }: { segment: SidebarIdentitySegment; badge?: React.ReactNode }) {
  const current = segment.options?.find((option) => option.value === segment.value);
  const text = current?.label ?? segment.label ?? segment.value ?? "";
  const interactive = Boolean(segment.onSelect || (segment.options && segment.options.length > 0));

  const content = (
    <span className="flex min-w-0 flex-1 flex-col items-start">
      <span className="text-ui-caption leading-tight text-sidebar-muted">{segment.caption}</span>
      <span className="flex w-full min-w-0 items-center gap-ui-xs">
        <span className="truncate text-ui-body-sm font-medium text-sidebar-foreground">{text}</span>
        {badge}
      </span>
    </span>
  );

  if (!interactive) {
    return <div className="flex items-center gap-ui-sm px-ui-sm py-ui-2xs">{content}</div>;
  }

  const trigger = (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-ui-sm rounded-md px-ui-sm py-ui-2xs text-left transition-colors duration-normal",
        "hover:bg-sidebar-hover",
        "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
      )}
    >
      {content}
      <ChevronsUpDown aria-hidden="true" className="size-4 shrink-0 text-sidebar-muted" />
    </button>
  );

  return <SegmentControl segment={segment} trigger={trigger} />;
}

/** El disparador de un segmento: desvío a la aplicación, o el menú propio. */
function SegmentControl({
  segment,
  trigger,
  ariaLabel,
}: {
  segment: SidebarIdentitySegment;
  trigger: React.ReactElement;
  ariaLabel?: string;
}) {
  const button =
    trigger.type === "button" ? (
      React.cloneElement(trigger as React.ReactElement<React.ButtonHTMLAttributes<HTMLButtonElement>>, { "aria-label": ariaLabel })
    ) : (
      <button
        type="button"
        aria-label={ariaLabel}
        className={cn(
          "grid place-items-center rounded-md transition-colors duration-normal hover:bg-sidebar-hover",
          "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
        )}
      >
        {trigger}
      </button>
    );

  // Desviado: el disparador llama a la aplicación y no monta menú alguno.
  if (segment.onSelect) {
    return React.cloneElement(button as React.ReactElement<React.ButtonHTMLAttributes<HTMLButtonElement>>, {
      onClick: segment.onSelect,
      "aria-haspopup": "dialog",
    });
  }

  return (
    <Menu>
      <MenuTrigger>{button}</MenuTrigger>
      <MenuContent className="w-72">
        <MenuRadioItemGroup value={segment.value} onValueChange={(details) => segment.onChange?.(details.value)}>
          <MenuItemGroupLabel>{segment.caption}</MenuItemGroupLabel>
          {segment.options!.map((option) => (
            <MenuRadioItem key={option.value} value={option.value} disabled={option.disabled}>
              <span className="flex flex-col gap-0.5">
                <span>{option.label}</span>
                {option.description ? <span className="text-ui-caption text-muted-foreground">{option.description}</span> : null}
              </span>
            </MenuRadioItem>
          ))}
        </MenuRadioItemGroup>
      </MenuContent>
    </Menu>
  );
}
