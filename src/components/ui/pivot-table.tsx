import * as React from "react";
import { Calculator, Columns3, GripVertical, Rows3, Sigma, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Select } from "@/components/ui/select";
import { IconTile } from "@/components/ui/icon";

export type PivotAggregation = "sum" | "average" | "count" | "min" | "max";
export type PivotDatum = Record<string, unknown>;

export interface PivotField {
  key: string;
  label: string;
  type: "dimension" | "measure";
}

export interface PivotTableProps {
  data: PivotDatum[];
  fields: PivotField[];
  initialRowField?: string;
  initialColumnField?: string;
  initialRowFields?: string[];
  initialColumnFields?: string[];
  initialValueField?: string;
  initialAggregation?: PivotAggregation;
  title?: React.ReactNode;
  description?: React.ReactNode;
  formatValue?: (value: number, aggregation: PivotAggregation) => React.ReactNode;
  emptyMessage?: React.ReactNode;
  className?: string;
}

interface Accumulator {
  sum: number;
  count: number;
  min: number;
  max: number;
}

const emptyAccumulator = (): Accumulator => ({
  sum: 0,
  count: 0,
  min: Number.POSITIVE_INFINITY,
  max: Number.NEGATIVE_INFINITY,
});

function addValue(accumulator: Accumulator, raw: unknown) {
  const numeric = Number(raw);
  if (!Number.isFinite(numeric)) return;
  accumulator.sum += numeric;
  accumulator.count += 1;
  accumulator.min = Math.min(accumulator.min, numeric);
  accumulator.max = Math.max(accumulator.max, numeric);
}

function resolveValue(accumulator: Accumulator, aggregation: PivotAggregation) {
  if (aggregation === "count") return accumulator.count;
  if (accumulator.count === 0) return 0;
  if (aggregation === "average") return accumulator.sum / accumulator.count;
  if (aggregation === "min") return accumulator.min;
  if (aggregation === "max") return accumulator.max;
  return accumulator.sum;
}

const aggregationLabels: Record<PivotAggregation, string> = {
  sum: "Suma",
  average: "Promedio",
  count: "Conteo",
  min: "Mínimo",
  max: "Máximo",
};

/** Matriz analítica configurable para resumir dimensiones y métricas de negocio. */
function PivotTable({
  data,
  fields,
  initialRowField,
  initialColumnField,
  initialRowFields,
  initialColumnFields,
  initialValueField,
  initialAggregation = "sum",
  title = "Tabla dinámica",
  description = "Cruza dimensiones y resume métricas sin alterar los datos originales.",
  formatValue = (value) =>
    new Intl.NumberFormat("es-CO", { maximumFractionDigits: 2 }).format(value),
  emptyMessage = "No hay datos suficientes para construir la tabla dinámica.",
  className,
}: PivotTableProps) {
  const dimensions = fields.filter((field) => field.type === "dimension");
  const measures = fields.filter((field) => field.type === "measure");
  const [rowFields, setRowFields] = React.useState<string[]>(
    initialRowFields ?? [initialRowField ?? dimensions[0]?.key ?? ""].filter(Boolean),
  );
  const [columnFields, setColumnFields] = React.useState<string[]>(
    initialColumnFields ?? [initialColumnField ?? dimensions[1]?.key ?? dimensions[0]?.key ?? ""].filter(Boolean),
  );
  const [valueField, setValueField] = React.useState(initialValueField ?? measures[0]?.key ?? "");
  const [aggregation, setAggregation] = React.useState<PivotAggregation>(initialAggregation);
  const [draggingField, setDraggingField] = React.useState<string | null>(null);

  const fieldLabel = (key: string) => fields.find((field) => field.key === key)?.label ?? key;

  const pivot = React.useMemo(() => {
    const dimensionKey = (datum: PivotDatum, keys: string[]) =>
      JSON.stringify(keys.map((key) => String(datum[key] ?? "Sin valor")));
    const rowValues = [...new Set(data.map((datum) => dimensionKey(datum, rowFields)))];
    const columnValues = [...new Set(data.map((datum) => dimensionKey(datum, columnFields)))];
    const cells = new Map<string, Accumulator>();
    const rowTotals = new Map<string, Accumulator>();
    const columnTotals = new Map<string, Accumulator>();
    const grandTotal = emptyAccumulator();

    data.forEach((datum) => {
      const row = dimensionKey(datum, rowFields);
      const column = dimensionKey(datum, columnFields);
      const rawValue = aggregation === "count" ? 1 : datum[valueField];
      const cellKey = JSON.stringify([row, column]);
      if (!cells.has(cellKey)) cells.set(cellKey, emptyAccumulator());
      if (!rowTotals.has(row)) rowTotals.set(row, emptyAccumulator());
      if (!columnTotals.has(column)) columnTotals.set(column, emptyAccumulator());
      addValue(cells.get(cellKey)!, rawValue);
      addValue(rowTotals.get(row)!, rawValue);
      addValue(columnTotals.get(column)!, rawValue);
      addValue(grandTotal, rawValue);
    });

    return { rowValues, columnValues, cells, rowTotals, columnTotals, grandTotal };
  }, [aggregation, columnFields, data, rowFields, valueField]);

  const dimensionOptions = dimensions.map((field) => ({ label: field.label, value: field.key }));
  const measureOptions = measures.map((field) => ({ label: field.label, value: field.key }));
  const aggregationOptions = Object.entries(aggregationLabels).map(([value, label]) => ({ value, label }));
  const isReady = data.length > 0 && rowFields.length > 0 && columnFields.length > 0 && (valueField || aggregation === "count");
  const dragging = fields.find((field) => field.key === draggingField);
  const addDimension = (target: "rows" | "columns", key: string) => {
    const setter = target === "rows" ? setRowFields : setColumnFields;
    setter((current) => (current.includes(key) ? current : [...current, key]));
  };

  return (
    <section className={cn("overflow-hidden rounded-xl border border-border bg-card shadow-sm", className)}>
      <header className="flex flex-col gap-4 border-b border-border px-5 py-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-3">
          <IconTile icon={Calculator} variant="outline" shape="rounded" containerSize="md" />
          <div>
            <h3 className="font-heading text-ui-title font-semibold text-foreground">{title}</h3>
            <p className="mt-1 panel-2xl text-ui-body-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <span className="w-fit rounded-full bg-subtle px-3 py-1 text-xs font-semibold text-subtle-foreground">
          {data.length} registros
        </span>
      </header>

      <div className="border-b border-border bg-muted/20 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Campos disponibles</p>
            <p className="mt-1 text-xs text-muted-foreground">Arrastra dimensiones o métricas hacia las zonas de análisis.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {fields.map((field) => (
            <button
              key={field.key}
              type="button"
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData("text/plain", field.key);
                event.dataTransfer.effectAllowed = "copy";
                setDraggingField(field.key);
              }}
              onDragEnd={() => setDraggingField(null)}
              className="inline-flex min-h-9 cursor-grab items-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-semibold text-foreground shadow-sm transition hover:border-primary/40 hover:bg-accent active:cursor-grabbing"
            >
              <GripVertical aria-hidden="true" className="size-3.5 text-muted-foreground" />
              {field.label}
              <span className="rounded bg-muted px-1.5 py-0.5 text-[0.625rem] uppercase text-muted-foreground">
                {field.type === "dimension" ? "Dimensión" : "Métrica"}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 border-b border-border bg-muted/30 p-4 sm:grid-cols-2 xl:grid-cols-4">
        <PivotSelector
          icon={Rows3}
          label="Filas"
          activeFields={rowFields.map((key) => ({ key, label: fieldLabel(key) }))}
          canDrop={dragging?.type === "dimension"}
          onDropField={(key) => addDimension("rows", key)}
          onRemoveField={(key) => setRowFields((current) => current.length > 1 ? current.filter((item) => item !== key) : current)}
        >
          <Select
            aria-label="Dimensión de filas"
            options={dimensionOptions}
            value={rowFields[0]}
            onChange={(value) => setRowFields([String(value ?? "")])}
            size="sm"
          />
        </PivotSelector>
        <PivotSelector
          icon={Columns3}
          label="Columnas"
          activeFields={columnFields.map((key) => ({ key, label: fieldLabel(key) }))}
          canDrop={dragging?.type === "dimension"}
          onDropField={(key) => addDimension("columns", key)}
          onRemoveField={(key) => setColumnFields((current) => current.length > 1 ? current.filter((item) => item !== key) : current)}
        >
          <Select
            aria-label="Dimensión de columnas"
            options={dimensionOptions}
            value={columnFields[0]}
            onChange={(value) => setColumnFields([String(value ?? "")])}
            size="sm"
          />
        </PivotSelector>
        <PivotSelector
          icon={Sigma}
          label="Métrica"
          activeFields={[{ key: valueField, label: fieldLabel(valueField) }]}
          canDrop={dragging?.type === "measure"}
          onDropField={setValueField}
        >
          <Select
            aria-label="Métrica"
            options={measureOptions}
            value={valueField}
            onChange={(value) => setValueField(String(value ?? ""))}
            size="sm"
          />
        </PivotSelector>
        <PivotSelector icon={Calculator} label="Cálculo">
          <Select
            aria-label="Agregación"
            options={aggregationOptions}
            value={aggregation}
            onChange={(value) => setAggregation(String(value ?? "sum") as PivotAggregation)}
            size="sm"
          />
        </PivotSelector>
      </div>

      {!isReady ? (
        <div className="grid min-h-56 place-items-center px-6 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full border-collapse text-sm" aria-label="Tabla dinámica">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="sticky left-0 z-10 min-w-44 bg-muted px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {rowFields.map(fieldLabel).join(" + ")} / {columnFields.map(fieldLabel).join(" + ")}
                </th>
                {pivot.columnValues.map((column) => (
                  <th key={column} className="min-w-32 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {(JSON.parse(column) as string[]).join(" · ")}
                  </th>
                ))}
                <th className="min-w-32 bg-primary/5 px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-foreground">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {pivot.rowValues.map((row) => (
                <tr key={row} className="border-b border-border last:border-0 hover:bg-accent/30">
                  <th className="sticky left-0 z-10 bg-card px-4 py-3 text-left font-semibold text-foreground">
                    {(JSON.parse(row) as string[]).join(" · ")}
                  </th>
                  {pivot.columnValues.map((column) => {
                    const accumulator = pivot.cells.get(JSON.stringify([row, column])) ?? emptyAccumulator();
                    return (
                      <td key={column} className="px-4 py-3 text-right tabular-nums text-foreground">
                        {formatValue(resolveValue(accumulator, aggregation), aggregation)}
                      </td>
                    );
                  })}
                  <td className="bg-primary/5 px-4 py-3 text-right font-semibold tabular-nums text-foreground">
                    {formatValue(resolveValue(pivot.rowTotals.get(row) ?? emptyAccumulator(), aggregation), aggregation)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border bg-muted/60 font-semibold">
                <th className="sticky left-0 z-10 bg-muted px-4 py-3 text-left">Total general</th>
                {pivot.columnValues.map((column) => (
                  <td key={column} className="px-4 py-3 text-right tabular-nums">
                    {formatValue(resolveValue(pivot.columnTotals.get(column) ?? emptyAccumulator(), aggregation), aggregation)}
                  </td>
                ))}
                <td className="bg-primary/10 px-4 py-3 text-right font-bold tabular-nums">
                  {formatValue(resolveValue(pivot.grandTotal, aggregation), aggregation)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </section>
  );
}

function PivotSelector({
  icon,
  label,
  children,
  activeFields = [],
  canDrop = false,
  onDropField,
  onRemoveField,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  label: string;
  children: React.ReactNode;
  activeFields?: Array<{ key: string; label: string }>;
  canDrop?: boolean;
  onDropField?: (key: string) => void;
  onRemoveField?: (key: string) => void;
}) {
  const Glyph = icon;
  return (
    <div
      data-pivot-zone={label.toLocaleLowerCase()}
      onDragOver={(event) => {
        if (!canDrop || !onDropField) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
      }}
      onDrop={(event) => {
        if (!canDrop || !onDropField) return;
        event.preventDefault();
        onDropField(event.dataTransfer.getData("text/plain"));
      }}
      className={cn(
        "grid gap-1.5 rounded-xl border border-transparent p-2 transition-colors",
        canDrop && "border-dashed border-primary/60 bg-primary/5",
      )}
    >
      <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        <Glyph aria-hidden="true" className="size-3.5" />
        {label}
      </span>
      {children}
      {activeFields.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {activeFields.map((field) => (
            <span key={field.key} className="inline-flex min-h-7 items-center gap-1.5 rounded-md bg-subtle px-2 text-[0.6875rem] font-semibold text-subtle-foreground">
              {field.label}
              {onRemoveField && activeFields.length > 1 ? (
                <button type="button" onClick={() => onRemoveField(field.key)} aria-label={`Quitar ${field.label}`}>
                  <X aria-hidden="true" className="size-3" />
                </button>
              ) : null}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export { PivotTable };
