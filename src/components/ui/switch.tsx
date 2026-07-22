import * as React from "react";
import { InputSwitch, type InputSwitchProps } from "primereact/inputswitch";

import { cn } from "@/lib/utils";

export interface SwitchProps extends Omit<InputSwitchProps, "onChange" | "checked"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

/** Interruptor on/off sobre PrimeReact InputSwitch, con el tema Tailwind de la librería. */
const Switch = React.forwardRef<InputSwitch, SwitchProps>(
  ({ className, checked = false, onCheckedChange, ...props }, ref) => (
    <InputSwitch
      ref={ref}
      className={cn(className)}
      checked={checked}
      onChange={(e) => onCheckedChange?.(!!e.value)}
      {...props}
    />
  ),
);
Switch.displayName = "Switch";

export { Switch };
