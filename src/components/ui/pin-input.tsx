import * as React from "react";
import { PinInput as ArkPinInput } from "@ark-ui/react/pin-input";

import { cn } from "@/lib/utils";
import { fieldControlVariants } from "@/lib/recipes/field-control";

export interface PinInputLabels {
  /**
   * Nombre accesible de cada casilla. Recibe el índice (desde 0) y cuántas
   * hay en total. Ark trae uno en inglés («pin code 1 of 6»).
   * @default (i, total) => `dígito ${i + 1} de ${total}`
   */
  input?: (index: number, length: number) => string;
}

export interface PinInputProps {
  /** El código como una sola cadena. Más corto que él, se pinta a medias. */
  value: string;
  onChange: (value: string) => void;
  /** Se dispara cuando se llenan todas las casillas. */
  onComplete?: (value: string) => void;
  /** @default 6 */
  length?: number;
  /**
   * Qué se acepta teclear o pegar. `numeric` además pone el teclado
   * numérico en móvil.
   * @default "numeric"
   */
  type?: "numeric" | "alphanumeric" | "alphabetic";
  /**
   * Declara el campo como código de un solo uso: pone
   * `autoComplete="one-time-code"`, que es lo que hace que el teléfono
   * ofrezca el código que acaba de llegar por SMS. Apagalo solo si el
   * código no es de un solo uso —un PIN fijo, por ejemplo—, porque
   * ofrecerle a alguien un código viejo es peor que no ofrecerle nada.
   * @default true
   */
  otp?: boolean;
  /** Oculta lo tecleado, como una contraseña. @default false */
  mask?: boolean;
  /** Pone el foco en la primera casilla al montar. @default false */
  autoFocus?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  /** Nombre del input oculto, para envíos de formulario nativos. */
  name?: string;
  /** Carácter de las casillas vacías. @default "○" */
  placeholder?: string;
  /**
   * Nombre accesible del grupo. Sin él —ni `aria-labelledby`— el grupo no
   * declara `role="group"`: se asume que lo envuelve un `Field` con
   * `compositeControl`, que ya aporta el rol y el rótulo.
   */
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  labels?: PinInputLabels;
  className?: string;
}

const DEFAULT_INPUT_LABEL = (index: number, length: number) => `dígito ${index + 1} de ${length}`;

/**
 * Código de un solo uso, sobre el `pin-input` de Ark UI: una casilla por
 * carácter, el foco avanza solo, borrar retrocede, y pegar el código entero
 * lo reparte entre todas.
 *
 * **No es una pieza de autenticación**, aunque el segundo factor sea su uso
 * más obvio: sirve igual para confirmar una transferencia o autorizar una
 * anulación. Por eso vive en `ui/` y no sabe nada de sesiones.
 *
 * Es un control **compuesto** —varias casillas enfocables bajo un mismo
 * rótulo—, así que dentro de un `Field` va con `compositeControl`; si no,
 * el `<label htmlFor>` quedaría apuntando a un elemento que no enfoca.
 *
 * @example
 * ```tsx
 * <Field label="Código" compositeControl>
 *   <PinInput value={codigo} onChange={setCodigo} onComplete={verificar} />
 * </Field>
 * ```
 */
export const PinInput = React.forwardRef<HTMLDivElement, PinInputProps>(
  (
    {
      value,
      onChange,
      onComplete,
      length = 6,
      type = "numeric",
      otp = true,
      mask = false,
      autoFocus,
      disabled,
      readOnly,
      name,
      placeholder,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,
      labels,
      className,
    },
    ref,
  ) => {
    const inputLabel = labels?.input ?? DEFAULT_INPUT_LABEL;
    const invalid = ariaInvalid === true || ariaInvalid === "true";
    // Ark trabaja con un carácter por posición; hacia afuera el código es una
    // cadena, que es como lo maneja quien lo consume (lo compara, lo manda al
    // backend). El relleno hasta `length` es lo que espera la máquina: un
    // array más corto dejaría casillas sin controlar.
    const chars = React.useMemo(
      () => Array.from({ length }, (_, index) => value[index] ?? ""),
      [value, length],
    );

    return (
      <ArkPinInput.Root
        ref={ref}
        count={length}
        value={chars}
        onValueChange={({ valueAsString }) => onChange(valueAsString)}
        onValueComplete={({ valueAsString }) => onComplete?.(valueAsString)}
        type={type}
        otp={otp}
        mask={mask}
        autoFocus={autoFocus}
        disabled={disabled}
        readOnly={readOnly}
        invalid={invalid}
        name={name}
        placeholder={placeholder}
        translations={{ inputLabel }}
        className={cn("inline-flex", className)}
      >
        <ArkPinInput.Control
          // Sin nombre propio no se declara grupo: dentro de un `Field` con
          // `compositeControl` el rol y el rótulo ya los pone él, y anidar
          // dos grupos solo añade ruido para quien escucha.
          role={ariaLabel || ariaLabelledBy ? "group" : undefined}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
          className="flex items-center gap-ui-sm"
        >
          {chars.map((_, index) => (
            <ArkPinInput.Input
              key={index}
              index={index}
              className={cn(
                fieldControlVariants({ size: "lg" }),
                "w-12 px-0 text-center font-mono text-lg tabular-nums",
                "data-[invalid]:border-destructive data-[invalid]:ring-destructive/20",
              )}
            />
          ))}
        </ArkPinInput.Control>
        <ArkPinInput.HiddenInput />
      </ArkPinInput.Root>
    );
  },
);
PinInput.displayName = "PinInput";
