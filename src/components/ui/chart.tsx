import * as React from "react";
import { Chart as PrimeChart, type ChartProps } from "primereact/chart";

import { cn } from "@/lib/utils";

export type { ChartProps };

/**
 * Gráficas sobre PrimeReact Chart (wrapper de Chart.js): `type="bar"`,
 * `"line"`, `"pie"`, `"doughnut"`, `"radar"`, `"polarArea"`, `"scatter"`.
 * Requiere `chart.js` como dependencia (ya incluida en la librería).
 */
const Chart = React.forwardRef<PrimeChart, ChartProps>(({ className, ...props }, ref) => (
  <PrimeChart ref={ref} className={cn(className)} {...props} />
));
Chart.displayName = "Chart";

export { Chart };
