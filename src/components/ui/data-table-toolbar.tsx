import * as React from "react";
import { type ColumnVisibilityState, type Table } from "@tanstack/react-table";
import { RotateCcw, Search, Settings2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { DataTableFeatures, DataTableValue } from "@/components/ui/data-table";

export type DataTableDensity = "compact" | "default" | "comfortable";

export interface DataTableToolbarProps<TValue extends DataTableValue> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  searchable?: boolean;
  searchPlaceholder?: string;
  configurableColumns?: boolean;
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  table: Table<DataTableFeatures, TValue>;
  activeDensity: DataTableDensity;
  onActiveDensityChange: (density: DataTableDensity) => void;
  defaultVisibility: ColumnVisibilityState;
  setColumnVisibility: React.Dispatch<React.SetStateAction<ColumnVisibilityState>>;
  onColumnVisibilityChange?: (visibility: Record<string, boolean>) => void;
}

/**
 * Barra superior de `DataTable`: título/descripción, acciones, búsqueda y el
 * configurador de columnas (densidad + visibilidad). No dibuja nada cuando
 * `DataTable` no pasa ninguno de esos elementos — esa decisión la toma quien
 * la usa, comprobando las mismas props antes de montarla.
 */
export function DataTableToolbar<TValue extends DataTableValue>({
  title,
  description,
  actions,
  searchable,
  searchPlaceholder = "Buscar en la tabla…",
  configurableColumns,
  globalFilter,
  onGlobalFilterChange,
  table,
  activeDensity,
  onActiveDensityChange,
  defaultVisibility,
  setColumnVisibility,
  onColumnVisibilityChange,
}: DataTableToolbarProps<TValue>) {
  const [columnQuery, setColumnQuery] = React.useState("");

  return (
    <div className="flex flex-col gap-4 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        {title ? <div className="font-heading text-base font-semibold text-foreground">{title}</div> : null}
        {description ? <div className="mt-1 text-sm text-muted-foreground">{description}</div> : null}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {searchable ? (
          <div className="relative min-w-0 sm:w-64">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Buscar en la tabla"
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
        {actions}
        {configurableColumns ? (
          <Popover positioning={{ placement: "bottom-end" }}>
            <PopoverTrigger>
              <button
                type="button"
                aria-label="Configurar columnas"
                className="inline-flex h-control-default w-control-default shrink-0 items-center justify-center rounded-md border border-input bg-raised text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
  );
}
