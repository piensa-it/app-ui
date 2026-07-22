import * as React from "react";
import {
  ResponsiveContainer,
  BarChart,
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
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- fila genérica de datos de la gráfica.
export type ChartDatum = Record<string, any>;

export interface ChartProps {
  type: "bar" | "line" | "area" | "pie" | "donut";
  data: ChartDatum[];
  /** Campo usado como eje X (o como etiqueta de cada porción en pie/donut). */
  categoryKey: string;
  /** Series a graficar. En pie/donut solo se usa la primera. */
  series: ChartSeries[];
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  className?: string;
}

const tooltipStyle: React.CSSProperties = {
  borderRadius: "var(--radius)",
  border: "1px solid hsl(var(--border))",
  backgroundColor: "hsl(var(--popover))",
  color: "hsl(var(--popover-foreground))",
  fontSize: "0.8125rem",
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
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
function Chart({ type, data, categoryKey, series, height = 300, showLegend = true, showGrid = true, className }: ChartProps) {
  const colored = series.map((s, i) => ({ ...s, color: s.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length] }));

  if (type === "pie" || type === "donut") {
    const primary = colored[0];
    return (
      <div className={className} style={{ width: "100%", height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey={primary?.key}
              nameKey={categoryKey}
              innerRadius={type === "donut" ? "60%" : 0}
              outerRadius="85%"
              paddingAngle={2}
            >
              {data.map((_, index) => (
                <Cell key={index} fill={DEFAULT_COLORS[index % DEFAULT_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            {showLegend ? <Legend /> : null}
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  const ChartComponent = type === "bar" ? BarChart : type === "line" ? LineChart : AreaChart;

  return (
    <div className={className} style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          {showGrid ? <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /> : null}
          <XAxis dataKey={categoryKey} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--accent))", opacity: 0.4 }} />
          {showLegend ? <Legend /> : null}
          {colored.map((s) =>
            type === "bar" ? (
              <Bar key={s.key} dataKey={s.key} name={s.label ?? s.key} fill={s.color} radius={[4, 4, 0, 0]} />
            ) : type === "line" ? (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label ?? s.key}
                stroke={s.color}
                strokeWidth={2}
                dot={false}
              />
            ) : (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label ?? s.key}
                stroke={s.color}
                fill={s.color}
                fillOpacity={0.2}
              />
            ),
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
}

export { Chart };
