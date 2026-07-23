import * as React from "react";
import { Checkbox as ArkCheckbox } from "@ark-ui/react/checkbox";
import { Check, Minus } from "lucide-react";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { checkboxControlVariants, checkboxLabelVariants } from "@/lib/recipes/checkbox";

export interface CheckboxProps
  extends Omit<ArkCheckbox.RootProps, "checked" | "children" | "onCheckedChange">,
    VariantProps<typeof checkboxControlVariants> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Texto de la etiqueta, opcional (para checkboxes sin label visible usa `aria-label`). */
  label?: React.ReactNode;
  description?: React.ReactNode;
}

/** Checkbox accesible sobre Ark UI (headless), con el tema Tailwind de la librería. */
const Checkbox = React.forwardRef<HTMLLabelElement, CheckboxProps>(
  ({ className, checked = false, onCheckedChange, label, description, size, ...props }, ref) => (
    <ArkCheckbox.Root
      ref={ref}
      className={cn(
        "group inline-flex min-h-control-default cursor-pointer items-start gap-3 rounded-md px-1.5 py-2",
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
      <ArkCheckbox.HiddenInput />
    </ArkCheckbox.Root>
  ),
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
