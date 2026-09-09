import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { composeStories } from "@storybook/react";

import * as stories from "../components/ui/data-table-tree.stories";

/**
 * Estas pruebas montan las stories de verdad —no solo comprueban que
 * Storybook compila— para dejar evidencia de que el árbol se expande, la
 * búsqueda deja visibles a los ancestros, ordenar reordena entre hermanos y
 * paginar no parte familias. Compilar no prueba nada de eso.
 */
const { ArbolCompleto, DesdeListaPlanaConParentId, AccionesPorFila } = composeStories(stories);

describe("Storybook — UI/DataTable/Jerarquía — Árbol completo", () => {
  it("arranca con los edificios expandidos (defaultExpandedDepth=1) pero las bodegas colapsadas", () => {
    render(<ArbolCompleto />);
    expect(screen.getByText("Edificio Norte")).toBeInTheDocument();
    // Los locales (nivel 1) sí se ven con defaultExpandedDepth=1...
    expect(screen.getAllByText("Local B").length).toBeGreaterThan(0);
    // ...pero las bodegas (nivel 2) siguen colapsadas.
    expect(screen.queryByText("Bodega Norte")).not.toBeInTheDocument();
  });

  it("buscar deja visibles a los ancestros de lo encontrado y lo expande", async () => {
    const user = userEvent.setup();
    render(<ArbolCompleto />);

    await user.type(screen.getByPlaceholderText("Buscar activo…"), "Bodega Norte");

    // La bodega buscada aparece...
    expect(await screen.findByText("Bodega Norte")).toBeInTheDocument();
    // ...y también su padre (el local) y su abuelo (el edificio), aunque
    // ninguno de los dos casa con el texto "Bodega B-1" por sí mismo.
    expect(screen.getAllByText("Local B").length).toBeGreaterThan(0);
    expect(screen.getByText("Edificio Norte")).toBeInTheDocument();
    // Un edificio sin ninguna coincidencia en su rama no se muestra.
    expect(screen.queryByText("Edificio Sur")).not.toBeInTheDocument();
  });

  it("ordenar por nombre reordena los locales entre hermanos, sin mezclarlos con los de otro edificio", async () => {
    const user = userEvent.setup();
    render(<ArbolCompleto />);

    // "Edificio Centro" queda en la página 1 tanto sin ordenar (es el
    // tercero en los datos) como ordenado ascendente (es el tercero en
    // orden alfabético) — así el cambio que se observa es solo el de sus
    // hermanas, no un efecto de paginación.
    const table = screen.getByRole("table");
    const filasEdificioCentro = () => {
      const filaEdificio = screen.getByText("Edificio Centro").closest("tr")!;
      // Los dos locales de "Edificio Centro" son las dos filas siguientes en
      // el DOM: hijas directas pintadas justo después de su padre.
      const filas = within(table).getAllByRole("row");
      const indice = filas.indexOf(filaEdificio);
      return [filas[indice + 1], filas[indice + 2]];
    };

    // Antes de ordenar: "Local B" se insertó primero que "Local A" en los datos.
    let [primera, segunda] = filasEdificioCentro();
    expect(within(primera).getByText("Local B")).toBeInTheDocument();
    expect(within(segunda).getByText("Local A")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Ordenar por Nombre" }));

    // Ascendente: "Local A" pasa a ir antes que "Local B", dentro del mismo
    // edificio — sus hermanas cambiaron de lugar, no se aplanó el árbol.
    [primera, segunda] = filasEdificioCentro();
    expect(within(primera).getByText("Local A")).toBeInTheDocument();
    expect(within(segunda).getByText("Local B")).toBeInTheDocument();
  });

  it("paginar reparte por raíz: la página 1 trae los cinco primeros edificios completos, y ninguna familia se parte", async () => {
    const user = userEvent.setup();
    render(<ArbolCompleto />);

    // Los cinco primeros edificios, con su local, están en la página 1.
    expect(screen.getByText("Edificio Norte")).toBeInTheDocument();
    expect(screen.getByText("Edificio Occidente")).toBeInTheDocument();
    expect(screen.getAllByText("Local B").length).toBe(5);
    // El sexto edificio todavía no aparece.
    expect(screen.queryByText("Edificio Altavista")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Ir a la página siguiente" }));

    // En la página 2 aparece completo el edificio siguiente, con su local —
    // no la mitad de un edificio de la página 1.
    expect(await screen.findByText("Edificio Altavista")).toBeInTheDocument();
    expect(screen.getAllByText("Local B").length).toBe(5);
    expect(screen.queryByText("Edificio Norte")).not.toBeInTheDocument();
  });
});

describe("Storybook — UI/DataTable/Jerarquía — Desde lista plana con parentId", () => {
  it("buildTree convierte la lista plana y DataTable la muestra ya anidada, expandida", () => {
    render(<DesdeListaPlanaConParentId />);
    expect(screen.getByText("Edificio Norte")).toBeInTheDocument();
    expect(screen.getAllByText("Local B").length).toBeGreaterThan(0);
    expect(screen.getByText("Bodega Norte")).toBeInTheDocument();
  });
});

describe("Storybook — UI/DataTable/Jerarquía — Acciones por fila", () => {
  it("cada fila tiene sus tres botones de acción, con nombre accesible propio y sin API nueva", () => {
    render(<AccionesPorFila />);
    expect(screen.getByRole("button", { name: "Editar Edificio Norte" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Borrar Edificio Norte" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Agregar hijo a Edificio Norte" })).toBeInTheDocument();
  });
});
