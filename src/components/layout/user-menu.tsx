import * as React from "react";

import { cn } from "@/lib/utils";
import { initialsFrom } from "@/lib/initials";
import type { TokenColor } from "@/lib/palette";
import { Avatar } from "@/components/ui/avatar";
import { confirmAlert } from "@/components/ui/alert-dialog";
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "@/components/ui/menu";
import { ChevronDownIcon, LogoutIcon, SettingsIcon, UserIcon } from "@/icons";

export interface UserMenuUser {
  name: string;
  email?: string;
  /** «Cajera», «Administrador»… Se muestra bajo el nombre. */
  role?: string;
  /** Foto. Sin ella, iniciales sobre `avatarColor`. */
  avatarSrc?: string;
  /**
   * Color de fondo de las iniciales, en el formato de los tokens (`H S% L%`),
   * el mismo de `createPalette`. Sin él, el color de marca.
   */
  avatarColor?: TokenColor;
}

export interface UserMenuItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onSelect: () => void;
}

export interface UserMenuLabels {
  /** @default "Mi perfil" */
  profile?: string;
  /** @default "Configuración" */
  settings?: string;
  /** @default "Cerrar sesión" */
  signOut?: string;
  /** @default "¿Cerrar la sesión?" */
  confirmTitle?: string;
  /** @default "Tendrás que volver a identificarte para seguir trabajando." */
  confirmDescription?: string;
  /** @default "Cerrar sesión" */
  confirmLabel?: string;
  /** @default "Cancelar" */
  cancelLabel?: string;
}

export interface UserMenuProps {
  user: UserMenuUser;
  /** Sin él, no se pinta «Mi perfil». */
  onProfile?: () => void;
  /** Sin él, no se pinta «Configuración». */
  onSettings?: () => void;
  onSignOut: () => void;
  /** Acciones propias de la aplicación, entre «Configuración» y «Cerrar sesión». */
  items?: UserMenuItem[];
  /**
   * Pide confirmación antes de cerrar la sesión. Reutiliza `confirmAlert`
   * —hace falta `UiProvider` montado— y no monta una capa modal propia.
   * @default false
   */
  confirmSignOut?: boolean;
  /** Textos, para otro idioma o para decirlo de otra forma. */
  labels?: UserMenuLabels;
  className?: string;
}

const DEFAULT_LABELS: Required<UserMenuLabels> = {
  profile: "Mi perfil",
  settings: "Configuración",
  signOut: "Cerrar sesión",
  confirmTitle: "¿Cerrar la sesión?",
  confirmDescription: "Tendrás que volver a identificarte para seguir trabajando.",
  confirmLabel: "Cerrar sesión",
  cancelLabel: "Cancelar",
};

/**
 * El menú de la persona en la barra superior: quién es, su perfil, su
 * configuración y cerrar sesión, en ese orden y siempre en el mismo sitio.
 *
 * Es la pieza que faltaba en `AppShell`: la marca de la organización ya la
 * traía la librería (`SidebarBrand`); la identidad de la persona la escribía
 * cada aplicación por su cuenta, y cada una se desviaba de las otras en orden,
 * iconos y comportamiento (#97).
 *
 * La librería no conoce el router ni la sesión: todo son callbacks. Lo que
 * fija es el orden —cabecera, «Mi perfil», «Configuración», lo propio de la
 * aplicación, «Cerrar sesión»— porque que las tres aplicaciones tengan lo
 * mismo en el mismo sitio es todo el valor.
 *
 * @example
 * ```tsx
 * <AppShell topbar={
 *   <UserMenu
 *     user={{ name: "Andrés Montoya", email: "andres@piensait.com", role: "Cajera", avatarColor: "350 75% 45%" }}
 *     onProfile={() => navigate("/perfil")}
 *     onSettings={() => navigate("/configuracion")}
 *     onSignOut={cerrarSesion}
 *     confirmSignOut
 *   />
 * } />
 * ```
 */
export const UserMenu = React.forwardRef<HTMLButtonElement, UserMenuProps>(
  ({ user, onProfile, onSettings, onSignOut, items = [], confirmSignOut = false, labels, className }, ref) => {
    const text = { ...DEFAULT_LABELS, ...labels };

    const signOut = () => {
      if (!confirmSignOut) {
        onSignOut();
        return;
      }
      confirmAlert({
        title: text.confirmTitle,
        description: text.confirmDescription,
        confirmLabel: text.confirmLabel,
        cancelLabel: text.cancelLabel,
        variant: "destructive",
        onConfirm: onSignOut,
      });
    };

    const avatar = (
      <Avatar
        size="sm"
        src={user.avatarSrc}
        alt=""
        label={initialsFrom(user.name)}
        // Sin color propio, el de marca: un avatar gris en una barra gris se
        // pierde, y el color es lo que lo hace reconocible de un vistazo.
        className={cn(!user.avatarColor && "bg-primary text-primary-foreground")}
        style={user.avatarColor ? { backgroundColor: `hsl(${user.avatarColor})`, color: "white" } : undefined}
      />
    );

    return (
      <Menu>
        <MenuTrigger>
          <button
            ref={ref}
            type="button"
            // El nombre siempre está en el nombre accesible aunque en pantallas
            // estrechas solo se vea el avatar.
            aria-label={user.name}
            className={cn(
              "flex items-center gap-ui-xs rounded-md py-ui-2xs pl-ui-2xs pr-ui-xs text-left",
              "transition-colors duration-normal hover:bg-surface-hover",
              "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              className,
            )}
          >
            {avatar}
            <span className="hidden min-w-0 flex-col sm:flex">
              <span className="truncate text-ui-body-sm font-medium text-foreground">{user.name}</span>
              {user.role ? <span className="truncate text-ui-caption text-muted-foreground">{user.role}</span> : null}
            </span>
            <ChevronDownIcon aria-hidden="true" className="hidden size-4 shrink-0 text-muted-foreground sm:block" />
          </button>
        </MenuTrigger>
        <MenuContent className="w-64">
          {/* La cabecera no es elegible: dice quién está dentro, y sobre todo
              con qué cuenta, que es lo que se comprueba antes de cerrar sesión. */}
          <div className="flex items-center gap-ui-xs px-ui-xs py-ui-2xs" data-part="user-header">
            {avatar}
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-ui-body-sm font-medium text-foreground">{user.name}</span>
              {user.email ? <span className="truncate text-ui-caption text-muted-foreground">{user.email}</span> : null}
              {!user.email && user.role ? <span className="truncate text-ui-caption text-muted-foreground">{user.role}</span> : null}
            </span>
          </div>
          <MenuSeparator />
          {onProfile ? (
            <MenuItem value="profile" icon={<UserIcon />} onSelect={onProfile}>
              {text.profile}
            </MenuItem>
          ) : null}
          {onSettings ? (
            <MenuItem value="settings" icon={<SettingsIcon />} onSelect={onSettings}>
              {text.settings}
            </MenuItem>
          ) : null}
          {items.map((item) => (
            <MenuItem key={item.id} value={item.id} icon={item.icon ? <item.icon /> : undefined} onSelect={item.onSelect}>
              {item.label}
            </MenuItem>
          ))}
          <MenuSeparator />
          <MenuItem value="sign-out" variant="destructive" icon={<LogoutIcon />} onSelect={signOut}>
            {text.signOut}
          </MenuItem>
        </MenuContent>
      </Menu>
    );
  },
);
UserMenu.displayName = "UserMenu";
