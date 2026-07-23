import { cva } from "class-variance-authority";

import { focusRingInside } from "./focus";
import { disabledStyles, interactiveTransition } from "./interactive";

/** Estilos compartidos para Input, Textarea y triggers tipo campo (Select). */
export const inputVariants = cva(
  [
    "w-full appearance-none text-foreground",
    interactiveTransition,
    focusRingInside,
    disabledStyles,
    "placeholder:text-muted-foreground",
  ].join(" "),
  {
    variants: {
      variant: {
        outline: "border border-input bg-transparent shadow-sm",
        surface: "border border-surface-border bg-surface shadow-sm hover:bg-surface-hover",
        subtle: "border border-transparent bg-subtle shadow-sm hover:bg-subtle-hover",
      },
      size: {
        sm: "h-9 rounded-md px-2.5 text-sm",
        md: "h-10 rounded-md px-3 text-sm",
        lg: "h-11 rounded-md px-3.5 text-base",
      },
    },
    defaultVariants: {
      variant: "surface",
      size: "md",
    },
  },
);

/** Misma paleta que `inputVariants`, para textareas (altura mínima en lugar de fija). */
export const textareaVariants = cva(
  [
    "w-full min-h-[80px] appearance-none py-2 text-foreground",
    interactiveTransition,
    focusRingInside,
    disabledStyles,
    "placeholder:text-muted-foreground",
  ].join(" "),
  {
    variants: {
      variant: {
        outline: "border border-input bg-transparent shadow-sm",
        surface: "border border-surface-border bg-surface shadow-sm hover:bg-surface-hover",
        subtle: "border border-transparent bg-subtle shadow-sm hover:bg-subtle-hover",
      },
      size: {
        sm: "rounded-md px-2.5 text-sm",
        md: "rounded-md px-3 text-sm",
        lg: "rounded-md px-3.5 text-base",
      },
    },
    defaultVariants: {
      variant: "surface",
      size: "md",
    },
  },
);
