import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface ImageCarouselBackdropProps {
  images: string[];
  /**
   * "hero": overlay claro que se funde con el fondo de la app (para
   * secciones justo debajo del header, sobre fondo claro/oscuro según tema).
   * "duotone": overlay de color + blur, para secciones con texto claro
   * encima (testimonios, precios) — más "editorial" y con contraste fuerte.
   */
  variant?: "hero" | "duotone";
  intervalMs?: number;
  /** Círculos decorativos difuminados — solo tiene sentido con variant="duotone". */
  glowCircles?: boolean;
  /** Clases del overlay de color en variant="duotone". Por defecto usa el primary del tema. */
  duotoneOverlayClassName?: string;
  /** Clases de los dos círculos de glow (separadas por espacio, una por círculo). Por defecto usan el primary del tema. */
  glowClassNames?: [string, string];
}

/**
 * Fondo de imagen animado (carrusel con fundido) + overlay. Agnóstico de
 * paleta: variant="duotone" usa `bg-primary` por defecto para que el color
 * salga del theme de cada consumidor; sobreescribe `duotoneOverlayClassName`
 * / `glowClassNames` si necesitas un color puntual distinto al primary.
 */
export function ImageCarouselBackdrop({
  images,
  variant = "duotone",
  intervalMs = 6000,
  glowCircles = variant === "duotone",
  duotoneOverlayClassName = "bg-primary/45 backdrop-blur-[3px]",
  glowClassNames = ["bg-primary/60", "bg-primary/30"],
}: ImageCarouselBackdropProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(interval);
  }, [images.length, intervalMs]);

  return (
    <>
      <div className={`absolute inset-0 z-0 ${variant === "hero" ? "bg-overlay" : "bg-primary"}`}>
        <AnimatePresence mode="popLayout">
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: variant === "hero" ? 0.5 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${images[index]})` }}
          />
        </AnimatePresence>
        {variant === "duotone" && (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-background/75 to-background/85 mix-blend-multiply" />
            <div className={`absolute inset-0 ${duotoneOverlayClassName}`} />
          </>
        )}
      </div>

      {variant === "hero" && (
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
      )}

      {glowCircles && (
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
          <div
            className={`absolute -translate-x-1/2 -translate-y-1/2 top-0 left-0 h-96 w-96 rounded-full blur-[120px] ${glowClassNames[0]}`}
          />
          <div
            className={`absolute translate-x-1/2 translate-y-1/2 bottom-0 right-0 h-96 w-96 rounded-full blur-[120px] ${glowClassNames[1]}`}
          />
        </div>
      )}
    </>
  );
}
