import * as React from "react";
import { Checkbox as ArkCheckbox } from "@ark-ui/react/checkbox";
import { Check, Minus } from "lucide-react";

import { cn } from "@/lib/utils";
import { transition } from "@/lib/style-helpers";

export interface CheckboxProps extends Omit<ArkCheckbox.RootProps, "checked" | "children"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Texto de la etiqueta, opcional (para checkboxes sin label visible usa `aria-label`). */
  label?: React.ReactNode;
}

/** Checkbox accesible sobre Ark UI (headless), con el tema Tailwind de la librería. */
const Checkbox = React.forwardRef<HTMLLabelElement, CheckboxProps>(
  ({ className, checked = false, onCheckedChange, label, ...props }, ref) => (
    <ArkCheckbox.Root
      ref={ref}
      className={cn("group inline-flex items-center gap-2", className)}
      checked={checked}
      onCheckedChange={(details) => onCheckedChange?.(!!details.checked)}
      {...props}
    >
      <ArkCheckbox.Control
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-primary shadow",
          "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
          "data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground",
          "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
          "data-[focus-visible]:outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring data-[focus-visible]:ring-offset-2",
          transition,
        )}
      >
        <ArkCheckbox.Indicator>
          <Check className="h-3.5 w-3.5" />
        </ArkCheckbox.Indicator>
        <ArkCheckbox.Indicator indeterminate>
          <Minus className="h-3.5 w-3.5" />
        </ArkCheckbox.Indicator>
      </ArkCheckbox.Control>
      {label ? <ArkCheckbox.Label className="text-sm">{label}</ArkCheckbox.Label> : null}
      <ArkCheckbox.HiddenInput />
    </ArkCheckbox.Root>
  ),
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
