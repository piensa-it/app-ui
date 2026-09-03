import * as React from "react";

import { Toaster } from "@/components/ui/toast";
import { AlertDialogHost } from "@/components/ui/alert-dialog";

export type UiDensity = "compact" | "default" | "comfortable";

export interface UiProviderProps {
  children: React.ReactNode;
  /**
   * Densidad de toda la interfaz. Baja sola a cada control porque todos usan
   * los mismos tokens de altura y relleno, así que no hay que pasarla
   * componente por componente.
   *
   * - `compact` para pantallas de captura, donde importa cuántas filas caben.
   * - `default` para el resto.
   * - `comfortable` para tableros y pantallas de consulta en pantalla grande.
   *
   * Se puede acotar a una parte de la interfaz anidando otro `UiProvider`.
   * @default "default"
   */
  density?: UiDensity;
  /** Clases del envoltorio que marca la densidad. Solo aplica si hay `density`. */
  className?: string;
}

/**
 * Proveedor raíz de `@piensa-it/ui-library`.
 *
 * Todos los componentes son headless (Ark UI) y no requieren un contexto de
 * tema para renderizar — este proveedor solo monta los hosts globales que sí
 * necesitan un único punto de montaje: `<Toaster />` (notificaciones) y
 * `<AlertDialogHost />` (`confirmAlert(...)`).
 *
 * Acepta además la densidad de la interfaz, que se aplica como un atributo y
 * baja a todos los controles por tokens.
 *
 * @example
 * ```tsx
 * import { UiProvider } from "@piensa-it/ui-library";
 *
 * <UiProvider density="compact">
 *   <App />
 * </UiProvider>
 * ```
 */
export function UiProvider({ children, density, className }: UiProviderProps) {
  // Sin densidad no se envuelve nada: el árbol queda idéntico al de antes y
  // el `div` extra no aparece donde no hace falta.
  const content =
    density === undefined ? (
      children
    ) : (
      <div data-ui-density={density} className={className}>
        {children}
      </div>
    );

  return (
    <>
      {content}
      <Toaster />
      <AlertDialogHost />
    </>
  );
}
