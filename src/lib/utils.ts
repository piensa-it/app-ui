import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Escalas propias de la librería, en el mismo orden que el preset de Tailwind.
 * Se declaran aquí porque `tailwind-merge` solo conoce de fábrica la escala
 * nativa: lo que no le digamos, o lo clasifica mal o no lo clasifica.
 */
const SPACING = ["2xs", "xs", "sm", "md", "lg", "xl", "2xl", "inset", "inset-compact", "stack", "field"];
const FONT_SIZES = ["ui-caption", "ui-body-sm", "ui-body", "ui-title-sm", "ui-title", "ui-display"];
const CONTROL_HEIGHTS = ["control-compact", "control-default", "control-comfortable"];
const DURATIONS = ["fast", "normal", "slow"];

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      // Alimenta de una vez padding, margin, gap, space y demás utilidades que
      // se apoyan en la escala de espaciado.
      spacing: SPACING,
    },
    classGroups: {
      // Sin esto, `text-ui-body-sm` se toma por un color: al escribir un tamaño
      // seguido de un color —el orden natural— el tamaño desaparecía.
      "font-size": [{ text: FONT_SIZES }],
      h: [{ h: CONTROL_HEIGHTS }],
      "min-h": [{ "min-h": CONTROL_HEIGHTS }],
      w: [{ w: CONTROL_HEIGHTS }],
      "min-w": [{ "min-w": CONTROL_HEIGHTS }],
      duration: [{ duration: DURATIONS }],
    },
  },
});

/**
 * Une clases y resuelve los conflictos entre ellas: la última gana, que es lo
 * que permite que el `className` de quien usa un componente pueda anular lo que
 * el componente trae.
 *
 * @example cn("px-md py-xs", condicion && "px-lg", className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
