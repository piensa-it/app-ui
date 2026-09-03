import * as React from "react";

export interface SidebarState {
  /** El menú está plegado a solo iconos. */
  collapsed: boolean;
  /** Cierra el panel móvil. Sin efecto en el menú fijo de escritorio. */
  closeMobile: () => void;
  /** El menú se está mostrando dentro del panel móvil. */
  inMobilePanel: boolean;
  /** Identificadores de las secciones que el usuario dejó cerradas. */
  closedGroups: readonly string[];
  /** Abre o cierra una sección, recordándolo con el resto de preferencias. */
  toggleGroup: (groupId: string, open: boolean) => void;
}

const SidebarContext = React.createContext<SidebarState | null>(null);

export const SidebarProvider = SidebarContext.Provider;

/**
 * Estado del menú lateral, para el contenido que vive dentro de `AppShell`.
 *
 * Existe para que los enlaces sepan si el menú está plegado sin obligar a la
 * aplicación a levantar ese estado: si lo levantara, `AppShell` dejaría de leer
 * la preferencia guardada al montar y `storageKey` quedaría inservible.
 *
 * Fuera de `AppShell` devuelve un estado neutro, así un menú se puede renderizar
 * suelto (en una story, por ejemplo) sin romperse.
 */
export function useSidebar(): SidebarState {
  return (
    React.useContext(SidebarContext) ?? {
      collapsed: false,
      closeMobile: () => {},
      inMobilePanel: false,
      closedGroups: [],
      toggleGroup: () => {},
    }
  );
}
