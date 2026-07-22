import * as React from "react";
import { Dropdown, type DropdownProps } from "primereact/dropdown";

import { cn } from "@/lib/utils";

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<DropdownProps, "options" | "value" | "onChange" | "optionLabel" | "optionValue"> {
  options: SelectOption[];
  value?: string | number | null;
  onChange?: (value: string | number | null) => void;
  placeholder?: string;
}

/** Select accesible sobre PrimeReact Dropdown, con el tema Tailwind de la librería. */
const Select = React.forwardRef<Dropdown, SelectProps>(
  ({ className, options, value, onChange, placeholder = "Selecciona una opción", ...props }, ref) => (
    <Dropdown
      ref={ref}
      className={cn(className)}
      options={options}
      optionLabel="label"
      optionValue="value"
      optionDisabled="disabled"
      value={value ?? null}
      onChange={(e) => onChange?.(e.value)}
      placeholder={placeholder}
      {...props}
    />
  ),
);
Select.displayName = "Select";

export { Select };
