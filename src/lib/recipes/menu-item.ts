import { cva } from "class-variance-authority";

import { interactiveTransition } from "./interactive";

/** Ítem de menú para Select, Combobox, Autocomplete, etc. */
export const menuItemVariants = cva(
  [
    "relative flex cursor-pointer select-none items-center justify-between outline-none",
    "rounded-md px-2 py-2 text-sm",
    interactiveTransition,
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
    "data-[highlighted]:bg-surface-hover data-[highlighted]:text-foreground",
  ].join(" "),
);
