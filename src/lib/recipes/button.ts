import { cva } from "class-variance-authority";

import { focusRingOutside } from "./focus";
import { disabledStyles, interactiveTransition } from "./interactive";

/**
 * Variantes semánticas inspiradas en Park UI: solid, subtle, surface, outline, plain.
 * Se mantienen alias shadcn (default, secondary, ghost) por compatibilidad.
 */
export const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold",
    "relative isolate cursor-pointer select-none",
    interactiveTransition,
    focusRingOutside,
    disabledStyles,
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        solid: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:bg-primary/95",
        subtle: "bg-subtle text-subtle-foreground hover:bg-subtle-hover active:bg-subtle-hover",
        surface:
          "border border-surface-border bg-surface text-foreground shadow-sm hover:border-border hover:bg-surface-hover active:bg-surface-hover",
        outline:
          "border border-input bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
        plain: "text-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
        /** @deprecated Usa `solid`. */
        default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:bg-primary/95",
        /** @deprecated Usa `subtle`. */
        secondary: "bg-subtle text-subtle-foreground hover:bg-subtle-hover active:bg-subtle-hover",
        /** @deprecated Usa `plain`. */
        ghost: "text-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:bg-destructive/95",
        link: "text-primary underline-offset-4 shadow-none hover:underline",
      },
      size: {
        xs: "h-8 min-w-8 px-2.5 text-xs [&_svg]:size-4",
        sm: "h-9 min-w-9 px-3 text-sm [&_svg]:size-4",
        md: "h-10 min-w-10 px-3.5 text-sm [&_svg]:size-5",
        lg: "h-11 min-w-11 px-4 text-base [&_svg]:size-5",
        /** @deprecated Usa `md`. */
        default: "h-10 min-w-10 px-3.5 text-sm [&_svg]:size-5",
        icon: "h-10 w-10 [&_svg]:size-5",
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "md",
    },
  },
);
