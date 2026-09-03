import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Select } from "@/components/ui/select";

export interface PaginationProps {
  /** Página actual, 0-indexada (igual que TanStack Table). */
  pageIndex: number;
  /** Total de páginas disponibles. */
  pageCount: number;
  pageSize: number;
  onPageIndexChange: (pageIndex: number) => void;
  /** Si se omite, el selector de "filas por página" no se muestra. */
  onPageSizeChange?: (pageSize: number) => void;
  /** @default [10, 25, 50] */
  pageSizeOptions?: number[];
  /**
   * Total de elementos (todas las páginas) — si se provee, muestra el rango
   * "1-10 de 42" en vez de "Página 1 / 5".
   */
  totalItems?: number;
  className?: string;
}

/**
 * Barra de paginación independiente de la fuente de datos: no conoce
 * TanStack Table ni ningún fetcher, solo recibe `pageIndex`/`pageCount` y
 * notifica cambios. La usa `DataTable` internamente, pero también sirve para
 * paginar listas propias del consumidor (ej. resultados server-side).
 */
function Pagination({
  pageIndex,
  pageCount,
  pageSize,
  onPageIndexChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  totalItems,
  className,
}: PaginationProps) {
  // Un `pageSize` fuera de las opciones dejaba el selector mostrando el
  // placeholder, como si no hubiera ningún tamaño elegido. Se inserta en su
  // sitio para que la lista siga leyéndose de menor a mayor.
  const sizeOptions = React.useMemo(
    () =>
      pageSizeOptions.includes(pageSize)
        ? pageSizeOptions
        : [...pageSizeOptions, pageSize].sort((a, b) => a - b),
    [pageSizeOptions, pageSize],
  );
  const canPreviousPage = pageIndex > 0;
  const canNextPage = pageIndex < pageCount - 1;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground",
        className,
      )}
    >
      {onPageSizeChange ? (
        <div className="flex items-center gap-2">
          <span>Filas por página</span>
          <Select
            className="w-20"
            aria-label="Filas por página"
            options={sizeOptions.map((n) => ({ label: String(n), value: n }))}
            value={pageSize}
            onChange={(value) => onPageSizeChange(Number(value))}
          />
        </div>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-3">
        <span>
          {totalItems === undefined
            ? `Página ${pageCount === 0 ? 0 : pageIndex + 1} / ${pageCount}`
            : totalItems === 0
              ? "0 de 0"
              : `${pageIndex * pageSize + 1}-${Math.min((pageIndex + 1) * pageSize, totalItems)} de ${totalItems}`}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Ir a la página anterior"
            onClick={() => onPageIndexChange(pageIndex - 1)}
            disabled={!canPreviousPage}
            className={cn(
              "flex h-control-default w-control-default items-center justify-center rounded-md border border-input",
              "transition-colors duration-150 hover:bg-accent hover:text-accent-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:pointer-events-none disabled:opacity-50",
            )}
          >
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
          </button>
          {totalItems !== undefined ? (
            <span className="px-1 tabular-nums">
              {pageCount === 0 ? 0 : pageIndex + 1} / {pageCount}
            </span>
          ) : null}
          <button
            type="button"
            aria-label="Ir a la página siguiente"
            onClick={() => onPageIndexChange(pageIndex + 1)}
            disabled={!canNextPage}
            className={cn(
              "flex h-control-default w-control-default items-center justify-center rounded-md border border-input",
              "transition-colors duration-150 hover:bg-accent hover:text-accent-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:pointer-events-none disabled:opacity-50",
            )}
          >
            <ChevronRight aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export { Pagination };
