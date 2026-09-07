import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { MotionLab } from "../docs/motion-lab";

const matchMedia = (matches: boolean) =>
  vi.fn().mockImplementation((query: string) => ({
    matches: query.includes("reduce") ? matches : false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    onchange: null,
    dispatchEvent: vi.fn(),
  }));

/**
 * El laboratorio existe para comparar los mecanismos de movimiento sin editar
 * código (#110). Lo que se fija: las cuatro secciones, que el código mostrado
 * sigue a los controles, que «Repetir» vuelve a montar la muestra, y que con
 * `prefers-reduced-motion` la página lo dice.
 */
describe("MotionLab", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("ofrece las cuatro secciones con sus controles y su código", () => {
    vi.stubGlobal("matchMedia", matchMedia(false));
    render(<MotionLab />);
    for (const nombre of ["Entrada de página", "Énfasis", "Cifras", "Aparición al desplazar"]) {
      expect(screen.getByRole("region", { name: nombre })).toBeInTheDocument();
    }
    expect(screen.getByText(/staggerGap=\{60\}/)).toBeInTheDocument();
    expect(screen.getByText(/preset="celebrate"/)).toBeInTheDocument();
    expect(screen.getByText(/duration=\{600\}/)).toBeInTheDocument();
    expect(screen.queryByText(/pide menos movimiento/)).not.toBeInTheDocument();
  });

  it("el código sigue a los controles: cambiar el preset cambia el fragmento", async () => {
    vi.stubGlobal("matchMedia", matchMedia(false));
    const user = userEvent.setup();
    render(<MotionLab />);
    const enfasis = screen.getByRole("region", { name: "Énfasis" });
    await user.click(within(enfasis).getByRole("radio", { name: /Advertir/ }));
    expect(within(enfasis).getByText(/preset="warn"/)).toBeInTheDocument();
  });

  it("«Repetir» vuelve a montar la muestra para que la entrada se vea otra vez", async () => {
    vi.stubGlobal("matchMedia", matchMedia(false));
    const user = userEvent.setup();
    render(<MotionLab />);
    const entrada = screen.getByRole("region", { name: "Entrada de página" });
    const antes = within(entrada).getByRole("heading", { name: "Movimientos de caja" });
    await user.click(within(entrada).getByRole("button", { name: "Repetir" }));
    const despues = within(entrada).getByRole("heading", { name: "Movimientos de caja" });
    expect(despues).not.toBe(antes);
  });

  it("con prefers-reduced-motion lo dice arriba", () => {
    vi.stubGlobal("matchMedia", matchMedia(true));
    render(<MotionLab />);
    expect(screen.getByText(/Tu sistema pide menos movimiento/)).toBeInTheDocument();
  });
});
