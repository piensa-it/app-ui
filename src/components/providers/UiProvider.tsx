import * as React from "react";

import { Toaster } from "@/components/ui/toast";
import { AlertDialogHost } from "@/components/ui/alert-dialog";

export interface UiProviderProps {
  children: React.ReactNode;
}

/**
 * Proveedor raíz de `@piensa-it/ui-library`.
 *
 * Todos los componentes son headless (Ark UI) y no requieren un contexto de
 * tema para renderizar — este proveedor solo monta los hosts globales que sí
 * necesitan un único punto de montaje: `<Toaster />` (notificaciones) y
 * `<AlertDialogHost />` (`confirmAlert(...)`).
 *
 * @example
 * ```tsx
 * import { UiProvider } from "@piensa-it/ui-library";
 *
 * <UiProvider>
 *   <App />
 * </UiProvider>
 * ```
 */
export function UiProvider({ children }: UiProviderProps) {
  return (
    <>
      {children}
      <Toaster />
      <AlertDialogHost />
    </>
  );
}
