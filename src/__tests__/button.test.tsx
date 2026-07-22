import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../components/ui/button";

describe("Button", () => {
  it("renderiza el texto y responde a click", async () => {
    let clicked = false;
    render(<Button onClick={() => (clicked = true)}>Continuar</Button>);

    const button = screen.getByRole("button", { name: "Continuar" });
    expect(button).toBeInTheDocument();

    await userEvent.click(button);
    expect(clicked).toBe(true);
  });

  it("aplica la variante destructive", () => {
    render(<Button variant="destructive">Eliminar</Button>);
    expect(screen.getByRole("button", { name: "Eliminar" })).toHaveClass("bg-destructive");
  });

  it("se deshabilita correctamente", () => {
    render(<Button disabled>Deshabilitado</Button>);
    expect(screen.getByRole("button", { name: "Deshabilitado" })).toBeDisabled();
  });
});
