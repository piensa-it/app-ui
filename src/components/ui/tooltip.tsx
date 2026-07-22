import * as React from "react";
import { Tooltip as ArkTooltip } from "@ark-ui/react/tooltip";

import { cn } from "@/lib/utils";
import { cx } from "@/lib/style-helpers";

export interface TooltipProps extends Omit<ArkTooltip.RootProps, "children"> {
  /** Contenido del tooltip. */
  content: React.ReactNode;
  /** Único hijo sobre el que se activa el tooltip al hacer hover/focus. */
  children: React.ReactElement;
  className?: string;
}

/**
 * Tooltip accesible sobre Ark UI (headless). A diferencia de la versión
 * PrimeReact (que apuntaba a un selector CSS por id), este envuelve
 * directamente al hijo con `Tooltip.Trigger asChild` — funciona con
 * cualquier hijo, sea un componente de la librería o un elemento nativo.
 */
function Tooltip({ content, children, className, ...props }: TooltipProps) {
  return (
    <ArkTooltip.Root openDelay={200} closeDelay={100} {...props}>
      <ArkTooltip.Trigger asChild>{children}</ArkTooltip.Trigger>
      <ArkTooltip.Positioner>
        <ArkTooltip.Content
          className={cn(
            "z-50 rounded-md bg-foreground px-2.5 py-1.5 text-xs text-background shadow-md",
            cx(
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
              "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            ),
            className,
          )}
        >
          {content}
        </ArkTooltip.Content>
      </ArkTooltip.Positioner>
    </ArkTooltip.Root>
  );
}

export { Tooltip };
