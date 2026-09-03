import * as React from "react";

import { cn } from "@/lib/utils";

export interface ToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Fila de controles con el espaciado del sistema: la barra superior, las
 * acciones de una tarjeta, los filtros sobre una tabla.
 *
 * Usa `ToolbarSeparator` para empujar a la derecha lo que venga después.
 *
 * @example
 * ```tsx
 * <Toolbar>
 *   <Select width="auto" aria-label="Periodo" options={periodos} />
 *   <ToolbarSeparator />
 *   <Button>Nuevo</Button>
 * </Toolbar>
 * ```
 */
export const Toolbar = React.forwardRef<HTMLDivElement, ToolbarProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-wrap items-center gap-xs", className)} {...props}>
      {children}
    </div>
  ),
);
Toolbar.displayName = "Toolbar";

export interface ToolbarSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Dibuja una línea vertical además de separar. Sin ella solo empuja el resto
   * del contenido hacia la derecha.
   * @default false
   */
  visible?: boolean;
}

/** Empuja hacia la derecha lo que venga después dentro de un `Toolbar`. */
export const ToolbarSeparator = React.forwardRef<HTMLDivElement, ToolbarSeparatorProps>(
  ({ visible = false, className, ...props }, ref) => (
    <div
      ref={ref}
      role="separator"
      aria-orientation="vertical"
      className={cn("ml-auto", visible && "h-5 w-px self-center bg-border", className)}
      {...props}
    />
  ),
);
ToolbarSeparator.displayName = "ToolbarSeparator";
