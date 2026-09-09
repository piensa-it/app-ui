import * as React from "react";
import type { ColumnVisibilityState, ExpandedState, Updater } from "@tanstack/react-table";

/** Clave de `localStorage` donde se guarda la visibilidad de columnas de una tabla. */
function storageKey(preferencesKey: string): string {
  return `ui-table:${preferencesKey}:columns`;
}

/** Clave de `localStorage` donde se guarda la expansión de una tabla jerárquica. */
function expandedStorageKey(preferencesKey: string): string {
  return `ui-table:${preferencesKey}:expanded`;
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

/**
 * Estado de expansión de una tabla jerárquica, controlado, persistido por
 * `preferencesKey`, o interno con un valor inicial — en ese orden de
 * prioridad.
 *
 * A propósito **no** se persiste "qué está colapsado" para invertir el
 * significado con un defecto de "todo expandido" (el truco que usaba la
 * versión de Lynx): se guarda el estado tal como lo modela TanStack, para
 * que no haya ambigüedad entre lo guardado y `defaultExpandedDepth` cuando
 * cambian.
 *
 * - Con `controlledExpanded` definido (no `undefined`), el estado es
 *   controlado por quien usa `DataTable`: no se lee ni escribe
 *   `localStorage`, y `setExpanded` solo notifica vía `onExpandedChange`.
 * - Sin control, `computeDefault` se evalúa una única vez como valor
 *   inicial — antes de que exista nada persistido — nunca en cada render.
 */
export function useExpandedPreference(
  preferencesKey: string | undefined,
  controlledExpanded: ExpandedState | undefined,
  onExpandedChange: ((next: ExpandedState) => void) | undefined,
  computeDefault: () => ExpandedState,
): [ExpandedState, (updater: Updater<ExpandedState>) => void] {
  const isControlled = controlledExpanded !== undefined;

  const [internalExpanded, setInternalExpanded] = React.useState<ExpandedState>(() => {
    if (isControlled) return controlledExpanded;
    if (!preferencesKey || typeof window === "undefined") return computeDefault();
    try {
      const stored = window.localStorage.getItem(expandedStorageKey(preferencesKey));
      return stored ? (JSON.parse(stored) as ExpandedState) : computeDefault();
    } catch {
      return computeDefault();
    }
  });

  React.useEffect(() => {
    if (isControlled || !preferencesKey || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(expandedStorageKey(preferencesKey), JSON.stringify(internalExpanded));
    } catch {
      // La tabla sigue funcionando cuando el navegador bloquea almacenamiento.
    }
  }, [internalExpanded, preferencesKey, isControlled]);

  const expanded = isControlled ? controlledExpanded : internalExpanded;

  const setExpanded = React.useCallback(
    (updater: Updater<ExpandedState>) => {
      const next = typeof updater === "function" ? (updater as (old: ExpandedState) => ExpandedState)(expanded) : updater;
      onExpandedChange?.(next);
      if (!isControlled) setInternalExpanded(next);
    },
    [expanded, isControlled, onExpandedChange],
  );

  return [expanded, setExpanded];
}
