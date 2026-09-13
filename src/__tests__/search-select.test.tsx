import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SearchSelect, type SearchSelectOption } from "../components/ui/search-select";

const clientes: SearchSelectOption[] = [
  { value: 1, label: "Juan Pérez", description: "NIT 900123456" },
  { value: 2, label: "Juan Pérez", description: "NIT 800555111" },
  { value: 3, label: "Distribuidora Andina", description: "NIT 901000222" },
];

/**
 * Escribe el texto en un solo evento. `user.type` tecla a tecla pierde
 * caracteres en jsdom con este combobox (también con `AutoComplete`); en
 * Chromium real no pasa — se comprobó escribiendo de un tirón con Playwright.
 */
function escribir(input: HTMLElement, text: string) {
  fireEvent.change(input, { target: { value: text } });
}

function Demo({ onChange, ...props }: Partial<React.ComponentProps<typeof SearchSelect>>) {
  const [value, setValue] = useState<string | number | null>(props.value ?? null);
  return (
    <>
      <SearchSelect
        aria-label="Cliente"
        options={clientes}
        {...props}
        value={value}
        onChange={(next, option) => {
          setValue(next);
          onChange?.(next, option);
        }}
      />
      <button type="button">Afuera</button>
    </>
  );
}

describe("SearchSelect", () => {
  it("expone un combobox con el nombre accesible", () => {
    render(<Demo />);
    expect(screen.getByRole("combobox", { name: "Cliente" })).toBeInTheDocument();
  });

  it("filtra sin distinguir tildes, busca también en la descripción y entrega el id", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Demo onChange={onChange} />);

    const input = screen.getByRole("combobox", { name: "Cliente" });
    await user.click(input);
    escribir(input, "perez");
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(2));

    escribir(input, "800555");
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(1));
    await user.click(screen.getByRole("option"));

    await waitFor(() => expect(onChange).toHaveBeenCalledWith(2, clientes[1]));
    expect(input).toHaveValue("Juan Pérez");
  });

  it("al salir sin elegir, el texto vuelve al registro seleccionado", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Demo value={3} onChange={onChange} />);

    const input = screen.getByRole("combobox", { name: "Cliente" });
    expect(input).toHaveValue("Distribuidora Andina");
    await user.click(input);
    escribir(input, "algo que no existe");
    expect(await screen.findByText("Sin resultados")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Afuera" }));

    await waitFor(() => expect(input).toHaveValue("Distribuidora Andina"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("Escape cierra el panel y devuelve el texto al registro elegido", async () => {
    const user = userEvent.setup();
    render(<Demo value={3} />);

    const input = screen.getByRole("combobox", { name: "Cliente" });
    await user.click(input);
    escribir(input, "juan");
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(2));
    await user.keyboard("{Escape}");

    await waitFor(() => expect(input).toHaveAttribute("aria-expanded", "false"));
    await waitFor(() => expect(input).toHaveValue("Distribuidora Andina"));
  });

  it("el botón de mostrar opciones abre el panel y Tab lo cierra", async () => {
    const user = userEvent.setup();
    render(<Demo />);

    await user.click(screen.getByRole("button", { name: "Mostrar opciones" }));
    expect(await screen.findAllByRole("option")).toHaveLength(3);
    await user.keyboard("{Tab}");
    await waitFor(() =>
      expect(screen.getByRole("combobox", { name: "Cliente" })).toHaveAttribute("aria-expanded", "false"),
    );
  });

  it("limpia la selección con la X", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Demo value={1} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Quitar selección" }));
    expect(onChange).toHaveBeenCalledWith(null, null);
    expect(screen.getByRole("combobox", { name: "Cliente" })).toHaveValue("");
  });

  it("pinta como máximo `maxResults` opciones", async () => {
    const user = userEvent.setup();
    const muchos = Array.from({ length: 500 }, (_, i) => ({ value: i, label: `Ítem ${i}` }));
    render(<Demo options={muchos} maxResults={20} />);

    await user.click(screen.getByRole("combobox", { name: "Cliente" }));
    expect(await screen.findAllByRole("option")).toHaveLength(20);
    expect(screen.getByText(/Mostrando 20 de 500/)).toBeInTheDocument();
  });

  it("con `onSearch` no filtra, avisa el texto con retardo y muestra el valor desde `selectedOption`", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(
      <Demo
        options={clientes}
        onSearch={onSearch}
        value={99}
        selectedOption={{ value: 99, label: "Cliente guardado" }}
      />,
    );

    const input = screen.getByRole("combobox", { name: "Cliente" });
    expect(input).toHaveValue("Cliente guardado");

    // Al abrir busca de inmediato, sin texto.
    await user.click(input);
    await waitFor(() => expect(onSearch).toHaveBeenLastCalledWith(""));

    escribir(input, "zzz");
    // Sin filtrar: las opciones son las que entregó la búsqueda.
    expect(screen.getAllByRole("option")).toHaveLength(3);
    // Al teclear, con retardo.
    expect(onSearch).not.toHaveBeenCalledWith("zzz");
    await waitFor(() => expect(onSearch).toHaveBeenLastCalledWith("zzz"));
  });

  it("muestra el estado de carga", async () => {
    const user = userEvent.setup();
    render(<Demo options={[]} onSearch={() => {}} loading />);
    await user.click(screen.getByRole("combobox", { name: "Cliente" }));
    expect(await screen.findByText("Buscando…")).toBeInTheDocument();
  });

  it("con `name` envía el identificador en un campo oculto", () => {
    const { container } = render(<Demo value={3} name="cliente_id" />);
    expect(container.querySelector('input[type="hidden"][name="cliente_id"]')).toHaveValue("3");
  });
});
