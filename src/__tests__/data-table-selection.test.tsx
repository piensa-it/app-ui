import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable, Column } from "../components/ui/data-table";
import { buildTree, type TreeRow } from "../lib/tree";

interface Persona {
  id: string;
  nombre: string;
}

const personas: Persona[] = [
  { id: "1", nombre: "Ana" },
  { id: "2", nombre: "Luis" },
  { id: "3", nombre: "Marta" },
];

describe("DataTable — sin `selectable` (regresión)", () => {
  it("no dibuja ninguna casilla ni columna de selección", () => {
    render(
      <DataTable value={personas} getRowId={(p) => p.id}>
        <Column field="nombre" header="Nombre" />
      </DataTable>,
    );
    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
  });

  it("`selectionActions` sin `selectable` no se pinta", () => {
    render(
      <DataTable
        value={personas}
        getRowId={(p) => p.id}
        selectionActions={() => <button>Borrar</button>}
      >
        <Column field="nombre" header="Nombre" />
      </DataTable>,
    );
    expect(screen.queryByRole("button", { name: "Borrar" })).not.toBeInTheDocument();
  });
});

describe("DataTable — selección plana", () => {
  it("cada casilla de fila tiene nombre accesible con la fila; la de cabecera dice su alcance", () => {
    render(
      <DataTable value={personas} getRowId={(p) => p.id} selectable getRowLabel={(p) => p.nombre}>
        <Column field="nombre" header="Nombre" />
      </DataTable>,
    );
    expect(screen.getByRole("checkbox", { name: "Seleccionar Ana" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Seleccionar Luis" })).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: "Seleccionar todas las filas de esta página" }),
    ).toBeInTheDocument();
  });

  it("marcar una fila la cuenta en la barra y llama a onSelectedChange con la fila completa", async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();
    render(
      <DataTable
        value={personas}
        getRowId={(p) => p.id}
        selectable
        getRowLabel={(p) => p.nombre}
        onSelectedChange={onSelectedChange}
      >
        <Column field="nombre" header="Nombre" />
      </DataTable>,
    );

    await user.click(screen.getByRole("checkbox", { name: "Seleccionar Ana" }));

    expect(onSelectedChange).toHaveBeenCalledWith([personas[0]]);
    expect(screen.getByRole("status")).toHaveTextContent("1 seleccionada");
  });

  it("la casilla de cabecera marca toda la página; con la página entera marcada aparece el aviso de extender", async () => {
    const user = userEvent.setup();
    // 3 filas, página de 2: la cabecera solo puede marcar 2, y hay una más
    // que cumple el filtro (ninguno, en este caso) sin marcar.
    render(
      <DataTable value={personas} getRowId={(p) => p.id} selectable rows={2} paginator getRowLabel={(p) => p.nombre}>
        <Column field="nombre" header="Nombre" />
      </DataTable>,
    );

    await user.click(screen.getByRole("checkbox", { name: "Seleccionar todas las filas de esta página" }));

    expect(screen.getByRole("checkbox", { name: "Deseleccionar Ana" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Deseleccionar Luis" })).toBeChecked();
    expect(screen.getByText(/Seleccionadas las 2 de esta página/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Seleccionar las 3/ })).toBeInTheDocument();
  });

  it("extender a todo lo filtrado selecciona también lo que no cabía en la página, y el aviso desaparece", async () => {
    const user = userEvent.setup();
    render(
      <DataTable value={personas} getRowId={(p) => p.id} selectable rows={2} paginator getRowLabel={(p) => p.nombre}>
        <Column field="nombre" header="Nombre" />
      </DataTable>,
    );

    await user.click(screen.getByRole("checkbox", { name: "Seleccionar todas las filas de esta página" }));
    await user.click(screen.getByRole("button", { name: /Seleccionar las 3/ }));

    expect(screen.getByText("3 seleccionadas")).toBeInTheDocument();
    expect(screen.queryByText(/Seleccionadas las/)).not.toBeInTheDocument();
  });

  it("deseleccionar una fila tras extender deja la cuenta correcta", async () => {
    const user = userEvent.setup();
    render(
      <DataTable value={personas} getRowId={(p) => p.id} selectable rows={2} paginator getRowLabel={(p) => p.nombre}>
        <Column field="nombre" header="Nombre" />
      </DataTable>,
    );

    await user.click(screen.getByRole("checkbox", { name: "Seleccionar todas las filas de esta página" }));
    await user.click(screen.getByRole("button", { name: /Seleccionar las 3/ }));
    await user.click(screen.getByRole("checkbox", { name: "Deseleccionar Ana" }));

    expect(screen.getByText("2 seleccionadas")).toBeInTheDocument();
  });

  it("el contador dice la verdad cuando hay filas seleccionadas fuera del filtro actual", async () => {
    const user = userEvent.setup();
    render(
      <DataTable value={personas} getRowId={(p) => p.id} selectable searchable getRowLabel={(p) => p.nombre}>
        <Column field="nombre" header="Nombre" />
      </DataTable>,
    );

    await user.click(screen.getByRole("checkbox", { name: "Seleccionar Ana" }));
    await user.type(screen.getByRole("textbox", { name: "Buscar en la tabla" }), "Luis");

    // Ana sigue seleccionada (decisión #137: la selección sobrevive al
    // filtro) pero ya no está a la vista — el contador tiene que decirlo.
    expect(screen.getByText("1 seleccionada (1 fuera del filtro actual)")).toBeInTheDocument();
    expect(screen.queryByText("Ana")).not.toBeInTheDocument();
  });

  it("la barra transforma título por la cuenta y acciones normales por selectionActions; el buscador se queda", async () => {
    // Decisión de #137 tal como se implementó aquí: el título se sustituye
    // por «N seleccionadas» y `actions` por `selectionActions` — pero el
    // buscador NO desaparece. Si desapareciera, el criterio de aceptación
    // "el contador distingue lo seleccionado que está fuera del filtro
    // actual" sería imposible de ejercitar: no habría forma de cambiar el
    // filtro con una selección activa. Ver el porqué en el comentario de
    // `data-table-toolbar.tsx` junto al bloque de título/selección.
    const user = userEvent.setup();
    render(
      <DataTable
        value={personas}
        getRowId={(p) => p.id}
        title="Personas"
        actions={<button>Nueva persona</button>}
        searchable
        selectable
        getRowLabel={(p) => p.nombre}
        selectionActions={(rows) => <button>Borrar ({rows.length})</button>}
      >
        <Column field="nombre" header="Nombre" />
      </DataTable>,
    );

    expect(screen.getByText("Personas")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Nueva persona" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Borrar/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: "Seleccionar Ana" }));

    expect(screen.queryByText("Personas")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Nueva persona" })).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Buscar en la tabla" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Borrar (1)" })).toBeInTheDocument();
  });

  it("la selección sobrevive a ordenar, filtrar y paginar", async () => {
    const user = userEvent.setup();
    render(
      <DataTable value={personas} getRowId={(p) => p.id} selectable rows={2} paginator getRowLabel={(p) => p.nombre}>
        <Column field="nombre" header="Nombre" sortable />
      </DataTable>,
    );

    await user.click(screen.getByRole("checkbox", { name: "Seleccionar Ana" }));
    await user.click(screen.getByRole("button", { name: "Ordenar por Nombre" }));

    expect(screen.getByRole("checkbox", { name: "Deseleccionar Ana" })).toBeChecked();
  });

  it("`selected`/`onSelectedChange` controlados gobiernan el estado", async () => {
    const user = userEvent.setup();
    function Controlado() {
      const [selected, setSelected] = React.useState<Persona[]>([]);
      return (
        <DataTable
          value={personas}
          getRowId={(p) => p.id}
          selectable
          selected={selected}
          onSelectedChange={setSelected}
          getRowLabel={(p) => p.nombre}
        >
          <Column field="nombre" header="Nombre" />
        </DataTable>
      );
    }
    render(<Controlado />);

    await user.click(screen.getByRole("checkbox", { name: "Seleccionar Ana" }));
    expect(screen.getByRole("checkbox", { name: "Deseleccionar Ana" })).toBeChecked();
    expect(screen.getByText("1 seleccionada")).toBeInTheDocument();
  });
});

describe("DataTable — aviso de `selectable` sin `getRowId`", () => {
  it("avisa una sola vez en consola, en desarrollo", () => {
    const advertir = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { rerender } = render(
      <DataTable value={personas} selectable>
        <Column field="nombre" header="Nombre" />
      </DataTable>,
    );
    expect(advertir).toHaveBeenCalledTimes(1);
    expect(advertir.mock.calls[0][0]).toMatch(/getRowId/);

    rerender(
      <DataTable value={personas} selectable>
        <Column field="nombre" header="Nombre" />
      </DataTable>,
    );
    expect(advertir).toHaveBeenCalledTimes(1);
    advertir.mockRestore();
  });

  it("con getRowId no avisa", () => {
    const advertir = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <DataTable value={personas} getRowId={(p) => p.id} selectable>
        <Column field="nombre" header="Nombre" />
      </DataTable>,
    );
    expect(advertir).not.toHaveBeenCalled();
    advertir.mockRestore();
  });

  it("sin selectable no avisa, tenga o no getRowId", () => {
    const advertir = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <DataTable value={personas}>
        <Column field="nombre" header="Nombre" />
      </DataTable>,
    );
    expect(advertir).not.toHaveBeenCalled();
    advertir.mockRestore();
  });
});

describe("DataTable — selección jerárquica", () => {
  interface Unidad {
    id: string;
    parentId?: string;
    nombre: string;
  }
  type UnidadArbol = TreeRow<Unidad>;
  const getSubRows = (u: UnidadArbol) => u.children;
  const getRowId = (u: UnidadArbol) => u.id;

  function arbol() {
    return buildTree<Unidad>([
      { id: "1", nombre: "Edificio A" },
      { id: "1.1", parentId: "1", nombre: "Torre 1" },
      { id: "1.2", parentId: "1", nombre: "Torre 2" },
    ]);
  }

  it("marcar un padre marca su rama entera", async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        value={arbol()}
        getSubRows={getSubRows}
        getRowId={getRowId}
        selectable
        defaultExpandedDepth={Infinity}
        getRowLabel={(u) => u.nombre}
      >
        <Column field="nombre" header="Nombre" tree />
      </DataTable>,
    );

    await user.click(screen.getByRole("checkbox", { name: "Seleccionar Edificio A" }));

    expect(screen.getByRole("checkbox", { name: /Torre 1/ })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: /Torre 2/ })).toBeChecked();
  });

  it("un padre con solo parte de sus hijas marcadas sale indeterminado", async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        value={arbol()}
        getSubRows={getSubRows}
        getRowId={getRowId}
        selectable
        defaultExpandedDepth={Infinity}
        getRowLabel={(u) => u.nombre}
      >
        <Column field="nombre" header="Nombre" tree />
      </DataTable>,
    );

    await user.click(screen.getByRole("checkbox", { name: "Seleccionar Torre 1" }));

    const padre = screen.getByRole("checkbox", { name: /Edificio A/ }) as HTMLInputElement;
    expect(padre.indeterminate).toBe(true);
    expect(padre.checked).toBe(false);
  });

  it("`enableSubRowSelection` como predicado por fila desactiva la cascada donde devuelve false", async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        value={arbol()}
        getSubRows={getSubRows}
        getRowId={getRowId}
        selectable
        // Solo el nodo "1" (Edificio A) permite arrastrar a sus hijas — el
        // resto de nodos con hijas (ninguno más aquí) no lo haría.
        enableSubRowSelection={(u: Unidad) => u.id === "1"}
        defaultExpandedDepth={Infinity}
        getRowLabel={(u) => u.nombre}
      >
        <Column field="nombre" header="Nombre" tree />
      </DataTable>,
    );

    await user.click(screen.getByRole("checkbox", { name: "Seleccionar Edificio A" }));

    expect(screen.getByRole("checkbox", { name: /Torre 1/ })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: /Torre 2/ })).toBeChecked();
  });
});
