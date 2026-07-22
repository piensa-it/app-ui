import type { Meta, StoryObj } from "@storybook/react-vite";
import { Chart } from "./chart";

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
