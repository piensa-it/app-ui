import * as React from "react";
import { createPortal } from "react-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable, Column } from "../components/ui/data-table";
import { Menu, MenuTrigger, MenuContent, MenuItem } from "../components/ui/menu";
import { Switch } from "../components/ui/switch";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";

interface Fila {
  nombre: string;
  id?: string;
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

  it("permite nombrar el buscador y mantiene el nombre por defecto", () => {
    const value: Fila[] = [{ nombre: "Ana" }];

    const { unmount } = render(
      <DataTable value={value} searchable searchLabel="Buscar canal por nombre">
        <Column<Fila> field="nombre" header="Nombre" />
      </DataTable>,
    );
    expect(screen.getByLabelText("Buscar canal por nombre")).toBeInTheDocument();
    unmount();

    render(
      <DataTable value={value} searchable>
        <Column<Fila> field="nombre" header="Nombre" />
      </DataTable>,
    );
    expect(screen.getByLabelText("Buscar en la tabla")).toBeInTheDocument();
  });

  it("puede pintar el título como encabezado real", () => {
    const value: Fila[] = [{ nombre: "Ana" }];

    const { unmount } = render(
      <DataTable value={value} title="Canales registrados" titleAs="h3">
        <Column<Fila> field="nombre" header="Nombre" />
      </DataTable>,
    );
    expect(screen.getByRole("heading", { name: "Canales registrados", level: 3 })).toBeInTheDocument();
    unmount();

    // Por defecto NO es encabezado: no se cambia lo ya publicado.
    render(
      <DataTable value={value} title="Canales registrados">
        <Column<Fila> field="nombre" header="Nombre" />
      </DataTable>,
    );
    expect(screen.queryByRole("heading", { name: "Canales registrados" })).toBeNull();
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

  it("usa getRowId para identificar las filas", () => {
    interface Canal { id: string; nombre: string }
    const value: Canal[] = [
      { id: "ch_web", nombre: "Web" },
      { id: "ch_mostrador", nombre: "Mostrador" },
    ];
    const { container } = render(
      <DataTable value={value} getRowId={(c) => c.id}>
        <Column<Canal> field="nombre" header="Nombre" />
      </DataTable>,
    );
    const filas = container.querySelectorAll("tbody tr");
    expect(filas[0].getAttribute("data-row-id")).toBe("ch_web");
    expect(filas[1].getAttribute("data-row-id")).toBe("ch_mostrador");
  });

  it("sin getRowId no escribe data-row-id (el índice de TanStack no es una identidad)", () => {
    const { container } = render(
      <DataTable value={[{ nombre: "Ana" }, { nombre: "Luis" }]}>
        <Column field="nombre" header="Nombre" />
      </DataTable>,
    );
    const filas = container.querySelectorAll("tbody tr");
    expect(filas[0]).not.toHaveAttribute("data-row-id");
    expect(filas[1]).not.toHaveAttribute("data-row-id");
  });

  it("con getRowId el estado no controlado de una fila sigue al registro al reordenar", async () => {
    const user = userEvent.setup();
    interface Canal { id: string; nombre: string }
    const value: Canal[] = [
      { id: "ch_web", nombre: "Web" },
      { id: "ch_mostrador", nombre: "Mostrador" },
    ];
    // Las columnas se fijan una sola vez y se reutilizan en el `rerender`: si
    // se reconstruyeran en cada llamada (JSX nuevo cada vez), `columnDefs`
    // recalcularía sus `cell` con identidad distinta y TanStack/React
    // remontarían la celda igual con o sin `getRowId` — la prueba dejaría de
    // distinguir el caso que interesa, que es solo el de las filas.
    const columnas = [
      <Column<Canal> key="nombre" field="nombre" header="Nombre" />,
      <Column<Canal>
        key="nota"
        id="nota"
        header="Nota"
        body={() => <input aria-label="Nota" defaultValue="" />}
      />,
    ];
    const { rerender } = render(
      <DataTable value={value} getRowId={(c) => c.id}>
        {columnas}
      </DataTable>,
    );

    // Se marca la nota de la fila "Web", un estado que React no puede
    // reconstruir a partir de las props: solo sobrevive si la fila conserva
    // el mismo nodo del DOM entre renders.
    const filaWeb = screen.getByText("Web").closest("tr")!;
    await user.type(within(filaWeb).getByRole("textbox", { name: "Nota" }), "marcada");

    // Se invierte el orden: "Web" pasa de la primera posición a la segunda.
    rerender(
      <DataTable value={[value[1], value[0]]} getRowId={(c) => c.id}>
        {columnas}
      </DataTable>,
    );

    const filaWebDespues = screen.getByText("Web").closest("tr")!;
    expect(within(filaWebDespues).getByRole("textbox", { name: "Nota" })).toHaveValue("marcada");
  });

  it("onRowClick abre la fila con ratón y con teclado", async () => {
    const value: Fila[] = [{ nombre: "Ana" }];
    const abrir = vi.fn();
    const user = userEvent.setup();

    render(
      <DataTable value={value} onRowClick={abrir}>
        <Column<Fila> field="nombre" header="Nombre" />
      </DataTable>,
    );

    await user.click(screen.getByText("Ana"));
    expect(abrir).toHaveBeenCalledWith(value[0]);

    abrir.mockClear();
    const fila = screen.getByText("Ana").closest("tr")!;
    fila.focus();
    await user.keyboard("{Enter}");
    expect(abrir).toHaveBeenCalledWith(value[0]);
  });

  it("onRowClick NO se dispara desde un botón de la fila", async () => {
    const value: Fila[] = [{ nombre: "Ana" }];
    const abrir = vi.fn();
    const borrar = vi.fn();
    const user = userEvent.setup();

    render(
      <DataTable value={value} onRowClick={abrir}>
        <Column<Fila> field="nombre" header="Nombre" />
        <Column<Fila>
          id="acciones"
          header="Acciones"
          body={() => <button type="button" onClick={borrar}>Eliminar</button>}
        />
      </DataTable>,
    );

    await user.click(screen.getByRole("button", { name: "Eliminar" }));
    expect(borrar).toHaveBeenCalledTimes(1);
    expect(abrir).not.toHaveBeenCalled();
  });

  // El kebab de acciones es el caso real, no el botón suelto de arriba: su
  // `MenuItem` se pinta en un `Portal` (fuera del <tr> en el DOM), y es
  // exactamente lo que un click de "Eliminar" en un menú de fila se parece
  // en las 12 pantallas que van a usar esto.
  it("onRowClick NO se dispara desde un ítem de un menú portado (kebab de la fila)", async () => {
    const value: Fila[] = [{ nombre: "Ana" }];
    const abrir = vi.fn();
    const borrar = vi.fn();

    render(
      <DataTable value={value} onRowClick={abrir}>
        <Column<Fila> field="nombre" header="Nombre" />
        <Column<Fila>
          id="acciones"
          header="Acciones"
          body={() => (
            <Menu>
              <MenuTrigger>
                <button type="button">Más opciones</button>
              </MenuTrigger>
              <MenuContent>
                <MenuItem value="delete" onSelect={borrar}>
                  Eliminar
                </MenuItem>
              </MenuContent>
            </Menu>
          )}
        />
      </DataTable>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Más opciones" }));
    const item = await screen.findByRole("menuitem", { name: "Eliminar" });
    // Ver menu.test.tsx: Ark UI solo dispara onSelect si el ítem quedó
    // "highlighted" antes del click, algo que hace el pointerdown real.
    fireEvent.pointerDown(item, { pointerType: "mouse" });
    await waitFor(() => expect(item).toHaveAttribute("data-highlighted"));
    fireEvent.click(item);

    await waitFor(() => expect(borrar).toHaveBeenCalledTimes(1));
    expect(abrir).not.toHaveBeenCalled();
  });

  // El equivalente por teclado de la prueba anterior NO sirve con `Menu`: su
  // `Content` (zag-js) ya intercepta Enter/Espacio con su propio
  // `stopPropagation` antes de que salgan del menú — abrir con Enter tras
  // resaltar "Eliminar" nunca llega al `onKeyDown` de la fila, con o sin
  // `naceFueraDeLaFila`. Eso no prueba nada del guardián: probaría el
  // `stopPropagation` de Ark, no el nuestro. Para pinchar el guardián de
  // verdad hace falta un control portado que SÍ deje burbujear el evento
  // —un doble mínimo, sin la protección propia de Ark— tal como cualquier
  // control futuro que un desarrollador de CoreLink meta en una celda sin
  // saber que replica el mecanismo de Ark.
  it("onRowClick NO se dispara con Enter nacido en un control portado", () => {
    const value: Fila[] = [{ nombre: "Ana" }];
    const abrir = vi.fn();
    const activar = vi.fn();

    render(
      <DataTable value={value} onRowClick={abrir}>
        <Column<Fila> field="nombre" header="Nombre" />
        <Column<Fila>
          id="portal"
          header="Portal"
          body={() =>
            createPortal(
              // `role="menuitem"` y no un `<button>`: así el clic no lo
              // detiene `naceEnUnControl` (no está en su lista) y lo único
              // que puede pararlo es el guardián estructural.
              <div
                role="menuitem"
                tabIndex={-1}
                onKeyDown={(event) => {
                  if (event.key === "Enter") activar();
                }}
              >
                Eliminar
              </div>,
              document.body,
            )
          }
        />
      </DataTable>,
    );

    const item = screen.getByRole("menuitem", { name: "Eliminar" });
    fireEvent.keyDown(item, { key: "Enter" });

    expect(activar).toHaveBeenCalledTimes(1);
    expect(abrir).not.toHaveBeenCalled();
  });

  // `RadioGroupItem` (radio-group.tsx) deja su `<input>` real recortado a 1px
  // (`peer sr-only`, sin geometría): el clic aterriza siempre en el `<label>`
  // que envuelve el círculo, o en su texto — nunca en el input. A diferencia
  // de `Switch`, aquí el hueco es real en cualquier navegador, no solo bajo
  // Testing Library.
  it("onRowClick NO se dispara al elegir un RadioGroupItem de la fila", async () => {
    const value: Fila[] = [{ nombre: "Ana" }];
    const abrir = vi.fn();
    const elegir = vi.fn();
    const user = userEvent.setup();

    render(
      <DataTable value={value} onRowClick={abrir}>
        <Column<Fila> field="nombre" header="Nombre" />
        <Column<Fila>
          id="prioridad"
          header="Prioridad"
          body={() => (
            <RadioGroup onValueChange={elegir}>
              <RadioGroupItem value="alta" label="Alta" />
            </RadioGroup>
          )}
        />
      </DataTable>,
    );

    // El texto de la etiqueta, no el input oculto — el mismo caso que Switch,
    // pero aquí el hueco existe también fuera de las pruebas.
    await user.click(screen.getByText("Alta"));
    expect(elegir).toHaveBeenCalledWith("alta");
    expect(abrir).not.toHaveBeenCalled();
  });

  // `Switch` (switch.tsx + hidden-input.ts) SÍ cubre el input entero (100% de
  // ancho/alto, `clip: auto`): en un navegador real el clic siempre cae en
  // ese input, incluso apuntando al texto. El hueco que prueba este caso lo
  // produce Testing Library, no el navegador: `getByText` dispara el clic
  // directo sobre el `<span>` de la etiqueta, sin el cálculo de superposición
  // que haría un clic real — por eso `label` también hace falta aquí, aunque
  // el mecanismo de fondo sea distinto al de `RadioGroupItem`.
  it("onRowClick NO se dispara al marcar un Switch de la fila", async () => {
    const value: Fila[] = [{ nombre: "Ana" }];
    const abrir = vi.fn();
    const marcar = vi.fn();
    const user = userEvent.setup();

    render(
      <DataTable value={value} onRowClick={abrir}>
        <Column<Fila> field="nombre" header="Nombre" />
        <Column<Fila>
          id="activo"
          header="Estado"
          body={() => <Switch label="Activo" onCheckedChange={marcar} />}
        />
      </DataTable>,
    );

    await user.click(screen.getByText("Activo"));
    expect(marcar).toHaveBeenCalledTimes(1);
    expect(abrir).not.toHaveBeenCalled();
  });

  it("sin onRowClick la fila no es interactiva", () => {
    render(
      <DataTable value={[{ nombre: "Ana" }] as Fila[]}>
        <Column<Fila> field="nombre" header="Nombre" />
      </DataTable>,
    );
    const fila = screen.getByText("Ana").closest("tr")!;
    expect(fila).not.toHaveAttribute("tabindex");
  });

  it("renderExpanded despliega y repliega el detalle de una fila", async () => {
    const value: Fila[] = [
      { id: "a", nombre: "Ana" },
      { id: "b", nombre: "Luis" },
    ];
    const user = userEvent.setup();

    render(
      <DataTable value={value} getRowId={(f) => f.id!} renderExpanded={(f) => <p>Detalle de {f.nombre}</p>}>
        <Column<Fila> field="nombre" header="Nombre" />
      </DataTable>,
    );

    expect(screen.queryByText("Detalle de Ana")).toBeNull();

    const abrir = screen.getAllByRole("button", { name: /desplegar/i })[0];
    await user.click(abrir);
    expect(screen.getByText("Detalle de Ana")).toBeInTheDocument();
    expect(screen.queryByText("Detalle de Luis")).toBeNull();

    await user.click(screen.getByRole("button", { name: /replegar/i }));
    expect(screen.queryByText("Detalle de Ana")).toBeNull();
  });

  it("sin renderExpanded no aparece la columna de despliegue", () => {
    render(
      <DataTable value={[{ nombre: "Ana" }] as Fila[]}>
        <Column<Fila> field="nombre" header="Nombre" />
      </DataTable>,
    );
    expect(screen.queryByRole("button", { name: /desplegar/i })).toBeNull();
  });

  // El esqueleto de carga (`loading`) dibuja sus propias filas, no las de
  // `table.getRowModel()`. Sin la celda de despliegue ahí también, el
  // esqueleto tiene una columna menos que el encabezado y la tabla queda
  // despareja mientras carga.
  it("con loading y renderExpanded, el esqueleto tiene tantas celdas como el encabezado", () => {
    const { container } = render(
      <DataTable value={[]} loading renderExpanded={(f: Fila) => <p>{f.nombre}</p>}>
        <Column<Fila> field="nombre" header="Nombre" />
      </DataTable>,
    );
    const headerCells = container.querySelectorAll("thead th").length;
    const primeraFilaEsqueleto = container.querySelector("tbody tr")!;
    expect(primeraFilaEsqueleto.querySelectorAll("td").length).toBe(headerCells);
  });

  it("solo una fila a la vez: abrir Luis repliega el detalle de Ana", async () => {
    const value: Fila[] = [
      { id: "a", nombre: "Ana" },
      { id: "b", nombre: "Luis" },
    ];
    const user = userEvent.setup();

    render(
      <DataTable value={value} getRowId={(f) => f.id!} renderExpanded={(f) => <p>Detalle de {f.nombre}</p>}>
        <Column<Fila> field="nombre" header="Nombre" />
      </DataTable>,
    );

    const botones = screen.getAllByRole("button", { name: /desplegar/i });
    await user.click(botones[0]);
    expect(screen.getByText("Detalle de Ana")).toBeInTheDocument();

    // Al abrir Luis, el detalle de Ana debe replegarse: no es una lista de
    // detalles acumulados, es una fila a la vez.
    await user.click(screen.getByRole("button", { name: /desplegar/i }));
    expect(screen.getByText("Detalle de Luis")).toBeInTheDocument();
    expect(screen.queryByText("Detalle de Ana")).toBeNull();
  });

  // Ordenar es una transformación interna de TanStack: reordena el
  // `sortedRowModel` para pintar, pero el `row.id` posicional por defecto se
  // asigna sobre el índice del arreglo `data` tal como lo recibió la tabla,
  // no sobre el orden ya ordenado. Así que ordenar, por sí solo, no debería
  // mover `filaAbierta` de registro — se verifica antes de ir al caso real.
  it("sin getRowId, ordenar con el botón de la columna no mueve el detalle abierto de registro", async () => {
    const value: Fila[] = [{ nombre: "Beto" }, { nombre: "Ana" }];
    const user = userEvent.setup();

    render(
      <DataTable value={value} renderExpanded={(f) => <p>Detalle de {f.nombre}</p>}>
        <Column<Fila> field="nombre" header="Nombre" sortable />
      </DataTable>,
    );

    const abrir = screen.getAllByRole("button", { name: /desplegar/i })[0];
    await user.click(abrir);
    expect(screen.getByText("Detalle de Beto")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Ordenar por Nombre" }));

    expect(screen.getByText("Detalle de Beto")).toBeInTheDocument();
    expect(screen.queryByText("Detalle de Ana")).toBeNull();
  });

  // Esta prueba PIENSA A PROPÓSITO una limitación conocida y documentada en
  // el JSDoc de `renderExpanded`, no describe un bug que alguien deba
  // "arreglar" invirtiendo la aserción. La misma exposición que `getRowId`
  // vino a resolver reaparece por la puerta de `filaAbierta`: sin identidad
  // estable, `row.id` es el índice posicional del arreglo `value` tal como
  // llega en cada render. Si el padre vuelve a renderizar con el arreglo
  // reordenado —una recarga que trae los mismos registros en otro orden,
  // algo que sí ocurre en el ERP—, la posición 0 pasa a ser otro registro y
  // `filaAbierta` la sigue apuntando. No se vuelve `getRowId` obligatorio
  // (rompería a quien ya usa `renderExpanded` sin él); en su lugar hay un
  // aviso de desarrollo (ver más abajo) que dice exactamente esto.
  it("[limitación conocida, documentada] sin getRowId, el detalle abierto SÍ salta a otro registro si el padre reordena `value`", async () => {
    const value: Fila[] = [{ nombre: "Beto" }, { nombre: "Ana" }];
    const user = userEvent.setup();
    const columnas = [<Column<Fila> key="nombre" field="nombre" header="Nombre" />];

    const { rerender } = render(
      <DataTable value={value} renderExpanded={(f) => <p>Detalle de {f.nombre}</p>}>
        {columnas}
      </DataTable>,
    );

    // Se abre el detalle de la fila en la posición 0 (Beto).
    const abrir = screen.getAllByRole("button", { name: /desplegar/i })[0];
    await user.click(abrir);
    expect(screen.getByText("Detalle de Beto")).toBeInTheDocument();

    // El padre reordena el arreglo — mismos registros, otro orden. Ana pasa
    // a ocupar la posición 0.
    rerender(
      <DataTable value={[value[1], value[0]]} renderExpanded={(f) => <p>Detalle de {f.nombre}</p>}>
        {columnas}
      </DataTable>,
    );

    // `filaAbierta` sigue guardando "0": el detalle ahora muestra a Ana, no
    // a Beto. La comparación entre filas se rompe igual que sin `getRowId`
    // se rompía el estado no controlado de una fila.
    expect(screen.queryByText("Detalle de Beto")).toBeNull();
    expect(screen.getByText("Detalle de Ana")).toBeInTheDocument();
  });

  it("renderExpanded sin getRowId avisa una sola vez en consola, en desarrollo", () => {
    const advertir = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { rerender } = render(
      <DataTable value={[{ nombre: "Ana" }] as Fila[]} renderExpanded={(f: Fila) => <p>{f.nombre}</p>}>
        <Column<Fila> field="nombre" header="Nombre" />
      </DataTable>,
    );
    expect(advertir).toHaveBeenCalledTimes(1);
    expect(advertir.mock.calls[0][0]).toMatch(/getRowId/);

    // Un re-render posterior no repite el aviso: es de montaje, no de props.
    rerender(
      <DataTable value={[{ nombre: "Ana" }] as Fila[]} renderExpanded={(f: Fila) => <p>{f.nombre}</p>}>
        <Column<Fila> field="nombre" header="Nombre" />
      </DataTable>,
    );
    expect(advertir).toHaveBeenCalledTimes(1);
    advertir.mockRestore();
  });

  // `React.StrictMode` invoca los efectos dos veces al montar en desarrollo.
  // CoreLink no lo usa hoy, pero el comentario junto al `useEffect` dice "una
  // sola vez al montar" sin matices — si algún día se activa StrictMode, esa
  // frase tiene que seguir siendo cierta.
  it("el aviso sigue siendo uno solo incluso bajo React.StrictMode", () => {
    const advertir = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <React.StrictMode>
        <DataTable value={[{ nombre: "Ana" }] as Fila[]} renderExpanded={(f: Fila) => <p>{f.nombre}</p>}>
          <Column<Fila> field="nombre" header="Nombre" />
        </DataTable>
      </React.StrictMode>,
    );
    expect(advertir).toHaveBeenCalledTimes(1);
    advertir.mockRestore();
  });

  it("renderExpanded con getRowId no avisa en consola", () => {
    const advertir = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <DataTable
        value={[{ id: "a", nombre: "Ana" }] as Fila[]}
        getRowId={(f: Fila) => f.id!}
        renderExpanded={(f: Fila) => <p>{f.nombre}</p>}
      >
        <Column<Fila> field="nombre" header="Nombre" />
      </DataTable>,
    );
    expect(advertir).not.toHaveBeenCalled();
    advertir.mockRestore();
  });

  it("sin renderExpanded no avisa en consola, tenga o no getRowId", () => {
    const advertir = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <DataTable value={[{ nombre: "Ana" }] as Fila[]}>
        <Column<Fila> field="nombre" header="Nombre" />
      </DataTable>,
    );
    expect(advertir).not.toHaveBeenCalled();
    advertir.mockRestore();
  });

  // El botón que despliega el detalle repite el mismo texto en cada fila
  // («Desplegar el detalle»): sin más, un lector de pantalla que recorre
  // los botones no puede distinguir uno de otro. `aria-controls` asocia
  // además el botón con el `<td>` del detalle que abre.
  it("el botón del detalle distingue cada fila y se asocia al detalle con aria-controls", async () => {
    const value: Fila[] = [
      { id: "a", nombre: "Ana" },
      { id: "b", nombre: "Luis" },
    ];
    const user = userEvent.setup();

    render(
      <DataTable value={value} getRowId={(f) => f.id!} renderExpanded={(f) => <p>Detalle de {f.nombre}</p>}>
        <Column<Fila> field="nombre" header="Nombre" />
      </DataTable>,
    );

    const botones = screen.getAllByRole("button", { name: /desplegar/i });
    expect(botones[0]).toHaveAccessibleName(/fila 1/i);
    expect(botones[1]).toHaveAccessibleName(/fila 2/i);

    const controlaId = botones[0].getAttribute("aria-controls");
    expect(controlaId).toBeTruthy();

    await user.click(botones[0]);
    const detalle = screen.getByText("Detalle de Ana").closest("td")!;
    expect(detalle).toHaveAttribute("id", controlaId);
  });

  // La celda del cuerpo trae un botón enfocable, así que su columna necesita
  // encabezado: un `<th>` con `aria-hidden` dejaría esa columna sin nombre
  // para quien navega celda por celda con lector de pantalla.
  it("la columna del detalle tiene un encabezado accesible, no aria-hidden", () => {
    render(
      <DataTable value={[{ nombre: "Ana" }] as Fila[]} renderExpanded={(f: Fila) => <p>{f.nombre}</p>}>
        <Column<Fila> field="nombre" header="Nombre" />
      </DataTable>,
    );
    const encabezados = screen.getAllByRole("columnheader");
    expect(encabezados[0]).not.toHaveAttribute("aria-hidden");
    expect(encabezados[0]).toHaveAccessibleName(/detalle/i);
  });

  // `onRowClick` y `renderExpanded` comparten el mismo `<tr>`, cada uno con su
  // propio guardián (`naceEnUnControl` para uno, el botón de despliegue vive
  // dentro de la fila para el otro). Ya se prueban por separado; esto fija
  // que conviven sin pisarse, en las dos direcciones, para que un cambio
  // futuro en cualquiera de los dos guardianes no rompa al otro en silencio.
  it("onRowClick y renderExpanded conviven en la misma fila sin dispararse entre sí", async () => {
    const value: Fila[] = [{ id: "a", nombre: "Ana" }];
    const abrir = vi.fn();
    const user = userEvent.setup();

    render(
      <DataTable value={value} getRowId={(f) => f.id!} onRowClick={abrir} renderExpanded={(f) => <p>Detalle de {f.nombre}</p>}>
        <Column<Fila> field="nombre" header="Nombre" />
      </DataTable>,
    );

    // El botón de despliegue vive dentro del <tr>: lo abre, pero no dispara onRowClick.
    await user.click(screen.getByRole("button", { name: /desplegar/i }));
    expect(screen.getByText("Detalle de Ana")).toBeInTheDocument();
    expect(abrir).not.toHaveBeenCalled();

    // Un clic en una celda normal sí abre la fila, y no toca el detalle ya desplegado.
    await user.click(screen.getByText("Ana"));
    expect(abrir).toHaveBeenCalledWith(value[0]);
    expect(screen.getByText("Detalle de Ana")).toBeInTheDocument();
  });
});

// Antes, `preferencesKey` solo recordaba qué columnas estaban visibles, bajo
// `ui-table:<key>:columns`. Ahora todo va a una sola clave nueva,
// `ui-table:<key>:prefs`, que además del tamaño de página y el orden. La
// clave vieja se sigue leyendo cuando la nueva no existe —así nadie pierde lo
// que ya tenía guardado un navegador real—, pero nunca se vuelve a escribir.
describe("DataTable — preferencias persistidas (tamaño de página y orden)", () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it("un orden elegido por el usuario se escribe en la clave nueva y se restaura en un montaje posterior", async () => {
    const user = userEvent.setup();
    const value: Fila[] = [{ nombre: "Beto" }, { nombre: "Ana" }];

    const { unmount } = render(
      <DataTable value={value} preferencesKey="orden-test">
        <Column<Fila> field="nombre" header="Nombre" sortable />
      </DataTable>,
    );

    await user.click(screen.getByRole("button", { name: /ordenar por nombre/i }));

    await waitFor(() => {
      const guardado = JSON.parse(window.localStorage.getItem("ui-table:orden-test:prefs")!);
      expect(guardado.sort).toEqual([{ id: "nombre", desc: false }]);
    });

    unmount();

    render(
      <DataTable value={value} preferencesKey="orden-test">
        <Column<Fila> field="nombre" header="Nombre" sortable />
      </DataTable>,
    );

    expect(screen.getByRole("columnheader", { name: /nombre/i })).toHaveAttribute("aria-sort", "ascending");
  });

  it("un tamaño de página elegido por el usuario se escribe y se restaura", async () => {
    const value: Fila[] = Array.from({ length: 12 }, (_, i) => ({ nombre: `Persona ${i + 1}` }));

    const { unmount } = render(
      <DataTable value={value} preferencesKey="pagesize-test" rowsPerPageOptions={[5, 10]}>
        <Column<Fila> field="nombre" header="Nombre" />
      </DataTable>,
    );

    fireEvent.click(screen.getByRole("combobox", { name: "Filas por página" }));
    fireEvent.click(await screen.findByRole("option", { name: "5" }));

    await waitFor(() => {
      const guardado = JSON.parse(window.localStorage.getItem("ui-table:pagesize-test:prefs")!);
      expect(guardado.pageSize).toBe(5);
    });

    unmount();

    render(
      <DataTable value={value} preferencesKey="pagesize-test" rowsPerPageOptions={[5, 10]}>
        <Column<Fila> field="nombre" header="Nombre" />
      </DataTable>,
    );

    expect(screen.getByText("1-5 de 12")).toBeInTheDocument();
  });

  it("cuando solo existe la clave vieja `:columns`, su visibilidad de columnas se respeta al montar, la clave vieja sobrevive intacta y la nueva se escribe (ruta de migración)", async () => {
    const columnasViejas = JSON.stringify({ extra: false });
    window.localStorage.setItem("ui-table:migracion-test:columns", columnasViejas);

    render(
      <DataTable value={[{ nombre: "Ana" }] as Fila[]} preferencesKey="migracion-test">
        <Column<Fila> field="nombre" header="Nombre" />
        <Column<Fila> id="extra" header="Extra" body={() => "x"} />
      </DataTable>,
    );

    expect(screen.queryByRole("columnheader", { name: "Extra" })).not.toBeInTheDocument();
    // La migración es de lectura: la clave vieja no se toca...
    expect(window.localStorage.getItem("ui-table:migracion-test:columns")).toBe(columnasViejas);
    // ...pero a partir de aquí la tabla ya escribe bajo la clave nueva.
    await waitFor(() => {
      const guardado = JSON.parse(window.localStorage.getItem("ui-table:migracion-test:prefs")!);
      // El objeto escrito trae también las columnas que no estaban en la
      // clave vieja, con su valor por defecto: la escritura fusiona lo
      // migrado con `defaultVisibility`, no lo copia tal cual.
      expect(guardado.columns).toEqual({ nombre: true, extra: false });
    });
  });

  it("la clave vieja `:columns` nunca se vuelve a escribir", async () => {
    const user = userEvent.setup();
    const value: Fila[] = [{ nombre: "Beto" }, { nombre: "Ana" }];

    render(
      <DataTable value={value} preferencesKey="no-reescribe-vieja">
        <Column<Fila> field="nombre" header="Nombre" sortable />
      </DataTable>,
    );

    await user.click(screen.getByRole("button", { name: /ordenar por nombre/i }));

    await waitFor(() => {
      expect(window.localStorage.getItem("ui-table:no-reescribe-vieja:prefs")).not.toBeNull();
    });
    expect(window.localStorage.getItem("ui-table:no-reescribe-vieja:columns")).toBeNull();
  });

  it("sin preferencesKey no se escribe nada en localStorage", async () => {
    const user = userEvent.setup();
    const value: Fila[] = [{ nombre: "Beto" }, { nombre: "Ana" }];
    const clavesAntes = window.localStorage.length;

    render(
      <DataTable value={value}>
        <Column<Fila> field="nombre" header="Nombre" sortable />
      </DataTable>,
    );

    await user.click(screen.getByRole("button", { name: /ordenar por nombre/i }));

    expect(window.localStorage.length).toBe(clavesAntes);
  });

  // Las columnas cambian entre versiones: un `sort` guardado puede nombrar
  // una que ya no existe. TanStack la ignora sin más — no ordena por ella, no
  // lanza, y no deja el encabezado real con un indicador de orden encendido
  // que mienta sobre el estado real de la tabla.
  it("un `sort` guardado que nombra una columna que ya no existe no lanza y no deja indicador de orden encendido", () => {
    window.localStorage.setItem(
      "ui-table:sort-obsoleto:prefs",
      JSON.stringify({ sort: [{ id: "vendedor", desc: false }] }),
    );
    const value: Fila[] = [{ nombre: "Beto" }, { nombre: "Ana" }];

    render(
      <DataTable value={value} preferencesKey="sort-obsoleto">
        <Column<Fila> field="nombre" header="Nombre" sortable />
      </DataTable>,
    );

    expect(screen.getByRole("columnheader", { name: /nombre/i })).toHaveAttribute("aria-sort", "none");
    // El orden original de `value` se conserva: no se aplicó ningún orden.
    const filas = screen.getAllByRole("row").slice(1);
    expect(within(filas[0]).getByText("Beto")).toBeInTheDocument();
    expect(within(filas[1]).getByText("Ana")).toBeInTheDocument();
  });

  interface FilaOrdenOculto {
    nombre: string;
    correo: string;
  }
  const filasOrden: FilaOrdenOculto[] = [
    { nombre: "Zoe", correo: "zoe@x.co" },
    { nombre: "Luis", correo: "luis@x.co" },
    { nombre: "Ana", correo: "ana@x.co" },
  ];

  // El caso distinto del anterior: aquí la columna sí existe, solo que está
  // oculta. Un `sort` que la nombra —heredado de una sesión anterior, o de
  // la migración desde `:columns`— no puede aplicarse al montar: no hay
  // ningún control en pantalla para quitarlo si se aplicara mal.
  //
  // El orden de inserción es deliberadamente distinto del alfabético en
  // cualquiera de los dos sentidos (ni ascendente ni descendente): si el
  // `sort` heredado se llegara a aplicar iría a parar a Ana/Beto/Carla, así
  // que confundirlo con el orden original (Beto/Ana/Carla) es imposible.
  it("un `sort` persistido sobre una columna oculta no se aplica al montar", () => {
    interface FilaOrdenNoAlfabetico {
      nombre: string;
      correo: string;
    }
    const value: FilaOrdenNoAlfabetico[] = [
      { nombre: "Beto", correo: "beto@x.co" },
      { nombre: "Ana", correo: "ana@x.co" },
      { nombre: "Carla", correo: "carla@x.co" },
    ];
    window.localStorage.setItem(
      "ui-table:sort-columna-oculta:prefs",
      JSON.stringify({ columns: { nombre: false }, pageSize: 10, sort: [{ id: "nombre", desc: false }] }),
    );

    render(
      <DataTable value={value} preferencesKey="sort-columna-oculta" configurableColumns>
        <Column<FilaOrdenNoAlfabetico> field="nombre" header="Nombre" sortable />
        <Column<FilaOrdenNoAlfabetico> field="correo" header="Correo" />
      </DataTable>,
    );

    expect(screen.queryByRole("columnheader", { name: /^nombre$/i })).not.toBeInTheDocument();
    const filas = screen.getAllByRole("row").slice(1);
    // Orden original de `value` (Beto, Ana, Carla) — no el ascendente
    // (Ana, Beto, Carla) que habría dado el `sort` heredado si se aplicara.
    expect(within(filas[0]).getByText("beto@x.co")).toBeInTheDocument();
    expect(within(filas[1]).getByText("ana@x.co")).toBeInTheDocument();
    expect(within(filas[2]).getByText("carla@x.co")).toBeInTheDocument();
  });

  // El caso que atrapaba a un usuario en producción (midivisa): ordenar,
  // ocultar la columna por la que se ordena, y quedar sin ningún control
  // para deshacerlo — y con el orden persistiendo a la recarga, atrapado
  // para siempre. Se limpia de inmediato al ocultar, no se espera a la
  // siguiente recarga.
  it("ocultar durante la sesión la columna por la que se ordena limpia el orden de inmediato, y la limpieza sobrevive a la recarga", async () => {
    const user = userEvent.setup();

    const { unmount } = render(
      <DataTable value={filasOrden} preferencesKey="orden-atrapado" configurableColumns>
        <Column<FilaOrdenOculto> field="nombre" header="Nombre" sortable />
        <Column<FilaOrdenOculto> field="correo" header="Correo" />
      </DataTable>,
    );

    await user.click(screen.getByRole("button", { name: "Ordenar por Nombre" }));
    let filas = screen.getAllByRole("row").slice(1);
    expect(within(filas[0]).getByText("Ana")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Configurar columnas" }));
    // El botón del selector de columnas empieza por el nombre de la columna;
    // el del encabezado empieza por "Ordenar por" — el ancla evita que el
    // patrón alcance a los dos.
    await user.click(screen.getByRole("button", { name: /^Nombre/i }));

    expect(screen.queryByRole("columnheader", { name: /^nombre$/i })).not.toBeInTheDocument();
    filas = screen.getAllByRole("row").slice(1);
    expect(within(filas[0]).getByText("zoe@x.co")).toBeInTheDocument();

    await waitFor(() => {
      const guardado = JSON.parse(window.localStorage.getItem("ui-table:orden-atrapado:prefs")!);
      expect(guardado.sort).toEqual([]);
    });

    unmount();

    render(
      <DataTable value={filasOrden} preferencesKey="orden-atrapado" configurableColumns>
        <Column<FilaOrdenOculto> field="nombre" header="Nombre" sortable />
        <Column<FilaOrdenOculto> field="correo" header="Correo" />
      </DataTable>,
    );
    filas = screen.getAllByRole("row").slice(1);
    expect(within(filas[0]).getByText("zoe@x.co")).toBeInTheDocument();
  });

  // JSON válido pero de forma ajena (un `pageSize` de texto, o el propio
  // valor guardado siendo un array) no debe romper el montaje ni dejar la
  // tabla con datos reales escondidos tras un `pageSize` inválido.
  it("un `pageSize` guardado con forma ajena se ignora y no deja la tabla vacía", () => {
    window.localStorage.setItem("ui-table:pagesize-ajeno:prefs", JSON.stringify({ pageSize: "muchas" }));
    const value: Fila[] = Array.from({ length: 15 }, (_, i) => ({ nombre: `Persona ${i + 1}` }));

    render(
      <DataTable value={value} preferencesKey="pagesize-ajeno" rowsPerPageOptions={[10, 25, 50]}>
        <Column<Fila> field="nombre" header="Nombre" />
      </DataTable>,
    );

    expect(screen.queryByText("No hay datos para mostrar.")).not.toBeInTheDocument();
    expect(screen.getByText("1-10 de 15")).toBeInTheDocument();
  });

  // Comprobar que `sort` es un array no basta: una entrada que no es un
  // objeto (`null`) revienta en cuanto algo intenta leer su `id`, con el
  // mismo desenlace que el array top-level — la tabla ni monta.
  it("un `sort` con una entrada nula se ignora y no rompe el montaje", () => {
    window.localStorage.setItem("ui-table:sort-con-nulo:prefs", JSON.stringify({ sort: [null] }));
    const value: Fila[] = [{ nombre: "Ana" }];

    expect(() =>
      render(
        <DataTable value={value} preferencesKey="sort-con-nulo">
          <Column<Fila> field="nombre" header="Nombre" sortable />
        </DataTable>,
      ),
    ).not.toThrow();
    expect(screen.getByText("Ana")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /nombre/i })).toHaveAttribute("aria-sort", "none");
  });

  // Un `pageSize` fraccionario ("2.5") es JSON válido y numérico, pero no es
  // un tamaño de página real: TanStack lo usa tal cual en el pie ("1-2.5 de
  // 30") y, sin filtro, se reescribiría intacto en cada guardado siguiente.
  it("un `pageSize` fraccionario se ignora y no queda escrito en el siguiente guardado", async () => {
    window.localStorage.setItem("ui-table:pagesize-fraccionario:prefs", JSON.stringify({ pageSize: 2.5 }));
    const value: Fila[] = Array.from({ length: 30 }, (_, i) => ({ nombre: `Persona ${i + 1}` }));

    render(
      <DataTable value={value} preferencesKey="pagesize-fraccionario" rows={10} rowsPerPageOptions={[10, 25, 50]}>
        <Column<Fila> field="nombre" header="Nombre" />
      </DataTable>,
    );

    expect(screen.getByText("1-10 de 30")).toBeInTheDocument();
    await waitFor(() => {
      const guardado = JSON.parse(window.localStorage.getItem("ui-table:pagesize-fraccionario:prefs")!);
      expect(guardado.pageSize).toBe(10);
    });
  });

  it("JSON foráneo (un array) bajo la clave nueva no rompe el montaje", () => {
    window.localStorage.setItem("ui-table:json-ajeno:prefs", JSON.stringify([1, 2, 3]));
    const value: Fila[] = [{ nombre: "Ana" }];

    expect(() =>
      render(
        <DataTable value={value} preferencesKey="json-ajeno">
          <Column<Fila> field="nombre" header="Nombre" />
        </DataTable>,
      ),
    ).not.toThrow();
    expect(screen.getByText("Ana")).toBeInTheDocument();
  });
});
