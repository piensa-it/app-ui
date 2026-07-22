import * as React from "react";
import { Progress as ArkProgress } from "@ark-ui/react/progress";

import { cn } from "@/lib/utils";

export interface ProgressProps extends Omit<ArkProgress.RootProps, "children"> {
  /** Muestra el porcentaje numérico junto a la barra. @default false */
  showValue?: boolean;
}

/** Barra de progreso sobre Ark UI (headless), con el tema Tailwind de la librería. */
const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, showValue = false, ...props }, ref) => (
    <ArkProgress.Root ref={ref} className={cn("flex items-center gap-2", className)} {...props}>
      <ArkProgress.Track className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <ArkProgress.Range
          className="block h-full rounded-full bg-primary transition-all"
          style={{ width: "var(--percent)" }}
        />
      </ArkProgress.Track>
      {showValue ? <ArkProgress.ValueText className="text-xs text-muted-foreground" /> : null}
    </ArkProgress.Root>
  ),
);
Progress.displayName = "Progress";

export { Progress };
