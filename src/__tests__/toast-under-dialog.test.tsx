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
 * #67 (abierta, cruza con #142): `Toaster` no se monta en un `Portal` (ver
 * `src/components/ui/toast.tsx`), así que con un `Dialog` modal abierto
 * queda dentro del subárbol que Zag marca `aria-hidden="true"` sobre todo lo
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
 * No se corrige aquí — #53 es cobertura de pruebas, no el fix (portalizar
 * `Toaster`) — pero se deja activa y documentada como advertía la
 * incidencia. Debe actualizarse (o borrarse) el día que #67 se cierre.
 */
describe("Toast bajo un Dialog abierto (#67)", () => {
  it("el aviso queda dentro del subárbol aria-hidden que pone el Dialog modal", async () => {
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

    // Confirmación directa en el DOM: el propio aviso —no solo un
    // antepasado genérico— cuelga de un `aria-hidden="true"`. Es la causa
    // exacta descrita en #67: un lector de pantalla no lo anuncia, y su
    // botón "Cerrar notificación" queda fuera del árbol de accesibilidad.
    expect(status.closest('[aria-hidden="true"]')).not.toBeNull();

    const result = await axe.run(document.body, {
      rules: {
        "color-contrast": { enabled: false },
        // Mismo caso que accessibility-overlays.test.tsx: contenido
        // portado fuera de cualquier landmark de página, no aplica aquí.
        region: { enabled: false },
      },
    });
    // axe no lo cuenta como "violation": en jsdom no puede resolver con
    // certeza si un elemento dentro de un subárbol aria-hidden sigue siendo
    // alcanzable por teclado (depende del motor de foco real del
    // navegador), así que lo deja en "incomplete" — revisión manual. La
    // comprobación del DOM de arriba es la que no depende de esa duda: el
    // aria-hidden está puesto, con o sin veredicto automático de axe.
    expect(result.violations).toEqual([]);
    expect(result.incomplete.map((item) => item.id)).toContain("aria-hidden-focus");
  });
});
