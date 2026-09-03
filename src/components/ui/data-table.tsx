import * as React from "react";
import {
  useTable,
  tableFeatures,
  columnFilteringFeature,
  columnVisibilityFeature,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  flexRender,
  type ColumnDef,
  type ColumnVisibilityState,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown, RotateCcw, Search, Settings2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Pagination } from "@/components/ui/pagination";

/**
 * Desde la v9 de TanStack Table las features ya no vienen incluidas: hay que
 * registrar explícitamente las que se usan, junto con los row models y las
 * funciones de orden/filtro que antes se resolvían solas. Se declara a nivel de
 * módulo —no dentro del componente— para que la identidad del objeto sea
 * estable entre renders.
 */
const dataTableFeatures = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns: { includesString: filterFn_includesString },
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    basic: sortFn_basic,
    datetime: sortFn_datetime,
    text: sortFn_text,
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- fila genérica, igual que el `DataTableValue` anterior sobre PrimeReact.
export type DataTableValue = Record<string, any>;

/** Lo que `DataTable` guarda en `meta` de cada columna de TanStack. */
interface ColumnMeta<TValue extends DataTableValue> {
  className?: string;
  headerClassName?: string;
  ariaLabel?: string;
  footer?: (rows: TValue[]) => React.ReactNode;
}

const ALIGNMENTS = {
  left: "",
  center: "text-center",
  // Las cifras se comparan en vertical: alineadas a la derecha y de ancho fijo.
  right: "text-right tabular-nums",
} as const;

export interface ColumnProps<TValue extends DataTableValue> {
  /**
   * Campo de la fila a mostrar. Anota el tipo de la fila
   * (`<Column<Movimiento> field="valor" />`) para que un campo mal escrito sea
   * un error de compilación en vez de una columna vacía en silencio.
   */
  field: keyof TValue & string;
  header: React.ReactNode;
  sortable?: boolean;
  /** Permite ocultar la columna desde el configurador. @default true */
  hideable?: boolean;
  /** Estado inicial antes de aplicar preferencias persistidas. @default true */
  defaultVisible?: boolean;
  /** Contenido personalizado de la celda. Si se omite, se muestra el valor crudo del campo. */
  body?: (row: TValue) => React.ReactNode;
  /**
   * Alineación de la columna. `right` añade además cifras de ancho fijo
   * (`tabular-nums`), sin las cuales los dígitos bailan de una fila a otra y
   * las cantidades dejan de poder compararse de un vistazo.
   * @default "left"
   */
  align?: "left" | "center" | "right";
  /**
   * Contenido del pie de la columna, para una fila de totales. Recibe **todas**
   * las filas que quedan tras filtrar, no solo las de la página visible: un
   * arqueo suma el periodo entero, no la página.
   *
   * Basta con que una columna lo declare para que la tabla dibuje el pie.
   */
  footer?: (rows: TValue[]) => React.ReactNode;
  /** Clases aplicadas al `<th>` y a cada `<td>` de la columna (ej. `text-right` para cifras). */
  className?: string;
  /** Clases solo para el `<th>`. Si se omite, el encabezado hereda `className`. */
  headerClassName?: string;
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
  /**
   * `true` muestra siempre el pie de paginación, `false` lo omite y muestra
   * todas las filas, `"auto"` lo muestra solo cuando hay más filas que `rows`.
   * @default "auto"
   */
  paginator?: boolean | "auto";
  rows?: number;
  rowsPerPageOptions?: number[];
  emptyMessage?: React.ReactNode;
  /** Nombre accesible de la tabla cuando no se muestra un caption visible. */
  "aria-label"?: string;
  /** Caption visible que describe el conjunto de datos. */
  caption?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  searchable?: boolean;
  searchPlaceholder?: string;
  loading?: boolean;
  /** Densidad vertical de las filas. @default "default" */
  density?: "compact" | "default" | "comfortable";
  /** Alterna un fondo sutil entre filas. */
  striped?: boolean;
  /** Muestra el configurador de columnas en la barra superior. */
  configurableColumns?: boolean;
  /** Clave de localStorage para recordar columnas visibles por tabla/usuario. */
  preferencesKey?: string;
  /** Notifica cambios para persistencia externa en perfiles de usuario. */
  onColumnVisibilityChange?: (visibility: Record<string, boolean>) => void;
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
  paginator = "auto",
  rows = 10,
  rowsPerPageOptions = [10, 25, 50],
  emptyMessage = "No hay datos para mostrar.",
  "aria-label": ariaLabel = "Tabla de datos",
  caption,
  title,
  description,
  actions,
  searchable = false,
  searchPlaceholder = "Buscar en la tabla…",
  loading = false,
  density = "default",
  striped = false,
  configurableColumns = false,
  preferencesKey,
  onColumnVisibilityChange,
  className,
}: DataTableProps<TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: rows });
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnQuery, setColumnQuery] = React.useState("");
  const [activeDensity, setActiveDensity] = React.useState(density);

  const columnSpecs = React.useMemo(
    () =>
      React.Children.toArray(children).filter(
        (child): child is React.ReactElement<ColumnProps<TValue>> =>
          React.isValidElement(child) && child.type === Column,
      ),
    [children],
  );

  const defaultVisibility = React.useMemo<ColumnVisibilityState>(
    () => Object.fromEntries(columnSpecs.map((spec) => [spec.props.field, spec.props.defaultVisible !== false])),
    [columnSpecs],
  );
  const [columnVisibility, setColumnVisibility] = React.useState<ColumnVisibilityState>(() => {
    if (!preferencesKey || typeof window === "undefined") return defaultVisibility;
    try {
      const stored = window.localStorage.getItem(`ui-table:${preferencesKey}:columns`);
      return stored ? { ...defaultVisibility, ...JSON.parse(stored) } : defaultVisibility;
    } catch {
      return defaultVisibility;
    }
  });

  React.useEffect(() => {
    if (!preferencesKey || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(`ui-table:${preferencesKey}:columns`, JSON.stringify(columnVisibility));
    } catch {
      // La tabla sigue funcionando cuando el navegador bloquea almacenamiento.
    }
  }, [columnVisibility, preferencesKey]);

  const columnDefs = React.useMemo<Array<ColumnDef<typeof dataTableFeatures, TValue>>>(() => {
    return columnSpecs.map((spec) => ({
      id: spec.props.field,
      accessorKey: spec.props.field,
      header: () => spec.props.header,
      enableSorting: spec.props.sortable ?? false,
      enableHiding: spec.props.hideable ?? true,
      cell: (ctx) => (spec.props.body ? spec.props.body(ctx.row.original) : String(ctx.getValue() ?? "")),
      meta: {
        // La alineación va primero para que `className` pueda anularla.
        className: cn(ALIGNMENTS[spec.props.align ?? "left"], spec.props.className),
        headerClassName: cn(
          ALIGNMENTS[spec.props.align ?? "left"],
          spec.props.headerClassName ?? spec.props.className,
        ),
        footer: spec.props.footer,
        ariaLabel: typeof spec.props.header === "string" ? spec.props.header : spec.props.field,
      },
    }));
  }, [columnSpecs]);

  // Con `paginator` desactivado ya no se puede omitir el row model de
  // paginación: en la v9 las features son estáticas. Se deja registrada y se
  // fuerza una sola página que abarca todas las filas — mismo resultado
  // visible que antes daba no registrar el row model.
  const effectivePagination = React.useMemo(
    () => (paginator ? pagination : { pageIndex: 0, pageSize: Math.max(value.length, 1) }),
    [paginator, pagination, value.length],
  );

  const table = useTable({
    features: dataTableFeatures,
    data: value,
    columns: columnDefs,
    state: { sorting, pagination: effectivePagination, globalFilter, columnVisibility },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: (updater) => {
      setColumnVisibility((current) => {
        const next = typeof updater === "function" ? updater(current) : updater;
        onColumnVisibilityChange?.(next);
        return next;
      });
    },
  });

  // Las filas que quedan tras filtrar, en su orden actual: es lo que recibe el
  // pie de totales.
  const filteredRows = React.useMemo(
    () => table.getFilteredRowModel().rows.map((row) => row.original),
    [table, globalFilter, value, sorting],
  );
  const hasFooter = columnSpecs.some((spec) => spec.props.footer);
  const totalRows = table.getFilteredRowModel().rows.length;
  const pageCount = table.getPageCount();
  const showPaginator = paginator === true || (paginator === "auto" && totalRows > pagination.pageSize);
  const cellPadding = {
    compact: "px-4 py-2",
    default: "px-4 py-3",
    comfortable: "px-4 py-4",
  }[activeDensity];

  return (
    <div className={cn("w-full overflow-hidden rounded-lg border border-border bg-card shadow-sm", className)}>
      {title || description || actions || searchable || configurableColumns ? (
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
                    setGlobalFilter(event.target.value);
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
                    className="inline-flex h-control-default w-control-default shrink-0 items-center justify-center rounded-md border border-input bg-raised text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                            onClick={() => setActiveDensity(option)}
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
      ) : null}
      <div className="overflow-x-auto">
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
                        (header.column.columnDef.meta as { headerClassName?: string } | undefined)?.headerClassName,
                      )}
                    >
                      {header.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className={cn(
                            "inline-flex min-h-8 items-center gap-1.5 rounded-sm text-left",
                            // Preflight resetea `button { text-transform: none }`; sin esto el
                            // encabezado ordenable pierde las mayúsculas del <th>.
                            "uppercase",
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
            {loading ? (
              Array.from({ length: Math.min(rows, 5) }).map((_, rowIndex) => (
                <tr key={`loading-${rowIndex}`} className="border-b border-border last:border-0">
                  {table.getVisibleLeafColumns().map((column, columnIndex) => (
                    <td key={`${column.id ?? columnIndex}`} className={cellPadding}>
                      <div className={cn("h-4 animate-pulse rounded bg-muted", columnIndex === 0 ? "w-3/5" : columnIndex % 2 ? "w-4/5" : "w-2/5")} />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={table.getVisibleLeafColumns().length} className="px-4 py-8 text-center text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-border last:border-0 transition-colors duration-fast hover:bg-accent/50",
                    striped && "even:bg-muted/30",
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={cn(
                        cellPadding,
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
          {/* El pie solo existe si alguna columna declara `footer`. Se calcula
              sobre las filas filtradas —no las de la página— porque un total
              de página no es un total. */}
          {hasFooter && !loading ? (
            <tfoot aria-label="Totales" className="border-t-2 border-border bg-muted/40 font-medium">
              <tr>
                {table.getVisibleLeafColumns().map((column) => {
                  const footer = (column.columnDef.meta as ColumnMeta<TValue> | undefined)?.footer;
                  return (
                    <td
                      key={column.id}
                      className={cn(cellPadding, (column.columnDef.meta as ColumnMeta<TValue> | undefined)?.className)}
                    >
                      {footer ? footer(filteredRows) : null}
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>
      {showPaginator && !loading ? (
        <Pagination
          pageIndex={pagination.pageIndex}
          pageCount={pageCount}
          pageSize={pagination.pageSize}
          totalItems={totalRows}
          pageSizeOptions={rowsPerPageOptions}
          onPageIndexChange={(index) => table.setPageIndex(index)}
          onPageSizeChange={(size) => table.setPageSize(size)}
        />
      ) : null}
    </div>
  );
}

export { DataTable, Column };
