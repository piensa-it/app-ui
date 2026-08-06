import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

import "./motion.css";

export type MotionPreset = "enter" | "float" | "point" | "celebrate" | "warn";
export type MotionDuration = "fast" | "normal" | "slow" | number;
export type MotionRepeat = number | "infinite";

export interface MotionProps extends HTMLAttributes<HTMLDivElement> {
  /** Movimiento que se aplica al contenido. */
  preset: MotionPreset;
  /** Duración semántica o valor exacto en milisegundos. */
  duration?: MotionDuration;
  /** Repeticiones adicionales después de la primera ejecución. */
  repeat?: MotionRepeat;
  /** Detiene y reanuda la animación conservando su punto actual. */
  paused?: boolean;
  children: ReactNode;
}

const durationByName: Record<Exclude<MotionDuration, number>, number> = {
  fast: 320,
  normal: 600,
  slow: 1200,
};

const defaultDuration: Record<MotionPreset, number> = {
  enter: 480,
  float: 3200,
  point: 850,
  celebrate: 700,
  warn: 540,
};

const defaultRepeat: Record<MotionPreset, MotionRepeat> = {
  enter: 0,
  float: "infinite",
  point: 0,
  celebrate: 0,
  warn: 0,
};

interface MotionCssProperties extends CSSProperties {
  "--ui-motion-duration": string;
  "--ui-motion-iterations": number | "infinite";
}

export function Motion({
  preset,
  duration,
  repeat,
  paused = false,
  className,
  style,
  children,
  ...props
}: MotionProps) {
  const durationMs =
    typeof duration === "number"
      ? Math.max(0, duration)
      : duration
        ? durationByName[duration]
        : defaultDuration[preset];

  const resolvedRepeat = repeat ?? defaultRepeat[preset];
  const iterations =
    resolvedRepeat === "infinite" ? "infinite" : Math.max(0, resolvedRepeat) + 1;

  const motionStyle: MotionCssProperties = {
    ...style,
    "--ui-motion-duration": `${durationMs}ms`,
    "--ui-motion-iterations": iterations,
  };

  return (
    <div
      {...props}
      className={cn(className)}
      style={motionStyle}
      data-ui-motion={preset}
      data-paused={paused}
    >
      {children}
    </div>
  );
}
