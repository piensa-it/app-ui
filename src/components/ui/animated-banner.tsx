import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Illustration } from "./illustration";
import {
  Motion,
  type MotionDuration,
  type MotionPreset,
  type MotionRepeat,
} from "./motion";

export type AnimatedBannerVariant = "info" | "success" | "warning" | "destructive";

export interface AnimatedBannerProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  children?: ReactNode;
  illustration?: ReactNode;
  action?: ReactNode;
  variant?: AnimatedBannerVariant;
  motion?: MotionPreset | "none";
  duration?: MotionDuration;
  repeat?: MotionRepeat;
  paused?: boolean;
}

const variantClasses: Record<AnimatedBannerVariant, string> = {
  info: "border-border bg-surface text-foreground",
  success: "border-success/30 bg-success/10 text-foreground",
  warning: "border-warning/40 bg-warning/10 text-foreground",
  destructive: "border-destructive/30 bg-destructive/10 text-foreground",
};

export function AnimatedBanner({
  title,
  children,
  illustration,
  action,
  variant = "info",
  motion = "enter",
  duration,
  repeat,
  paused,
  className,
  role = variant === "destructive" ? "alert" : "status",
  ...props
}: AnimatedBannerProps) {
  const content = (
    <div
      {...props}
      className={cn(
        "grid items-center gap-5 rounded-xl border p-5 sm:grid-cols-[auto_1fr_auto]",
        variantClasses[variant],
        className,
      )}
      role={role}
      data-ui-animated-banner=""
    >
      {illustration ? (
        <Illustration size="sm" className="mx-auto sm:mx-0">
          {illustration}
        </Illustration>
      ) : null}
      <div className={cn(!illustration && "sm:col-start-1")}>
        <h3 className="font-heading text-base font-semibold">{title}</h3>
        {children ? <div className="mt-1 text-sm text-muted-foreground">{children}</div> : null}
      </div>
      {action ? <div className="flex shrink-0 justify-center sm:justify-end">{action}</div> : null}
    </div>
  );

  if (motion === "none") return content;

  return (
    <Motion preset={motion} duration={duration} repeat={repeat} paused={paused}>
      {content}
    </Motion>
  );
}
