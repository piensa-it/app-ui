import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { IconTile } from "@/components/ui/icon";

export interface ProcessStep {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: LucideIcon;
}

export interface ProcessStepsProps extends React.OlHTMLAttributes<HTMLOListElement> {
  steps: ProcessStep[];
  /**
   * `horizontal` pasa a vertical en móvil; `vertical` siempre en columna, con
   * conector entre pasos.
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";
  /** `card` con caja; `plain` sin ella. @default "card" */
  variant?: "card" | "plain";
}

const horizontalCols: Record<number, string> = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-2 lg:grid-cols-4",
  5: "md:grid-cols-3 lg:grid-cols-5",
};

/**
 * «Cómo funciona» en pasos numerados «01, 02, 03», como lista ordenada. El
 * número decorativo convive con el ícono (Deliver, Lynx).
 */
const ProcessSteps = React.forwardRef<HTMLOListElement, ProcessStepsProps>(
  ({ steps, orientation = "horizontal", variant = "card", className, ...props }, ref) => {
    const vertical = orientation === "vertical";
    return (
      <ol
        ref={ref}
        className={cn("grid gap-6", !vertical && (horizontalCols[steps.length] ?? "md:grid-cols-3"), className)}
        {...props}
      >
        {steps.map((step, index) => (
          <li
            key={index}
            className={cn(
              "relative flex gap-4",
              vertical ? "flex-row" : "flex-col",
              variant === "card" && "rounded-xl border border-border bg-card p-6 shadow-sm",
            )}
          >
            <div className={cn("flex items-center gap-3", vertical && "flex-col")}>
              <span aria-hidden="true" className="font-heading text-4xl font-semibold tabular-nums text-muted-foreground/40">
                {String(index + 1).padStart(2, "0")}
              </span>
              {step.icon && <IconTile icon={step.icon} />}
              {vertical && index < steps.length - 1 && <span aria-hidden="true" className="w-px flex-1 bg-border" />}
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-heading text-lg font-semibold text-foreground">{step.title}</h3>
              {step.description && <div className="text-sm leading-relaxed text-muted-foreground">{step.description}</div>}
            </div>
          </li>
        ))}
      </ol>
    );
  },
);
ProcessSteps.displayName = "ProcessSteps";

export { ProcessSteps };
