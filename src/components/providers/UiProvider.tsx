import * as React from "react";
import { PrimeReactProvider } from "primereact/api";

import { piensaTheme } from "@/lib/primereact-theme";
import { Toaster } from "@/components/ui/toast";
import { AlertDialogHost } from "@/components/ui/alert-dialog";
import "@/lib/locale-es";

export interface UiProviderProps {
  children: React.ReactNode;
  /** Configuración regional para componentes PrimeReact (fechas, mensajes). @default "es" */
  locale?: string;
}

/**
 * Proveedor raíz de `@piensa-it/ui-library`.
 *
 * Envuelve `PrimeReactProvider` ya configurado en modo `unstyled` con el
 * tema Tailwind de Piensa IT (`primereact-theme.ts`), para que las apps
 * consumidoras no tengan que conocer los detalles de PrimeReact.
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
export function UiProvider({ children, locale = "es" }: UiProviderProps) {
  return (
    <PrimeReactProvider value={{ unstyled: true, pt: piensaTheme, locale, ripple: false }}>
      {children}
      <Toaster />
      <AlertDialogHost />
    </PrimeReactProvider>
  );
}
