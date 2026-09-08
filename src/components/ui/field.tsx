import * as React from "react";

import { cn } from "@/lib/utils";
import { Label, labelVariants } from "./label";

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
  /**
   * Actívalo cuando `children` no es un control HTML simple sino un grupo
   * compuesto —varios controles bajo un mismo rótulo, como `AvatarPicker` o
   * un grupo de radios armado a mano— que no expone un único elemento
   * enfocable al que asociar el `id` que `Field` normalmente inyecta.
   *
   * Con un control simple, `Field` pinta `<label htmlFor>` apuntando al `id`
   * que le da a `children` vía `cloneElement`. Un control compuesto casi
   * nunca reenvía ese `id` a nada —`AvatarPickerProps` no lo acepta ni hace
   * rest-spread, por ejemplo—, así que ese `htmlFor` queda apuntando a un
   * elemento que no existe: un `<label>` que no hace nada al pulsarlo, y sin
   * la asociación accesible que el resto de la librería garantiza. Con esta
   * prop, el rótulo se pinta como `<span id>` (no como `<label>`: nunca
   * apunta por accidente al primer control focable de dentro, como un
   * `<input type="file">` oculto) y la columna del control lleva
   * `role="group"` + `aria-labelledby` (y `aria-describedby` si hay
   * descripción o error) en su lugar. `children` no recibe `id`,
   * `aria-describedby` ni `aria-invalid`: en un grupo compuesto esas props no
   * tienen un único destino al que ir.
   * @default false
   */
  compositeControl?: boolean;
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
  compositeControl = false,
  className,
}: FieldProps) {
  const generatedId = React.useId();
  const controlId = children.props.id ?? `field-${generatedId}`;
  const descriptionId = description && !error ? `${controlId}-description` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [children.props["aria-describedby"], descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  const labelContent = (
    <>
      {label}
      {required ? <span aria-hidden="true" className="ml-1 text-destructive">*</span> : null}
    </>
  );

  // La fila de rótulo (+ el aviso de opcional) es idéntica en las dos
  // orientaciones; lo único que cambia es qué más comparte columna con ella.
  // El propio rótulo cambia de elemento según `compositeControl`: un
  // `<label htmlFor>` que no apunta a nada es peor que no tener `htmlFor`.
  const labelRow = (
    <div className="flex items-baseline justify-between gap-ui-sm">
      {compositeControl ? (
        <span id={controlId} className={labelVariants()}>
          {labelContent}
        </span>
      ) : (
        <Label htmlFor={controlId}>{labelContent}</Label>
      )}
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
        // ancho del *contenedor* de la rejilla sin límite: medido con la
        // mutación real, a 1920 px de ventana con `PageContainer` `wide` eso
        // eran 418 px para una sola palabra). Con el tope, el bloque
        // rótulo+control se mantiene junto y proporcionado —el ancho que
        // sobra en un contenedor amplio queda como margen a la derecha del
        // control, no estirando la etiqueta.
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
        role={compositeControl ? "group" : undefined}
        aria-labelledby={compositeControl ? controlId : undefined}
        aria-describedby={compositeControl ? describedBy : undefined}
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
        {compositeControl
          ? children
          : React.cloneElement(children, {
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
