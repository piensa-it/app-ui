import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Select } from "../components/ui/select";

describe("Select", () => {
  it("muestra el placeholder cuando no hay valor", () => {
    render(
      <Select
        options={[
          { label: "Colombia", value: "co" },
          { label: "México", value: "mx" },
        ]}
        placeholder="Selecciona un país"
      />,
    );
    expect(screen.getAllByText("Selecciona un país").length).toBeGreaterThan(0);
  });

  it("muestra la etiqueta del valor seleccionado", () => {
    render(
      <Select
        options={[
          { label: "Colombia", value: "co" },
          { label: "México", value: "mx" },
        ]}
        value="mx"
      />,
    );
    expect(screen.getAllByText("México").length).toBeGreaterThan(0);
  });
});
