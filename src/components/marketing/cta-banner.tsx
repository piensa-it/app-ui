import * as React from "react";

import { cn } from "@/lib/utils";

import "./marketing.css";

export interface CtaBannerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** 1 o 2 acciones. Sobre `gradient`, `Button variant="surface"` da el botón invertido. */
  actions?: React.ReactNode;
  /**
   * - `gradient`: degradado de marca con texto claro (Deliver).
   * - `grid`: superficie con rejilla decorativa (Lynx).
   * - `muted`: superficie sobria.
   * @default "gradient"
   */
  background?: "gradient" | "grid" | "muted";
}

/** Llamado a la acción de cierre de una landing. */
const CtaBanner = React.forwardRef<HTMLDivElement, CtaBannerProps>(
  ({ title, description, actions, background = "gradient", className, ...props }, ref) => (
    <div
      ref={ref}
      data-marketing-bg={background === "grid" ? "grid" : undefined}
      data-marketing-cta={background}
      className={cn(
        "relative isolate overflow-hidden rounded-2xl px-6 py-12 text-center sm:px-12 md:py-16",
        background === "gradient" && "text-primary-foreground",
        background === "grid" && "border border-border bg-card text-foreground",
        background === "muted" && "bg-muted text-foreground",
        className,
      )}
      {...props}
    >
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4">
        <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h2>
        {description && (
          <p className={cn("text-lg text-pretty", background === "gradient" ? "text-primary-foreground/85" : "text-muted-foreground")}>
            {description}
          </p>
        )}
        {actions && <div className="mt-4 flex flex-wrap items-center justify-center gap-3">{actions}</div>}
      </div>
    </div>
  ),
);
CtaBanner.displayName = "CtaBanner";

export { CtaBanner };
