import * as React from "react";
import { MultiSelect as PrimeMultiSelect, type MultiSelectProps } from "primereact/multiselect";

import { cn } from "@/lib/utils";
import { overlayPanelTransition } from "@/lib/overlay-transitions";

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface MultiSelectFieldProps
  extends Omit<MultiSelectProps, "options" | "optionLabel" | "optionValue"> {
  options: SelectOption[];
}

/** Selector múltiple sobre PrimeReact MultiSelect, con el tema Tailwind de la librería. */
const MultiSelect = React.forwardRef<PrimeMultiSelect, MultiSelectFieldProps>(
  ({ className, options, placeholder = "Selecciona opciones", display = "chip", ...props }, ref) => (
    <PrimeMultiSelect
      ref={ref}
      className={cn(className)}
      options={options}
      optionLabel="label"
      optionValue="value"
      optionDisabled="disabled"
      placeholder={placeholder}
      display={display}
      transitionOptions={overlayPanelTransition}
      {...props}
    />
  ),
);
MultiSelect.displayName = "MultiSelect";

export { MultiSelect };
