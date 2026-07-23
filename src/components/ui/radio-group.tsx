import * as React from "react";
import { RadioGroup as ArkRadioGroup } from "@ark-ui/react/radio-group";

import { cn } from "@/lib/utils";
import { transition } from "@/lib/style-helpers";

export interface RadioGroupProps extends Omit<ArkRadioGroup.RootProps, "value" | "onValueChange"> {
  value?: string;
  onValueChange?: (value: string) => void;
}

/** Agrupa varios `RadioGroupItem` sobre Ark UI (headless) — agrupación nativa vía `name`. */
const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, ...props }, ref) => (
    <ArkRadioGroup.Root
      ref={ref}
      className={cn("grid gap-2", className)}
      value={value ?? null}
      onValueChange={(details) => onValueChange?.(details.value ?? "")}
      {...props}
    />
  ),
);
RadioGroup.displayName = "RadioGroup";

export interface RadioGroupItemProps {
  value: string;
  id?: string;
  disabled?: boolean;
  className?: string;
  /** Texto de la opción. */
  label?: React.ReactNode;
  description?: React.ReactNode;
}

/**
 * OJO: el `ItemHiddenInput` (el `<input type="radio">` real) va ANTES que el
 * `ItemControl` en el DOM a propósito — así el círculo visual puede usar
 * `peer-checked:` (pseudo-clase nativa, 100% confiable) en vez de adivinar
 * el nombre exacto del atributo `data-*` de Ark para el estado seleccionado.
 */
const RadioGroupItem = React.forwardRef<HTMLLabelElement, RadioGroupItemProps>(
  ({ value, id, disabled, className, label, description }, ref) => (
    <ArkRadioGroup.Item
      ref={ref}
      value={value}
      disabled={disabled}
      className={cn(
        "flex min-h-control-default cursor-pointer items-start gap-3 rounded-md px-1.5 py-2 text-sm transition-colors duration-normal hover:bg-surface-hover",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <ArkRadioGroup.ItemHiddenInput id={id} className="peer sr-only" />
      <ArkRadioGroup.ItemControl
        className={cn(
          "relative mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-border bg-background shadow-sm",
          "after:size-2.5 after:scale-0 after:rounded-full after:bg-primary after:transition-transform after:duration-normal",
          "peer-checked:border-primary",
          "peer-checked:after:scale-100",
          "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
          transition,
        )}
      />
      {label ? (
        <span className="grid gap-0.5">
          <ArkRadioGroup.ItemText className="font-medium text-foreground">{label}</ArkRadioGroup.ItemText>
          {description ? <span className="leading-5 text-muted-foreground">{description}</span> : null}
        </span>
      ) : null}
    </ArkRadioGroup.Item>
  ),
);
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
