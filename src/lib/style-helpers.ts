/**
 * Constantes de estilo compartidas entre los componentes de la librería.
 *
 * A diferencia del tema centralizado que usábamos con PrimeReact (`pt`),
 * con Ark UI cada componente se estila directamente en su propio archivo
 * usando `data-*`/`aria-*` reales que Ark expone de forma consistente en
 * todas sus partes — no hace falta una capa de indirección. Este archivo
 * solo evita repetir los mismos strings de Tailwind en cada componente.
 */

/** Anillo de foco consistente en toda la librería. */
export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

/**
 * Igual que `focusRing`, pero para elementos donde el foco real vive en un
 * hermano anterior (ej. un input nativo oculto) — se dispara con `peer`.
 */
export const peerFocusRing =
  "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2";

export const transition = "transition-colors duration-150";

/**
 * Anillo de 1px casi invisible que reforzamos junto a la sombra en paneles
 * flotantes/modales, para que no se sientan "planos" sobre el fondo.
 */
export const elevationRing = "ring-1 ring-black/5 dark:ring-white/10";

/** Clases de entrada/salida para overlays flotantes (Popover, Select, Combobox, DatePicker...). */
export const popoverAnimation = cx(
  "data-[state=open]:animate-in data-[state=closed]:animate-out",
  "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
  "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
  "data-[state=closed]:slide-out-to-top-1 data-[state=open]:slide-in-from-top-1",
);

/** Clases de entrada/salida para modales centrados (Dialog, AlertDialog). */
export const dialogContentAnimation = cx(
  "data-[state=open]:animate-in data-[state=closed]:animate-out",
  "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
  "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
);

/** Backdrop/mask detrás de un modal. */
export const backdropAnimation = cx(
  "data-[state=open]:animate-in data-[state=closed]:animate-out",
  "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
);

/** Paneles laterales (Sheet/Drawer) — por lado. */
export function drawerContentAnimation(side: "left" | "right" | "top" | "bottom" = "right") {
  const bySide: Record<typeof side, string> = {
    left: "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
    right: "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
    top: "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
    bottom: "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
  };
  return cx(
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
    "data-[state=closed]:duration-200 data-[state=open]:duration-300",
    bySide[side],
  );
}

export function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
