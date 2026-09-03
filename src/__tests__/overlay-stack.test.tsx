import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

import { Dialog, DialogTitle } from "../components/ui/dialog";
import { Sheet, SheetTitle } from "../components/ui/sidebar";

type Overlay = typeof Dialog | typeof Sheet;
type TitleComponent = React.ComponentType<React.PropsWithChildren>;

// Zag registra los listeners de descarte tras un raf + setTimeout(0): hay que
// darle margen antes de interactuar, y otro tras interactuar para la cascada.
const settle = (ms = 150) =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });

/**
 * Dos capas modales gobernadas por la app: A se abre primero y B encima. La
 * app cierra A mientras B sigue abierta (radicar → ver el radicado). Zag, por
 * defecto, cierra en cascada las capas por encima de la que se retira y trata
 * como «foco fuera» el que otra capa devuelve al cerrarse; el estado `open`
 * lo manda la app, así que B debe seguir abierta.
 */
function Stack({ Overlay, Title, onB }: { Overlay: Overlay; Title: TitleComponent; onB: (open: boolean) => void }) {
  const [openA, setOpenA] = useState(true);
  const [openB, setOpenB] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpenB(true)}>
        Abrir B
      </button>
      <button type="button" onClick={() => setOpenA(false)}>
        Cerrar A
      </button>
      <Overlay open={openA} onOpenChange={setOpenA}>
        <Title>Capa A</Title>
      </Overlay>
      <Overlay
        open={openB}
        onOpenChange={(open) => {
          onB(open);
          setOpenB(open);
        }}
      >
        <Title>Capa B</Title>
      </Overlay>
    </>
  );
}

describe.each([
  ["Dialog", Dialog as Overlay, DialogTitle as TitleComponent],
  ["Sheet", Sheet as Overlay, SheetTitle as TitleComponent],
])("%s — no se cierra por cascada ni por foco", (_name, Overlay, Title) => {
  it("B sigue abierta cuando la app cierra A por debajo", async () => {
    const onB = vi.fn();
    render(<Stack Overlay={Overlay} Title={Title} onB={onB} />);
    await screen.findByText("Capa A");
    await settle();
    // Bajo un modal el resto queda aria-hidden: los botones se buscan con `hidden`.
    fireEvent.click(screen.getByRole("button", { name: "Abrir B", hidden: true }));
    await screen.findByText("Capa B");
    await settle();

    fireEvent.click(screen.getByRole("button", { name: "Cerrar A", hidden: true }));
    await waitFor(() => expect(screen.queryByText("Capa A")).not.toBeInTheDocument());
    await settle(200);

    expect(onB).not.toHaveBeenCalledWith(false);
    expect(screen.getByText("Capa B")).toBeInTheDocument();
  });

  it("mover el foco fuera no la cierra", async () => {
    const onOpenChange = vi.fn();
    render(
      <>
        <button type="button">Fuera</button>
        <Overlay open onOpenChange={onOpenChange}>
          <Title>Capa</Title>
        </Overlay>
      </>,
    );
    await screen.findByText("Capa");
    await settle();

    const outside = screen.getByRole("button", { name: "Fuera", hidden: true });
    act(() => outside.focus());
    fireEvent.focusIn(outside);
    await settle();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it("el handler onRequestDismiss del consumidor recibe la cascada antes del veto", async () => {
    const onRequestDismiss = vi.fn();
    function StackConHandler() {
      const [openA, setOpenA] = useState(true);
      return (
        <>
          <button type="button" onClick={() => setOpenA(false)}>
            Cerrar A
          </button>
          <Overlay open={openA} onOpenChange={setOpenA}>
            <Title>Capa A</Title>
          </Overlay>
          <Overlay open onOpenChange={() => {}} onRequestDismiss={onRequestDismiss}>
            <Title>Capa B</Title>
          </Overlay>
        </>
      );
    }
    render(<StackConHandler />);
    await screen.findByText("Capa B");
    await settle();
    fireEvent.click(screen.getByRole("button", { name: "Cerrar A", hidden: true }));
    await waitFor(() => expect(screen.queryByText("Capa A")).not.toBeInTheDocument());
    await settle(200);
    expect(onRequestDismiss).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Capa B")).toBeInTheDocument();
  });

  it("Escape sigue cerrando", async () => {
    const onOpenChange = vi.fn();
    render(
      <Overlay open onOpenChange={onOpenChange}>
        <Title>Capa</Title>
      </Overlay>,
    );
    await screen.findByText("Capa");
    await settle();
    fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it("el clic en el backdrop sigue cerrando", async () => {
    const onOpenChange = vi.fn();
    render(
      <Overlay open onOpenChange={onOpenChange}>
        <Title>Capa</Title>
      </Overlay>,
    );
    await screen.findByText("Capa");
    await settle();
    const backdrop = document.querySelector('[data-part="backdrop"]') as HTMLElement;
    expect(backdrop).not.toBeNull();
    fireEvent.pointerDown(backdrop, { pointerType: "mouse", clientX: 5, clientY: 5, button: 0 });
    fireEvent.pointerUp(backdrop);
    fireEvent.click(backdrop);
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });
});
