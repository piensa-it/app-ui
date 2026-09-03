import * as React from "react";

import { cn } from "@/lib/utils";

const variants = {
  page: "bg-ground text-ground-foreground",
  card: "border border-border bg-card text-card-foreground",
  muted: "bg-muted text-foreground",
  subtle: "bg-subtle text-subtle-foreground",
  accent: "bg-accent text-accent-foreground",
  primary: "bg-primary text-primary-foreground",
} as const;

const paddings = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-8",
} as const;

const elevations = {
  none: "",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
} as const;

export interface SurfaceProps extends React.HTMLAttributes<HTMLElement> {
  as?: "div" | "section" | "article" | "aside" | "header" | "footer";
  variant?: keyof typeof variants;
  padding?: keyof typeof paddings;
  elevation?: keyof typeof elevations;
}

/** Superficie semántica para agrupar contenido sin hardcodear fondos ni elevación. */
const Surface = React.forwardRef<HTMLElement, SurfaceProps>(
  (
    {
      as: Component = "div",
      variant = "card",
      padding = "md",
      elevation = "none",
      className,
      ...props
    },
    ref,
  ) => (
    <Component
      ref={ref as React.Ref<never>}
      className={cn("rounded-lg", variants[variant], paddings[padding], elevations[elevation], className)}
      {...props}
    />
  ),
);
Surface.displayName = "Surface";

export { Surface };
