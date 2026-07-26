import { cva } from "class-variance-authority";

import { interactiveTransition } from "./interactive";

/**
 * Ítem de menú — usado por `Menu` (dropdown de acciones) y reutilizable por
 * cualquier lista de opciones flotante con navegación por teclado.
 * `pl-8` se agrega puntualmente en Checkbox/RadioItem para dejar espacio al
 * indicador de selección absoluto (ver `menu.tsx`).
 */
export const menuItemVariants = cva(
  [
    "relative flex min-h-10 cursor-pointer select-none items-center gap-2 outline-none",
    "rounded-md px-2.5 py-2 text-sm",
    interactiveTransition,
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "text-foreground data-[highlighted]:bg-surface-hover data-[highlighted]:text-foreground",
        destructive: "text-destructive data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive",
      },
    },
    defaultVariants: { variant: "default" },
  },
);
