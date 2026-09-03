import * as React from "react";
import {
  ResponsiveContainer,
  BarChart,
  ComposedChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";

const DEFAULT_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export interface ChartSeries {
  /** Campo del objeto de datos a graficar. */
  key: string;
  /** Etiqueta legible (leyenda/tooltip). Por defecto usa `key`. */
  label?: string;
  color?: string;
  /** Permite combinar barras, líneas y áreas dentro de `type="composed"`. */
  type?: "bar" | "line" | "area";
  /** Patrón SVG, útil para diferenciar pronósticos de datos reales. */
  strokeDasharray?: string;
  opacity?: number;
  stackId?: string;
}

export interface ChartReferenceLine {
  value: number;
  label?: string;
  color?: string;
  strokeDasharray?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- fila genérica de datos de la gráfica.
export type ChartDatum = Record<string, any>;

/** Límite de dominio del eje Y, en la misma sintaxis que acepta Recharts. */
export type ChartAxisDomainValue = number | "auto" | "dataMin" | "dataMax";

export interface ChartYAxis {
  /**
   * Rango del eje Y como `[min, max]`. Acepta números, `"auto"` (ticks
   * "bonitos" alrededor de los datos), `"dataMin"`/`"dataMax"`, o una
   * expresión de Recharts como `"dataMax + 100"`.
   *
   * Por defecto, `type="line"` usa `["auto", "auto"]` — lo que se espera al
   * dibujar una serie de precios — y el resto de tipos `[0, "auto"]`.
   */
  domain?: [ChartAxisDomainValue | string, ChartAxisDomainValue | string];
  /** Cantidad aproximada de marcas del eje. @default 5 */
  tickCount?: number;
}

export interface ChartProps {
  type: "bar" | "line" | "area" | "pie" | "donut" | "composed";
  data: ChartDatum[];
  /** Campo usado como eje X (o como etiqueta de cada porción en pie/donut). */
  categoryKey: string;
  /** Series a graficar. En pie/donut solo se usa la primera. */
  series: ChartSeries[];
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Métrica principal asociada a la visualización. */
  value?: React.ReactNode;
  /** Variación o contexto breve de la métrica. */
  trend?: React.ReactNode;
  actions?: React.ReactNode;
  loading?: boolean;
  emptyMessage?: React.ReactNode;
  /** Muestra superficie, borde y encabezado de panel. @default true */
  framed?: boolean;
  /** Líneas horizontales para metas, presupuestos o límites. */
  referenceLines?: ChartReferenceLine[];
  /**
   * Formatea los valores de ejes y tooltips (moneda, porcentaje, unidades).
   * Es el respaldo de `axisFormatter` y `tooltipFormatter` cuando no se pasan.
   */
  valueFormatter?: (value: number) => string;
  /** Formatea solo las marcas del eje Y (p. ej. "2,7 M" mientras el tooltip muestra la cifra completa). */
  axisFormatter?: (value: number) => string;
  /** Formatea solo los valores del tooltip. */
  tooltipFormatter?: (value: number) => string;
  /** Ancho en px reservado a las etiquetas del eje Y. Recharts recorta a 60 px las cifras largas. @default 60 */
  yAxisWidth?: number;
  /** Permite marcas decimales en el eje Y. @default true */
  allowDecimals?: boolean;
  /** Dominio y marcas del eje Y. No aplica a pie/donut. */
  yAxis?: ChartYAxis;
  /**
   * Campo de cada fila con el color de esa categoría (barras y porciones):
   * `data={[{ moneda: "USD", total: 10, color: "hsl(var(--chart-2))" }]}` con
   * `colorKey="color"`. Sin él, las barras usan el color de la serie y las
   * porciones la paleta por índice.
   */
  colorKey?: string;
  className?: string;
}

const tooltipStyle: React.CSSProperties = {
  borderRadius: "var(--radius)",
  border: "1px solid hsl(var(--border))",
  backgroundColor: "hsl(var(--popover))",
  color: "hsl(var(--popover-foreground))",
  fontSize: "0.8125rem",
  boxShadow: "0 4px 6px -1px hsl(var(--shadow-color) / 0.1)",
};

/**
 * Gráficas sobre Recharts (SVG, no canvas) — a diferencia de Chart.js, se
 * estilan con las CSS variables de la librería en vez de colores fijos en
 * JS, así que respetan tema claro/oscuro automáticamente.
 *
 * @example
 * ```tsx
 * <Chart
 *   type="bar"
 *   data={[{ mes: "Ene", proyectos: 4 }, { mes: "Feb", proyectos: 7 }]}
 *   categoryKey="mes"
 *   series={[{ key: "proyectos", label: "Proyectos activos" }]}
 * />
 * ```
 */
function Chart({
  type,
  data,
  categoryKey,
  series,
  height = 300,
  showLegend = true,
  showGrid = true,
  title,
  description,
  value,
  trend,
  actions,
  loading = false,
  emptyMessage = "No hay datos para visualizar.",
  framed = true,
  referenceLines = [],
  valueFormatter,
  axisFormatter,
  tooltipFormatter,
  yAxisWidth,
  allowDecimals = true,
  yAxis,
  colorKey,
  className,
}: ChartProps) {
  const formatAxis = axisFormatter ?? valueFormatter;
  const formatTooltip = tooltipFormatter ?? valueFormatter;
  const colorOf = (row: ChartDatum, index: number, fallback: string) =>
    (colorKey && typeof row[colorKey] === "string" ? (row[colorKey] as string) : undefined) ??
    (fallback || DEFAULT_COLORS[index % DEFAULT_COLORS.length]);
  const colored = series.map((item, index) => ({
    ...item,
    color: item.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length],
  }));
  const chartId = React.useId().replace(/:/g, "");
  let visualization: React.ReactNode;

  if (type === "pie" || type === "donut") {
    const primary = colored[0];
    visualization = (
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey={primary?.key}
              nameKey={categoryKey}
              innerRadius={type === "donut" ? "60%" : 0}
              outerRadius="84%"
              paddingAngle={3}
              cornerRadius={5}
            >
              {data.map((row, index) => (
                <Cell key={index} fill={colorOf(row, index, "")} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={formatTooltip ? (value) => formatTooltip(Number(value)) : undefined}
            />
            {showLegend ? <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "0.8125rem" }} /> : null}
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  } else {
    const ChartComponent =
      type === "bar" ? BarChart : type === "line" ? LineChart : type === "area" ? AreaChart : ComposedChart;
    visualization = (
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer width="100%" height="100%">
          <ChartComponent data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
            <defs>
              {colored.map((item) => (
                <linearGradient key={item.key} id={`${chartId}-${item.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={item.color} stopOpacity={0.28} />
                  <stop offset="95%" stopColor={item.color} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            {showGrid ? <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" /> : null}
            <XAxis dataKey={categoryKey} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatAxis}
              width={yAxisWidth}
              allowDecimals={allowDecimals}
              domain={yAxis?.domain ?? (type === "line" ? ["auto", "auto"] : [0, "auto"])}
              tickCount={yAxis?.tickCount}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              cursor={{ fill: "hsl(var(--accent))", opacity: 0.4 }}
              formatter={formatTooltip ? (value) => formatTooltip(Number(value)) : undefined}
            />
            {showLegend ? (
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "0.8125rem", paddingTop: "12px" }} />
            ) : null}
            {referenceLines.map((reference) => (
              <ReferenceLine
                key={`${reference.label}-${reference.value}`}
                y={reference.value}
                label={reference.label ? { value: reference.label, position: "insideTopRight", fill: "hsl(var(--muted-foreground))", fontSize: 11 } : undefined}
                stroke={reference.color ?? "hsl(var(--muted-foreground))"}
                strokeDasharray={reference.strokeDasharray ?? "5 5"}
              />
            ))}
            {colored.map((item) => {
              const seriesType = item.type ?? (type === "composed" ? "line" : type);
              return seriesType === "bar" ? (
                <Bar
                  key={item.key}
                  dataKey={item.key}
                  name={item.label ?? item.key}
                  fill={item.color}
                  fillOpacity={item.opacity}
                  stackId={item.stackId}
                  radius={[6, 6, 2, 2]}
                >
                  {colorKey
                    ? data.map((row, index) => <Cell key={index} fill={colorOf(row, index, item.color)} />)
                    : null}
                </Bar>
              ) : seriesType === "line" ? (
                <Line
                  key={item.key}
                  type="monotone"
                  dataKey={item.key}
                  name={item.label ?? item.key}
                  stroke={item.color}
                  strokeWidth={2}
                  strokeDasharray={item.strokeDasharray}
                  opacity={item.opacity}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, fill: "hsl(var(--card))" }}
                />
              ) : (
                <Area
                  key={item.key}
                  type="monotone"
                  dataKey={item.key}
                  name={item.label ?? item.key}
                  stroke={item.color}
                  strokeWidth={2}
                  fill={`url(#${chartId}-${item.key})`}
                  fillOpacity={1}
                  strokeDasharray={item.strokeDasharray}
                  opacity={item.opacity}
                  stackId={item.stackId}
                />
              );
            })}
          </ChartComponent>
        </ResponsiveContainer>
      </div>
    );
  }

  const content = loading ? (
    <div className="flex items-end gap-3 px-2" style={{ height }}>
      {[42, 68, 54, 82, 65, 90, 72].map((size, index) => (
        <div key={index} className="flex-1 animate-pulse rounded-t-md bg-muted" style={{ height: `${size}%` }} />
      ))}
    </div>
  ) : data.length === 0 ? (
    <div className="grid place-items-center text-sm text-muted-foreground" style={{ height }}>
      {emptyMessage}
    </div>
  ) : visualization;

  return (
    <section className={framed ? `overflow-hidden rounded-lg border border-border bg-card shadow-sm ${className ?? ""}` : className}>
      {title || description || value || trend || actions ? (
        <header className="flex flex-col gap-4 border-b border-border px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {title ? <h3 className="font-heading text-base font-semibold text-foreground">{title}</h3> : null}
            {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
            {value ? (
              <div className="mt-4 flex flex-wrap items-baseline gap-2">
                <span className="font-heading text-3xl font-semibold tracking-tight text-foreground">{value}</span>
                {trend ? <span className="text-sm font-medium text-success">{trend}</span> : null}
              </div>
            ) : null}
          </div>
          {actions}
        </header>
      ) : null}
      <div className={framed ? "px-4 pb-4 pt-5" : undefined}>{content}</div>
    </section>
  );
}

export { Chart };
