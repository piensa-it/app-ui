import * as React from "react";

import { cn } from "@/lib/utils";
import { Label } from "./label";

export interface FieldProps {
  label: React.ReactNode;
  children: React.ReactElement<{
    id?: string;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean | "true" | "false";
  }>;
  description?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  optionalLabel?: React.ReactNode;
  orientation?: "vertical" | "horizontal";
  variant?: "plain" | "outline" | "surface" | "subtle";
  density?: "compact" | "comfortable";
  /**
   * Ancho del campo dentro de un `FormGrid`. `full` ocupa la fila entera, para
   * notas, direcciones o cualquier campo que no quepa cómodo a media fila.
   * @default 1
   */
  span?: 1 | "full";
  className?: string;
}

/**
 * Compone label, ayuda y error de un control, conectando automáticamente sus
 * relaciones accesibles mediante `id` y `aria-describedby`.
 */
export function Field({
  label,
  children,
  description,
  error,
  required = false,
  optionalLabel,
  orientation = "vertical",
  variant = "plain",
  density = "comfortable",
  span = 1,
  className,
}: FieldProps) {
  const generatedId = React.useId();
  const controlId = children.props.id ?? `field-${generatedId}`;
  const descriptionId = description && !error ? `${controlId}-description` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [children.props["aria-describedby"], descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  // La fila de rótulo (+ el aviso de opcional) es idéntica en las dos
  // orientaciones; lo único que cambia es qué más comparte columna con ella.
  const labelRow = (
    <div className="flex items-baseline justify-between gap-ui-sm">
      <Label htmlFor={controlId}>
        {label}
        {required ? <span aria-hidden="true" className="ml-1 text-destructive">*</span> : null}
      </Label>
      {!required && optionalLabel ? <span className="text-xs text-muted-foreground">{optionalLabel}</span> : null}
    </div>
  );

  return (
    <div
      className={cn(
        "grid",
        span === "full" && "sm:col-span-2",
        // El espacio entre etiqueta, control y mensaje sale de la escala:
        // así todos los formularios de todas las aplicaciones respiran igual.
        density === "compact" ? "gap-ui-2xs" : "gap-field",
        variant === "outline" && "rounded-xl border border-border bg-raised p-inset-compact",
        variant === "surface" && "rounded-xl border border-surface-border bg-surface p-inset-compact shadow-sm",
        variant === "subtle" && "rounded-xl border border-transparent bg-subtle p-inset-compact",
        // La columna del rótulo topa en 20rem (antes `0.4fr`, un 40% del
        // contenedor sin límite: a 1920 px eso son ~590 px para una sola
        // palabra). Con el tope, el bloque rótulo+control se mantiene junto
        // y proporcionado —el ancho que sobra en un contenedor amplio queda
        // como margen a la derecha del control, no estirando la etiqueta.
        orientation === "horizontal" && "sm:grid-cols-[minmax(10rem,20rem)_minmax(0,1fr)] sm:gap-x-6",
        className,
      )}
    >
      {orientation === "horizontal" ? (
        // La descripción se muda aquí, bajo el rótulo: es lo que le da peso a
        // la columna izquierda y evita alargar la página con una fila de
        // ayuda aparte junto al control. El error no se muda —sigue junto al
        // control, ver más abajo— así que esta columna nunca lo pinta.
        <div className="flex flex-col gap-ui-2xs sm:pt-ui-2xs">
          {labelRow}
          {description && !error ? (
            <p id={descriptionId} className="text-sm leading-5 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      ) : (
        labelRow
      )}
      <div
        className={cn(
          "grid min-w-0 gap-field",
          // Tope de ancho solo en horizontal: sin él, un campo dentro de un
          // contenedor ancho (una `SettingsPage` a lo ancho de un monitor)
          // estira el control hasta hacerlo ilegible —un input de teléfono de
          // 780 px no se ve mejor que uno de 470, se ve peor—. En vertical el
          // control siempre ocupa el ancho de su columna, como hasta ahora.
          orientation === "horizontal" && "sm:max-w-md",
        )}
      >
        {React.cloneElement(children, {
          id: controlId,
          "aria-describedby": describedBy,
          "aria-invalid": error ? true : children.props["aria-invalid"],
        })}
        {orientation === "vertical" && description && !error ? (
          <p id={descriptionId} className="text-sm leading-5 text-muted-foreground">
            {description}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} role="alert" className="text-sm font-medium leading-5 text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
