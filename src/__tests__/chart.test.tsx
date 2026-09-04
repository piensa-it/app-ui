import { describe, expect, it, vi } from "vitest";
import * as React from "react";
import { act, render } from "@testing-library/react";
import { Chart } from "../components/ui/chart";

// jsdom no calcula layout, así que ResponsiveContainer mediría 0×0 y Recharts
// no dibujaría nada. Se sustituye solo el contenedor por uno de tamaño fijo;
// el resto de Recharts (ejes, escalas, ticks) es el real.
vi.mock("recharts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("recharts")>();
  // Las formas (rectángulos, sectores) se dibujan al terminar la animación,
  // que en jsdom nunca completa: se desactiva solo en pruebas. Sin
  // displayName a propósito: Recharts identifica sus hijos por él y, si el
  // wrapper se llama "Bar", lo trata como la serie y no pinta las formas.
  const sinAnimacion =
    <P extends object>(Component: React.ComponentType<P>) =>
    (props: P) => <Component {...props} isAnimationActive={false} />;
  return {
    ...actual,
    // El genérico de `ReactElement` va explícito: en React 19 su valor por
    // defecto pasó de `any` a `unknown`, y `cloneElement` ya no acepta
    // cualquier prop.
    ResponsiveContainer: ({ children }: { children: React.ReactElement<{ width?: number; height?: number }> }) =>
      React.cloneElement(children, { width: 600, height: 300 }),
    Bar: sinAnimacion(actual.Bar),
    Pie: sinAnimacion(actual.Pie),
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

describe("Chart — formateadores, ancho del eje y decimales", () => {
  const cop = [
    { fecha: "01", valor: 2700000 },
    { fecha: "02", valor: 3600000 },
  ];
  const yAxisLabels = (container: HTMLElement) =>
    Array.from(
      container.getElementsByClassName("recharts-yAxis-tick-labels")[0]?.getElementsByClassName("recharts-cartesian-axis-tick-value") ?? [],
    ).map((n) => n.textContent);

  it("axisFormatter formatea solo el eje y valueFormatter sigue siendo el respaldo", () => {
    const { container } = render(
      <Chart
        type="bar"
        data={cop}
        categoryKey="fecha"
        series={[{ key: "valor" }]}
        valueFormatter={(v) => `$${v.toLocaleString("es-CO")}`}
        axisFormatter={(v) => `${Math.round(v / 1e6)} M`}
      />,
    );
    const labels = yAxisLabels(container);
    expect(labels).toContain("0 M");
    expect(labels.some((l) => l?.startsWith("$"))).toBe(false);
  });

  it("sin axisFormatter, valueFormatter formatea el eje", () => {
    const { container } = render(
      <Chart type="bar" data={cop} categoryKey="fecha" series={[{ key: "valor" }]} valueFormatter={(v) => `$${v}`} />,
    );
    expect(yAxisLabels(container)).toContain("$0");
  });

  it("yAxisWidth fija el ancho reservado para las etiquetas del eje", () => {
    const { container } = render(
      <Chart type="bar" data={cop} categoryKey="fecha" series={[{ key: "valor" }]} yAxisWidth={110} />,
    );
    const yAxis = container.getElementsByClassName("recharts-yAxis")[0];
    expect(yAxis).toBeTruthy();
    const label = container.getElementsByClassName("recharts-yAxis-tick-labels")[0]?.getElementsByClassName("recharts-cartesian-axis-tick-value")[0];
    expect(label).toHaveAttribute("width", "110");
  });

  it("allowDecimals=false evita marcas decimales", () => {
    const pocos = [
      { fecha: "01", valor: 1 },
      { fecha: "02", valor: 2 },
    ];
    const { container } = render(
      <Chart type="bar" data={pocos} categoryKey="fecha" series={[{ key: "valor" }]} allowDecimals={false} />,
    );
    const labels = yAxisLabels(container);
    expect(labels.length).toBeGreaterThan(1);
    expect(labels.every((l) => Number.isInteger(Number(l)))).toBe(true);
  });

  it("por defecto, con pocos valores, Recharts sí usa decimales (control)", () => {
    const pocos = [
      { fecha: "01", valor: 1 },
      { fecha: "02", valor: 2 },
    ];
    const { container } = render(<Chart type="bar" data={pocos} categoryKey="fecha" series={[{ key: "valor" }]} />);
    expect(yAxisLabels(container).some((l) => !Number.isInteger(Number(l)))).toBe(true);
  });
});

// Las formas se calculan en un efecto de layout tras medir ejes y leyenda:
// hay que ceder unos ticks (y evitar la leyenda, que en jsdom no mide).
const nextTick = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

describe("Chart — color por categoría", () => {
  const porMoneda = [
    { moneda: "USD", total: 10, color: "hsl(var(--chart-2))" },
    { moneda: "EUR", total: 20, color: "hsl(var(--chart-4))" },
  ];

  it("colorKey pinta cada barra con el color de su fila", async () => {
    const { container } = render(
      <Chart type="bar" data={porMoneda} categoryKey="moneda" series={[{ key: "total" }]} colorKey="color" showLegend={false} />,
    );
    await nextTick();
    const fills = Array.from(container.getElementsByClassName("recharts-bar-rectangle")).map(
      (g) => g.querySelector("path")?.getAttribute("fill"),
    );
    expect(fills).toEqual(["hsl(var(--chart-2))", "hsl(var(--chart-4))"]);
  });

  it("colorKey pinta cada porción del pie con el color de su fila", async () => {
    const { container } = render(
      <Chart type="pie" data={porMoneda} categoryKey="moneda" series={[{ key: "total" }]} colorKey="color" showLegend={false} />,
    );
    await nextTick();
    const fills = Array.from(container.getElementsByClassName("recharts-pie-sector")).map(
      (g) => g.querySelector("path")?.getAttribute("fill"),
    );
    expect(fills).toEqual(["hsl(var(--chart-2))", "hsl(var(--chart-4))"]);
  });
});
