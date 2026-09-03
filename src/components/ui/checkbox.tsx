import * as React from "react";
import { Checkbox as ArkCheckbox } from "@ark-ui/react/checkbox";
import { Check, Minus } from "lucide-react";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { checkboxControlVariants, checkboxLabelVariants } from "@/lib/recipes/checkbox";
import { hiddenInputCoverClassName, hiddenInputCoverStyle } from "@/lib/recipes/hidden-input";

export interface CheckboxProps
  extends Omit<ArkCheckbox.RootProps, "checked" | "children" | "onCheckedChange">,
    VariantProps<typeof checkboxControlVariants> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Texto de la etiqueta, opcional (para checkboxes sin label visible usa `aria-label`). */
  label?: React.ReactNode;
  description?: React.ReactNode;
  /** Nombre accesible del input cuando no hay `label` visible. */
  "aria-label"?: string;
  /**
   * Id del input nativo, para asociar un `<label htmlFor>` externo. Equivale a
   * `ids.hiddenInput`; si se pasan ambos, gana `ids.hiddenInput`.
   */
  id?: string;
}


/** Checkbox accesible sobre Ark UI (headless), con el tema Tailwind de la librería. */
const Checkbox = React.forwardRef<HTMLLabelElement, CheckboxProps>(
  ({ className, checked = false, onCheckedChange, label, description, size, "aria-label": ariaLabel, id, ids, ...props }, ref) => (
    <ArkCheckbox.Root
      ref={ref}
      ids={id || ids ? { ...ids, hiddenInput: ids?.hiddenInput ?? id } : undefined}
      className={cn(
        "group relative inline-flex min-h-control-default cursor-pointer items-start gap-3 rounded-md px-1.5 py-2",
        "transition-colors duration-normal hover:bg-surface-hover",
        "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        className,
      )}
      checked={checked}
      onCheckedChange={(details) => onCheckedChange?.(!!details.checked)}
      {...props}
    >
      <ArkCheckbox.Control
        className={cn(checkboxControlVariants({ size }), "mt-0.5")}
      >
        <ArkCheckbox.Indicator>
          <Check aria-hidden="true" />
        </ArkCheckbox.Indicator>
        <ArkCheckbox.Indicator indeterminate>
          <Minus aria-hidden="true" />
        </ArkCheckbox.Indicator>
      </ArkCheckbox.Control>
      {label ? (
        <span className="grid gap-0.5">
          <ArkCheckbox.Label className={checkboxLabelVariants({ size })}>{label}</ArkCheckbox.Label>
          {description ? <span className="text-sm leading-5 text-muted-foreground">{description}</span> : null}
        </span>
      ) : null}
      {/* Sin `label`, Ark apuntaría `aria-labelledby` a un Label que no existe:
          el nombre accesible se escribe en el propio input. */}
      <ArkCheckbox.HiddenInput
        aria-label={ariaLabel}
        // `null` (no `undefined`): mergeProps de Zag ignora undefined y dejaría
        // el aria-labelledby de Ark; React omite el atributo con null.
        aria-labelledby={label ? undefined : (null as unknown as undefined)}
        className={hiddenInputCoverClassName}
        style={hiddenInputCoverStyle}
      />
    </ArkCheckbox.Root>
  ),
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
