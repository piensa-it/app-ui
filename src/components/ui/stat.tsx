import * as React from "react";
import { ArrowDown, ArrowUp, ChevronDown, ChevronUp, Minus } from "lucide-react";

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

/**
 * Qué clase de noticia es la cifra. No es lo mismo que `trend`, que habla de
 * la variación respecto al periodo anterior: una cartera puede estar plana y
 * aun así estar vencida.
 *
 * La regla para elegir entre `warning` y `negative` es el PLAZO, no la
 * gravedad: lo que vence esta semana todavía se paga a tiempo; lo vencido ya
 * llegó tarde. Cuando todo lo que pide atención sale en rojo, el rojo deja de
 * significar nada.
 */
export type StatTone = "default" | "positive" | "warning" | "negative";

export interface StatProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Qué se está midiendo. */
  label: React.ReactNode;
  /**
   * Qué clase de noticia es la cifra. @default "default"
   *
   * - `default`: informativa. Es un dato, no una noticia. Va en el color de
   *   marca, no en gris: un tablero de seis cifras en gris no dice «esto es
   *   normal», dice «esto está apagado».
   * - `positive`: salió bien.
   * - `warning`: hay que mirarlo esta semana.
   * - `negative`: hay que hacer algo ya.
   *
   * Solo `negative` tiñe la cifra. En ámbar no: el borde y el icono ya lo
   * señalan, y un tablero con cuatro cifras de colores distintos se lee peor.
   */
  tone?: StatTone;
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

const TONE: Record<
  StatTone,
  { icon: string; border: string; value: string; announce: string | null }
> = {
  default: { icon: "text-primary", border: "border-raised-border", value: "text-foreground", announce: null },
  positive: { icon: "text-success", border: "border-success/40", value: "text-foreground", announce: "salió bien" },
  warning: { icon: "text-warning", border: "border-warning/50", value: "text-foreground", announce: "requiere atención esta semana" },
  negative: { icon: "text-destructive", border: "border-destructive/40", value: "text-destructive", announce: "requiere acción" },
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
  ({ label, value, description, trend, icon, tone = "default", loading = false, className, ...props }, ref) => {
    const labelId = React.useId();
    const TrendIcon = trend ? TREND_ICON[trend.direction] : null;
    const styles = TONE[tone];

    return (
      <div
        ref={ref}
        role="group"
        aria-labelledby={labelId}
        aria-busy={loading || undefined}
        className={cn("rounded-lg border bg-raised p-inset shadow-raised", styles.border, className)}
        {...props}
      >
        <dl className="flex flex-col gap-ui-2xs">
          <dt id={labelId} className="flex items-center gap-ui-xs text-ui-body-sm text-muted-foreground">
            {icon ? (
              <span aria-hidden="true" className={cn("grid size-4 place-items-center [&_svg]:size-4", styles.icon)}>
                {icon}
              </span>
            ) : null}
            {label}
            {/* El tono se anuncia además de pintarse: el color solo no llega a
                quien no lo distingue, y con la marca en verde `default` y
                `positive` salen del mismo color. */}
            {styles.announce ? <span className="sr-only">, {styles.announce}</span> : null}
          </dt>
          <dd
            className={cn(
              "font-heading text-ui-title font-semibold tabular-nums tracking-tight",
              styles.value,
              loading && "animate-pulse text-muted-foreground",
            )}
          >
            {value}
          </dd>
          {trend ? (
            <dd className={cn("flex items-center gap-ui-2xs text-ui-body-sm font-medium", trendTone(trend))}>
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
  /**
   * Deja ocultar y mostrar los indicadores. @default false
   *
   * Una pantalla de tabla no siempre quiere las cifras arriba: quien captura
   * cuarenta movimientos al día prefiere las filas, y quien supervisa
   * prefiere el resumen. Con esto lo decide cada persona, y no la pantalla
   * por todos.
   */
  collapsible?: boolean;
  /** Estado inicial cuando no hay preferencia guardada. @default false */
  defaultCollapsed?: boolean;
  /**
   * Clave para recordar en este dispositivo si se ocultaron. Ponla distinta
   * por pantalla; sin clave, no se recuerda. Mismo mecanismo que `AppShell`.
   */
  storageKey?: string;
  /** Textos del botón. */
  labels?: { hide?: string; show?: string };
  children: React.ReactNode;
}

const GROUP_COLUMNS: Record<NonNullable<StatGroupProps["columns"]>, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

const groupKeyFor = (key: string) => `ui-stats:${key}:collapsed`;

function readStoredCollapsed(key: string | undefined, fallback: boolean): boolean {
  if (!key || typeof window === "undefined") return fallback;
  try {
    const stored = window.localStorage.getItem(groupKeyFor(key));
    return stored === null ? fallback : stored === "true";
  } catch {
    return fallback;
  }
}

/** Fila de métricas, con el espaciado del sistema. Opcionalmente plegable. */
export const StatGroup = React.forwardRef<HTMLDivElement, StatGroupProps>(
  (
    { label = "Indicadores", columns = 3, collapsible = false, defaultCollapsed = false, storageKey, labels, className, children, ...props },
    ref,
  ) => {
    const [collapsed, setCollapsedState] = React.useState(() => readStoredCollapsed(storageKey, defaultCollapsed));
    const gridId = React.useId();
    const text = { hide: "Ocultar indicadores", show: "Mostrar indicadores", ...labels };

    const setCollapsed = (next: boolean) => {
      setCollapsedState(next);
      if (!storageKey || typeof window === "undefined") return;
      try {
        window.localStorage.setItem(groupKeyFor(storageKey), String(next));
      } catch {
        // Se pliega igual aunque no se pueda recordar.
      }
    };

    const grid = (
      <div id={gridId} className={cn("grid grid-cols-1 gap-ui-md", GROUP_COLUMNS[columns])}>
        {children}
      </div>
    );

    if (!collapsible) {
      return (
        <div ref={ref} role="group" aria-label={label} className={cn("grid grid-cols-1 gap-ui-md", GROUP_COLUMNS[columns], className)} {...props}>
          {children}
        </div>
      );
    }

    return (
      <div ref={ref} role="group" aria-label={label} className={cn("flex flex-col gap-ui-xs", className)} {...props}>
        {/* El botón va a la derecha y en caja, como una acción secundaria de
            la pantalla: plegado, es lo único que queda y no debe parecer un
            título huérfano. */}
        <div className="flex items-center justify-end">
          <button
            type="button"
            aria-expanded={!collapsed}
            aria-controls={gridId}
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "inline-flex items-center gap-ui-2xs rounded-md px-ui-xs py-ui-2xs text-ui-caption font-medium text-muted-foreground",
              "transition-colors duration-fast hover:bg-surface-hover hover:text-foreground",
              "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            )}
          >
            {collapsed ? <ChevronDown aria-hidden="true" className="size-4" /> : <ChevronUp aria-hidden="true" className="size-4" />}
            {collapsed ? text.show : text.hide}
          </button>
        </div>
        {collapsed ? null : grid}
      </div>
    );
  },
);
StatGroup.displayName = "StatGroup";
