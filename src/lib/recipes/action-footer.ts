import { cva } from "class-variance-authority";

/**
 * El pie de acciones: separador arriba (opcional), botones a la derecha,
 * apilados en columna —principal arriba— por debajo de `sm`. Compartido por
 * `DialogFooter`, `SheetFooter`, el pie del `AlertDialog` imperativo, el pie
 * de sección de `SettingsPage` y el formulario canónico de la documentación
 * (#140) — antes, cinco copias con tres espaciados a ojo distintos.
 *
 * Los valores no heredan ninguna de las copias por inercia:
 *
 * - `gap-ui-xs` (0.5rem): era ya el valor de cuatro de las cinco copias
 *   (`dialog`, `alert-dialog`, `sidebar`, `settings-page`); la quinta
 *   (`ControlShowcase`, 0.75rem) era la que desentonaba, no al revés.
 * - Variante `separator: false` (por defecto) — `mt-ui-md`, sin línea: el pie
 *   vive dentro de un contenedor con su propio padding (diálogo, hoja) que ya
 *   separa visualmente; un simple margen alcanza. Es el valor que ya
 *   compartían `dialog`, `alert-dialog` y `sidebar` (`mt-4`).
 * - Variante `separator: true` — `mt-stack` antes de la línea y `pt-ui-md`
 *   después: aquí el pie SÍ es "un bloque de primer nivel de página" (la
 *   definición exacta de `--space-stack`, ver `globals.css`), porque cierra
 *   una sección de contenido dentro del flujo normal de la página en vez de
 *   un contenedor de overlay ya acolchado — el mismo criterio que ya usaba
 *   `settings-page.tsx`. `ControlShowcase` adopta este mismo valor en vez de
 *   su `pt-6` inventado.
 */
export const actionFooterVariants = cva("flex flex-col-reverse gap-ui-xs sm:flex-row sm:justify-end", {
  variants: {
    separator: {
      false: "mt-ui-md",
      true: "mt-stack border-t border-border pt-ui-md",
    },
  },
  defaultVariants: {
    separator: false,
  },
});
