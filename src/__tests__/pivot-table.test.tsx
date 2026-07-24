import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { PivotTable, type PivotField } from "../components/ui/pivot-table";

const fields: PivotField[] = [
  { key: "region", label: "Región", type: "dimension" },
  { key: "year", label: "Año", type: "dimension" },
  { key: "channel", label: "Canal", type: "dimension" },
  { key: "quarter", label: "Trimestre", type: "dimension" },
  { key: "sales", label: "Ventas", type: "measure" },
];

describe("PivotTable", () => {
  it("agrega valores y presenta totales", () => {
    render(
      <PivotTable
        data={[
          { region: "Centro", year: "2025", sales: 10 },
          { region: "Centro", year: "2026", sales: 15 },
          { region: "Norte", year: "2025", sales: 8 },
        ]}
        fields={fields}
        initialRowField="region"
        initialColumnField="year"
        initialValueField="sales"
      />,
    );

    expect(screen.getByRole("table", { name: "Tabla dinámica" })).toBeInTheDocument();
    expect(screen.getByText("Centro")).toBeInTheDocument();
    expect(screen.getByText("Total general")).toBeInTheDocument();
    expect(screen.getByText("33")).toBeInTheDocument();
  });

  it("combina múltiples dimensiones en filas y columnas", () => {
    render(
      <PivotTable
        data={[
          { region: "Centro", channel: "Digital", year: "2026", quarter: "T1", sales: 10 },
          { region: "Centro", channel: "Directo", year: "2026", quarter: "T2", sales: 15 },
        ]}
        fields={fields}
        initialRowFields={["region", "channel"]}
        initialColumnFields={["year", "quarter"]}
        initialValueField="sales"
      />,
    );

    expect(screen.getByText("Región + Canal / Año + Trimestre")).toBeInTheDocument();
    expect(screen.getByText("Centro · Digital")).toBeInTheDocument();
    expect(screen.getByText("2026 · T1")).toBeInTheDocument();
  });

  it("acepta dimensiones arrastradas para crear un nuevo agrupado", () => {
    const { container } = render(
      <PivotTable
        data={[
          { region: "Centro", channel: "Digital", year: "2026", sales: 10 },
          { region: "Centro", channel: "Directo", year: "2026", sales: 15 },
        ]}
        fields={fields}
        initialRowField="region"
        initialColumnField="year"
        initialValueField="sales"
      />,
    );
    const transferred = new Map<string, string>();
    const dataTransfer = {
      effectAllowed: "none",
      dropEffect: "none",
      setData: (type: string, value: string) => transferred.set(type, value),
      getData: (type: string) => transferred.get(type) ?? "",
    };

    fireEvent.dragStart(screen.getByRole("button", { name: /Canal\s*Dimensión/ }), { dataTransfer });
    const rowZone = container.querySelector('[data-pivot-zone="filas"]');
    expect(rowZone).not.toBeNull();
    fireEvent.dragOver(rowZone!, { dataTransfer });
    fireEvent.drop(rowZone!, { dataTransfer });

    expect(screen.getByText("Región + Canal / Año")).toBeInTheDocument();
    expect(screen.getByText("Centro · Digital")).toBeInTheDocument();
  });
});
