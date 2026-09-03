import * as React from "react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

import { cn } from "@/lib/utils";

export interface StatTrend {
  /** Texto de la variación: "+12%", "-4 pts", "3 más que ayer". */
  value: React.ReactNode;
  /** Sentido de la variación. Decide el color y el texto que se anuncia. */
  direction: "up" | "down" | "flat";
  /**
   * Si una subida es mala (gastos, incidencias, mora), ponlo en `false` para
   * que el verde y el rojo no digan lo contrario de lo que pasa.
   * @default true
   */
  goodWhenUp?: boolean;
}

export interface StatProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Qué se está midiendo. */
  label: React.ReactNode;
  /** La cifra, ya formateada. La librería no formatea números por ti. */
  value: React.ReactNode;
  /** Una línea de contexto bajo la cifra. */
  description?: React.ReactNode;
  /** Variación respecto al periodo anterior. */
  trend?: StatTrend;
  /** Icono a la izquierda del rótulo. */
  icon?: React.ReactNode;
  /** La cifra todavía se está calculando. */
  loading?: boolean;
}

const TREND_TEXT: Record<StatTrend["direction"], string> = {
  up: "sube",
  down: "baja",
  flat: "sin cambio",
};

const TREND_ICON: Record<StatTrend["direction"], typeof ArrowUp> = {
  up: ArrowUp,
  down: ArrowDown,
  flat: Minus,
};

function trendTone(trend: StatTrend): string {
  if (trend.direction === "flat") return "text-muted-foreground";
  const good = trend.direction === "up" ? trend.goodWhenUp !== false : trend.goodWhenUp === false;
  return good ? "text-success" : "text-destructive";
}

/**
 * Una cifra con su rótulo: el bloque que encabeza casi cualquier pantalla de
 * consulta.
 *
 * Usa `<dl>`/`<dt>`/`<dd>` y no un encabezado. Un `<h3>` cuyo texto es
 * "$ 60.938.100" ensucia el esquema de la página: quien navega por encabezados
 * se encuentra números sueltos en vez de secciones.
 *
 * @example
 * ```tsx
 * <StatGroup>
 *   <Stat label="Entradas" value={pesos(entradas)} description="6 recaudos" />
 *   <Stat label="Salidas" value={pesos(salidas)} trend={{ value: "+8%", direction: "up", goodWhenUp: false }} />
 * </StatGroup>
 * ```
 */
export const Stat = React.forwardRef<HTMLDivElement, StatProps>(
  ({ label, value, description, trend, icon, loading = false, className, ...props }, ref) => {
    const labelId = React.useId();
    const TrendIcon = trend ? TREND_ICON[trend.direction] : null;

    return (
      <div
        ref={ref}
        role="group"
        aria-labelledby={labelId}
        aria-busy={loading || undefined}
        className={cn(
          "rounded-lg border border-raised-border bg-raised p-inset shadow-raised",
          className,
        )}
        {...props}
      >
        <dl className="flex flex-col gap-2xs">
          <dt id={labelId} className="flex items-center gap-xs text-ui-body-sm text-muted-foreground">
            {icon ? (
              <span aria-hidden="true" className="grid size-4 place-items-center [&_svg]:size-4">
                {icon}
              </span>
            ) : null}
            {label}
          </dt>
          <dd
            className={cn(
              "font-heading text-ui-title font-semibold tabular-nums tracking-tight text-foreground",
              loading && "animate-pulse text-muted-foreground",
            )}
          >
            {value}
          </dd>
          {trend ? (
            <dd className={cn("flex items-center gap-2xs text-ui-body-sm font-medium", trendTone(trend))}>
              {TrendIcon ? <TrendIcon aria-hidden="true" className="size-4" /> : null}
              {/* El sentido se anuncia además de pintarse: el color solo no
                  llega a quien no lo distingue. */}
              <span aria-label={`${TREND_TEXT[trend.direction]}: ${trend.value}`}>{trend.value}</span>
            </dd>
          ) : null}
          {description ? (
            <dd className="text-ui-body-sm text-muted-foreground">{description}</dd>
          ) : null}
        </dl>
      </div>
    );
  },
);
Stat.displayName = "Stat";

export interface StatGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Nombre del grupo. @default "Indicadores" */
  label?: string;
  /** Columnas en pantalla ancha. @default 3 */
  columns?: 2 | 3 | 4;
  children: React.ReactNode;
}

const GROUP_COLUMNS: Record<NonNullable<StatGroupProps["columns"]>, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

/** Fila de métricas, con el espaciado del sistema. */
export const StatGroup = React.forwardRef<HTMLDivElement, StatGroupProps>(
  ({ label = "Indicadores", columns = 3, className, children, ...props }, ref) => (
    <div
      ref={ref}
      role="group"
      aria-label={label}
      className={cn("grid grid-cols-1 gap-md", GROUP_COLUMNS[columns], className)}
      {...props}
    >
      {children}
    </div>
  ),
);
StatGroup.displayName = "StatGroup";
