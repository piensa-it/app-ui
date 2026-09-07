import * as React from "react";
import { ChevronRight, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Menu, MenuContent, MenuItemGroupLabel, MenuRadioItem, MenuRadioItemGroup, MenuTrigger } from "@/components/ui/menu";
import type { SidebarBrandOption } from "./sidebar-brand";

export interface TopbarIdentitySystem {
  /** Nombre del sistema: CoreLink, Lynx, MiDivisa. */
  name: string;
  /** Logo, a la izquierda del nombre. */
  logo?: React.ReactNode;
}

export interface TopbarIdentitySegment {
  /**
   * Rótulo del segmento: «Empresa», «Módulo». Va al nombre accesible del
   * control y, en pantalla ancha, como sobretítulo.
   */
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

export interface TopbarIdentityProps extends React.HTMLAttributes<HTMLDivElement> {
  system: TopbarIdentitySystem;
  /** Con qué empresa se trabaja. */
  company?: TopbarIdentitySegment;
  /** En qué módulo. Opcional: una aplicación pequeña lo omite y no queda hueco. */
  module?: TopbarIdentitySegment;
}

const TONES = {
  neutral: "bg-muted text-muted-foreground",
  warning: "bg-warning text-warning-foreground",
  danger: "bg-destructive text-destructive-foreground",
} as const;

/**
 * La identidad de la aplicación en la barra superior (#119): qué sistema es,
 * con qué empresa se trabaja y en qué módulo, y cambiar los dos últimos desde
 * ahí. Va en el hueco `topbarStart` de `AppShell`.
 *
 * Una aplicación grande y una pequeña muestran lo mismo en el mismo sitio; la
 * pequeña omite el módulo. Cada segmento es un control —o una etiqueta, si no
 * hay nada que elegir— y la empresa se cambia en un solo sitio: con esto
 * puesto, `SidebarBrand` va sin el grupo de empresa.
 *
 * @example
 * ```tsx
 * <AppShell topbarStart={
 *   <TopbarIdentity
 *     system={{ name: "MiDivisa" }}
 *     company={{ caption: "Empresa", value: empresa, options: empresas, onChange: setEmpresa }}
 *     module={{ caption: "Módulo", value: modulo, onSelect: abrirCambioDeModulo }}
 *   />
 * } … />
 * ```
 */
export const TopbarIdentity = React.forwardRef<HTMLDivElement, TopbarIdentityProps>(
  ({ system, company, module, className, ...props }, ref) => (
    <div ref={ref} className={cn("flex min-w-0 items-center gap-ui-2xs", className)} {...props}>
      <span className="flex shrink-0 items-center gap-ui-xs font-heading text-ui-body-sm font-semibold text-foreground">
        {system.logo ? <span aria-hidden="true" className="grid size-6 place-items-center [&_svg]:size-5">{system.logo}</span> : null}
        {system.name}
      </span>
      {company ? <Segment segment={company} /> : null}
      {module ? <Segment segment={module} /> : null}
    </div>
  ),
);
TopbarIdentity.displayName = "TopbarIdentity";

function Segment({ segment }: { segment: TopbarIdentitySegment }) {
  const current = segment.options?.find((option) => option.value === segment.value);
  const text = current?.label ?? segment.label ?? segment.value ?? "";
  const badge = current?.badge;

  const content = (
    <>
      {/* El rótulo es parte del nombre del control; en pantalla estrecha
          deja de verse pero no de anunciarse. */}
      <span className="text-ui-caption leading-none text-muted-foreground max-sm:sr-only">{segment.caption}</span>
      <span className="flex min-w-0 items-center gap-ui-2xs">
        <span className="truncate text-ui-body-sm font-medium text-foreground">{text}</span>
        {badge ? (
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-ui-caption font-medium",
              badge.uppercase && "uppercase tracking-wide",
              TONES[badge.tone ?? "neutral"],
            )}
          >
            {badge.label}
          </span>
        ) : null}
      </span>
    </>
  );

  const separator = <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground/60" />;
  const interactive = Boolean(segment.onSelect || (segment.options && segment.options.length > 0));

  if (!interactive) {
    return (
      <>
        {separator}
        <span className="flex min-w-0 flex-col items-start gap-0.5 px-ui-2xs">{content}</span>
      </>
    );
  }

  const trigger = (
    <button
      type="button"
      className={cn(
        "flex min-w-0 items-center gap-ui-xs rounded-md px-ui-2xs py-ui-2xs text-left transition-colors duration-normal",
        "hover:bg-surface-hover focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      )}
    >
      <span className="flex min-w-0 flex-col items-start gap-0.5">{content}</span>
      <ChevronsUpDown aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
    </button>
  );

  // Desviado: el disparador llama a la aplicación y no monta menú alguno.
  if (segment.onSelect) {
    return (
      <>
        {separator}
        {React.cloneElement(trigger, { onClick: segment.onSelect, "aria-haspopup": "dialog" })}
      </>
    );
  }

  return (
    <>
      {separator}
      <Menu>
        <MenuTrigger>{trigger}</MenuTrigger>
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
    </>
  );
}
