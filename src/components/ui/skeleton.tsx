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

/** Hueso interno de los presets — sin role: el preset entero es UN solo `status`. */
function Bone({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-md bg-muted motion-reduce:animate-none", className)} />;
}

export interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Líneas de texto simuladas. @default 3 */
  lines?: number;
  label?: string;
}

/** Tarjeta en carga: título + líneas. Un solo `role="status"` para el bloque. */
export function SkeletonCard({ lines = 3, label = "Cargando contenido", className, ...props }: SkeletonCardProps) {
  return (
    <div role="status" aria-label={label} className={cn("rounded-lg border border-border bg-card p-5 space-y-3", className)} {...props}>
      <Bone className="h-4 w-1/3" />
      {Array.from({ length: lines }, (_, i) => (
        <Bone key={i} className={cn("h-3", i === lines - 1 ? "w-2/3" : "w-full")} />
      ))}
    </div>
  );
}

export interface SkeletonKpiProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
}

/** Indicador (KPI) en carga: rótulo + cifra grande. */
export function SkeletonKpi({ label = "Cargando indicador", className, ...props }: SkeletonKpiProps) {
  return (
    <div role="status" aria-label={label} className={cn("rounded-lg border border-border bg-card p-5 space-y-3", className)} {...props}>
      <Bone className="h-3 w-24" />
      <Bone className="h-8 w-32" />
    </div>
  );
}

export interface SkeletonTableProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Filas simuladas. @default 5 */
  rows?: number;
  /** Columnas simuladas. @default 4 */
  columns?: number;
  label?: string;
}

/** Tabla en carga: encabezado + filas. Un solo `role="status"` para el bloque. */
export function SkeletonTable({ rows = 5, columns = 4, label = "Cargando tabla", className, ...props }: SkeletonTableProps) {
  return (
    <div role="status" aria-label={label} className={cn("rounded-lg border border-border bg-card p-4 space-y-3", className)} {...props}>
      <div className="flex gap-4">
        {Array.from({ length: columns }, (_, i) => (
          <Bone key={i} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: columns }, (_, c) => (
            <Bone key={c} className={cn("h-4 flex-1", c === 0 && "max-w-[40%]")} />
          ))}
        </div>
      ))}
    </div>
  );
}
