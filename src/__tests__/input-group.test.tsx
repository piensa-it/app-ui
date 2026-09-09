import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { InputGroup, InputGroupAddon, InputGroupAction } from "../components/ui/input-group";

describe("InputGroup", () => {
  it("compone addon, input y action dentro del mismo contenedor", () => {
    render(
      <InputGroup data-testid="grupo">
        <InputGroupAddon data-testid="addon">$</InputGroupAddon>
        <input aria-label="Monto" />
        <InputGroupAction data-testid="accion">
          <button type="button">Limpiar</button>
        </InputGroupAction>
      </InputGroup>,
    );

    const grupo = screen.getByTestId("grupo");
    expect(grupo).toContainElement(screen.getByTestId("addon"));
    expect(grupo).toContainElement(screen.getByLabelText("Monto"));
    expect(grupo).toContainElement(screen.getByTestId("accion"));
    expect(screen.getByRole("button", { name: "Limpiar" })).toBeInTheDocument();
  });

  it("InputGroupAddon y InputGroupAction reenvían className", () => {
    render(
      <InputGroup>
        <InputGroupAddon data-testid="addon" className="addon-clase" />
        <InputGroupAction data-testid="accion" className="accion-clase" />
      </InputGroup>,
    );
    expect(screen.getByTestId("addon")).toHaveClass("addon-clase");
    expect(screen.getByTestId("accion")).toHaveClass("accion-clase");
  });
});
