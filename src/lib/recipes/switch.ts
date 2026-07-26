import { cva } from "class-variance-authority";

/**
 * Solo las dimensiones (track/thumb) varían por tamaño — el resto de clases
 * (foco, hover, transición, disabled) se quedan en `switch.tsx` tal cual,
 * porque usan `data-[focus-visible]` (estado que expone Ark, no el pseudo-
 * elemento `:focus-visible`) y no vale la pena arriesgar ese detalle fino
 * moviéndolo a un recipe compartido.
 */
export const switchControlSizeVariants = cva("", {
  variants: {
    size: {
      sm: "h-5 w-9",
      md: "h-6 w-11",
      lg: "h-7 w-14",
    },
  },
  defaultVariants: { size: "md" },
});

export const switchThumbSizeVariants = cva("", {
  variants: {
    size: {
      sm: "size-4 data-[state=checked]:translate-x-4",
      md: "size-5 data-[state=checked]:translate-x-5",
      lg: "size-6 data-[state=checked]:translate-x-7",
    },
  },
  defaultVariants: { size: "md" },
});
