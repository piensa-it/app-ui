import { describe, expect, it, vi } from "vitest";
import * as React from "react";
import { render } from "@testing-library/react";
import { Chart } from "../components/ui/chart";

// jsdom no calcula layout, así que ResponsiveContainer mediría 0×0 y Recharts
// no dibujaría nada. Se sustituye solo el contenedor por uno de tamaño fijo;
// el resto de Recharts (ejes, escalas, ticks) es el real.
vi.mock("recharts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("recharts")>();
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactElement }) =>
      React.cloneElement(children, { width: 600, height: 300 }),
  };
});

const trm = [
  { fecha: "01", valor: 2700 },
  { fecha: "02", valor: 3100 },
  { fecha: "03", valor: 3600 },
];

// Recharts 3 pinta las etiquetas de cada eje por portal en capas z-index,
// fuera del grupo `.recharts-yAxis`; el grupo `recharts-yAxis-tick-labels`
// es el que contiene los <text> de las marcas. Se encadena
// `getElementsByClassName` porque jsdom (nwsapi) no resuelve selectores
// descendientes por clase dentro de SVG.
function yAxisTicks(container: HTMLElement): number[] {
  const labels = container.getElementsByClassName("recharts-yAxis-tick-labels")[0];
  if (!labels) return [];
  return Array.from(labels.getElementsByClassName("recharts-cartesian-axis-tick-value"))
    .map((node) => Number(node.textContent))
    .filter((n) => !Number.isNaN(n));
}

describe("Chart — dominio del eje Y", () => {
  it("las barras arrancan en 0 por defecto", () => {
    const { container } = render(
      <Chart type="bar" data={trm} categoryKey="fecha" series={[{ key: "valor" }]} />,
    );
    const ticks = yAxisTicks(container);
    expect(ticks.length).toBeGreaterThan(1);
    expect(Math.min(...ticks)).toBe(0);
  });

  it("las líneas usan ['auto', 'auto'] por defecto, así la serie no queda aplastada", () => {
    const { container } = render(
      <Chart type="line" data={trm} categoryKey="fecha" series={[{ key: "valor" }]} />,
    );
    const ticks = yAxisTicks(container);
    expect(ticks.length).toBeGreaterThan(1);
    expect(Math.min(...ticks)).toBeGreaterThan(0);
    expect(Math.min(...ticks)).toBeLessThanOrEqual(2700);
  });

  it("yAxis.domain se pasa a Recharts", () => {
    const { container } = render(
      <Chart
        type="bar"
        data={trm}
        categoryKey="fecha"
        series={[{ key: "valor" }]}
        yAxis={{ domain: ["dataMin", "dataMax"] }}
      />,
    );
    const ticks = yAxisTicks(container);
    expect(Math.min(...ticks)).toBe(2700);
    expect(Math.max(...ticks)).toBe(3600);
  });

  it("yAxis.tickCount controla la cantidad de marcas", () => {
    const { container } = render(
      <Chart
        type="line"
        data={trm}
        categoryKey="fecha"
        series={[{ key: "valor" }]}
        yAxis={{ domain: [0, 4000], tickCount: 3 }}
      />,
    );
    expect(yAxisTicks(container)).toEqual([0, 2000, 4000]);
  });
});
