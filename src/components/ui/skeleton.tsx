import * as React from "react";

import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Texto que describe el contenido que está cargando. */
  label?: string;
}

export function Skeleton({ className, label = "Cargando", ...props }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn("animate-pulse rounded-md bg-muted motion-reduce:animate-none", className)}
      {...props}
    />
  );
}
