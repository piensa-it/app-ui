import * as React from "react";

import { cn } from "@/lib/utils";

export interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode;
  /** Una frase que explique de qué va la pantalla. No repitas el título. */
  description?: React.ReactNode;
  /** Acciones principales de la pantalla, alineadas a la derecha. */
  actions?: React.ReactNode;
  /** Contenido por encima del título: migas de pan, botón de volver, distintivos. */
  above?: React.ReactNode;
  /**
   * Nivel del encabezado. Baja a `h2` cuando el componente encabeza una
   * sección y no la página entera.
   * @default "h1"
   */
  as?: "h1" | "h2" | "h3";
}

/**
 * Encabezado de página: título, descripción y acciones, con el ritmo del
 * sistema. Va como primer hijo de `PageContainer`.
 *
 * @example
 * ```tsx
 * <PageHeader
 *   title="Arqueo de caja"
 *   description="Cierre del turno de la mañana."
 *   actions={<Button>Cerrar turno</Button>}
 * />
 * ```
 */
export const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ title, description, actions, above, as: Heading = "h1", className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-sm", className)} {...props}>
      {above ? <div className="flex flex-wrap items-center gap-xs">{above}</div> : null}
      <div className="flex flex-col gap-md sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2xs">
          <Heading
            className={cn(
              "font-heading font-semibold tracking-tight text-foreground",
              Heading === "h1" ? "text-ui-title" : "text-ui-title-sm",
            )}
          >
            {title}
          </Heading>
          {description ? (
            <p className="text-ui-body-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-xs">{actions}</div> : null}
      </div>
    </div>
  ),
);
PageHeader.displayName = "PageHeader";
