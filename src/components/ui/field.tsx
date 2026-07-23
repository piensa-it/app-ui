import * as React from "react";

import { cn } from "@/lib/utils";
import { Label } from "./label";

export interface FieldProps {
  label: React.ReactNode;
  children: React.ReactElement<{
    id?: string;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean | "true" | "false";
  }>;
  description?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  optionalLabel?: React.ReactNode;
  orientation?: "vertical" | "horizontal";
  variant?: "plain" | "outline" | "surface" | "subtle";
  density?: "compact" | "comfortable";
  className?: string;
}

/**
 * Compone label, ayuda y error de un control, conectando automáticamente sus
 * relaciones accesibles mediante `id` y `aria-describedby`.
 */
export function Field({
  label,
  children,
  description,
  error,
  required = false,
  optionalLabel,
  orientation = "vertical",
  variant = "plain",
  density = "comfortable",
  className,
}: FieldProps) {
  const generatedId = React.useId();
  const controlId = children.props.id ?? `field-${generatedId}`;
  const descriptionId = description && !error ? `${controlId}-description` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [children.props["aria-describedby"], descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div
      className={cn(
        "grid gap-2",
        density === "compact" ? "gap-1.5" : "gap-2",
        variant === "outline" && "rounded-xl border border-border bg-background p-4",
        variant === "surface" && "rounded-xl border border-surface-border bg-surface p-4 shadow-sm",
        variant === "subtle" && "rounded-xl border border-transparent bg-subtle p-4",
        orientation === "horizontal" && "sm:grid-cols-[minmax(10rem,0.4fr)_minmax(0,1fr)] sm:gap-x-6",
        className,
      )}
    >
      <div className={cn("flex items-baseline justify-between gap-3", orientation === "horizontal" && "sm:pt-3")}>
        <Label htmlFor={controlId}>
          {label}
          {required ? <span aria-hidden="true" className="ml-1 text-destructive">*</span> : null}
        </Label>
        {!required && optionalLabel ? <span className="text-xs text-muted-foreground">{optionalLabel}</span> : null}
      </div>
      <div className="grid min-w-0 gap-2">
        {React.cloneElement(children, {
          id: controlId,
          "aria-describedby": describedBy,
          "aria-invalid": error ? true : children.props["aria-invalid"],
        })}
        {description && !error ? (
          <p id={descriptionId} className="text-sm leading-5 text-muted-foreground">
            {description}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} role="alert" className="text-sm font-medium leading-5 text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
