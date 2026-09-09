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
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Pagination } from "@/components/ui/pagination";
import { DataTableToolbar, type DataTableDensity } from "@/components/ui/data-table-toolbar";
import { useColumnVisibilityPreference } from "@/components/ui/data-table-preferences";

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

/** Tipo de las features registradas — lo necesita `data-table-toolbar.tsx` para tipar la tabla que recibe. */
export type DataTableFeatures = typeof dataTableFeatures;

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

interface ColumnBase<TValue extends DataTableValue> {
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
 * Una columna es de una de dos clases, y la identidad no es lo mismo que el
 * origen del dato:
 *
 * - **De campo**: lee un campo de la fila. Se puede ordenar y buscar por ella.
 *   Anota el tipo (`<Column<Movimiento> field="valor" />`) para que un campo
 *   mal escrito sea un error de compilación y no una columna vacía.
 * - **De presentación**: no corresponde a ningún campo —acciones de fila, un
 *   estado derivado de dos campos, un contacto que junta correo y teléfono—.
 *   Se identifica con `id` y pinta con `body`.
 */
export type ColumnProps<TValue extends DataTableValue> = ColumnBase<TValue> &
  (
    | {
        /** Campo de la fila a mostrar. */
        field: keyof TValue & string;
        /** Identidad de la columna. Por defecto, el propio campo. Úsalo para tener dos columnas del mismo campo. */
        id?: string;
      }
    | {
        field?: undefined;
        /** Identidad de la columna. Obligatoria cuando no hay campo. */
        id: string;
        /** Una columna sin campo tiene que pintar algo. */
        body: (row: TValue) => React.ReactNode;
      }
  );

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
  /**
   * Identidad estable de cada fila. Sin él, TanStack usa el índice, que cambia
   * al ordenar o filtrar.
   */
  getRowId?: (row: TValue, index: number) => string;
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
  getRowId,
}: DataTableProps<TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: rows });
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [activeDensity, setActiveDensity] = React.useState<DataTableDensity>(density);

  const columnSpecs = React.useMemo(
    () =>
      React.Children.toArray(children).filter(
        (child): child is React.ReactElement<ColumnProps<TValue>> =>
          React.isValidElement(child) && child.type === Column,
      ),
    [children],
  );

  const defaultVisibility = React.useMemo<ColumnVisibilityState>(
    () =>
      Object.fromEntries(
        columnSpecs.map((spec) => [spec.props.id ?? spec.props.field, spec.props.defaultVisible !== false]),
      ),
    [columnSpecs],
  );
  const [columnVisibility, setColumnVisibility] = useColumnVisibilityPreference(preferencesKey, defaultVisibility);

  const columnDefs = React.useMemo<Array<ColumnDef<typeof dataTableFeatures, TValue>>>(() => {
    return columnSpecs.map((spec) => ({
      // Uno de los dos existe siempre: el tipo de `ColumnProps` exige `id`
      // cuando no hay `field`.
      id: (spec.props.id ?? spec.props.field) as string,
      // Sin campo no hay valor que leer: la columna solo pinta lo que diga
      // `body`, y no se puede ordenar ni buscar por ella.
      ...(spec.props.field ? { accessorKey: spec.props.field } : {}),
      header: () => spec.props.header,
      enableSorting: Boolean(spec.props.field) && (spec.props.sortable ?? false),
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
        ariaLabel:
          typeof spec.props.header === "string" ? spec.props.header : (spec.props.id ?? spec.props.field),
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
    // Solo se pasa cuando viene: sin él, TanStack sigue identificando filas
    // por índice, igual que antes de que existiera esta prop.
    ...(getRowId ? { getRowId } : {}),
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
    <div className={cn("w-full overflow-hidden rounded-lg border border-raised-border bg-card shadow-sm", className)}>
      {title || description || actions || searchable || configurableColumns ? (
        <DataTableToolbar
          title={title}
          description={description}
          actions={actions}
          searchable={searchable}
          searchPlaceholder={searchPlaceholder}
          configurableColumns={configurableColumns}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          table={table}
          activeDensity={activeDensity}
          onActiveDensityChange={setActiveDensity}
          defaultVisibility={defaultVisibility}
          setColumnVisibility={setColumnVisibility}
          onColumnVisibilityChange={onColumnVisibilityChange}
        />
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
                            "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
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
