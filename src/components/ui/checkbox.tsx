import * as React from "react";
import { Checkbox as PrimeCheckbox, type CheckboxProps as PrimeCheckboxProps } from "primereact/checkbox";

import { cn } from "@/lib/utils";

export interface CheckboxProps extends Omit<PrimeCheckboxProps, "onChange" | "checked"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

/** Checkbox accesible sobre PrimeReact, con el tema Tailwind de la librería. */
const Checkbox = React.forwardRef<PrimeCheckbox, CheckboxProps>(
  ({ className, checked = false, onCheckedChange, ...props }, ref) => (
    <PrimeCheckbox
      ref={ref}
      className={cn(className)}
      checked={checked}
      onChange={(e) => onCheckedChange?.(!!e.checked)}
      {...props}
    />
  ),
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
