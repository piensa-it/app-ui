import * as React from "react";
import { RadioButton } from "primereact/radiobutton";

import { cn } from "@/lib/utils";

interface RadioGroupContextValue {
  name: string;
  value?: string | number;
  onChange?: (value: string | number) => void;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Nombre compartido por todos los `RadioGroupItem` del grupo (agrupación nativa). */
  name: string;
  value?: string | number;
  onValueChange?: (value: string | number) => void;
}

/** Agrupa varios `RadioGroupItem` sobre PrimeReact `RadioButton`. */
const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, name, value, onValueChange, children, ...props }, ref) => (
    <RadioGroupContext.Provider value={{ name, value, onChange: onValueChange }}>
      <div ref={ref} role="radiogroup" className={cn("grid gap-2", className)} {...props}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  ),
);
RadioGroup.displayName = "RadioGroup";

export interface RadioGroupItemProps {
  value: string | number;
  id?: string;
  disabled?: boolean;
  className?: string;
}

const RadioGroupItem = React.forwardRef<RadioButton, RadioGroupItemProps>(
  ({ value, id, disabled, className }, ref) => {
    const ctx = React.useContext(RadioGroupContext);
    if (!ctx) {
      throw new Error("RadioGroupItem debe usarse dentro de un RadioGroup.");
    }
    return (
      <RadioButton
        ref={ref}
        inputId={id}
        name={ctx.name}
        value={value}
        checked={ctx.value === value}
        disabled={disabled}
        className={cn(className)}
        onChange={(e) => ctx.onChange?.(e.value)}
      />
    );
  },
);
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
