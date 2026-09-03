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

describe("Select — <select> nativo oculto", () => {
  const options = [
    { label: "Colombia", value: "co" },
    { label: "México", value: "mx", disabled: true },
  ];

  it("sin `name` no renderiza un <select> (evita duplicar cada opción en el DOM)", () => {
    const { container } = render(<Select aria-label="País" options={options} />);
    expect(container.querySelector("select")).toBeNull();
    // Solo existe una copia del texto de cada opción (la visible al abrir).
    expect(screen.queryByText("Colombia")).not.toBeInTheDocument();
  });

  it("con `name` renderiza el <select> con las mismas opciones", () => {
    const { container } = render(<Select aria-label="País" name="pais" options={options} value="co" />);
    const select = container.querySelector("select");
    expect(select).not.toBeNull();
    expect(select).toHaveAttribute("name", "pais");
    const rendered = Array.from(select!.querySelectorAll("option")).map((o) => ({
      label: o.textContent,
      value: o.value,
      disabled: o.disabled,
    }));
    expect(rendered).toEqual([
      { label: "Colombia", value: "co", disabled: false },
      { label: "México", value: "mx", disabled: true },
    ]);
  });
});

describe("Select — opciones con label ReactNode", () => {
  const options = [
    { label: <span><i aria-hidden="true">★</i> Colombia</span>, textValue: "Colombia", value: "co" },
    { label: "México", value: "mx" },
  ];

  it("renderiza el nodo y usa textValue como texto accesible y de búsqueda", async () => {
    render(<Select aria-label="País" options={options} name="pais" />);
    fireEvent.click(screen.getByRole("combobox", { name: "País" }));
    // El icono lleva aria-hidden: el nombre accesible es solo el texto.
    const option = await screen.findByRole("option", { name: "Colombia" });
    expect(option.querySelector("i")).not.toBeNull();
    // El <select> nativo usa itemToString → textValue.
    const nativeOptions = Array.from(document.querySelectorAll("select option")).map((o) => o.textContent);
    expect(nativeOptions).toContain("Colombia");
  });

  it("muestra el nodo del valor seleccionado en el trigger", () => {
    render(<Select aria-label="País" options={options} value="co" />);
    const trigger = screen.getByRole("combobox", { name: "País" });
    expect(trigger.textContent).toContain("Colombia");
  });
});
