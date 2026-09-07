import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SearchInput } from "../components/ui/search-input";

/**
 * El patrón que faltaba (#60) para la barra superior y las barras de
 * herramientas. Controlado: la aplicación decide si busca al escribir o al
 * confirmar, y si lo pone o no.
 */
describe("SearchInput", () => {
  it("es un buscador con nombre accesible", () => {
    render(<SearchInput value="" onChange={() => {}} />);
    expect(screen.getByRole("searchbox", { name: "Buscar" })).toBeInTheDocument();
  });

  it("notifica cada tecla", async () => {
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} />);
    await userEvent.type(screen.getByRole("searchbox"), "ca");
    expect(onChange).toHaveBeenCalledWith("c");
  });

  it("con Enter busca «al confirmar»", async () => {
    const onSearch = vi.fn();
    render(<SearchInput value="cartera" onChange={() => {}} onSearch={onSearch} />);
    await userEvent.type(screen.getByRole("searchbox"), "{Enter}");
    expect(onSearch).toHaveBeenCalledWith("cartera");
  });

  it("con algo escrito aparece el botón de limpiar, y limpia", async () => {
    const onChange = vi.fn();
    render(<SearchInput value="cartera" onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Limpiar búsqueda" }));
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("sin nada escrito no hay botón de limpiar, y muestra el atajo si se le pasa", () => {
    render(<SearchInput value="" onChange={() => {}} shortcut="Ctrl K" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("Ctrl K")).toBeInTheDocument();
  });

  it("Escape limpia sin cerrar nada", async () => {
    const onChange = vi.fn();
    render(<SearchInput value="cartera" onChange={onChange} />);
    await userEvent.type(screen.getByRole("searchbox"), "{Escape}");
    expect(onChange).toHaveBeenCalledWith("");
  });
});
