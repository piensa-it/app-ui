import * as React from "react";

import { cn } from "@/lib/utils";
import { Stagger } from "@/components/ui/stagger";

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Ancho máximo del contenido.
   * - `default` para pantallas de lectura y formularios.
   * - `wide` para tableros y tablas anchas.
   * - `full` cuando el contenido gestiona su propio ancho.
   * @default "default"
   */
  width?: "default" | "wide" | "full";
  /**
   * Escalona la entrada de los bloques de primer nivel.
   *
   * Viene activado a propósito: si cada pantalla tuviera que decidir si se
   * anima, solo unas pocas lo harían y la aplicación se sentiría irregular.
   * `Stagger` respeta `prefers-reduced-motion` sin configuración: con esa
   * preferencia activa el contenido aparece de golpe, sin desplazamiento.
   * @default true
   */
  animate?: boolean;
  /** Milisegundos entre la entrada de un bloque y el siguiente. @default 60 */
  staggerGap?: number;
  children: React.ReactNode;
}

const WIDTHS: Record<NonNullable<PageContainerProps["width"]>, string> = {
  default: "max-w-5xl",
  wide: "max-w-screen-2xl",
  full: "",
};

/**
 * Contenedor de una página: ancho de lectura, relleno y ritmo vertical entre
 * bloques, con la entrada escalonada ya resuelta.
 *
 * Cada hijo directo es un "bloque de primer nivel" y recibe el ritmo
 * (`--space-stack`, 24 px) y su turno en la animación de entrada. Agrupa en un
 * mismo hijo lo que deba entrar junto.
 *
 * @example
 * ```tsx
 * <PageContainer>
 *   <PageHeader title="Arqueo de caja" actions={<Button>Cerrar turno</Button>} />
 *   <Card>…</Card>
 *   <DataTable value={movimientos}>…</DataTable>
 * </PageContainer>
 * ```
 */
export const PageContainer = React.forwardRef<HTMLDivElement, PageContainerProps>(
  ({ width = "default", animate = true, staggerGap = 60, className, children, ...props }, ref) => {
    const classes = cn(
      "mx-auto w-full px-md py-lg sm:px-lg",
      WIDTHS[width],
      // El ritmo vertical no se declara pantalla por pantalla: lo pone el
      // contenedor, y por eso todas las páginas respiran igual.
      "space-y-stack",
      className,
    );

    if (!animate) {
      return (
        <div ref={ref} className={classes} {...props}>
          {children}
        </div>
      );
    }

    return (
      <Stagger ref={ref} gap={staggerGap} className={classes} {...props}>
        {children}
      </Stagger>
    );
  },
);
PageContainer.displayName = "PageContainer";
