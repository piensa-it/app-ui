import * as React from "react";

import { cn } from "@/lib/utils";
import { initialsFrom } from "@/lib/initials";
import type { TokenColor } from "@/lib/palette";
import { Avatar } from "@/components/ui/avatar";
import { useSidebar } from "./sidebar-context";

export interface SidebarProfileProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onClick"> {
  /** Nombre de la persona. */
  name: string;
  /** Una línea bajo el nombre: rol, correo, sucursal. */
  description?: React.ReactNode;
  /** Foto. Sin ella, las iniciales de `name`. */
  src?: string;
  /** Iniciales a mostrar sin foto. Por defecto se derivan de `name`. */
  initials?: string;
  /** Color del avatar sin foto, en `H S% L%` (el de `AvatarPicker`). Sin él, el de marca. */
  avatarColor?: TokenColor;
  /** Al pulsar el bloque, para abrir el perfil. Con esto el bloque es un botón. */
  onClick?: () => void;
  /**
   * Muestra solo el avatar. Dentro de `AppShell` se toma del estado del menú:
   * no hace falta pasarlo.
   */
  collapsed?: boolean;
}

/**
 * La persona en la cabecera del menú lateral: avatar grande, nombre y una
 * línea de contexto (#113). Es identidad, como `SidebarBrand` sin grupos; las
 * acciones de la persona —perfil, configuración, salir— siguen en `UserMenu`.
 * Con `onClick` el bloque es un botón que abre lo que la aplicación quiera.
 *
 * Plegado deja el avatar, con el nombre en el nombre accesible.
 *
 * @example
 * ```tsx
 * <AppShell brand={<SidebarProfile name="Janice Chandler" description="Contadora" src={foto} />} …>
 * ```
 */
export const SidebarProfile = React.forwardRef<HTMLDivElement, SidebarProfileProps>(
  ({ name, description, src, initials, avatarColor, onClick, collapsed: collapsedProp, className, ...props }, ref) => {
    const sidebar = useSidebar();
    const collapsed = collapsedProp ?? sidebar.collapsed;

    const avatar = (
      <Avatar
        size={collapsed ? "sm" : "xl"}
        src={src}
        alt=""
        label={initials ?? initialsFrom(name)}
        // Sin color propio, el de marca: un avatar gris sobre el menú se
        // pierde, y el color es lo que lo hace reconocible de un vistazo.
        className={cn("shrink-0", !avatarColor && "bg-primary text-primary-foreground")}
        style={avatarColor ? { backgroundColor: `hsl(${avatarColor})`, color: "white" } : undefined}
      />
    );

    const identity = collapsed ? (
      avatar
    ) : (
      <>
        {avatar}
        <span className="flex w-full min-w-0 flex-col items-center gap-0.5">
          <span className="w-full truncate text-ui-body-sm font-semibold text-sidebar-foreground">{name}</span>
          {description ? <span className="w-full truncate text-ui-caption text-sidebar-muted">{description}</span> : null}
        </span>
      </>
    );

    const layout = cn(
      "flex w-full flex-col items-center gap-ui-xs text-center",
      collapsed ? "px-0 py-ui-xs" : "px-ui-sm py-ui-md",
    );

    if (onClick) {
      return (
        <div ref={ref} className={cn(collapsed ? "px-0" : "px-ui-2xs", className)} {...props}>
          <button
            type="button"
            onClick={onClick}
            aria-label={collapsed ? name : undefined}
            className={cn(
              layout,
              "rounded-md transition-colors duration-normal hover:bg-sidebar-hover",
              "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
            )}
          >
            {identity}
          </button>
        </div>
      );
    }

    return (
      <div ref={ref} aria-label={collapsed ? name : undefined} className={cn(layout, className)} {...props}>
        {identity}
      </div>
    );
  },
);
SidebarProfile.displayName = "SidebarProfile";
