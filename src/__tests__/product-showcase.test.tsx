import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { ProductShowcase, type ProductScreen } from "../components/marketing/product-showcase";

const screens: ProductScreen[] = [
  { src: "/a.webp", name: "Tablero", description: "Ocupación y canon del portafolio." },
  { src: "/b.webp", name: "Planimetría", description: "El plano con el mapa de calor." },
  { src: "/c.webp", name: "Facturación", description: "Del canon a la factura DIAN." },
];

describe("ProductShowcase", () => {
  it("pinta todas las pantallas y deja visible la primera", () => {
    render(<ProductShowcase screens={screens} />);
    const imgs = screen.getAllByRole("img", { hidden: true });
    expect(imgs).toHaveLength(3);
    expect(imgs[0]).toHaveStyle({ opacity: "1" });
    expect(imgs[1]).toHaveStyle({ opacity: "0" });
  });

  it("compone el alt con nombre y descripción cuando no se pasa uno propio", () => {
    render(<ProductShowcase screens={screens} />);
    expect(screen.getByAltText("Tablero — Ocupación y canon del portafolio.")).toBeInTheDocument();
  });

  it("muestra el pie con el nombre resaltado y la descripción de la pantalla activa", () => {
    render(<ProductShowcase screens={screens} />);
    expect(screen.getByText("Tablero.")).toBeInTheDocument();
    expect(screen.getByText(/Ocupación y canon del portafolio\./)).toBeInTheDocument();
  });

  it("el selector cambia la pantalla activa (imagen, pie y aria-current)", () => {
    render(<ProductShowcase screens={screens} />);
    const pill = screen.getByRole("button", { name: "Facturación" });
    fireEvent.click(pill);
    expect(pill).toHaveAttribute("aria-current", "true");
    expect(screen.getByText("Facturación.")).toBeInTheDocument();
    const imgs = screen.getAllByRole("img", { hidden: true });
    expect(imgs[2]).toHaveStyle({ opacity: "1" });
    expect(imgs[0]).toHaveStyle({ opacity: "0" });
  });

  it("con una sola pantalla no pinta selector ni crea temporizador", () => {
    const spy = vi.spyOn(globalThis, "setInterval");
    render(<ProductShowcase screens={[screens[0]]} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("no pinta pie cuando la pantalla activa no tiene descripción", () => {
    render(<ProductShowcase screens={[{ src: "/x.webp", name: "Solo" }]} />);
    expect(screen.queryByText("Solo.")).not.toBeInTheDocument();
  });

  describe("rotación automática", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it("avanza a la siguiente pantalla tras intervalMs y vuelve a la primera al final", () => {
      render(<ProductShowcase screens={screens} intervalMs={1000} />);
      const imgs = screen.getAllByRole("img", { hidden: true });

      act(() => void vi.advanceTimersByTime(1000));
      expect(imgs[1]).toHaveStyle({ opacity: "1" });

      act(() => void vi.advanceTimersByTime(2000));
      expect(imgs[0]).toHaveStyle({ opacity: "1" });
    });

    it("se pausa al pasar el cursor por encima", () => {
      const { container } = render(<ProductShowcase screens={screens} intervalMs={1000} />);
      const root = container.firstChild as HTMLElement;
      fireEvent.mouseEnter(root);
      act(() => void vi.advanceTimersByTime(3000));
      const imgs = screen.getAllByRole("img", { hidden: true });
      expect(imgs[0]).toHaveStyle({ opacity: "1" });
    });
  });
});
