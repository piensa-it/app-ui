import * as React from "react";

import { cn } from "@/lib/utils";
import { UI_LIBRARY_VERSION } from "@/version";
import { useSidebar } from "./sidebar-context";

export interface AppVersionProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Versión de la aplicación que consume la librería. */
  version: string;
  /**
   * Fecha de compilación de la aplicación, en cualquier formato que entienda
   * `Date`. Normalmente se inyecta en el build (`define` de Vite).
   *
   * Solo se pinta con `details`.
   */
  buildDate?: string | number | Date;
  /**
   * Añade la versión de la librería y la fecha de compilación en una segunda
   * línea. @default false
   *
   * Su sitio es una pantalla de ayuda o de «acerca de», donde el texto se
   * puede leer y seleccionar. En el pie del menú lateral no: ahí compiten con
   * lo único que se consulta a diario, que es la versión de la aplicación.
   */
  details?: boolean;
  /** Prefijo delante de la versión de la aplicación. @default "v" */
  prefix?: string;
}

/** `2026-09-03`: una fecha de calendario, sin hora ni zona. */
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

function toDate(value: NonNullable<AppVersionProps["buildDate"]>): Date {
  if (value instanceof Date) return value;
  if (typeof value === "string") {
    const iso = ISO_DATE.exec(value);
    // `new Date("2026-09-03")` es medianoche UTC, así que al formatear en una
    // zona al oeste retrocede un día. Y ese es justo el formato que produce
    // `toISOString().slice(0, 10)`, que es lo que se inyecta en el build. Una
    // fecha de calendario se construye en horario local.
    if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  }
  return new Date(value);
}

function formatBuildDate(value: NonNullable<AppVersionProps["buildDate"]>): string | null {
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(date);
}

/**
 * Línea de versión para el pie del menú lateral.
 *
 * Muestra **solo la versión de la aplicación**, que es el único dato que se
 * consulta a diario. La versión de la librería y la fecha de compilación
 * también sirven para depurar un reporte, pero no en el menú: hasta la 0.6.0 se
 * pintaban las tres, y en un menú de 256 px la línea quedaba llena de datos que
 * nadie leía. Para eso está `details`, en una pantalla de ayuda, donde el texto
 * se puede leer y seleccionar de verdad.
 *
 * Antes el detalle vivía además en el `title`, con la idea de copiarlo al
 * reportar algo. No se usaba: un `title` no se puede seleccionar ni copiar sin
 * transcribirlo a mano.
 *
 * @example
 * ```tsx
 * // En el pie del menú: solo la versión.
 * <AppVersion version={import.meta.env.VITE_APP_VERSION} />
 *
 * // En la pantalla de ayuda: todo, para pegarlo en un reporte.
 * <AppVersion version={APP_VERSION} buildDate={BUILD_DATE} details />
 * ```
 */
export const AppVersion = React.forwardRef<HTMLDivElement, AppVersionProps>(
  ({ version, buildDate, details = false, prefix = "v", className, ...props }, ref) => {
    // Fuera de un `AppShell`, `collapsed` es siempre falso.
    const { collapsed } = useSidebar();
    const formattedDate = buildDate === undefined ? null : formatBuildDate(buildDate);
    // Con el menú plegado quedan 48 px útiles, así que `details` se ignora: si
    // se respetara, la línea volvería a partirse en cuatro renglones y a
    // salirse del componente, que es el fallo que se corrigió en la 0.5.0.
    const extras =
      details && !collapsed ? [`UI ${UI_LIBRARY_VERSION}`, ...(formattedDate ? [formattedDate] : [])] : [];

    return (
      <div
        ref={ref}
        // Hereda el color: su sitio natural es el pie del menú, que es otro
        // plano cromático. Fijar `text-muted-foreground` lo sacaría de ahí.
        className={cn("text-ui-caption text-current", collapsed && "text-center", className)}
        {...props}
      >
        <span className="block truncate">{`${prefix}${version}`}</span>
        {extras.length > 0 ? (
          <span className="block truncate opacity-75">
            {extras.map((extra, index) => (
              <React.Fragment key={extra}>
                {index > 0 ? <span aria-hidden="true"> · </span> : null}
                <span>{extra}</span>
              </React.Fragment>
            ))}
          </span>
        ) : null}
      </div>
    );
  },
);
AppVersion.displayName = "AppVersion";
