import { describe, expect, it } from "vitest";
import { act, render, screen } from "@testing-library/react";
import axe from "axe-core";

import { Dialog, DialogTitle } from "../components/ui/dialog";
import { Toaster, toast } from "../components/ui/toast";

// Zag aplica `aria-hidden` al resto de la página (`hideContentBelow`) tras
// un raf + setTimeout(0) desde que el diálogo modal monta — mismo patrón que
// `settle()` en overlay-dismiss.test.tsx y overlay-stack.test.tsx.
const settle = (ms = 100) =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });

/**
 * #67: `Toaster` se monta en un `Portal` (ver `src/components/ui/toast.tsx`)
 * a `document.body`, igual que el resto de los componentes que superponen
 * (`Dialog`, `Menu`, `Select`...), así que con un `Dialog` modal abierto
 * queda fuera del subárbol que Zag marca `aria-hidden="true"` sobre todo lo
 * que no es el diálogo (`hideContentBelow` → `@zag-js/aria-hidden`).
 *
 * En un archivo propio, no junto al resto de pruebas de Toast en
 * `accessibility-overlays.test.tsx`: el `toaster` de Ark UI es un singleton
 * de módulo sin forma pública de vaciarlo entre pruebas, así que un caso que
 * deja un aviso sin descartar contamina cualquier prueba de Toast que
 * corra después en el mismo archivo (comprobado: el mismo escenario, corrido
 * junto a otra prueba de Toast en el mismo módulo, hace fallar por timeout
 * una búsqueda por rol que en aislamiento encuentra el nodo al instante).
 * Vitest aísla el registro de módulos por archivo, así que aquí no hace
 * falta ningún hook de limpieza.
 *
 * Documentaba el bug (#53) y antes de #67 pasaba en verde con el aviso
 * *dentro* del subárbol `aria-hidden`. Ahora afirma lo contrario.
 */
describe("Toast bajo un Dialog abierto (#67)", () => {
  it("el aviso no queda dentro de ningún subárbol aria-hidden y su botón de cerrar es alcanzable", async () => {
    render(
      <>
        <Toaster />
        <Dialog open onOpenChange={() => {}}>
          <DialogTitle>Capturar registro</DialogTitle>
        </Dialog>
      </>,
    );
    act(() => {
      toast.error({ summary: "No se pudo guardar" });
    });
    const status = await screen.findByRole("status", { name: "No se pudo guardar" });
    await screen.findByRole("dialog");
    await settle();

    // Confirmación directa en el DOM: ni el propio aviso ni ninguno de sus
    // antepasados cuelga de un `aria-hidden="true"`. Es la causa exacta
    // descrita en #67 — corregida: un lector de pantalla sí lo anuncia, y su
    // botón "Cerrar notificación" sigue en el árbol de accesibilidad.
    expect(status.closest('[aria-hidden="true"]')).toBeNull();

    // El botón de cerrar del aviso es alcanzable (no está `disabled` ni
    // colgado de un subárbol inerte) con el diálogo modal todavía abierto.
    const closeButton = screen.getByRole("button", { name: "Cerrar notificación" });
    expect(closeButton.closest('[aria-hidden="true"]')).toBeNull();
    expect(closeButton).toBeEnabled();

    const result = await axe.run(document.body, {
      rules: {
        "color-contrast": { enabled: false },
        // Mismo caso que accessibility-overlays.test.tsx: contenido
        // portado fuera de cualquier landmark de página, no aplica aquí.
        region: { enabled: false },
      },
    });
    expect(result.violations).toEqual([]);
    // Ya no hay ningún nodo dentro de un subárbol `aria-hidden` sobre el que
    // axe deba dejar la duda de si un motor de foco real lo alcanzaría.
    expect(result.incomplete.map((item) => item.id)).not.toContain("aria-hidden-focus");
  });
});
