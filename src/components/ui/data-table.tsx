import { DataTable as PrimeDataTable, type DataTableProps as PrimeDataTableProps } from "primereact/datatable";
import { Column, type ColumnProps } from "primereact/column";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- necesario para que TS acepte interfaces sin index signature (igual que el propio DataTableValue de PrimeReact).
export type DataTableValue = Record<string, any>;
export type DataTableProps<TValue extends DataTableValue[]> = PrimeDataTableProps<TValue>;

/**
 * Tabla de datos sobre PrimeReact DataTable: paginación, orden y filtro
 * incluidos. Este es el componente que shadcn/ui no ofrecía y que motivó el
 * cambio a PrimeReact — úsalo junto a `Column` para definir las columnas.
 *
 * @example
 * ```tsx
 * <DataTable value={usuarios} paginator rows={10}>
 *   <Column field="nombre" header="Nombre" sortable />
 *   <Column field="email" header="Correo" />
 * </DataTable>
 * ```
 */
function DataTable<TValue extends DataTableValue[]>({
  paginator = true,
  rows = 10,
  rowsPerPageOptions = [10, 25, 50],
  emptyMessage = "No hay datos para mostrar.",
  ...props
}: DataTableProps<TValue>) {
  return (
    <PrimeDataTable
      paginator={paginator}
      rows={rows}
      rowsPerPageOptions={rowsPerPageOptions}
      emptyMessage={emptyMessage}
      {...props}
    />
  );
}

export { DataTable, Column, type ColumnProps };
