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

export const Showcase: Story = {
  name: "Vista ejecutiva",
  args: {
    type: "composed",
    data: [
      { mes: "Ene", presupuesto: 82, real: 74 },
      { mes: "Feb", presupuesto: 88, real: 86 },
      { mes: "Mar", presupuesto: 92, real: 97 },
      { mes: "Abr", presupuesto: 98, real: 91 },
      { mes: "May", presupuesto: 104, real: 108 },
      { mes: "Jun", presupuesto: 110, real: 106 },
    ],
    categoryKey: "mes",
    series: [
      { key: "presupuesto", label: "Presupuesto", type: "bar", opacity: 0.28 },
      { key: "real", label: "Ejecución real", type: "line" },
    ],
    title: "Rendimiento financiero",
    description: "Ejecución mensual frente al presupuesto aprobado.",
    value: "$562 M",
    trend: "+9,8% interanual",
    referenceLines: [{ value: 100, label: "Meta mensual" }],
    valueFormatter: (value) => `$${value} M`,
    actions: <Button aria-label="Más opciones" size="icon" variant="outline"><MoreHorizontal /></Button>,
    height: 360,
  },
};

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

const moneyFormatter = (value: number) => `$${value.toLocaleString("es-CO")} M`;

export const PresupuestoVsEjecucion: Story = {
  name: "Presupuesto vs ejecución",
  args: {
    type: "composed",
    data: [
      { mes: "Ene", presupuesto: 82, ejecutado: 74 },
      { mes: "Feb", presupuesto: 88, ejecutado: 86 },
      { mes: "Mar", presupuesto: 92, ejecutado: 97 },
      { mes: "Abr", presupuesto: 98, ejecutado: 91 },
      { mes: "May", presupuesto: 104, ejecutado: 108 },
      { mes: "Jun", presupuesto: 110, ejecutado: 106 },
    ],
    categoryKey: "mes",
    series: [
      { key: "presupuesto", label: "Presupuesto", type: "bar", opacity: 0.32 },
      { key: "ejecutado", label: "Ejecución real", type: "line" },
    ],
    title: "Ejecución presupuestal",
    description: "Compara el gasto real con el presupuesto mensual aprobado.",
    value: "$562 M",
    trend: "97,8% ejecutado",
    referenceLines: [{ value: 100, label: "Umbral $100 M" }],
    valueFormatter: moneyFormatter,
  },
};

export const ComparativoAnual: Story = {
  name: "Año actual vs anterior",
  args: {
    type: "line",
    data: [
      { mes: "Ene", actual: 72, anterior: 64 },
      { mes: "Feb", actual: 78, anterior: 69 },
      { mes: "Mar", actual: 76, anterior: 73 },
      { mes: "Abr", actual: 86, anterior: 75 },
      { mes: "May", actual: 91, anterior: 81 },
      { mes: "Jun", actual: 98, anterior: 85 },
    ],
    categoryKey: "mes",
    series: [
      { key: "actual", label: "2026" },
      { key: "anterior", label: "2025", strokeDasharray: "6 5", opacity: 0.72 },
    ],
    title: "Ingresos comparables",
    description: "Evolución mensual frente al mismo periodo del año anterior.",
    value: "$501 M",
    trend: "+14,6% interanual",
    valueFormatter: moneyFormatter,
  },
};

export const Pronostico: Story = {
  name: "Real y pronóstico",
  args: {
    type: "composed",
    data: [
      { mes: "Ene", real: 58 },
      { mes: "Feb", real: 64 },
      { mes: "Mar", real: 67 },
      { mes: "Abr", real: 73, pronostico: 73 },
      { mes: "May", pronostico: 79, bandaInferior: 73, banda: 12 },
      { mes: "Jun", pronostico: 84, bandaInferior: 76, banda: 16 },
      { mes: "Jul", pronostico: 91, bandaInferior: 80, banda: 22 },
    ],
    categoryKey: "mes",
    series: [
      { key: "bandaInferior", label: "Base del intervalo", type: "area", stackId: "forecast", opacity: 0 },
      { key: "banda", label: "Intervalo esperado", type: "area", stackId: "forecast", opacity: 0.18 },
      { key: "real", label: "Valor real", type: "line" },
      { key: "pronostico", label: "Pronóstico", type: "line", strokeDasharray: "7 5" },
    ],
    title: "Pronóstico de demanda",
    description: "Datos observados y rango esperado para los próximos tres meses.",
    value: "91 mil",
    trend: "+8,3% esperado",
    referenceLines: [{ value: 85, label: "Capacidad actual" }],
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
