import * as React from "react";

import { cn } from "@/lib/utils";
import { fieldControlVariants } from "@/lib/recipes/field-control";
import type { VariantProps } from "class-variance-authority";

export interface InputGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof fieldControlVariants> {}

/**
 * Contenedor para prefijos, sufijos y acciones asociados a un campo. Los
 * controles internos pierden su borde propio y el grupo administra el foco.
 */
const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  ({ className, variant, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        fieldControlVariants({ variant, size }),
        "flex items-center gap-2 focus-within:border-ring focus-within:ring-2 focus-within:ring-inset focus-within:ring-ring",
        "[&>input]:h-auto [&>input]:min-h-0 [&>input]:min-w-0 [&>input]:flex-1 [&>input]:border-0 [&>input]:bg-transparent [&>input]:px-0 [&>input]:shadow-none [&>input]:ring-0",
        className,
      )}
      {...props}
    />
  ),
);
InputGroup.displayName = "InputGroup";

const InputGroupAddon = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span ref={ref} className={cn("shrink-0 text-sm text-muted-foreground", className)} {...props} />
  ),
);
InputGroupAddon.displayName = "InputGroupAddon";

const InputGroupAction = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("-mr-1 flex shrink-0 items-center [&>button]:size-8 [&>button]:min-w-8 [&>button]:p-0", className)}
      {...props}
    />
  ),
);
InputGroupAction.displayName = "InputGroupAction";

export { InputGroup, InputGroupAddon, InputGroupAction };
