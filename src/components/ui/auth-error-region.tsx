import * as React from "react";

import { Alert } from "./alert";

/**
 * El hueco del mensaje de error de los formularios de autenticación
 * (`LoginForm`, `PasswordResetForm`, `OtpForm`).
 *
 * No se exporta: es la misma decisión de accesibilidad escrita una sola vez,
 * no una pieza del contrato público. La región vive desde el primer render
 * aunque esté vacía, por dos motivos: un lector de pantalla solo anuncia el
 * cambio de una región viva que ya existía —si naciera junto con el mensaje,
 * se lo callaría—, y así el formulario no da un salto bajo el cursor cuando
 * el error aparece. El `role="alert"` lo pone `Alert` por su variante.
 */
export function AuthErrorRegion({ error }: { error?: React.ReactNode }) {
  return (
    <div aria-live="polite" className="empty:hidden">
      {error ? <Alert variant="destructive">{error}</Alert> : null}
    </div>
  );
}
