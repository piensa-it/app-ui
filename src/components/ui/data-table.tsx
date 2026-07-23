import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Select } from "@/components/ui/select";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- fila genérica, igual que el `DataTableValue` anterior sobre PrimeReact.
export type DataTableValue = Record<string, any>;

export interface ColumnProps<TValue extends DataTableValue> {
  /** Campo de la fila a mostrar (soporta rutas con punto, ej. "usuario.nombre"). */
  field: string;
  header: React.ReactNode;
  sortable?: boolean;
  /** Contenido personalizado de la celda. Si se omite, se muestra el valor crudo del campo. */
  body?: (row: TValue) => React.ReactNode;
  className?: string;
}

/**
 * Marcador de columna — no se renderiza directamente. `DataTable` recorre
 * sus hijos `Column` para construir las `ColumnDef` de TanStack Table.
 */
function Column<TValue extends DataTableValue>(_props: ColumnProps<TValue>): null {
  return null;
}

export interface DataTableProps<TValue extends DataTableValue> {
  value: TValue[];
  /** Elementos `Column` que definen las columnas de la tabla. */
  children?: React.ReactNode;
  paginator?: boolean;
  rows?: number;
  rowsPerPageOptions?: number[];
  emptyMessage?: React.ReactNode;
  /** Nombre accesible de la tabla cuando no se muestra un caption visible. */
  "aria-label"?: string;
  /** Caption visible que describe el conjunto de datos. */
  caption?: React.ReactNode;
  className?: string;
}

/**
 * Tabla de datos sobre TanStack Table (headless): paginación y orden
 * incluidos, con el tema Tailwind de la librería. Úsala junto a `Column`
 * para definir las columnas — la lógica de tabla no viene acoplada a
 * ninguna dependencia de UI, TanStack Table solo calcula filas/orden/página.
 *
 * @example
 * ```tsx
 * <DataTable value={usuarios} rows={10}>
 *   <Column field="nombre" header="Nombre" sortable />
 *   <Column field="email" header="Correo" />
 * </DataTable>
 * ```
 */
function DataTable<TValue extends DataTableValue>({
  value,
  children,
  paginator = true,
  rows = 10,
  rowsPerPageOptions = [10, 25, 50],
  emptyMessage = "No hay datos para mostrar.",
  "aria-label": ariaLabel = "Tabla de datos",
  caption,
  className,
}: DataTableProps<TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: rows });

  const columnDefs = React.useMemo<Array<ColumnDef<TValue>>>(() => {
    const specs = React.Children.toArray(children).filter(
      (child): child is React.ReactElement<ColumnProps<TValue>> => React.isValidElement(child) && child.type === Column,
    );
    return specs.map((spec) => ({
      id: spec.props.field,
      accessorKey: spec.props.field,
      header: () => spec.props.header,
      enableSorting: spec.props.sortable ?? false,
      cell: (ctx) => (spec.props.body ? spec.props.body(ctx.row.original) : String(ctx.getValue() ?? "")),
      meta: {
        className: spec.props.className,
        ariaLabel: typeof spec.props.header === "string" ? spec.props.header : spec.props.field,
      },
    }));
  }, [children]);

  const table = useReactTable({
    data: value,
    columns: columnDefs,
    state: { sorting, pagination: paginator ? pagination : undefined },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: paginator ? getPaginationRowModel() : undefined,
  });

  const totalRows = value.length;
  const pageCount = table.getPageCount();

  return (
    <div className={cn("w-full", className)}>
      <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
        <table aria-label={caption ? undefined : ariaLabel} className="w-full border-collapse text-sm">
          {caption ? <caption className="px-4 py-3 text-left font-medium">{caption}</caption> : null}
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border bg-muted/50">
                {headerGroup.headers.map((header) => {
                  const sortDir = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      aria-sort={
                        sortDir === "asc" ? "ascending" : sortDir === "desc" ? "descending" : "none"
                      }
                      className={cn(
                        "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground",
                      )}
                    >
                      {header.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className={cn(
                            "inline-flex min-h-8 items-center gap-1.5 rounded-sm text-left",
                            "transition-colors duration-fast hover:text-foreground",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                          )}
                          aria-label={`Ordenar por ${
                            (header.column.columnDef.meta as { ariaLabel?: string } | undefined)?.ariaLabel ?? header.id
                          }`}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sortDir === "asc" ? (
                            <ArrowUp aria-hidden="true" className="h-3.5 w-3.5" />
                          ) : sortDir === "desc" ? (
                            <ArrowDown aria-hidden="true" className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowUpDown aria-hidden="true" className="h-3.5 w-3.5 opacity-40" />
                          )}
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columnDefs.length} className="px-4 py-8 text-center text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border last:border-0 transition-colors duration-150 hover:bg-accent/40"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={cn(
                        "px-4 py-3",
                        (cell.column.columnDef.meta as { className?: string } | undefined)?.className,
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {paginator ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Filas por página</span>
            <Select
              className="w-20"
              aria-label="Filas por página"
              options={rowsPerPageOptions.map((n) => ({ label: String(n), value: n }))}
              value={pagination.pageSize}
              onChange={(v) => table.setPageSize(Number(v))}
            />
          </div>
          <div className="flex items-center gap-3">
            <span>
              {totalRows === 0
                ? "0 de 0"
                : `${pagination.pageIndex * pagination.pageSize + 1}-${Math.min(
                    (pagination.pageIndex + 1) * pagination.pageSize,
                    totalRows,
                  )} de ${totalRows}`}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Ir a la página anterior"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className={cn(
                  "flex h-control-default w-control-default items-center justify-center rounded-md border border-input",
                  "transition-colors duration-150 hover:bg-accent hover:text-accent-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  "disabled:pointer-events-none disabled:opacity-50",
                )}
              >
                <ChevronLeft aria-hidden="true" className="h-4 w-4" />
              </button>
              <span className="px-1 tabular-nums">
                {pageCount === 0 ? 0 : pagination.pageIndex + 1} / {pageCount}
              </span>
              <button
                type="button"
                aria-label="Ir a la página siguiente"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
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
      ) : null}
    </div>
  );
}

export { DataTable, Column };
