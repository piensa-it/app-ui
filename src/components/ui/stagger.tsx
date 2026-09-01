import { Children, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import "./motion.css";

export interface StaggerProps extends HTMLAttributes<HTMLDivElement> {
  /** Milisegundos entre la entrada de un hijo y el siguiente. @default 60 */
  gap?: number;
  /**
   * Clase del envoltorio de cada hijo. El envoltorio es quien ocupa la celda
   * cuando el contenedor es un grid/flex — úsala p. ej. para `h-full`.
   */
  itemClassName?: string;
  children: ReactNode;
}

/**
 * Entrada escalonada de los hijos con el preset `enter` del sistema de
 * movimiento (CSS puro, sin dependencias). Reemplaza el patrón de calcular
 * `animation-delay`/`transition delay` a mano por elemento.
 *
 * El contenedor recibe las clases de layout (`grid`, `flex`…): cada hijo se
 * envuelve en un item que hereda su posición y entra con un retraso
 * incremental. Con `prefers-reduced-motion` el contenido aparece sin animar.
 *
 * @example
 * <Stagger className="grid grid-cols-4 gap-4" itemClassName="h-full">
 *   {kpis.map((k) => <KpiCard key={k.id} {...k} />)}
 * </Stagger>
 */
export function Stagger({ gap = 60, itemClassName, className, children, ...props }: StaggerProps) {
  // toArray descarta null/booleanos, así el índice cuenta solo hijos reales.
  const items = Children.toArray(children);
  return (
    <div {...props} data-ui-stagger className={cn(className)}>
      {items.map((child, index) => (
        <div
          key={index}
          data-ui-stagger-item
          className={cn(itemClassName)}
          style={{ "--ui-stagger-delay": `${index * Math.max(0, gap)}ms` } as CSSProperties}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
