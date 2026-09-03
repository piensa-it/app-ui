import { cva } from "class-variance-authority";

/** Misma escala que `checkboxControlVariants` — ambos son controles de selección de 1 bit/N opciones. */
export const radioControlSizeVariants = cva(
  "relative mt-0.5 flex shrink-0 items-center justify-center rounded-full border border-border bg-raised shadow-sm",
  {
    variants: {
      size: {
        sm: "size-[1.125rem] after:size-2",
        md: "size-5 after:size-2.5",
        lg: "size-[1.375rem] after:size-3",
      },
    },
    defaultVariants: { size: "md" },
  },
);
