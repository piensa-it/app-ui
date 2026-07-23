import * as React from "react";
import { Switch as ArkSwitch } from "@ark-ui/react/switch";

import { cn } from "@/lib/utils";
import { transition } from "@/lib/style-helpers";

export interface SwitchProps
  extends Omit<ArkSwitch.RootProps, "checked" | "children" | "onCheckedChange" | "label"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
}

/** Interruptor on/off sobre Ark UI (headless), con el tema Tailwind de la librería. */
const Switch = React.forwardRef<HTMLLabelElement, SwitchProps>(
  ({ className, checked = false, onCheckedChange, label, description, ...props }, ref) => (
    <ArkSwitch.Root
      ref={ref}
      className={cn(
        "inline-flex min-h-control-comfortable cursor-pointer items-center gap-3 rounded-md px-1.5 py-1.5 transition-colors duration-normal hover:bg-surface-hover",
        "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        className,
      )}
      checked={checked}
      onCheckedChange={(details) => onCheckedChange?.(details.checked)}
      {...props}
    >
      <ArkSwitch.Control
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-input shadow-inner",
          "data-[state=checked]:bg-primary",
          "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
          "data-[focus-visible]:outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring data-[focus-visible]:ring-offset-2",
          transition,
        )}
      >
        <ArkSwitch.Thumb
          className={cn(
            "block size-5 translate-x-0.5 rounded-full bg-background shadow-sm transition-transform duration-normal motion-reduce:transition-none",
            "data-[state=checked]:translate-x-5",
          )}
        />
      </ArkSwitch.Control>
      {label ? (
        <span className="grid gap-0.5">
          <ArkSwitch.Label className="text-sm font-medium text-foreground">{label}</ArkSwitch.Label>
          {description ? <span className="text-sm leading-5 text-muted-foreground">{description}</span> : null}
        </span>
      ) : null}
      {/* Ark expone el input nativo como `type="checkbox"` (semántica de
          formulario) — se sobreescribe el rol a "switch" para que lectores
          de pantalla lo anuncien como interruptor on/off, no como checkbox. */}
      <ArkSwitch.HiddenInput role="switch" />
    </ArkSwitch.Root>
  ),
);
Switch.displayName = "Switch";

export { Switch };
