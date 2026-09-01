import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
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

  it("permite configurar la visibilidad de columnas y conserva columnas fijas", async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        value={[{ nombre: "Ana", correo: "ana@example.com" }]}
        configurableColumns
      >
        <Column field="nombre" header="Nombre" hideable={false} />
        <Column field="correo" header="Correo" />
      </DataTable>,
    );

    await user.click(screen.getByRole("button", { name: "Configurar columnas" }));
    expect(screen.getByText("Personalizar tabla")).toBeInTheDocument();
    expect(screen.getByText("Fija")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Correo/i }));
    expect(screen.queryByText("ana@example.com")).not.toBeInTheDocument();
  });

  it("cierra la configuración de columnas al continuar con la búsqueda", async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        value={[{ nombre: "Ana", correo: "ana@example.com" }]}
        configurableColumns
        searchable
      >
        <Column field="nombre" header="Nombre" />
        <Column field="correo" header="Correo" />
      </DataTable>,
    );

    const settings = screen.getByRole("button", { name: "Configurar columnas" });
    await user.click(settings);
    expect(settings).toHaveAttribute("aria-expanded", "true");

    await user.click(screen.getByRole("textbox", { name: "Buscar en la tabla" }));
    await waitFor(() => expect(settings).toHaveAttribute("aria-expanded", "false"));
  });

  it("sin paginador muestra todas las filas, no solo la primera página", () => {
    const value: Fila[] = Array.from({ length: 12 }, (_, i) => ({ nombre: `Persona ${i + 1}` }));
    const { rerender } = render(
      <DataTable value={value}>
        <Column field="nombre" header="Nombre" />
      </DataTable>,
    );

    // Con el paginador activo (por defecto) solo entran 10 filas por página.
    expect(screen.queryByText("Persona 12")).not.toBeInTheDocument();

    rerender(
      <DataTable value={value} paginator={false}>
        <Column field="nombre" header="Nombre" />
      </DataTable>,
    );

    expect(screen.getByText("Persona 1")).toBeInTheDocument();
    expect(screen.getByText("Persona 12")).toBeInTheDocument();
  });

  it("el buscador filtra las filas por el texto ingresado", async () => {
    const user = userEvent.setup();
    render(
      <DataTable value={[{ nombre: "Ana" }, { nombre: "Luis" }] as Fila[]} searchable>
        <Column field="nombre" header="Nombre" />
      </DataTable>,
    );

    await user.type(screen.getByRole("textbox", { name: "Buscar en la tabla" }), "Ana");

    await waitFor(() => expect(screen.queryByText("Luis")).not.toBeInTheDocument());
    expect(screen.getByText("Ana")).toBeInTheDocument();
  });
});
