import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

import {
  Motion,
  type MotionDuration,
  type MotionPreset,
  type MotionRepeat,
} from "./motion";

export type IllustrationSize = "sm" | "md" | "lg" | "xl" | "full";

export interface IllustrationProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  size?: IllustrationSize;
  motion?: MotionPreset | "none";
  duration?: MotionDuration;
  repeat?: MotionRepeat;
  paused?: boolean;
}

const sizeClasses: Record<IllustrationSize, string> = {
  sm: "w-24",
  md: "w-40",
  lg: "w-64",
  xl: "w-96",
  full: "w-full",
};

export function Illustration({
  children,
  size = "md",
  motion = "none",
  duration,
  repeat,
  paused,
  className,
  ...props
}: IllustrationProps) {
  const classes = cn("max-w-full [&>svg]:block [&>svg]:h-auto [&>svg]:w-full", sizeClasses[size], className);

  if (motion === "none") {
    return (
      <div className={classes} data-ui-illustration="" {...props}>
        {children}
      </div>
    );
  }

  return (
    <Motion
      {...props}
      className={classes}
      preset={motion}
      duration={duration}
      repeat={repeat}
      paused={paused}
      data-ui-illustration=""
    >
      {children}
    </Motion>
  );
}
