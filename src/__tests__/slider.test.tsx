import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Slider } from "../components/ui/slider";

/**
 * `thumbAlignment="center"` evita que Zag.js espere a un `ResizeObserver`
 * real para medir el thumb antes de pintarlo (`visibility: hidden` con el
 * valor por defecto "contain") — jsdom nunca dispara esa medición, así que
 * sin esto el thumb queda invisible para las queries de accesibilidad.
 */
describe("Slider", () => {
  it("renderiza un slider accesible con el valor inicial", () => {
    render(<Slider value={[40]} aria-label="Volumen" thumbAlignment="center" />);
    const control = screen.getByRole("slider", { name: "Volumen" });
    expect(control).toHaveAttribute("aria-valuenow", "40");
  });

  it("min/max quedan expuestos en el elemento con role=slider", () => {
    render(<Slider value={[5]} min={0} max={10} aria-label="Rango" thumbAlignment="center" />);
    const control = screen.getByRole("slider", { name: "Rango" });
    expect(control).toHaveAttribute("aria-valuemin", "0");
    expect(control).toHaveAttribute("aria-valuemax", "10");
  });

  it("con dos valores renderiza dos thumbs (rango)", () => {
    render(<Slider value={[2, 8]} min={0} max={10} aria-label="Rango doble" thumbAlignment="center" />);
    expect(screen.getAllByRole("slider")).toHaveLength(2);
  });

  it("mover el thumb con teclado invoca onChange — API value/onChange, no onValueChange", async () => {
    let valorActual = [5];
    render(
      <Slider
        value={valorActual}
        onChange={(value) => (valorActual = value)}
        min={0}
        max={10}
        aria-label="Con handler"
        thumbAlignment="center"
      />,
    );

    const thumb = screen.getByRole("slider", { name: "Con handler" });
    thumb.focus();
    await userEvent.keyboard("{ArrowRight}");

    expect(valorActual).toEqual([6]);
  });
});
