import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

  it("despliega opciones y permite seleccionar una", async () => {
    const onChange = vi.fn();
    render(
      <Select
        aria-label="Seleccionar país"
        options={[
          { label: "Colombia", value: "co" },
          { label: "México", value: "mx" },
        ]}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("combobox", { name: "Seleccionar país" }));
    fireEvent.click(await screen.findByRole("option", { name: "Colombia" }));

    await waitFor(() => expect(onChange).toHaveBeenCalledWith("co"));
  });
});
