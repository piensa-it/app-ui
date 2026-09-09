import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Input, inputVariants } from "../components/ui/input";

describe("Input", () => {
  it("reenvía value, placeholder y className al <input> nativo", () => {
    render(<Input placeholder="Nombre" defaultValue="Ada" className="mi-clase" />);
    const input = screen.getByPlaceholderText("Nombre");
    expect(input).toHaveValue("Ada");
    expect(input).toHaveClass("mi-clase");
  });

  it("aria-invalid=true agrega las clases de estado inválido", () => {
    render(<Input aria-invalid="true" data-testid="campo" />);
    const input = screen.getByTestId("campo");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveClass("aria-[invalid=true]:border-destructive");
  });
});

describe("inputVariants", () => {
  it("variant=outline no comparte clase de fondo con subtle", () => {
    const outline = inputVariants({ variant: "outline" });
    const subtle = inputVariants({ variant: "subtle" });
    expect(outline).toContain("border-input");
    expect(subtle).not.toContain("border-input");
  });

  it("por defecto usa variant=surface y size=md", () => {
    expect(inputVariants({})).toEqual(inputVariants({ variant: "surface", size: "md" }));
  });
});
