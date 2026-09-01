import { useEffect, useRef, useState, type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export interface AnimatedNumberProps extends HTMLAttributes<HTMLSpanElement> {
  value: number;
  /** Duración del conteo en milisegundos. @default 600 */
  duration?: number;
  /** Cómo se muestra la cifra en cada frame. @default redondeo + toLocaleString */
  format?: (value: number) => string;
  /** Contar desde cero al montar (efecto de dashboard). @default true */
  animateOnMount?: boolean;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Cifra que cuenta hasta su valor (ease-out) — pensada para KPIs. Anima del
 * valor anterior al nuevo en cada cambio; al montar cuenta desde cero salvo
 * `animateOnMount={false}`. Con `prefers-reduced-motion` muestra el valor
 * final de inmediato. Siempre en `tabular-nums` para que no baile el layout.
 */
export function AnimatedNumber({
  value,
  duration = 600,
  format = (v) => Math.round(v).toLocaleString(),
  animateOnMount = true,
  className,
  ...props
}: AnimatedNumberProps) {
  const initial = animateOnMount && !prefersReducedMotion() ? 0 : value;
  const [display, setDisplay] = useState(initial);
  const fromRef = useRef(initial);

  useEffect(() => {
    const from = fromRef.current;
    fromRef.current = value;
    if (from === value) return;
    let frame = 0;
    if (duration <= 0 || prefersReducedMotion()) {
      frame = requestAnimationFrame(() => setDisplay(value));
      return () => cancelAnimationFrame(frame);
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (value - from) * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return (
    <span {...props} className={cn("tabular-nums", className)}>
      {format(display)}
    </span>
  );
}
