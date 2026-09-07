import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ScreenSearch } from "../components/layout/screen-search";

const grupos = [
  { id: "operacion", label: "Operación", items: [{ id: "tablero", label: "Tablero" }, { id: "movimientos", label: "Movimientos" }] },
  { id: "control", label: "Control", items: [{ id: "conciliacion", label: "Conciliación" }] },
];

/**
 * El buscador de pantallas de la barra superior: un campo con la pista del
 * atajo que abre el `AppSwitcher`, también con Ctrl K. Elegir avisa y cierra.
 */
describe("ScreenSearch", () => {
  it("es un botón con la pista del atajo que abre el diálogo de pantallas", async () => {
    const user = userEvent.setup();
    render(<ScreenSearch groups={grupos} activeId="tablero" onSelect={() => {}} />);
    const boton = screen.getByRole("button", { name: "Buscar pantalla (Ctrl K)" });
    expect(boton).toHaveTextContent("Ctrl K");
    await user.click(boton);
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Conciliación")).toBeInTheDocument();
  });

  it("Ctrl K lo abre desde cualquier sitio, y elegir una pantalla avisa y cierra", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<ScreenSearch groups={grupos} onSelect={onSelect} />);
    await user.keyboard("{Control>}k{/Control}");
    const dialogo = await screen.findByRole("dialog");
    expect(dialogo).toBeInTheDocument();
    await user.type(screen.getByRole("combobox", { name: "Buscar" }), "conci");
    await user.keyboard("{Enter}");
    await waitFor(() => expect(onSelect).toHaveBeenCalledWith("conciliacion", expect.objectContaining({ label: "Conciliación" })));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});
