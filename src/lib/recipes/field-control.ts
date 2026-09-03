import { cva } from "class-variance-authority";

import { focusRingInside, focusRingOutside } from "./focus";
import { interactiveTransition } from "./interactive";

/** Base visual compartida por inputs y triggers de selección. */
export const fieldControlVariants = cva(
  [
    "w-full rounded-md text-foreground",
    interactiveTransition,
    "placeholder:text-muted-foreground",
    "data-[disabled]:pointer-events-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
    "aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/20",
    focusRingInside,
    "data-[state=open]:border-ring data-[state=open]:ring-2 data-[state=open]:ring-inset data-[state=open]:ring-ring",
  ].join(" "),
  {
    variants: {
      variant: {
        surface:
          "border border-surface-border bg-surface shadow-sm hover:border-border hover:bg-surface-hover",
        outline: "border border-input bg-raised hover:border-border hover:bg-accent/30",
        subtle: "border border-transparent bg-subtle hover:bg-subtle-hover",
      },
      size: {
        sm: "min-h-9 px-2.5 text-sm",
        md: "min-h-control-default px-3 text-sm",
        lg: "min-h-control-comfortable px-3.5 text-base",
      },
    },
    defaultVariants: { variant: "surface", size: "md" },
  },
);

/** Panel flotante compartido por selectores, búsquedas y calendarios. */
export const floatingPanelStyles = [
  "z-50 max-w-[calc(100vw-2rem)] overflow-auto rounded-lg",
  "border border-surface-border bg-raised text-popover-foreground shadow-md outline-none",
].join(" ");

/** Opción compartida. Highlight representa teclado/hover; checked, selección. */
export const optionStyles = [
  "relative flex min-h-10 cursor-pointer select-none items-center justify-between gap-3 rounded-md px-3 py-2 text-sm outline-none",
  interactiveTransition,
  "data-[highlighted]:bg-surface-hover data-[highlighted]:text-foreground",
  "data-[state=checked]:bg-subtle data-[state=checked]:text-subtle-foreground",
  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
].join(" ");

/** Botón de ícono con target cómodo y foco consistente. */
export const iconButtonStyles = [
  "inline-flex size-control-default shrink-0 items-center justify-center rounded-md text-muted-foreground",
  interactiveTransition,
  focusRingOutside,
  "hover:bg-surface-hover hover:text-foreground active:bg-accent",
  "disabled:pointer-events-none disabled:opacity-50",
].join(" ");
