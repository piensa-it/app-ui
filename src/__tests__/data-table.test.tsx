import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
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

interface Movimiento {
  concepto: string;
  valor: number;
}

const movimientos: Movimiento[] = [
  { concepto: "Recaudo", valor: 18450000 },
  { concepto: "Nómina", valor: -42780500 },
  { concepto: "Proveedores", valor: -3200000 },
];

describe("DataTable — columnas numéricas", () => {
  it("`align=right` alinea encabezado y celdas, y usa cifras de ancho fijo", () => {
    render(
      <DataTable value={movimientos}>
        <Column field="concepto" header="Concepto" />
        <Column field="valor" header="Valor" align="right" />
      </DataTable>,
    );
    const header = screen.getByRole("columnheader", { name: "Valor" });
    const cell = screen.getByRole("cell", { name: "18450000" });
    expect(header).toHaveClass("text-right");
    // `tabular-nums` va implícito: sin él las cifras bailan entre filas.
    expect(cell).toHaveClass("text-right", "tabular-nums");
    expect(header).toHaveClass("tabular-nums");
  });

  it("`align=center` centra la columna", () => {
    render(
      <DataTable value={movimientos}>
        <Column field="concepto" header="Concepto" align="center" />
      </DataTable>,
    );
    expect(screen.getByRole("columnheader", { name: "Concepto" })).toHaveClass("text-center");
  });

  it("`className` sigue mandando sobre la alineación", () => {
    render(
      <DataTable value={movimientos}>
        <Column field="valor" header="Valor" align="right" className="text-left" />
      </DataTable>,
    );
    expect(screen.getByRole("columnheader", { name: "Valor" })).toHaveClass("text-left");
  });
});

describe("DataTable — fila de totales", () => {
  const total = (rows: Movimiento[]) => rows.reduce((sum, row) => sum + row.valor, 0);

  it("sin `footer` en ninguna columna no se dibuja el pie de la tabla", () => {
    const { container } = render(
      <DataTable value={movimientos}>
        <Column field="concepto" header="Concepto" />
      </DataTable>,
    );
    expect(container.querySelector("tfoot")).toBeNull();
  });

  it("`footer` recibe las filas y dibuja la fila de totales", () => {
    render(
      <DataTable value={movimientos}>
        <Column field="concepto" header="Concepto" footer={() => "Total"} />
        {/* El tipo se anota para que `rows` llegue tipado al pie. */}
        <Column<Movimiento>
          field="valor"
          header="Valor"
          align="right"
          footer={(rows) => total(rows).toLocaleString("es-CO")}
        />
      </DataTable>,
    );
    const foot = screen.getByRole("rowgroup", { name: "Totales" });
    expect(within(foot).getByText("Total")).toBeInTheDocument();
    expect(within(foot).getByText("-27.530.500")).toBeInTheDocument();
  });

  it("el total suma todas las filas filtradas, no solo la página visible", async () => {
    const user = userEvent.setup();
    const muchas = Array.from({ length: 12 }, (_, i) => ({ concepto: `Fila ${i + 1}`, valor: 100 }));
    render(
      <DataTable value={muchas} rows={10} searchable>
        <Column field="concepto" header="Concepto" />
        <Column field="valor" header="Valor" footer={(rows) => `${rows.length} filas`} />
      </DataTable>,
    );
    // Doce filas, diez por página: el total cuenta las doce.
    expect(screen.getByText("12 filas")).toBeInTheDocument();

    // Y al filtrar, cuenta solo lo que queda.
    await user.type(screen.getByRole("textbox", { name: "Buscar en la tabla" }), "Fila 1");
    await waitFor(() => expect(screen.getByText("4 filas")).toBeInTheDocument());
  });

  it("la columna oculta no aparece en el pie", async () => {
    const user = userEvent.setup();
    render(
      <DataTable value={movimientos} configurableColumns>
        <Column field="concepto" header="Concepto" footer={() => "Total"} />
        <Column field="valor" header="Valor" footer={() => "suma"} />
      </DataTable>,
    );
    await user.click(screen.getByRole("button", { name: "Configurar columnas" }));
    await user.click(screen.getByRole("button", { name: /Valor/i }));
    const foot = screen.getByRole("rowgroup", { name: "Totales" });
    expect(within(foot).queryByText("suma")).not.toBeInTheDocument();
  });
});

describe("DataTable — columnas de presentación", () => {
  interface Cliente {
    nombre: string;
    correo: string;
    telefono: string;
  }
  const clientes: Cliente[] = [
    { nombre: "Ana Gómez", correo: "ana@acme.co", telefono: "310 555 0101" },
  ];

  it("una columna sin campo se declara con `id` y `body`", () => {
    render(
      <DataTable value={clientes}>
        <Column<Cliente> field="nombre" header="Nombre" />
        <Column<Cliente>
          id="contacto"
          header="Contacto"
          body={(fila) => (
            <span>
              {fila.correo} · {fila.telefono}
            </span>
          )}
        />
      </DataTable>,
    );
    expect(screen.getByRole("columnheader", { name: "Contacto" })).toBeInTheDocument();
    expect(screen.getByText(/ana@acme\.co · 310 555 0101/)).toBeInTheDocument();
  });

  it("una columna de acciones no necesita ningún campo de la fila", async () => {
    const user = userEvent.setup();
    const onEditar = vi.fn();
    render(
      <DataTable value={clientes}>
        <Column<Cliente> field="nombre" header="Nombre" />
        <Column<Cliente>
          id="acciones"
          header="Acciones"
          align="right"
          body={(fila) => (
            <button type="button" onClick={() => onEditar(fila.nombre)}>
              Editar
            </button>
          )}
        />
      </DataTable>,
    );
    await user.click(screen.getByRole("button", { name: "Editar" }));
    expect(onEditar).toHaveBeenCalledWith("Ana Gómez");
  });

  it("`id` distingue dos columnas del mismo campo", () => {
    render(
      <DataTable value={clientes}>
        <Column<Cliente> id="nombre-corto" field="nombre" header="Corto" body={(f) => f.nombre.split(" ")[0]} />
        <Column<Cliente> id="nombre-completo" field="nombre" header="Completo" />
      </DataTable>,
    );
    expect(screen.getByRole("columnheader", { name: "Corto" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Completo" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Ana" })).toBeInTheDocument();
  });

  it("una columna de presentación se puede ocultar y no se puede ordenar", async () => {
    const user = userEvent.setup();
    render(
      <DataTable value={clientes} configurableColumns>
        <Column<Cliente> field="nombre" header="Nombre" sortable />
        <Column<Cliente> id="acciones" header="Acciones" body={() => <span>—</span>} />
      </DataTable>,
    );
    // Sin campo del que leer un valor, no hay nada por lo que ordenar.
    expect(screen.queryByRole("button", { name: "Ordenar por Acciones" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Configurar columnas" }));
    expect(screen.getByRole("button", { name: /Acciones/i })).toBeInTheDocument();
  });

  it("el buscador no rompe con columnas sin campo", async () => {
    const user = userEvent.setup();
    render(
      <DataTable value={clientes} searchable>
        <Column<Cliente> field="nombre" header="Nombre" />
        <Column<Cliente> id="acciones" header="Acciones" body={() => <span>—</span>} />
      </DataTable>,
    );
    await user.type(screen.getByRole("textbox", { name: "Buscar en la tabla" }), "Ana");
    await waitFor(() => expect(screen.getByText("Ana Gómez")).toBeInTheDocument());
  });
});
