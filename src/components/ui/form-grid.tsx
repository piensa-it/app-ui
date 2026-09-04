import * as React from "react";

import { cn } from "@/lib/utils";

export interface FormGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Columnas a partir de pantalla mediana. En pantalla estrecha siempre es una:
   * un formulario a dos columnas en un teléfono no se rellena, se sufre.
   * @default 2
   */
  columns?: 1 | 2;
  children: React.ReactNode;
}

/**
 * Rejilla de campos de formulario, con el espaciado del sistema.
 *
 * Existe porque cada formulario reinventaba su `grid gap-… sm:grid-cols-2`, y
 * para que un campo ocupara la fila entera había que escribir clases de rejilla
 * en el campo. Con esto, un campo ancho se declara con `span="full"`.
 *
 * @example
 * ```tsx
 * <FormGrid>
 *   <Field label="Nombre"><Input /></Field>
 *   <Field label="Documento"><Input /></Field>
 *   <Field label="Notas" span="full"><Textarea /></Field>
 * </FormGrid>
 * ```
 */
export const FormGrid = React.forwardRef<HTMLDivElement, FormGridProps>(
  ({ columns = 2, className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("grid grid-cols-1 gap-ui-md", columns === 2 && "sm:grid-cols-2", className)}
      {...props}
    >
      {children}
    </div>
  ),
);
FormGrid.displayName = "FormGrid";
