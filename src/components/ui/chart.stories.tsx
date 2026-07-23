import type { Meta, StoryObj } from "@storybook/react-vite";
import { Chart } from "./chart";
import { Button } from "./button";
import { MoreHorizontal } from "lucide-react";

const meta = {
  title: "UI/Chart",
  component: Chart,
  tags: ["autodocs"],
  parameters: {
    docs: { description: { component: "Gráficas sobre Recharts (SVG), tematizadas con los tokens de la librería." } },
  },
} satisfies Meta<typeof Chart>;

export default meta;
type Story = StoryObj<typeof meta>;

const data = [
  { mes: "Ene", proyectos: 4 },
  { mes: "Feb", proyectos: 7 },
  { mes: "Mar", proyectos: 6 },
  { mes: "Abr", proyectos: 9 },
  { mes: "May", proyectos: 12 },
];

export const Barras: Story = {
  args: { type: "bar", data, categoryKey: "mes", series: [{ key: "proyectos", label: "Proyectos activos" }] },
};

export const Lineas: Story = {
  name: "Líneas",
  args: { type: "line", data, categoryKey: "mes", series: [{ key: "proyectos", label: "Proyectos activos" }] },
};

export const Donut: Story = {
  args: {
    type: "donut",
    data: [
      { estado: "Activo", total: 18 },
      { estado: "Inactivo", total: 5 },
      { estado: "Pendiente", total: 3 },
    ],
    categoryKey: "estado",
    series: [{ key: "total" }],
  },
};

export const AnalyticsCard: Story = {
  name: "Panel de analítica",
  args: {
    type: "area",
    data: [
      { mes: "Ene", ingresos: 18, objetivo: 16 },
      { mes: "Feb", ingresos: 22, objetivo: 18 },
      { mes: "Mar", ingresos: 21, objetivo: 20 },
      { mes: "Abr", ingresos: 28, objetivo: 22 },
      { mes: "May", ingresos: 32, objetivo: 25 },
      { mes: "Jun", ingresos: 37, objetivo: 28 },
    ],
    categoryKey: "mes",
    series: [
      { key: "ingresos", label: "Ingresos" },
      { key: "objetivo", label: "Objetivo" },
    ],
    title: "Ingresos mensuales",
    description: "Rendimiento acumulado durante el semestre.",
    value: "$37,2 M",
    trend: "+12,4%",
    actions: <Button aria-label="Más opciones" size="icon" variant="ghost"><MoreHorizontal /></Button>,
  },
};

export const Empty: Story = {
  args: {
    type: "bar",
    data: [],
    categoryKey: "mes",
    series: [{ key: "proyectos", label: "Proyectos" }],
    title: "Proyectos por mes",
  },
};
