import * as React from "react";

import { cn } from "@/lib/utils";

import "./marketing.css";

/* ------------------------------------------------------------------------ */
/* Fondo decorativo                                                          */
/* ------------------------------------------------------------------------ */

/**
 * Fondo decorativo de las secciones públicas: rejilla con máscara radial
 * (Deliver, Lynx, piensait.com) y halo difuso del color de marca. Se pinta con
 * CSS (`marketing.css`) a partir de los tokens, así que cambia con la marca y
 * con el tema.
 */
export type MarketingBackground = "none" | "grid" | "glow" | "grid-glow";

/* ------------------------------------------------------------------------ */
/* Section                                                                   */
/* ------------------------------------------------------------------------ */

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Superficie de la sección:
   * - `default`: el fondo de la página.
   * - `muted`: fondo alterno, para separar secciones seguidas.
   * - `inverted`: bloque en los tokens del tema oscuro, aunque la página esté
   *   en claro (bloques negros de piensait.com).
   * @default "default"
   */
  tone?: "default" | "muted" | "inverted";
  /** @default "none" */
  background?: MarketingBackground;
  /** Espacio vertical. @default "md" */
  spacing?: "sm" | "md" | "lg";
  /** Elemento raíz. @default "section" */
  as?: "section" | "div" | "header" | "footer";
}

const spacingClasses = {
  sm: "py-10 md:py-14",
  md: "py-16 md:py-24",
  lg: "py-20 md:py-32",
} as const;

/**
 * Contenedor de una sección de landing: ancho máximo, márgenes laterales,
 * fondo y espacio vertical comunes. Con `id` sirve de ancla del menú, y deja
 * libre la altura del header fijo al saltar a ella.
 */
const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ tone = "default", background = "none", spacing = "md", as: Comp = "section", className, children, ...props }, ref) => (
    <Comp
      ref={ref as React.Ref<HTMLElement & HTMLDivElement>}
      data-marketing-section=""
      data-marketing-bg={background === "none" ? undefined : background}
      className={cn(
        "relative isolate scroll-mt-20 overflow-hidden",
        // `inverted` usa los mismos tokens del tema oscuro: la clase `dark`
        // redefine las variables solo dentro del bloque.
        tone === "inverted" && "dark",
        tone === "muted" ? "bg-muted/40 text-foreground" : "bg-background text-foreground",
        spacingClasses[spacing],
        className,
      )}
      {...props}
    >
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
    </Comp>
  ),
);
Section.displayName = "Section";

/* ------------------------------------------------------------------------ */
/* Eyebrow                                                                   */
/* ------------------------------------------------------------------------ */

export interface EyebrowProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * - `text`: mayúsculas finas en el color de marca.
   * - `pill`: pastilla con borde (Deliver, Lynx, piensait.com).
   * @default "text"
   */
  variant?: "text" | "pill";
  /** Punto de color delante del texto, o un ícono propio. */
  indicator?: "dot" | React.ReactNode;
}

/** Rótulo corto sobre un título: categoría, ubicación o eslogan. */
const Eyebrow = React.forwardRef<HTMLSpanElement, EyebrowProps>(
  ({ variant = "text", indicator, className, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary",
        variant === "pill" && "rounded-full border border-primary/30 bg-primary/5 px-3 py-1",
        className,
      )}
      {...props}
    >
      {indicator === "dot" ? (
        <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-primary" />
      ) : indicator ? (
        <span aria-hidden="true" className="inline-flex shrink-0 [&_svg]:size-3.5">
          {indicator}
        </span>
      ) : null}
      {children}
    </span>
  ),
);
Eyebrow.displayName = "Eyebrow";

/* ------------------------------------------------------------------------ */
/* Highlight                                                                 */
/* ------------------------------------------------------------------------ */

export interface HighlightProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * - `gradient`: degradado del color de marca hacia
   *   `--marketing-highlight-to` (Deliver: índigo a fucsia). Sin esa variable,
   *   queda en el color de marca.
   * - `accent`: color de marca (piensait.com, CoreLink).
   * @default "gradient"
   */
  variant?: "gradient" | "accent";
  /** Cursiva de acento (CoreLink). */
  italic?: boolean;
}

/** Resalta una parte de un título: `<>Tus mensajes <Highlight>llegan</Highlight></>`. */
const Highlight = React.forwardRef<HTMLSpanElement, HighlightProps>(
  ({ variant = "gradient", italic = false, className, ...props }, ref) => (
    <span
      ref={ref}
      data-marketing-highlight={variant}
      className={cn(variant === "accent" && "text-primary", italic && "italic", className)}
      {...props}
    />
  ),
);
Highlight.displayName = "Highlight";

/* ------------------------------------------------------------------------ */
/* SectionHeading                                                            */
/* ------------------------------------------------------------------------ */

export interface SectionHeadingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Botones o enlaces bajo la descripción. */
  actions?: React.ReactNode;
  /** @default "start" */
  align?: "start" | "center";
  /** Nivel del título. @default "h2" */
  as?: "h1" | "h2" | "h3";
  /** Línea corta de acento bajo el título (piensait.com). */
  rule?: boolean;
}

/** Encabezado de sección: eyebrow, título y una línea de subtítulo. */
const SectionHeading = React.forwardRef<HTMLDivElement, SectionHeadingProps>(
  ({ eyebrow, title, description, actions, align = "start", as: Title = "h2", rule = false, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex max-w-3xl flex-col gap-4",
        align === "center" ? "mx-auto items-center text-center" : "items-start text-start",
        className,
      )}
      {...props}
    >
      {eyebrow && (typeof eyebrow === "string" ? <Eyebrow>{eyebrow}</Eyebrow> : eyebrow)}
      <Title
        className={cn(
          "font-heading font-semibold tracking-tight text-foreground text-balance",
          Title === "h1" ? "text-4xl sm:text-5xl lg:text-6xl" : "text-3xl sm:text-4xl",
        )}
      >
        {title}
      </Title>
      {rule && <span aria-hidden="true" className="h-0.5 w-14 rounded-full bg-primary" />}
      {description && <p className="max-w-2xl text-base text-muted-foreground text-pretty sm:text-lg">{description}</p>}
      {actions && <div className="mt-2 flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  ),
);
SectionHeading.displayName = "SectionHeading";

export { Section, SectionHeading, Eyebrow, Highlight };
