import * as React from "react";
import { Switch as ArkSwitch } from "@ark-ui/react/switch";

import { cn } from "@/lib/utils";
import { transition } from "@/lib/style-helpers";

export interface SwitchProps extends Omit<ArkSwitch.RootProps, "checked" | "children"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: React.ReactNode;
}

/** Interruptor on/off sobre Ark UI (headless), con el tema Tailwind de la librería. */
const Switch = React.forwardRef<HTMLLabelElement, SwitchProps>(
  ({ className, checked = false, onCheckedChange, label, ...props }, ref) => (
    <ArkSwitch.Root
      ref={ref}
      className={cn("inline-flex items-center gap-2", className)}
      checked={checked}
      onCheckedChange={(details) => onCheckedChange?.(details.checked)}
      {...props}
    >
      <ArkSwitch.Control
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full bg-input",
          "data-[state=checked]:bg-primary",
          "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
          "data-[focus-visible]:outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring data-[focus-visible]:ring-offset-2",
          transition,
        )}
      >
        <ArkSwitch.Thumb
          className={cn(
            "block h-4 w-4 translate-x-0.5 rounded-full bg-background shadow transition-transform duration-150",
            "data-[state=checked]:translate-x-4",
          )}
        />
      </ArkSwitch.Control>
      {label ? <ArkSwitch.Label className="text-sm">{label}</ArkSwitch.Label> : null}
      <ArkSwitch.HiddenInput />
    </ArkSwitch.Root>
  ),
);
Switch.displayName = "Switch";

export { Switch };
