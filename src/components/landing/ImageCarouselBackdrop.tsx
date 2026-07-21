import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageCarouselBackdropProps {
  images: string[];
  /**
   * "hero": overlay claro que se funde con el fondo de la app (para
   * secciones justo debajo del header, sobre fondo claro/oscuro según tema).
   * "duotone": overlay verde esmeralda + blur, para secciones con texto
   * claro encima (testimonios, precios) — más "editorial" y con contraste
   * fuerte.
   */
  variant?: "hero" | "duotone";
  intervalMs?: number;
  /** Círculos decorativos difuminados — solo tiene sentido con variant="duotone". */
  glowCircles?: boolean;
}

/**
 * Fondo de imagen animado (carrusel con fundido) + overlay, extraído de
 * Landing.tsx para poder reutilizarse también en LandingEmpresa.tsx sin
 * duplicar la lógica de intervalo/AnimatePresence (P4-29 fase 2).
 */
export function ImageCarouselBackdrop({
  images,
  variant = "duotone",
  intervalMs = 6000,
  glowCircles = variant === "duotone",
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
      <div className={`absolute inset-0 z-0 ${variant === "hero" ? "bg-black" : "bg-primary"}`}>
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
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/75 to-emerald-900/85 mix-blend-multiply" />
            <div className="absolute inset-0 bg-primary/45 backdrop-blur-[3px]" />
          </>
        )}
      </div>

      {variant === "hero" && (
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
      )}

      {glowCircles && (
        <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-300 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />
        </div>
      )}
    </>
  );
}
