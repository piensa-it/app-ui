import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AlertDialogHost, confirmAlert, __alertDialogTestHooks } from "../components/ui/alert-dialog";

const { getState } = __alertDialogTestHooks;

/**
 * `confirmAlert` es una API imperativa global sobre un store fuera de React
 * (ver el comentario junto a `let state` en `alert-dialog.tsx`): nada la
 * obliga a limpiarse sola. Lo que se prueba aquí es justo eso — #138.
 */
describe("alert-dialog · confirmAlert / AlertDialogHost", () => {
  it("abre un alertdialog con el título, la descripción y las etiquetas dadas", async () => {
    render(<AlertDialogHost />);
    confirmAlert({
      title: "¿Eliminar el registro?",
      description: "Esta acción no se puede deshacer.",
      confirmLabel: "Eliminar",
      cancelLabel: "No, gracias",
      onConfirm: vi.fn(),
    });

    const dialogo = await screen.findByRole("alertdialog");
    expect(within(dialogo).getByText("¿Eliminar el registro?")).toBeInTheDocument();
    expect(within(dialogo).getByText("Esta acción no se puede deshacer.")).toBeInTheDocument();
    expect(within(dialogo).getByRole("button", { name: "Eliminar" })).toBeInTheDocument();
    expect(within(dialogo).getByRole("button", { name: "No, gracias" })).toBeInTheDocument();
  });

  it("usa las etiquetas por defecto cuando no se dan", async () => {
    render(<AlertDialogHost />);
    confirmAlert({ title: "¿Seguro?", onConfirm: vi.fn() });

    const dialogo = await screen.findByRole("alertdialog");
    expect(within(dialogo).getByRole("button", { name: "Aceptar" })).toBeInTheDocument();
    expect(within(dialogo).getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
  });

  it("confirmar llama a onConfirm y cierra el diálogo", async () => {
    const user = userEvent.setup();
    render(<AlertDialogHost />);
    const onConfirm = vi.fn();
    confirmAlert({ title: "¿Seguro?", onConfirm });

    const dialogo = await screen.findByRole("alertdialog");
    await user.click(within(dialogo).getByRole("button", { name: "Aceptar" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
  });

  it("cancelar llama a onCancel (si existe) y cierra el diálogo, sin llamar a onConfirm", async () => {
    const user = userEvent.setup();
    render(<AlertDialogHost />);
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    confirmAlert({ title: "¿Seguro?", onConfirm, onCancel });

    const dialogo = await screen.findByRole("alertdialog");
    await user.click(within(dialogo).getByRole("button", { name: "Cancelar" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
  });

  it("no cierra al hacer clic afuera (closeOnInteractOutside={false})", async () => {
    render(<AlertDialogHost />);
    confirmAlert({ title: "¿Seguro?", onConfirm: vi.fn() });

    await screen.findByRole("alertdialog");
    // `modal` (por defecto) marca `document.body` con `pointer-events: none`
    // mientras el diálogo está abierto, así que `userEvent.click` —que
    // respeta esa regla, como un click real— no llega a disparar la
    // interacción "afuera" que se quiere probar. `fireEvent` la simula
    // directamente para comprobar que Ark la ignora (closeOnInteractOutside).
    fireEvent.pointerDown(document.body);
    fireEvent.click(document.body);
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });

  // --- Los tres problemas de #138, por separado ---

  it("al cerrar (confirmar o cancelar), el store suelta las opciones — no las conserva con open:false", async () => {
    const user = userEvent.setup();
    render(<AlertDialogHost />);
    confirmAlert({ title: "¿Seguro?", onConfirm: vi.fn() });

    const dialogo = await screen.findByRole("alertdialog");
    expect(getState()).not.toBeNull();

    await user.click(within(dialogo).getByRole("button", { name: "Aceptar" }));

    // Justo tras `close()` el store puede seguir vivo con `open: false` —lo
    // necesita la animación de salida—, pero no debe quedarse ahí para
    // siempre: cuando la salida termina, se suelta a `null`.
    await waitFor(() => expect(getState()).toBeNull());
  });

  it("un remontaje tras desmontar con el diálogo abierto no lo hereda ni bloquea la página", async () => {
    const { unmount } = render(<AlertDialogHost />);
    confirmAlert({ title: "¿Seguro?", onConfirm: vi.fn() });
    await screen.findByRole("alertdialog");

    // Desmontaje "en caliente": nadie pasó por close() (nadie hizo clic en
    // Aceptar/Cancelar), como pasaría si la app remonta su raíz —SSR con
    // hidratación parcial, un microfrontend, Storybook cambiando de
    // story— mientras el diálogo sigue abierto.
    unmount();
    render(<AlertDialogHost />);

    // El síntoma real medido en #124: sin este arreglo, el host remontado
    // hereda el diálogo abierto y su overlay modal deja el resto de la
    // página con `pointer-events: none` (6 de 37 pruebas de SettingsPage
    // caían por esto). Se prueba el síntoma, no el mecanismo interno.
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    // Ark revierte `pointer-events` del body en un `queueMicrotask` (ver
    // `@zag-js/dismissable/pointer-event-outside.js`), así que hay que
    // esperarlo en vez de comprobarlo en el mismo tick.
    await waitFor(() => expect(document.body).not.toHaveStyle({ pointerEvents: "none" }));
  });

  it("el onConfirm de antes de un desmontaje en caliente no se puede disparar tras remontar", async () => {
    const onConfirmViejo = vi.fn();
    const { unmount } = render(<AlertDialogHost />);
    confirmAlert({ title: "Acción destructiva", onConfirm: onConfirmViejo });
    await screen.findByRole("alertdialog");

    unmount();
    render(<AlertDialogHost />);

    // Es el escenario que describe la incidencia: una acción de un ciclo de
    // vida que ya no existe podría ejecutarse sobre estado que ya no está.
    // Si el remontaje heredara el diálogo (el bug), su botón de aceptar
    // seguiría cableado al `onConfirm` viejo — se fuerza el clic para
    // comprobar justo eso, en vez de solo constatar que no hay diálogo.
    document
      .querySelectorAll('[role="alertdialog"] button')
      .forEach((boton) => fireEvent.click(boton));

    expect(onConfirmViejo).not.toHaveBeenCalled();
  });

  it("una segunda llamada a confirmAlert reemplaza a la primera antes de que se abra", async () => {
    render(<AlertDialogHost />);
    const primerOnConfirm = vi.fn();
    const segundoOnConfirm = vi.fn();
    confirmAlert({ title: "Primero", onConfirm: primerOnConfirm });
    confirmAlert({ title: "Segundo", onConfirm: segundoOnConfirm });

    const dialogo = await screen.findByRole("alertdialog");
    expect(within(dialogo).getByText("Segundo")).toBeInTheDocument();
    expect(screen.queryByText("Primero")).not.toBeInTheDocument();
  });
});
