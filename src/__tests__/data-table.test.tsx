import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable, Column } from "../components/ui/data-table";

interface Fila {
  nombre: string;
}

describe("DataTable", () => {
  it("renderiza las filas y encabezados", () => {
    const value: Fila[] = [{ nombre: "Ana" }, { nombre: "Luis" }];
    render(
      <DataTable value={value}>
        <Column field="nombre" header="Nombre" />
      </DataTable>,
    );
    expect(screen.getByText("Nombre")).toBeInTheDocument();
    expect(screen.getByText("Ana")).toBeInTheDocument();
    expect(screen.getByText("Luis")).toBeInTheDocument();
  });

  it("muestra el mensaje vacío cuando no hay datos", () => {
    render(
      <DataTable value={[] as Fila[]}>
        <Column field="nombre" header="Nombre" />
      </DataTable>,
    );
    expect(screen.getByText("No hay datos para mostrar.")).toBeInTheDocument();
  });

  it("permite ordenar con un botón accesible y comunica la dirección", async () => {
    const user = userEvent.setup();
    render(
      <DataTable value={[{ nombre: "Luis" }, { nombre: "Ana" }]} aria-label="Usuarios">
        <Column field="nombre" header="Nombre" sortable />
      </DataTable>,
    );

    const table = screen.getByRole("table", { name: "Usuarios" });
    const sortButton = screen.getByRole("button", { name: "Ordenar por Nombre" });
    expect(table).toBeInTheDocument();
    expect(sortButton.closest("th")).toHaveAttribute("aria-sort", "none");

    await user.click(sortButton);
    expect(sortButton.closest("th")).toHaveAttribute("aria-sort", "ascending");
  });

  it("nombra los controles de paginación", () => {
    render(
      <DataTable value={[{ nombre: "Ana" }]}>
        <Column field="nombre" header="Nombre" />
      </DataTable>,
    );

    expect(screen.getByRole("button", { name: "Ir a la página anterior" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ir a la página siguiente" })).toBeInTheDocument();
  });
});
