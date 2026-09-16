import * as React from "react";

import { cn } from "@/lib/utils";

import { Eyebrow, type MarketingBackground } from "./section";

import "./marketing.css";

export interface PageHeroProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Con texto se pinta como pastilla con punto. */
  eyebrow?: React.ReactNode;
  /** Se renderiza como `h1`. */
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  /** Miga de pan sobre el eyebrow. */
  breadcrumbs?: React.ReactNode;
  /** @default "center" */
  align?: "center" | "start";
  /** @default "grid-glow" */
  background?: MarketingBackground;
}

/** Cabecera de las páginas interiores (Deliver `/plantillas`, `/precios`): sin artefacto. */
const PageHero = React.forwardRef<HTMLElement, PageHeroProps>(
  ({ eyebrow, title, description, actions, breadcrumbs, align = "center", background = "grid-glow", className, ...props }, ref) => (
    <section
      ref={ref}
      data-marketing-section=""
      data-marketing-bg={background === "none" ? undefined : background}
      className={cn("relative isolate overflow-hidden bg-background pb-12 pt-14 md:pb-16 md:pt-20", className)}
      {...props}
    >
      <div
        className={cn(
          "container relative mx-auto flex flex-col gap-5 px-4 sm:px-6 lg:px-8",
          align === "center" ? "items-center text-center" : "items-start",
        )}
      >
        {breadcrumbs}
        {eyebrow &&
          (typeof eyebrow === "string" ? (
            <Eyebrow variant="pill" indicator="dot">
              {eyebrow}
            </Eyebrow>
          ) : (
            eyebrow
          ))}
        <h1 className="max-w-3xl font-heading text-4xl font-semibold tracking-tight text-foreground text-balance sm:text-5xl">{title}</h1>
        {description && <p className="max-w-2xl text-lg text-muted-foreground text-pretty">{description}</p>}
        {actions && <div className="mt-2 flex flex-wrap items-center gap-3">{actions}</div>}
      </div>
    </section>
  ),
);
PageHero.displayName = "PageHero";

export { PageHero };
