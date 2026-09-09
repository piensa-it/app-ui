import * as React from "react";
import type { ColumnVisibilityState, ExpandedState, SortingState, Updater } from "@tanstack/react-table";

/** Clave de `localStorage` donde se guardaba, antes de la 0.11.0, sólo la visibilidad de columnas. */
function legacyColumnsStorageKey(preferencesKey: string): string {
  return `ui-table:${preferencesKey}:columns`;
}

/** Clave de `localStorage` donde se guardaba, antes de esta versión, sólo la expansión de una tabla jerárquica. */
function legacyExpandedStorageKey(preferencesKey: string): string {
  return `ui-table:${preferencesKey}:expanded`;
}

/** Clave de `localStorage` donde se guardan hoy, juntas, las cuatro preferencias de una tabla. */
function prefsStorageKey(preferencesKey: string): string {
  return `ui-table:${preferencesKey}:prefs`;
}

/**
 * Lo que se persiste bajo `ui-table:<preferencesKey>:prefs`.
 *
 * Antes de esta versión se guardaba por separado: sólo columnas
 * (`ui-table:<key>:columns`, desde la primera versión de la tabla) y, luego,
 * también la expansión (`ui-table:<key>:expanded`, con la jerarquía). Esta
 * forma junta las cuatro cosas que una tabla puede recordar bajo una sola
 * clave nueva; las dos viejas se siguen LEYENDO cuando la nueva no existe —
 * ver {@link readTablePrefs}— y no se vuelven a escribir nunca.
 */
export interface PrefsTabla {
  columns?: ColumnVisibilityState;
  expanded?: ExpandedState;
  pageSize?: number;
  sort?: SortingState;
}

const esObjetoPlano = (valor: unknown): valor is Record<string, unknown> =>
  typeof valor === "object" && valor !== null && !Array.isArray(valor);

/**
 * Sin este filtro, dos JSON perfectamente válidos rompen la tabla:
 *
 * - Un array top-level (`[1,2,3]`) hace que `prefsIniciales.sort` resuelva a
 *   `Array.prototype.sort` —un array tiene ese método—, y `useState` recibe
 *   una función como valor inicial: la llama como inicializador perezoso,
 *   sin el array como `this`, y `sort()` revienta con "Cannot convert
 *   undefined or null to object". La tabla ni monta.
 * - Un `pageSize` que no es número entero (`"muchas"`, o un `2.5` que nadie
 *   tecleó a mano) deja a TanStack calculando un tamaño de página roto: con
 *   texto, `NaN` y la tabla vacía —"No hay datos para mostrar"— con filas
 *   reales adentro; con un decimal, un pie que dice "1-2.5 de 30" que además
 *   se reescribe tal cual en el siguiente guardado. Nada en la consola
 *   delata por qué.
 * - Dentro de `sort`, una entrada que no es un objeto (`[null]`, el mismo
 *   array que sobrevive si solo se comprueba que es array) revienta en
 *   cuanto algo le lee `.id` — mismo desenlace que el array top-level: la
 *   tabla ni monta.
 *
 * Por eso se sanea campo por campo, y en `sort` también entrada por entrada:
 * un valor con la forma equivocada se descarta solo a él, no arrastra a los
 * demás. `expanded` acepta además el valor especial `true` de TanStack
 * ("todo expandido"), no sólo un objeto.
 */
function sanearPrefs(bruto: unknown): PrefsTabla {
  if (!esObjetoPlano(bruto)) return {};
  const prefs: PrefsTabla = {};
  if (esObjetoPlano(bruto.columns)) prefs.columns = bruto.columns as ColumnVisibilityState;
  if (bruto.expanded === true || esObjetoPlano(bruto.expanded)) {
    prefs.expanded = bruto.expanded as ExpandedState;
  }
  if (typeof bruto.pageSize === "number" && Number.isInteger(bruto.pageSize) && bruto.pageSize > 0) {
    prefs.pageSize = bruto.pageSize;
  }
  if (Array.isArray(bruto.sort)) {
    prefs.sort = bruto.sort.filter(
      (entrada): entrada is { id: string; desc: boolean } => esObjetoPlano(entrada) && typeof entrada.id === "string",
    ) as SortingState;
  }
  return prefs;
}

/**
 * Lee las preferencias persistidas de una tabla. La clave nueva (`:prefs`)
 * se prueba primero; si no existe se cae a las dos viejas —`:columns` y
 * `:expanded`—, que es todo lo que guardaban las versiones anteriores de
 * este componente y lo único que hay en el navegador de quien todavía no vio
 * ésta. Las viejas nunca se vuelven a escribir —son sólo lectura, de
 * migración— ni se borran una vez que la nueva existe: un downgrade, o una
 * pestaña que quedó con el bundle viejo abierto, las sigue necesitando.
 * Se quedan ahí para siempre; el costo es unos bytes por tabla, no una
 * preferencia perdida.
 */
export function readTablePrefs(preferencesKey: string | undefined): PrefsTabla {
  if (!preferencesKey || typeof window === "undefined") return {};
  try {
    const nuevas = window.localStorage.getItem(prefsStorageKey(preferencesKey));
    if (nuevas) return sanearPrefs(JSON.parse(nuevas));
    const columnasViejas = window.localStorage.getItem(legacyColumnsStorageKey(preferencesKey));
    const expandedViejo = window.localStorage.getItem(legacyExpandedStorageKey(preferencesKey));
    if (!columnasViejas && !expandedViejo) return {};
    return sanearPrefs({
      columns: columnasViejas ? JSON.parse(columnasViejas) : undefined,
      expanded: expandedViejo ? JSON.parse(expandedViejo) : undefined,
    });
  } catch {
    return {};
  }
}

/**
 * Escribe, bajo la clave nueva, las cuatro preferencias juntas. Una sola
 * escritura para las cuatro; las claves viejas (`:columns`, `:expanded`)
 * quedan intactas y no se vuelven a tocar —ver {@link readTablePrefs}—. Gana
 * la última escritura: dos pestañas abiertas sobre la misma tabla se pisan
 * la preferencia (la que escribe después borra lo que puso la otra). Ya
 * pasaba con `:columns` antes de esta versión, no es algo que esta tarea
 * introduzca, y coordinar entre pestañas (evento `storage`, merge por campo)
 * es complejidad real para un caso que nadie ha reportado.
 *
 * `expanded` se omite del todo cuando la expansión es controlada
 * (`isExpandedControlled`): no tiene sentido persistir un valor que decide
 * quien usa `DataTable`, y escribirlo igual sobrescribiría en cada tabla
 * jerárquica no controlada lo que sí se guardó en una sesión anterior no
 * controlada, si la aplicación alterna entre las dos formas bajo la misma
 * clave.
 */
export function usePersistTablePrefs(
  preferencesKey: string | undefined,
  prefs: { columns: ColumnVisibilityState; expanded: ExpandedState; pageSize: number; sort: SortingState },
  isExpandedControlled: boolean,
): void {
  const { columns, expanded, pageSize, sort } = prefs;
  React.useEffect(() => {
    if (!preferencesKey || typeof window === "undefined") return;
    try {
      const payload: PrefsTabla = { columns, pageSize, sort };
      if (!isExpandedControlled) payload.expanded = expanded;
      window.localStorage.setItem(prefsStorageKey(preferencesKey), JSON.stringify(payload));
    } catch {
      // La tabla sigue funcionando cuando el navegador bloquea almacenamiento.
    }
  }, [columns, expanded, pageSize, sort, preferencesKey, isExpandedControlled]);
}

/**
 * Estado de expansión de una tabla jerárquica: controlado o interno con un
 * valor inicial —en ese orden de prioridad—. La persistencia ya no vive
 * aquí (ver {@link readTablePrefs} y {@link usePersistTablePrefs}): este
 * hook sólo resuelve controlado-vs-interno, para que `DataTable` no tenga
 * que repetir esa lógica en cada sitio donde lee o cambia `expanded`.
 *
 * - Con `controlledExpanded` definido (no `undefined`), el estado es
 *   controlado por quien usa `DataTable`: `setExpanded` sólo notifica vía
 *   `onExpandedChange`, nunca actualiza estado interno.
 * - Sin control, `initialUncontrolled` es el valor inicial —normalmente
 *   `prefsIniciales.expanded ?? computeDefault()`—, evaluado una única vez
 *   al montar.
 */
export function useExpandedPreference(
  controlledExpanded: ExpandedState | undefined,
  onExpandedChange: ((next: ExpandedState) => void) | undefined,
  initialUncontrolled: () => ExpandedState,
): [ExpandedState, (updater: Updater<ExpandedState>) => void, boolean] {
  const isControlled = controlledExpanded !== undefined;

  const [internalExpanded, setInternalExpanded] = React.useState<ExpandedState>(() =>
    isControlled ? controlledExpanded : initialUncontrolled(),
  );

  const expanded = isControlled ? controlledExpanded : internalExpanded;

  const setExpanded = React.useCallback(
    (updater: Updater<ExpandedState>) => {
      const next = typeof updater === "function" ? (updater as (old: ExpandedState) => ExpandedState)(expanded) : updater;
      onExpandedChange?.(next);
      if (!isControlled) setInternalExpanded(next);
    },
    [expanded, isControlled, onExpandedChange],
  );

  return [expanded, setExpanded, isControlled];
}
