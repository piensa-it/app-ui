import * as React from "react";

import { cn } from "@/lib/utils";

export interface StatItem {
  /** Cifra ya formateada: `47`, `92 %`, `18.2k m²`, `50+`. */
  value: React.ReactNode;
  label: React.ReactNode;
}

export interface StatRowProps extends React.HTMLAttributes<HTMLDivElement> {
  items: StatItem[];
  /** Rótulo sobre las cifras (Lynx «El portafolio»). */
  label?: React.ReactNode;
  /** Cifra en color de marca (piensait.com). @default false */
  accent?: boolean;
  /** Líneas verticales entre cifras. @default true */
  dividers?: boolean;
  /** @default "start" */
  align?: "start" | "center";
}

const columnsBySize: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-2 lg:grid-cols-5",
};

/**
 * Fila de cifras del producto o de la empresa. El valor llega ya formateado y
 * se pinta tal cual, así que el HTML del servidor trae la cifra final.
 */
const StatRow = React.forwardRef<HTMLDivElement, StatRowProps>(
  ({ items, label, accent = false, dividers = true, align = "start", className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-6", align === "center" && "items-center text-center", className)} {...props}>
      {label && <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>}
      <dl className={cn("grid w-full gap-x-8 gap-y-8", columnsBySize[Math.min(items.length, 5)] ?? "grid-cols-2 lg:grid-cols-5")}>
        {items.map((item, index) => (
          <div
            key={index}
            className={cn(
              "flex flex-col-reverse gap-1",
              dividers && index > 0 && "lg:border-s lg:border-border lg:ps-8",
              align === "center" && "items-center",
            )}
          >
            <dt className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{item.label}</dt>
            <dd className={cn("font-heading text-4xl font-semibold tracking-tight tabular-nums", accent ? "text-primary" : "text-foreground")}>
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  ),
);
StatRow.displayName = "StatRow";

export { StatRow };
