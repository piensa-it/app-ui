import * as React from "react";

import { cn } from "@/lib/utils";
import { focusRingOutside, interactiveTransition } from "@/lib/recipes";

export interface ProductScreen {
  /** Ruta o URL de la captura del producto. */
  src: string;
  /** Nombre corto de la pantalla: se resalta en el pie y rotula su pastilla. */
  name: string;
  /** Descripción de una línea de la pantalla. Sin ella, esa pantalla no pinta pie. */
  description?: React.ReactNode;
  /**
   * Texto alternativo de la imagen. Por defecto se compone con `name` y, cuando
   * `description` es texto, también con ella.
   */
  alt?: string;
}

export interface ProductShowcaseProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Pantallas del producto, en orden de aparición. */
  screens: ProductScreen[];
  /** Milisegundos entre cruces automáticos. @default 5000 */
  intervalMs?: number;
  /** Relación de aspecto de la tarjeta (cualquier valor CSS `aspect-ratio`). @default "16 / 10" */
  aspectRatio?: string;
}

/**
 * Carrusel de capturas del producto como **tarjeta acotada**: imagen con marco,
 * pie que cambia y selector de pantalla. Es el artefacto del `aside` del `Hero`
 * en dos columnas (a diferencia de `ImageCarouselBackdrop`, que es un fondo a
 * sangre completa con degradado).
 *
 * Agnóstico de negocio: las capturas, nombres y descripciones llegan por
 * `screens` — la librería no hardcodea ningún producto. Se cruza cada
 * `intervalMs`, se pausa al pasar el cursor o al enfocar una pastilla, y respeta
 * `prefers-reduced-motion` (el fundido es una transición de opacidad con el
 * escape `motion-reduce:transition-none`). Se hidrata como isla en el consumidor.
 */
const ProductShowcase = React.forwardRef<HTMLDivElement, ProductShowcaseProps>(
  ({ screens, intervalMs = 5000, aspectRatio = "16 / 10", className, ...props }, ref) => {
    const count = screens.length;
    const [active, setActive] = React.useState(0);
    const [paused, setPaused] = React.useState(false);

    React.useEffect(() => {
      if (paused || count <= 1) return;
      const id = setInterval(() => setActive((i) => (i + 1) % count), intervalMs);
      return () => clearInterval(id);
    }, [paused, count, intervalMs]);

    // Si el consumidor recorta `screens` y el índice queda fuera de rango,
    // vuelve al inicio en vez de dejar el pie apuntando a una pantalla que ya no existe.
    React.useEffect(() => {
      if (active > count - 1) setActive(0);
    }, [active, count]);

    if (count === 0) return null;

    const activeScreen = screens[Math.min(active, count - 1)];

    return (
      <div
        ref={ref}
        role="group"
        aria-roledescription="carousel"
        className={cn("flex flex-col gap-ui-sm", className)}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        {...props}
      >
        <div
          className="relative overflow-hidden rounded-xl border border-raised-border bg-raised shadow-raised"
          style={{ aspectRatio }}
        >
          {screens.map((screen, i) => (
            <img
              key={`${screen.src}-${i}`}
              src={screen.src}
              alt={
                screen.alt ??
                (typeof screen.description === "string" ? `${screen.name} — ${screen.description}` : screen.name)
              }
              loading={i === 0 ? "eager" : "lazy"}
              aria-hidden={i === active ? undefined : true}
              className="absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-700 motion-reduce:transition-none"
              style={{ opacity: i === active ? 1 : 0 }}
            />
          ))}
        </div>

        {activeScreen.description != null && (
          <p className="text-ui-body-sm text-muted-foreground">
            <span className="font-medium text-foreground">{activeScreen.name}.</span> {activeScreen.description}
          </p>
        )}

        {count > 1 && (
          <div className="flex flex-wrap gap-ui-2xs">
            {screens.map((screen, i) => (
              <button
                key={`${screen.src}-${i}`}
                type="button"
                onClick={() => setActive(i)}
                aria-current={i === active || undefined}
                className={cn(
                  "rounded-full px-ui-sm py-ui-2xs text-ui-caption",
                  interactiveTransition,
                  focusRingOutside,
                  i === active
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                {screen.name}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  },
);
ProductShowcase.displayName = "ProductShowcase";

export { ProductShowcase };
