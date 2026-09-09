import { describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";

import { Button } from "../components/ui/button";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Sheet, SheetHeader, SheetTitle, SheetDescription } from "../components/ui/sidebar";
import { Popover, PopoverTrigger, PopoverContent } from "../components/ui/popover";
import { Menu, MenuTrigger, MenuContent, MenuItem } from "../components/ui/menu";
import { Tooltip } from "../components/ui/tooltip";
import { AlertDialogHost, confirmAlert } from "../components/ui/alert-dialog";
import { Toaster, toast } from "../components/ui/toast";

// Zag registra los listeners de apertura/descarte tras un raf + setTimeout(0):
// hay que darle margen antes de interactuar (mismo patrón que
// overlay-dismiss.test.tsx y overlay-stack.test.tsx).
const settle = (ms = 50) =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });

/**
 * Corre axe sobre `document.body`, no sobre el `container` de
 * `render()`: Dialog, Sheet, Menu y AlertDialog se montan en un `Portal`
 * (fuera del contenedor local), y las queries por rol de las pruebas
 * funcionales ya asumen ese alcance global.
 *
 * `color-contrast` sigue desactivada aquí: jsdom no tiene motor de layout ni
 * rasterizador, así que `getComputedStyle` no resuelve colores heredados,
 * gradientes ni la composición final de capas superpuestas (fondo del
 * backdrop + panel) — axe no puede calcular una relación de contraste real
 * sobre ese DOM, solo sobre los valores literales que ve, lo que da falsos
 * positivos y falsos negativos por igual. Una regla que no mide nada de
 * verdad es peor que no tenerla: mentiría "OK" sin haber comprobado un solo
 * píxel. El contraste sobre componentes renderizados se comprueba en
 * tests/browser/storybook.spec.ts, con un navegador real (ver esa prueba).
 *
 * `region` (best-practice, no WCAG) también se desactiva aquí, y por una
 * razón distinta a jsdom: exige que todo el contenido visible de la página
 * esté dentro de un landmark, pero su propia lista de excepciones
 * (`dialog, [role=dialog], [role=alertdialog], svg` — ver
 * `node_modules/axe-core/axe.js`, regla `region`) ya reconoce que el
 * contenido de overlays modales no cuenta como "contenido de página". Esa
 * lista no incluye `menu` ni `tooltip`: `Menu` (`src/components/ui/menu.tsx`)
 * porta su panel a `document.body` para no recortarse por `overflow` del
 * contenedor padre, y `Tooltip` se renderiza también fuera del flujo junto a
 * su trigger — ninguno de los dos es "contenido de página", son overlays
 * efímeros anclados a un disparador que sí vive dentro del landmark real de
 * la app. Confirmado con axe habilitado: en una app completa (con
 * `<main>`, `<nav>`...) el panel portado sigue señalándose, porque escapa
 * literalmente del DOM de esos landmarks — es una limitación conocida de la
 * regla `region` con overlays portados que no son diálogo, no una violación
 * real de estos componentes. Ver el mutante de este mismo archivo (rompe
 * `aria-label`/`aria-labelledby`) para confirmar que las demás reglas sí
 * detectan problemas reales en Menu/Tooltip.
 */
async function expectNoA11yViolations(container: HTMLElement = document.body) {
  const result = await axe.run(container, {
    rules: {
      "color-contrast": { enabled: false },
      region: { enabled: false },
    },
  });
  expect(result.violations).toEqual([]);
}

describe("accesibilidad de overlays (abiertos)", () => {
  it("Dialog no tiene violaciones con encabezado, descripción y acciones", async () => {
    render(
      <Dialog open onOpenChange={() => {}}>
        <DialogHeader>
          <DialogTitle>¿Confirmar acción?</DialogTitle>
          <DialogDescription>Esta operación no se puede deshacer.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancelar</Button>
          <Button>Confirmar</Button>
        </DialogFooter>
      </Dialog>,
    );
    await screen.findByRole("dialog");

    await expectNoA11yViolations();
  });

  it("Sheet no tiene violaciones con encabezado y descripción", async () => {
    render(
      <Sheet open onOpenChange={() => {}}>
        <SheetHeader>
          <SheetTitle>Detalle del pedido</SheetTitle>
          <SheetDescription>Información completa del pedido seleccionado.</SheetDescription>
        </SheetHeader>
      </Sheet>,
    );
    await screen.findByRole("dialog");

    await expectNoA11yViolations();
  });

  it("Popover no tiene violaciones con contenido interactivo", async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger>
          <Button variant="outline">Ver detalles</Button>
        </PopoverTrigger>
        <PopoverContent aria-label="Detalles adicionales">
          <p className="text-sm">Contenido adicional que aparece al hacer click en el botón.</p>
        </PopoverContent>
      </Popover>,
    );

    await user.click(screen.getByRole("button", { name: "Ver detalles" }));
    await settle();

    await expectNoA11yViolations();
  });

  it("Menu no tiene violaciones con sus opciones abiertas", async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <MenuTrigger>
          <Button variant="outline" size="icon" aria-label="Más opciones">
            ⋮
          </Button>
        </MenuTrigger>
        <MenuContent>
          <MenuItem value="edit">Editar</MenuItem>
          <MenuItem value="delete" variant="destructive">
            Eliminar
          </MenuItem>
        </MenuContent>
      </Menu>,
    );

    await user.click(screen.getByRole("button", { name: "Más opciones" }));
    await screen.findByRole("menuitem", { name: "Editar" });
    await settle();

    await expectNoA11yViolations();
  });

  it("Tooltip no tiene violaciones mientras está visible", async () => {
    const user = userEvent.setup({ delay: null });
    render(
      <Tooltip content="Ayuda contextual" openDelay={0}>
        <Button>Info</Button>
      </Tooltip>,
    );

    await user.hover(screen.getByRole("button", { name: "Info" }));
    await waitFor(() => screen.getByRole("tooltip"));

    await expectNoA11yViolations();
  });

  it("AlertDialog no tiene violaciones con título, descripción y acciones", async () => {
    render(<AlertDialogHost />);
    confirmAlert({
      title: "¿Eliminar el registro?",
      description: "Esta acción no se puede deshacer.",
      confirmLabel: "Eliminar",
      cancelLabel: "No, gracias",
      onConfirm: vi.fn(),
    });
    await screen.findByRole("alertdialog");

    await expectNoA11yViolations();
  });

  it("Toast no tiene violaciones con título y descripción", async () => {
    render(<Toaster />);
    act(() => {
      toast.error({ summary: "No se pudo guardar", detail: "Revisa los campos marcados en rojo." });
    });
    await screen.findByRole("status", { name: "No se pudo guardar" });

    await expectNoA11yViolations();
  });

  // El caso "Toast bajo un Dialog abierto" (#67: el Toaster no portaliza y
  // queda aria-hidden bajo un modal) vive en su propio archivo —
  // toast-under-dialog.test.tsx — porque el `toaster` de Ark UI es un
  // singleton de módulo: compartir ese escenario con el resto de pruebas de
  // Toast de este archivo hace que los avisos de una prueba sobrevivan a la
  // siguiente (no hay forma pública de vaciar el toaster entre pruebas) y el
  // resultado se vuelve dependiente del orden. Un archivo aparte le da un
  // registro de módulo propio, sin ese acoplamiento.
});
