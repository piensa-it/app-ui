import { useEffect, useRef, useState, type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

import "./motion.css";

export interface RevealProps extends HTMLAttributes<HTMLDivElement> {
  /** Anima solo la primera vez que entra al viewport. @default true */
  once?: boolean;
  /** `rootMargin` del IntersectionObserver — negativo abajo retrasa la aparición. */
  margin?: string;
}

/**
 * Revela su contenido con el preset `enter` cuando entra al viewport
 * (IntersectionObserver) — para secciones bajas de páginas largas, en vez de
 * animar todo al montar. Sin IntersectionObserver (SSR, navegadores viejos) o
 * con `prefers-reduced-motion`, el contenido simplemente se muestra.
 */
export function Reveal({ once = true, margin = "0px 0px -10% 0px", className, children, ...props }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Sin IntersectionObserver (SSR/jsdom) el contenido nace visible.
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === "undefined");

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { rootMargin: margin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [once, margin]);

  return (
    <div
      {...props}
      ref={ref}
      data-ui-reveal={visible ? "visible" : "pending"}
      data-ui-motion={visible ? "enter" : undefined}
      className={cn(className)}
    >
      {children}
    </div>
  );
}
