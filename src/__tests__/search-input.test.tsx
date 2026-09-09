import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchInput } from "../components/ui/search-input";

describe("SearchInput", () => {
  it("actualiza el texto visible al instante, sin esperar el retardo", async () => {
    const user = userEvent.setup();
    render(<SearchInput value="" onChange={vi.fn()} aria-label="Buscar" />);

    const input = screen.getByRole("searchbox", { name: "Buscar" });
    await user.type(input, "ca");
    expect(input).toHaveValue("ca");
  });

  it("avisa onChange solo tras el retardo, no en cada tecla", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} delay={40} aria-label="Buscar" />);

    const input = screen.getByRole("searchbox", { name: "Buscar" });
    await user.type(input, "ca");
    // Todavía dentro del retardo: ninguna letra disparó onChange por sí sola.
    expect(onChange).not.toHaveBeenCalled();

    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
    expect(onChange).toHaveBeenCalledWith("ca");
  });

  it("avisa en cada tecla con delay={0}", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} delay={0} aria-label="Buscar" />);

    await user.type(screen.getByRole("searchbox", { name: "Buscar" }), "ab");
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith("ab");
  });

  it("el botón de limpiar solo aparece con texto, y limpia sin esperar el retardo", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchInput value="café" onChange={onChange} aria-label="Buscar" />);

    const clearButton = screen.getByRole("button", { name: "Limpiar búsqueda" });
    await user.click(clearButton);

    expect(onChange).toHaveBeenCalledWith("");
    expect(screen.getByRole("searchbox", { name: "Buscar" })).toHaveValue("");
    expect(screen.queryByRole("button", { name: "Limpiar búsqueda" })).not.toBeInTheDocument();
  });

  it("no muestra el botón de limpiar cuando el campo está vacío", () => {
    render(<SearchInput value="" onChange={vi.fn()} aria-label="Buscar" />);
    expect(screen.queryByRole("button", { name: "Limpiar búsqueda" })).not.toBeInTheDocument();
  });
});
