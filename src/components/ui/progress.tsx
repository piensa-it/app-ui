import * as React from "react";
import { ProgressBar, type ProgressBarProps } from "primereact/progressbar";

import { cn } from "@/lib/utils";

export interface ProgressProps extends Omit<ProgressBarProps, "showValue"> {
  /** Muestra el porcentaje numérico dentro de la barra. @default false */
  showValue?: boolean;
}

/** Barra de progreso sobre PrimeReact ProgressBar, con el tema Tailwind de la librería. */
const Progress = React.forwardRef<ProgressBar, ProgressProps>(
  ({ className, showValue = false, ...props }, ref) => (
    <ProgressBar ref={ref} showValue={showValue} className={cn(className)} {...props} />
  ),
);
Progress.displayName = "Progress";

export { Progress };
