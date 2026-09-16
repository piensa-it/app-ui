import * as React from "react";

import { cn } from "@/lib/utils";

import { Eyebrow, type MarketingBackground } from "./section";

import "./marketing.css";

export interface HeroProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Rótulo sobre el título. Con texto se pinta como pastilla con punto. */
  eyebrow?: React.ReactNode;
  /** Se renderiza como `h1`. Resalta una parte con `Highlight`. */
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Botones principales. Opcionales: Lynx no los usa. */
  actions?: React.ReactNode;
  /** Nota bajo los botones: texto de confianza o aviso de ingreso. */
  note?: React.ReactNode;
  /**
   * Artefacto real del producto a la derecha: terminal, petición y respuesta,
   * tarjeta de factura, carrusel de capturas o foto. Con `aside` la portada va
   * en dos columnas; sin él, centrada.
   */
  aside?: React.ReactNode;
  /** Contenido bajo la portada, a todo el ancho: cifras (`StatRow`), logos. */
  footer?: React.ReactNode;
  /** @default "grid-glow" */
  background?: MarketingBackground;
  /** Línea corta de acento bajo el título (piensait.com). */
  rule?: boolean;
}

/**
 * Portada de una landing: eyebrow, título con resaltado, descripción, acciones
 * y el artefacto del producto al lado. En móvil el artefacto pasa debajo del
 * texto.
 */
const Hero = React.forwardRef<HTMLElement, HeroProps>(
  (
    { eyebrow, title, description, actions, note, aside, footer, background = "grid-glow", rule = false, className, ...props },
    ref,
  ) => {
    const centered = !aside;
    return (
      <section
        ref={ref}
        data-marketing-section=""
        data-marketing-bg={background === "none" ? undefined : background}
        className={cn("relative isolate overflow-hidden bg-background pb-16 pt-14 md:pb-24 md:pt-20", className)}
        {...props}
      >
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className={cn("grid items-center gap-12", !centered && "lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]")}>
            <div className={cn("flex flex-col gap-6", centered ? "mx-auto max-w-3xl items-center text-center" : "items-start")}>
              {eyebrow &&
                (typeof eyebrow === "string" ? (
                  <Eyebrow variant="pill" indicator="dot">
                    {eyebrow}
                  </Eyebrow>
                ) : (
                  eyebrow
                ))}
              <h1 className="font-heading text-4xl font-semibold tracking-tight text-foreground text-balance sm:text-5xl lg:text-6xl">
                {title}
              </h1>
              {rule && <span aria-hidden="true" className="h-0.5 w-14 rounded-full bg-primary" />}
              {description && (
                <p className="max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">{description}</p>
              )}
              {actions && <div className={cn("flex flex-wrap items-center gap-3", centered && "justify-center")}>{actions}</div>}
              {note && (
                <p className="flex items-center gap-2 text-sm text-muted-foreground [&_svg]:size-4 [&_svg]:shrink-0">{note}</p>
              )}
            </div>
            {aside && <div className="min-w-0">{aside}</div>}
          </div>
          {footer && <div className="mt-14 md:mt-20">{footer}</div>}
        </div>
      </section>
    );
  },
);
Hero.displayName = "Hero";

export { Hero };
