import * as React from "react";
import { NumberInput as ArkNumberInput } from "@ark-ui/react/number-input";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { fieldControlVariants } from "@/lib/recipes/field-control";
import { focusRingOutside } from "@/lib/recipes/focus";
import { splitAriaProps } from "@/lib/aria-props";

export interface NumberInputProps
  extends Omit<ArkNumberInput.RootProps, "value" | "onValueChange" | "onChange" | "children" | "translations">,
    VariantProps<typeof fieldControlVariants> {
  /** Valor numérico controlado. `undefined` representa el campo vacío (no `0` ni `NaN`). */
  value?: number;
  onChange?: (value: number | undefined) => void;
  placeholder?: string;
  /**
   * Código de moneda ISO 4217 (`"COP"`, `"USD"`...). Atajo para el caso que
   * motivó este componente —entrada monetaria, repetida a mano en las tres
   * apps—: activa `Intl.NumberFormat` con `style: "currency"`, separador de
   * miles según `locale` y 2 decimales, salvo que `formatOptions` diga otra
   * cosa. Para un formato que no es dinero (porcentaje, sin decimales...)
   * usa `formatOptions` directamente y omite `currency`.
   *
   * **Pegado**: Ark UI parsea el texto pegado con el mismo `Intl.NumberFormat`
   * localizado (vía `@internationalized/number`), así que pegar
   * `"$1.234.567,89"` con separadores de un formato COP se interpreta bien
   * bajo `locale="es-CO"` — pegar un formato de otra locale (p. ej. con coma
   * de miles) puede leerse mal, porque el separador decimal cambia de
   * símbolo entre locales.
   */
  currency?: string;
  /** Nombre accesible cuando el campo no tiene un `<label>` asociado (vía `Field` o `htmlFor`). */
  "aria-label"?: string;
  className?: string;
}

/**
 * Entrada numérica sobre Ark UI `number-input` (headless), pensada primero
 * para dinero: separador de miles y decimales vienen de `Intl.NumberFormat`
 * (nunca a mano), y `currency` cubre el caso común sin pedir `formatOptions`.
 * `value`/`onChange` con `number | undefined` — igual que su hermano
 * `Slider`, que también traduce el `string` de Ark a un tipo nativo antes de
 * exponerlo.
 */
const NumberInput = React.forwardRef<HTMLDivElement, NumberInputProps>(
  ({ className, value, onChange, placeholder, currency, formatOptions, variant, size, id, "aria-label": ariaLabel, ...props }, ref) => {
    const [ariaProps, machineProps] = splitAriaProps(props);

    const resolvedFormatOptions = React.useMemo<Intl.NumberFormatOptions | undefined>(() => {
      if (currency) {
        return { style: "currency", currency, maximumFractionDigits: 2, ...formatOptions };
      }
      return formatOptions;
    }, [currency, formatOptions]);

    return (
      <ArkNumberInput.Root
        ref={ref}
        className={cn("w-full", className)}
        value={value === undefined ? "" : String(value)}
        onValueChange={(details) => {
          onChange?.(Number.isNaN(details.valueAsNumber) ? undefined : details.valueAsNumber);
        }}
        formatOptions={resolvedFormatOptions}
        // El `id` externo (el que inyecta `Field` para el `<label htmlFor>`) va al
        // input vía `ids`, no al `id` del Root — mismo motivo que en Select: Zag
        // localiza sus partes por id y sobreescribir el del Root no las mueve.
        ids={id ? { input: id } : undefined}
        {...machineProps}
      >
        <ArkNumberInput.Control
          className={cn(
            fieldControlVariants({ variant, size }),
            "flex items-center gap-1 pr-1 focus-within:border-ring focus-within:ring-2 focus-within:ring-inset focus-within:ring-ring",
          )}
        >
          <ArkNumberInput.Input
            aria-label={ariaLabel}
            placeholder={placeholder}
            {...ariaProps}
            className="min-w-0 flex-1 bg-transparent outline-hidden placeholder:text-muted-foreground"
          />
          <div className="flex shrink-0 flex-col">
            <ArkNumberInput.IncrementTrigger
              aria-label="Aumentar"
              className={cn(
                "inline-flex h-4 w-5 items-center justify-center rounded-sm text-muted-foreground hover:bg-surface-hover hover:text-foreground",
                "disabled:pointer-events-none disabled:opacity-40",
                focusRingOutside,
              )}
            >
              <ChevronUp aria-hidden="true" className="size-3" />
            </ArkNumberInput.IncrementTrigger>
            <ArkNumberInput.DecrementTrigger
              aria-label="Disminuir"
              className={cn(
                "inline-flex h-4 w-5 items-center justify-center rounded-sm text-muted-foreground hover:bg-surface-hover hover:text-foreground",
                "disabled:pointer-events-none disabled:opacity-40",
                focusRingOutside,
              )}
            >
              <ChevronDown aria-hidden="true" className="size-3" />
            </ArkNumberInput.DecrementTrigger>
          </div>
        </ArkNumberInput.Control>
      </ArkNumberInput.Root>
    );
  },
);
NumberInput.displayName = "NumberInput";

export { NumberInput };
