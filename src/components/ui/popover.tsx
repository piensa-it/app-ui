import * as React from "react";
import { Popover as ArkPopover } from "@ark-ui/react/popover";

import { cn } from "@/lib/utils";
import { elevationRing, popoverAnimation } from "@/lib/style-helpers";

export type PopoverProps = ArkPopover.RootProps;

/** Agrupa un `PopoverTrigger` y un `PopoverContent` sobre Ark UI (headless). */
const Popover = (props: PopoverProps) => <ArkPopover.Root {...props} />;

export type PopoverTriggerProps = ArkPopover.TriggerProps;

/** Elemento que abre/cierra el popover al hacer click. */
const PopoverTrigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>((props, ref) => (
  <ArkPopover.Trigger ref={ref} asChild {...props} />
));
PopoverTrigger.displayName = "PopoverTrigger";

export type PopoverContentProps = ArkPopover.ContentProps;

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(({ className, ...props }, ref) => (
  <ArkPopover.Positioner>
    <ArkPopover.Content
      ref={ref}
      className={cn(
        "z-50 w-72 rounded-md border border-border bg-popover p-4 text-popover-foreground shadow-lg outline-none",
        elevationRing,
        popoverAnimation,
        className,
      )}
      {...props}
    />
  </ArkPopover.Positioner>
));
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent };
