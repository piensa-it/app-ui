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
      <DataTable value={[{ nombre: "Ana" }]} paginator>
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

describe("DataTable sin paginador", () => {
  it("renderiza con paginator={false} sin lanzar error", () => {
    expect(() =>
      render(
        <DataTable value={[{ a: 1 }]} paginator={false}>
          <Column field="a" header="A" />
        </DataTable>,
      ),
    ).not.toThrow();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("no muestra el pie de paginación con paginator={false}", () => {
    render(
      <DataTable value={[{ a: 1 }]} paginator={false}>
        <Column field="a" header="A" />
      </DataTable>,
    );
    expect(screen.queryByRole("button", { name: "Ir a la página siguiente" })).not.toBeInTheDocument();
    expect(screen.queryByText("Filas por página")).not.toBeInTheDocument();
  });
});

describe("DataTable — className de Column", () => {
  it("aplica className de la columna tanto al <th> como a las <td>", () => {
    render(
      <DataTable value={[{ total: 10 }]}>
        <Column field="total" header="Total" className="text-right" />
      </DataTable>,
    );
    expect(screen.getByRole("columnheader", { name: "Total" })).toHaveClass("text-right");
    expect(screen.getByRole("cell", { name: "10" })).toHaveClass("text-right");
  });

  it("headerClassName sustituye a className solo en el <th>", () => {
    render(
      <DataTable value={[{ total: 10 }]}>
        <Column field="total" header="Total" className="text-right" headerClassName="text-center" />
      </DataTable>,
    );
    const header = screen.getByRole("columnheader", { name: "Total" });
    expect(header).toHaveClass("text-center");
    expect(header).not.toHaveClass("text-right");
    expect(screen.getByRole("cell", { name: "10" })).toHaveClass("text-right");
  });
});

describe("DataTable — paginador automático", () => {
  const corta = Array.from({ length: 3 }, (_, i) => ({ nombre: `Moneda ${i + 1}` }));
  const larga = Array.from({ length: 12 }, (_, i) => ({ nombre: `Persona ${i + 1}` }));

  it('paginator="auto" oculta el pie cuando las filas caben en una página', () => {
    render(
      <DataTable value={corta} paginator="auto" rows={10}>
        <Column field="nombre" header="Nombre" />
      </DataTable>,
    );
    expect(screen.getByText("Moneda 3")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Ir a la página siguiente" })).not.toBeInTheDocument();
  });

  it('paginator="auto" muestra el pie cuando hay más filas que `rows`', () => {
    render(
      <DataTable value={larga} paginator="auto" rows={10}>
        <Column field="nombre" header="Nombre" />
      </DataTable>,
    );
    expect(screen.queryByText("Persona 12")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ir a la página siguiente" })).toBeInTheDocument();
  });

  it("es el comportamiento por defecto: una tabla corta no muestra el pie", () => {
    render(
      <DataTable value={corta}>
        <Column field="nombre" header="Nombre" />
      </DataTable>,
    );
    expect(screen.queryByText("Filas por página")).not.toBeInTheDocument();
  });

  it("paginator={true} fuerza el pie aunque la tabla sea corta", () => {
    render(
      <DataTable value={corta} paginator>
        <Column field="nombre" header="Nombre" />
      </DataTable>,
    );
    expect(screen.getByText("Filas por página")).toBeInTheDocument();
  });
});
