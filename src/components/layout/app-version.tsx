import * as React from "react";

import { cn } from "@/lib/utils";
import { UI_LIBRARY_VERSION } from "@/version";

export interface AppVersionProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Versión de la aplicación que consume la librería. */
  version: string;
  /**
   * Fecha de compilación de la aplicación, en cualquier formato que entienda
   * `Date`. Normalmente se inyecta en el build (`define` de Vite).
   */
  buildDate?: string | number | Date;
  /** Prefijo delante de la versión de la aplicación. @default "v" */
  prefix?: string;
}

function formatBuildDate(value: NonNullable<AppVersionProps["buildDate"]>): string | null {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(date);
}

/**
 * Línea de versión para el pie del menú lateral o la pantalla de ayuda.
 *
 * Muestra la versión de la aplicación, la de la librería y la fecha de
 * compilación. Existe para depurar: lo primero al recibir un reporte es saber
 * contra qué compilado estaba mirando quien lo envía, y eso son dos versiones,
 * no una. El detalle completo queda además en el `title`, listo para copiar y
 * pegar en el reporte.
 *
 * @example
 * ```tsx
 * <AppVersion version={import.meta.env.VITE_APP_VERSION} buildDate={import.meta.env.VITE_BUILD_DATE} />
 * ```
 */
export const AppVersion = React.forwardRef<HTMLDivElement, AppVersionProps>(
  ({ version, buildDate, prefix = "v", className, ...props }, ref) => {
    const formattedDate = buildDate === undefined ? null : formatBuildDate(buildDate);
    const parts = [`${prefix}${version}`, `UI ${UI_LIBRARY_VERSION}`, ...(formattedDate ? [formattedDate] : [])];

    return (
      <div
        ref={ref}
        title={parts.join(" · ")}
        // Hereda el color: su sitio natural es el pie del menú, que es otro
        // plano cromático. Fijar `text-muted-foreground` lo sacaría de ahí.
        className={cn("text-ui-caption text-current", className)}
        {...props}
      >
        {parts.map((part, index) => (
          <React.Fragment key={part}>
            {index > 0 ? <span aria-hidden="true"> · </span> : null}
            <span>{part}</span>
          </React.Fragment>
        ))}
      </div>
    );
  },
);
AppVersion.displayName = "AppVersion";
