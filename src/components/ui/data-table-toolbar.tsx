import * as React from "react";
import { type ColumnVisibilityState, type Table } from "@tanstack/react-table";
import { RotateCcw, Search, Settings2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { focusRingOutside } from "@/lib/recipes/focus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { DataTableFeatures, DataTableValue } from "@/components/ui/data-table";

export type DataTableDensity = "compact" | "default" | "comfortable";

export interface DataTableToolbarProps<TValue extends DataTableValue> {
  title?: React.ReactNode;
  /**
   * Etiqueta con la que se pinta `title`. `"div"` por defecto para no
   * inventar estructura donde la pantalla no la pidió; una pantalla que
   * encabeza una sección con la tabla pasa el nivel que le toca.
   */
  titleAs?: "h2" | "h3" | "h4" | "div";
  description?: React.ReactNode;
  actions?: React.ReactNode;
  searchable?: boolean;
  searchPlaceholder?: string;
  /**
   * Nombre accesible del buscador. Antes de este prop el `aria-label` estaba
   * fijo a «Buscar en la tabla»: todas las pantallas anunciaban el mismo
   * nombre y una prueba de extremo a extremo no tenía forma de distinguir un
   * buscador de otro cuando había más de uno en pantalla.
   *
   * Es independiente de `searchPlaceholder` y no cae a su valor: si se fija
   * el placeholder sin fijar este prop, el campo muestra un texto pero
   * anuncia otro —hay que poner los dos a la vez.
   */
  searchLabel?: string;
  configurableColumns?: boolean;
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  table: Table<DataTableFeatures, TValue>;
  activeDensity: DataTableDensity;
  onActiveDensityChange: (density: DataTableDensity) => void;
  defaultVisibility: ColumnVisibilityState;
  setColumnVisibility: React.Dispatch<React.SetStateAction<ColumnVisibilityState>>;
  onColumnVisibilityChange?: (visibility: Record<string, boolean>) => void;
  /**
   * Filas seleccionadas en TODA la tabla — no solo las visibles bajo el
   * filtro actual. Con esta prop en `0` (o `DataTable` sin `selectable`) la
   * barra se pinta exactamente igual que antes de #137.
   */
  selectionCount?: number;
  /**
   * De `selectionCount`, cuántas quedan fuera del filtro actual (no
   * aparecen en la tabla ahora mismo). **Decisión de #137**: la selección
   * sobrevive a filtrar (una fila que sale de la vista sigue marcada, y
   * vuelve a verse marcada si se limpia el filtro) — así que el contador
   * tiene que decir la verdad en vez de fingir que esas filas no cuentan.
   * Callarlo sería el error caro que pide evitar la incidencia: una
   * aplicación operando sobre filas que su usuario no ve en pantalla, sin
   * que nada se lo advierta. En `0` no se añade ninguna aclaración al texto.
   */
  selectionOutsideFilterCount?: number;
  /** Filas seleccionadas, completas — lo que recibe `selectionActions`. */
  selectedRows?: TValue[];
  /** Botones de acciones masivas. Sin ella, la barra en modo selección no pinta ningún botón propio. */
  selectionActions?: (rows: TValue[]) => React.ReactNode;
  /**
   * `true` cuando la casilla de cabecera acaba de marcar toda la página y
   * hay más filas que cumplen el filtro sin seleccionar — dispara el aviso
   * para extender la selección a todas ellas (patrón Gmail/GitHub, ver
   * #137: marcar de un clic TODO lo filtrado sin este paso intermedio es
   * donde ocurren los desastres de "creí que eran 10 y eran 3.000").
   */
  showExtendSelectionBanner?: boolean;
  /** Filas seleccionadas en la página actual — para el texto del aviso. */
  pageSelectedCount?: number;
  /** Filas que cumplen el filtro actual y admiten selección — para el texto del aviso. */
  filteredSelectableCount?: number;
  /** Extiende la selección de "esta página" a "todo lo que cumple el filtro". */
  onExtendSelectionToFiltered?: () => void;
}

/**
 * Barra superior de `DataTable`: título/descripción, acciones, búsqueda y el
 * configurador de columnas (densidad + visibilidad). No dibuja nada cuando
 * `DataTable` no pasa ninguno de esos elementos — esa decisión la toma quien
 * la usa, comprobando las mismas props antes de montarla.
 */
export function DataTableToolbar<TValue extends DataTableValue>({
  title,
  titleAs = "div",
  description,
  actions,
  searchable,
  searchPlaceholder = "Buscar en la tabla…",
  searchLabel = "Buscar en la tabla",
  configurableColumns,
  globalFilter,
  onGlobalFilterChange,
  table,
  activeDensity,
  onActiveDensityChange,
  defaultVisibility,
  setColumnVisibility,
  onColumnVisibilityChange,
  selectionCount = 0,
  selectionOutsideFilterCount = 0,
  selectedRows = [],
  selectionActions,
  showExtendSelectionBanner = false,
  pageSelectedCount = 0,
  filteredSelectableCount = 0,
  onExtendSelectionToFiltered,
}: DataTableToolbarProps<TValue>) {
  const [columnQuery, setColumnQuery] = React.useState("");
  const TitleTag = titleAs;
  const hasSelection = selectionCount > 0;

  // «N seleccionadas» — con la aclaración de #137 cuando hay selección fuera
  // del filtro actual (ver el DocBlock de `selectionOutsideFilterCount`).
  const selectionLabel = `${selectionCount} ${selectionCount === 1 ? "seleccionada" : "seleccionadas"}`;
  const selectionAnnouncement =
    selectionOutsideFilterCount > 0
      ? `${selectionLabel} (${selectionOutsideFilterCount} fuera del filtro actual)`
      : selectionLabel;

  return (
    // Fragmento, no un `<div>` extra: sin selección (el caso de siempre,
    // sin `selectable`), el DOM tiene que quedar carácter por carácter
    // igual al de antes de #137 — un envoltorio nuevo aquí, aunque no se
    // viera, ya sería un cambio. El aviso de extender (`showExtendSelectionBanner`)
    // se pinta como hermano, no como hijo de un wrapper nuevo.
    <>
      <div className="flex flex-col gap-4 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          {hasSelection ? (
            // `role="status"` + `aria-live="polite"`: el cambio de cuenta se
            // anuncia sin interrumpir a quien usa un lector de pantalla —
            // criterio de accesibilidad de #137. Reemplaza solo el
            // título/descripción, no el buscador: el contador de #137 tiene
            // que poder decir "fuera del filtro actual", y eso exige poder
            // seguir filtrando con una selección activa — si el buscador
            // desapareciera aquí, ese criterio de aceptación sería
            // imposible de ejercitar. `actions` (los botones "normales" de
            // la tabla) sí se sustituye por `selectionActions`: no tiene
            // sentido ver "Nuevo usuario" junto a "Borrar seleccionados".
            <div role="status" aria-live="polite" className="text-sm font-semibold text-foreground">
              {selectionAnnouncement}
            </div>
          ) : (
            <>
              {title ? <TitleTag className="font-heading text-base font-semibold text-foreground">{title}</TitleTag> : null}
              {description ? <div className="mt-1 text-sm text-muted-foreground">{description}</div> : null}
            </>
          )}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {hasSelection ? (
            <div className="flex flex-wrap items-center gap-2">{selectionActions?.(selectedRows)}</div>
          ) : (
            actions
          )}
          {searchable ? (
          <div className="relative min-w-0 sm:w-64">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label={searchLabel}
              className="pl-9"
              placeholder={searchPlaceholder}
              value={globalFilter}
              onChange={(event) => {
                onGlobalFilterChange(event.target.value);
                table.setPageIndex(0);
              }}
            />
          </div>
        ) : null}
        {configurableColumns ? (
          <Popover positioning={{ placement: "bottom-end" }}>
            <PopoverTrigger>
              <button
                type="button"
                aria-label="Configurar columnas"
                className={cn(
                  "inline-flex h-control-default w-control-default shrink-0 items-center justify-center rounded-md border border-input bg-raised text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground",
                  focusRingOutside,
                )}
              >
                <Settings2 aria-hidden="true" className="size-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[24rem] p-0">
              <div className="border-b border-border px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold">Personalizar tabla</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Ajusta las columnas y la densidad de esta vista.
                    </p>
                  </div>
                  <span className="rounded-full bg-subtle px-2.5 py-1 text-xs font-semibold text-subtle-foreground">
                    {table.getVisibleLeafColumns().length}/{table.getAllLeafColumns().length} visibles
                  </span>
                </div>
              </div>
              <div className="grid gap-4 border-b border-border p-4">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Densidad</p>
                  <div className="grid grid-cols-3 rounded-lg bg-muted p-1">
                    {(["compact", "default", "comfortable"] as const).map((option) => (
                      <button
                        key={option}
                        type="button"
                        aria-pressed={activeDensity === option}
                        onClick={() => onActiveDensityChange(option)}
                        className={cn(
                          "min-h-9 rounded-md px-2 text-xs font-medium transition-colors",
                          activeDensity === option
                            ? "bg-raised text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {option === "compact" ? "Compacta" : option === "default" ? "Normal" : "Cómoda"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={columnQuery}
                    onChange={(event) => setColumnQuery(event.target.value)}
                    placeholder="Buscar columna…"
                    aria-label="Buscar columna"
                    className="pl-9"
                    size="sm"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Columnas</p>
                  <button
                    type="button"
                    onClick={() => table.getAllLeafColumns().forEach((column) => column.getCanHide() && column.toggleVisibility(true))}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Mostrar todas
                  </button>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto p-2">
                {table.getAllLeafColumns().filter((column) => {
                  const label = (column.columnDef.meta as { ariaLabel?: string } | undefined)?.ariaLabel ?? column.id;
                  return label.toLocaleLowerCase().includes(columnQuery.trim().toLocaleLowerCase());
                }).map((column) => {
                  const visibleCount = table.getVisibleLeafColumns().length;
                  const cannotHideLast = column.getIsVisible() && visibleCount === 1;
                  return (
                    <button
                      type="button"
                      key={column.id}
                      disabled={!column.getCanHide() || cannotHideLast}
                      onClick={() => column.toggleVisibility()}
                      className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent disabled:cursor-default disabled:opacity-70"
                    >
                      <span className="min-w-0 flex-1 truncate">
                        {(column.columnDef.meta as { ariaLabel?: string } | undefined)?.ariaLabel ?? column.id}
                      </span>
                      {!column.getCanHide() ? <span className="text-[0.6875rem] text-muted-foreground">Fija</span> : null}
                      <span
                        aria-hidden="true"
                        className={cn(
                          "inline-flex h-6 w-10 items-center rounded-full p-0.5 transition-colors",
                          column.getIsVisible() ? "bg-primary" : "bg-muted",
                        )}
                      >
                        <span
                          className={cn(
                            "size-5 rounded-full bg-raised shadow-sm transition-transform",
                            column.getIsVisible() && "translate-x-4",
                          )}
                        />
                      </span>
                      <span className="sr-only">{column.getIsVisible() ? "Ocultar" : "Mostrar"}</span>
                    </button>
                  );
                })}
              </div>
              <div className="border-t border-border p-2">
                <button
                  type="button"
                  onClick={() => {
                    setColumnVisibility(defaultVisibility);
                    onColumnVisibilityChange?.(defaultVisibility);
                  }}
                  className="flex min-h-9 w-full items-center justify-center gap-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <RotateCcw aria-hidden="true" className="size-3.5" />
                  Restaurar columnas
                </button>
              </div>
            </PopoverContent>
          </Popover>
        ) : null}
        </div>
      </div>
      {showExtendSelectionBanner ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-subtle px-4 py-2 text-sm text-subtle-foreground">
          <span>Seleccionadas las {pageSelectedCount} de esta página.</span>
          <Button type="button" variant="plain" size="sm" onClick={onExtendSelectionToFiltered}>
            Seleccionar las {filteredSelectableCount} que cumplen el filtro
          </Button>
        </div>
      ) : null}
    </>
  );
}
