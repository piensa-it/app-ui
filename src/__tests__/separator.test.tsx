import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Separator } from "../components/ui/separator";

describe("Separator", () => {
  it("por defecto es horizontal y decorativo (sin role, fuera del árbol de accesibilidad)", () => {
    render(<Separator data-testid="linea" />);
    const linea = screen.getByTestId("linea");
    expect(linea).toHaveClass("h-px", "w-full");
    // decorative=true → role="none", no "separator": no debe anunciarse a lectores de pantalla.
    expect(linea).not.toHaveAttribute("role", "separator");
  });

  it("orientation vertical cambia el tamaño y el aria-orientation cuando no es decorativo", () => {
    render(<Separator data-testid="vertical" orientation="vertical" decorative={false} />);
    const linea = screen.getByTestId("vertical");
    expect(linea).toHaveClass("h-full", "w-px");
    expect(linea).toHaveAttribute("aria-orientation", "vertical");
    expect(linea).toHaveAttribute("role", "separator");
  });

  it("reenvía className", () => {
    render(<Separator data-testid="clase" className="mi-clase" />);
    expect(screen.getByTestId("clase")).toHaveClass("mi-clase");
  });
});
