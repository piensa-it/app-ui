import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable, Column } from "../components/ui/data-table";
import { buildTree, type TreeRow } from "../lib/tree";

interface Unidad {
  id: string;
  parentId?: string;
  nombre: string;
  tipo: string;
}

type UnidadArbol = TreeRow<Unidad>;

const getSubRows = (u: UnidadArbol) => u.children;
const getRowId = (u: UnidadArbol) => u.id;

const plano: Unidad[] = [
  { id: "1", nombre: "Edificio A", tipo: "edificio" },
  { id: "1.1", parentId: "1", nombre: "Torre 1", tipo: "torre" },
  { id: "1.1.1", parentId: "1.1", nombre: "Apto 101", tipo: "unidad" },
  { id: "1.1.2", parentId: "1.1", nombre: "Apto 102", tipo: "unidad" },
  { id: "1.2", parentId: "1", nombre: "Torre 2", tipo: "torre" },
  { id: "2", nombre: "Edificio B", tipo: "edificio" },
];

function arbol() {
  return buildTree(plano);
}

describe("DataTable — sin getSubRows (caso plano)", () => {
  it("no muestra ningún atributo de jerarquía en las filas", () => {
    render(
      <DataTable value={[{ nombre: "Ana" }]}>
        <Column field="nombre" header="Nombre" />
      </DataTable>,
    );
    const row = screen.getByRole("cell", { name: "Ana" }).closest("tr")!;
    expect(row).not.toHaveAttribute("aria-level");
    expect(row).not.toHaveAttribute("aria-posinset");
    expect(row).not.toHaveAttribute("aria-setsize");
    expect(row).not.toHaveAttribute("aria-expanded");
  });
});

describe("DataTable — modo jerárquico", () => {
  it("getSubRows activa la jerarquía: sangra por nivel y solo las filas con hijas muestran expandir", () => {
    render(
      <DataTable value={arbol()} getSubRows={getSubRows} getRowId={getRowId} defaultExpandedDepth={Infinity}>
        <Column field="nombre" header="Nombre" tree />
        <Column field="tipo" header="Tipo" />
      </DataTable>,
    );

    expect(screen.getByText("Edificio A")).toBeInTheDocument();
    expect(screen.getByText("Apto 101")).toBeInTheDocument();

    // Solo las filas con hijas tienen el botón de expandir.
    expect(screen.getByRole("button", { name: /Edificio A/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Apto 101/ })).not.toBeInTheDocument();
  });

  it("por defecto (defaultExpandedDepth=0) no se ve nada expandido", () => {
    render(
      <DataTable value={arbol()} getSubRows={getSubRows} getRowId={getRowId}>
        <Column field="nombre" header="Nombre" tree />
      </DataTable>,
    );
    expect(screen.getByText("Edificio A")).toBeInTheDocument();
    expect(screen.queryByText("Torre 1")).not.toBeInTheDocument();
  });

  it("cada fila lleva aria-expanded (solo si tiene hijas), aria-level, aria-posinset y aria-setsize", () => {
    render(
      <DataTable value={arbol()} getSubRows={getSubRows} getRowId={getRowId} defaultExpandedDepth={Infinity}>
        <Column field="nombre" header="Nombre" tree />
      </DataTable>,
    );

    const edificioA = screen.getByText("Edificio A").closest("tr")!;
    expect(edificioA).toHaveAttribute("aria-level", "1");
    expect(edificioA).toHaveAttribute("aria-posinset", "1");
    expect(edificioA).toHaveAttribute("aria-setsize", "2"); // dos raíces: Edificio A y B
    expect(edificioA).toHaveAttribute("aria-expanded", "true");

    const torre1 = screen.getByText("Torre 1").closest("tr")!;
    expect(torre1).toHaveAttribute("aria-level", "2");
    expect(torre1).toHaveAttribute("aria-posinset", "1");
    expect(torre1).toHaveAttribute("aria-setsize", "2"); // Torre 1 y Torre 2

    const apto101 = screen.getByText("Apto 101").closest("tr")!;
    expect(apto101).toHaveAttribute("aria-level", "3");
    // Una fila sin hijas no anuncia aria-expanded.
    expect(apto101).not.toHaveAttribute("aria-expanded");
  });

  it("el botón de expandir tiene nombre accesible que dice de qué fila es, no solo «expandir»", () => {
    render(
      <DataTable value={arbol()} getSubRows={getSubRows} getRowId={getRowId}>
        <Column field="nombre" header="Nombre" tree />
      </DataTable>,
    );
    // "Edificio A" tiene hijas directas, y "Edificio B" no tiene ninguna (no
    // aparece ningún botón con su nombre): el nombre accesible identifica la
    // fila, no solo un texto genérico de "expandir".
    expect(screen.getByRole("button", { name: "Expandir Edificio A" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Edificio B/ })).not.toBeInTheDocument();
  });

  it("clic en expandir muestra las hijas directas y cambia a «Colapsar»", async () => {
    const user = userEvent.setup();
    render(
      <DataTable value={arbol()} getSubRows={getSubRows} getRowId={getRowId}>
        <Column field="nombre" header="Nombre" tree />
      </DataTable>,
    );
    expect(screen.queryByText("Torre 1")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Expandir Edificio A" }));
    expect(screen.getByText("Torre 1")).toBeInTheDocument();
    expect(screen.getByText("Torre 2")).toBeInTheDocument();
    // Los nietos siguen colapsados.
    expect(screen.queryByText("Apto 101")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Colapsar Edificio A" })).toBeInTheDocument();
  });

  it("buscar deja visibles a los ancestros de lo encontrado, y lo encontrado sale expandido", async () => {
    const user = userEvent.setup();
    render(
      <DataTable value={arbol()} getSubRows={getSubRows} getRowId={getRowId} searchable>
        <Column field="nombre" header="Nombre" tree />
      </DataTable>,
    );
    await user.type(screen.getByRole("textbox", { name: "Buscar en la tabla" }), "101");

    await waitFor(() => expect(screen.getByText("Apto 101")).toBeInTheDocument());
    // Los ancestros (Edificio A, Torre 1) están visibles, aunque no coincidan.
    expect(screen.getByText("Edificio A")).toBeInTheDocument();
    expect(screen.getByText("Torre 1")).toBeInTheDocument();
    // Lo que no matchea y no es ancestro de un match, desaparece.
    expect(screen.queryByText("Torre 2")).not.toBeInTheDocument();
    expect(screen.queryByText("Apto 102")).not.toBeInTheDocument();
    expect(screen.queryByText("Edificio B")).not.toBeInTheDocument();
  });

  it("limpiar la búsqueda vuelve a colapsar lo que se había abierto solo por buscar", async () => {
    const user = userEvent.setup();
    render(
      <DataTable value={arbol()} getSubRows={getSubRows} getRowId={getRowId} searchable>
        <Column field="nombre" header="Nombre" tree />
      </DataTable>,
    );
    const search = screen.getByRole("textbox", { name: "Buscar en la tabla" });
    await user.type(search, "101");
    await waitFor(() => expect(screen.getByText("Apto 101")).toBeInTheDocument());

    await user.clear(search);
    await waitFor(() => expect(screen.queryByText("Torre 1")).not.toBeInTheDocument());
    expect(screen.getByText("Edificio A")).toBeInTheDocument();
  });

  it("colapsar a mano una fila que la búsqueda había forzado a abrir manda sobre la búsqueda", async () => {
    const user = userEvent.setup();
    render(
      <DataTable value={arbol()} getSubRows={getSubRows} getRowId={getRowId} searchable>
        <Column field="nombre" header="Nombre" tree />
      </DataTable>,
    );
    const search = screen.getByRole("textbox", { name: "Buscar en la tabla" });
    // "Torre" casa con las dos hijas directas de "Edificio A", que por eso
    // sale expandida sin haberla tocado.
    await user.type(search, "Torre");
    await waitFor(() => expect(screen.getByText("Torre 1")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Colapsar Edificio A" })).toBeInTheDocument();

    // Colapsarla a mano debe ganarle al forzado de la búsqueda: no debería
    // reabrirse sola mientras la búsqueda sigue activa.
    await user.click(screen.getByRole("button", { name: "Colapsar Edificio A" }));
    expect(screen.queryByText("Torre 1")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Expandir Edificio A" })).toBeInTheDocument();
  });

  it("ordenar reordena entre hermanos y nunca aplana el árbol", async () => {
    const user = userEvent.setup();
    const desordenado: Unidad[] = [
      { id: "1", nombre: "Edificio Z", tipo: "edificio" },
      { id: "1.1", parentId: "1", nombre: "Torre Z", tipo: "torre" },
      { id: "1.2", parentId: "1", nombre: "Torre A", tipo: "torre" },
      { id: "2", nombre: "Edificio A", tipo: "edificio" },
    ];
    render(
      <DataTable
        value={buildTree(desordenado)}
        getSubRows={getSubRows}
        getRowId={getRowId}
        defaultExpandedDepth={Infinity}
      >
        <Column field="nombre" header="Nombre" tree sortable />
      </DataTable>,
    );

    await user.click(screen.getByRole("button", { name: "Ordenar por Nombre" }));

    const rows = screen.getAllByRole("row").slice(1); // sin el encabezado
    const nombres = rows.map((row) => within(row).getByRole("cell").textContent?.trim());
    // Las raíces se reordenan entre sí (Edificio A antes que Edificio Z)...
    expect(nombres[0]).toBe("Edificio A");
    // ...y las hijas de "Edificio Z" se ordenan entre ellas, sin mezclarse
    // con las hijas de otra raíz ni con las raíces mismas.
    const indiceZ = nombres.indexOf("Edificio Z");
    expect(nombres[indiceZ + 1]).toBe("Torre A");
    expect(nombres[indiceZ + 2]).toBe("Torre Z");
  });

  it("paginar no parte familias: los descendientes van en la página de su raíz, y el paginador cuenta raíces", () => {
    const muchasRaices: Unidad[] = Array.from({ length: 12 }, (_, i) => ({
      id: `raiz-${i + 1}`,
      nombre: `Raíz ${i + 1}`,
      tipo: "edificio",
    }));
    muchasRaices.push({ id: "raiz-1.1", parentId: "raiz-1", nombre: "Hija de Raíz 1", tipo: "torre" });

    render(
      <DataTable
        value={buildTree(muchasRaices)}
        getSubRows={getSubRows}
        getRowId={getRowId}
        defaultExpandedDepth={Infinity}
        rows={10}
      >
        <Column field="nombre" header="Nombre" tree />
      </DataTable>,
    );

    // 10 raíces por página, pero la primera raíz trae una hija: 11 filas
    // visibles en la primera página, no 10.
    expect(screen.getByText("Raíz 1")).toBeInTheDocument();
    expect(screen.getByText("Hija de Raíz 1")).toBeInTheDocument();
    expect(screen.getByText("Raíz 10")).toBeInTheDocument();
    expect(screen.queryByText("Raíz 11")).not.toBeInTheDocument();

    // El paginador cuenta raíces (12), no filas totales (13).
    expect(screen.getByText("1-10 de 12")).toBeInTheDocument();
  });

  it("la expansión sobrevive a ordenar sin colapsarse", async () => {
    const user = userEvent.setup();
    render(
      <DataTable value={arbol()} getSubRows={getSubRows} getRowId={getRowId}>
        <Column field="nombre" header="Nombre" tree sortable />
      </DataTable>,
    );
    await user.click(screen.getByRole("button", { name: "Expandir Edificio A" }));
    expect(screen.getByText("Torre 1")).toBeInTheDocument();

    // Ordenar cambia el orden entre hermanos, no debería colapsar lo ya
    // expandido — es justo el punto que exige `getRowId`: sin id estable, el
    // estado de expansión (guardado por id) se desincroniza al reordenar.
    await user.click(screen.getByRole("button", { name: "Ordenar por Nombre" }));
    expect(screen.getByText("Torre 1")).toBeInTheDocument();
  });

  it("la expansión sobrevive a un ciclo de filtrar y volver a limpiar el filtro", async () => {
    const user = userEvent.setup();
    render(
      <DataTable value={arbol()} getSubRows={getSubRows} getRowId={getRowId} searchable>
        <Column field="nombre" header="Nombre" tree />
      </DataTable>,
    );
    await user.click(screen.getByRole("button", { name: "Expandir Edificio A" }));
    expect(screen.getByText("Torre 1")).toBeInTheDocument();

    // Buscar algo que oculta la rama expandida por completo (no hay ningún
    // "Edificio B" bajo "Edificio A")...
    const search = screen.getByRole("textbox", { name: "Buscar en la tabla" });
    await user.type(search, "Edificio B");
    await waitFor(() => expect(screen.queryByText("Edificio A")).not.toBeInTheDocument());

    // ...y al limpiar el filtro, "Edificio A" sigue expandida: el estado no
    // se perdió por el camino, porque va guardado por id y no por índice.
    await user.clear(search);
    await waitFor(() => expect(screen.getByText("Torre 1")).toBeInTheDocument());
  });

  it("con preferencesKey, la expansión se recuerda entre montajes (localStorage)", async () => {
    const user = userEvent.setup();
    window.localStorage.clear();
    const { unmount } = render(
      <DataTable value={arbol()} getSubRows={getSubRows} getRowId={getRowId} preferencesKey="unidades-test">
        <Column field="nombre" header="Nombre" tree />
      </DataTable>,
    );
    await user.click(screen.getByRole("button", { name: "Expandir Edificio A" }));
    expect(screen.getByText("Torre 1")).toBeInTheDocument();
    unmount();

    render(
      <DataTable value={arbol()} getSubRows={getSubRows} getRowId={getRowId} preferencesKey="unidades-test">
        <Column field="nombre" header="Nombre" tree />
      </DataTable>,
    );
    expect(screen.getByText("Torre 1")).toBeInTheDocument();
  });

  it("expanded/onExpandedChange controlados: DataTable no gestiona el estado internamente", async () => {
    const user = userEvent.setup();
    function Wrapper() {
      const [expanded, setExpanded] = React.useState({});
      // `value` se memoiza para no crear un árbol nuevo en cada render: como
      // cualquier tabla de TanStack, un `data` inestable dispara sus propios
      // resets internos — no es un caso especial de la jerarquía.
      const value = React.useMemo(() => arbol(), []);
      return (
        <DataTable
          value={value}
          getSubRows={getSubRows}
          getRowId={getRowId}
          expanded={expanded}
          onExpandedChange={setExpanded}
        >
          <Column field="nombre" header="Nombre" tree />
        </DataTable>
      );
    }
    render(<Wrapper />);
    expect(screen.queryByText("Torre 1")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Expandir Edificio A" }));
    expect(screen.getByText("Torre 1")).toBeInTheDocument();
  });

  it("una fila sin campo en la columna tree usa el id de fila en el nombre accesible del botón", () => {
    render(
      <DataTable value={arbol()} getSubRows={getSubRows} getRowId={getRowId}>
        <Column<UnidadArbol> id="nombre-custom" header="Nombre" tree body={(u) => u.nombre} />
      </DataTable>,
    );
    expect(screen.getByRole("button", { name: "Expandir fila 1" })).toBeInTheDocument();
  });
});
