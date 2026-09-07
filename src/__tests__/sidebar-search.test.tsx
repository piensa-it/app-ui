import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AppShell } from "../components/layout/app-shell";
import { SidebarSearch } from "../components/layout/sidebar-search";
import { normalizeSearch } from "../lib/search";

/**
 * El buscador del menú (#119): campo con lupa, limpiar y Escape; no se pinta
 * con el menú plegado. Qué se filtra lo decide la aplicación.
 */
describe("SidebarSearch", () => {
  it("es un campo de búsqueda con nombre, avisa al escribir y limpia con el botón y con Escape", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<SidebarSearch value="" onChange={onChange} />);
    const campo = screen.getByRole("searchbox", { name: "Buscar en el menú" });
    await user.type(campo, "c");
    expect(onChange).toHaveBeenCalledWith("c");
    expect(screen.queryByRole("button", { name: "Limpiar búsqueda" })).not.toBeInTheDocument();

    rerender(<SidebarSearch value="conci" onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Limpiar búsqueda" }));
    expect(onChange).toHaveBeenLastCalledWith("");
    await user.type(screen.getByRole("searchbox"), "{Escape}");
    expect(onChange).toHaveBeenLastCalledWith("");
  });

  it("plegado el menú no se pinta: no hay sitio para escribir", () => {
    render(
      <AppShell defaultCollapsed sidebar={<SidebarSearch value="" onChange={() => {}} />}>
        <p>Contenido</p>
      </AppShell>,
    );
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  });

  it("normaliza tildes y mayúsculas para comparar", () => {
    expect(normalizeSearch("  Conciliación ")).toBe("conciliacion");
    expect(normalizeSearch("NÓMINA")).toBe("nomina");
  });
});
