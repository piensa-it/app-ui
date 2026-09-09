import * as React from "react";
import type { ColumnVisibilityState } from "@tanstack/react-table";

/** Clave de `localStorage` donde se guarda la visibilidad de columnas de una tabla. */
function storageKey(preferencesKey: string): string {
  return `ui-table:${preferencesKey}:columns`;
}

/**
 * Visibilidad de columnas persistida en `localStorage` por `preferencesKey`.
 *
 * Sin `preferencesKey`, o fuera del navegador (SSR), se comporta como un
 * `useState` normal: no lee ni escribe nada.
 */
export function useColumnVisibilityPreference(
  preferencesKey: string | undefined,
  defaultVisibility: ColumnVisibilityState,
): [ColumnVisibilityState, React.Dispatch<React.SetStateAction<ColumnVisibilityState>>] {
  const [columnVisibility, setColumnVisibility] = React.useState<ColumnVisibilityState>(() => {
    if (!preferencesKey || typeof window === "undefined") return defaultVisibility;
    try {
      const stored = window.localStorage.getItem(storageKey(preferencesKey));
      return stored ? { ...defaultVisibility, ...JSON.parse(stored) } : defaultVisibility;
    } catch {
      return defaultVisibility;
    }
  });

  React.useEffect(() => {
    if (!preferencesKey || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey(preferencesKey), JSON.stringify(columnVisibility));
    } catch {
      // La tabla sigue funcionando cuando el navegador bloquea almacenamiento.
    }
  }, [columnVisibility, preferencesKey]);

  return [columnVisibility, setColumnVisibility];
}
