import { beforeAll, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { compilarTailwind } from "../test/compilar-tailwind";
import { DataTable, Column } from "../components/ui/data-table";

/**
 * Compila el CSS real de Tailwind (preflight + utilidades) solo para el
 * fuente de DataTable y lo inyecta en jsdom, que sí resuelve el cascade de
 * hojas de estilo en `getComputedStyle`. Así la prueba detecta regresiones
 * reales del reset de Preflight (`button { text-transform: none }`) en vez
 * de comprobar nombres de clases.
 */
beforeAll(async () => {
  const css = await compilarTailwind({ fuentes: ["src/components/ui/data-table.tsx"] });
  const style = document.createElement("style");
  style.setAttribute("data-test", "tailwind");
  style.textContent = css;
  document.head.appendChild(style);
});

describe("DataTable — estilos computados de encabezados", () => {
  it("el encabezado ordenable conserva el mismo text-transform que el no ordenable", () => {
    render(
      <DataTable value={[{ nombre: "Ana", total: 10 }]}>
        <Column field="nombre" header="Nombre" sortable />
        <Column field="total" header="Total" />
      </DataTable>,
    );

    const sortableHeader = screen.getByRole("columnheader", { name: /Nombre/ });
    const plainHeader = screen.getByRole("columnheader", { name: /Total/ });
    const sortButton = screen.getByRole("button", { name: "Ordenar por Nombre" });

    expect(getComputedStyle(plainHeader).textTransform).toBe("uppercase");
    expect(getComputedStyle(sortableHeader).textTransform).toBe(getComputedStyle(plainHeader).textTransform);
    // El texto visible del encabezado ordenable vive dentro del <button>,
    // que Preflight resetea a `text-transform: none`.
    expect(getComputedStyle(sortButton).textTransform).toBe(getComputedStyle(plainHeader).textTransform);
  });
});
