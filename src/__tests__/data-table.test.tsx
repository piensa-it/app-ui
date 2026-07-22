import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
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
});
