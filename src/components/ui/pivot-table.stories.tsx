import type { Meta, StoryObj } from "@storybook/react-vite";

import { PivotTable, type PivotDatum, type PivotField } from "./pivot-table";

const fields: PivotField[] = [
  { key: "region", label: "Región", type: "dimension" },
  { key: "year", label: "Año", type: "dimension" },
  { key: "quarter", label: "Trimestre", type: "dimension" },
  { key: "channel", label: "Canal", type: "dimension" },
  { key: "category", label: "Categoría", type: "dimension" },
  { key: "seller", label: "Ejecutivo", type: "dimension" },
  { key: "customerType", label: "Tipo de cliente", type: "dimension" },
  { key: "sales", label: "Ventas", type: "measure" },
  { key: "budget", label: "Presupuesto", type: "measure" },
  { key: "margin", label: "Margen", type: "measure" },
  { key: "units", label: "Unidades", type: "measure" },
  { key: "orders", label: "Pedidos", type: "measure" },
];

const regions = ["Centro", "Norte", "Occidente", "Costa"];
const quarters = ["T1", "T2", "T3", "T4"];
const channels = ["Directo", "Partners", "Digital"];
const sellers = ["Ana Gómez", "Luis Pérez", "Marta Ruiz", "Carlos Díaz"];

const data: PivotDatum[] = regions.flatMap((region, regionIndex) =>
  ["2025", "2026"].flatMap((year, yearIndex) =>
    quarters.map((quarter, quarterIndex) => {
      const factor = regionIndex * 17 + yearIndex * 23 + quarterIndex * 11;
      const sales = 138 + factor;
      return {
        region,
        year,
        quarter,
        channel: channels[(regionIndex + quarterIndex) % channels.length],
        category: (regionIndex + quarterIndex) % 2 === 0 ? "Software" : "Servicios",
        seller: sellers[(regionIndex + quarterIndex) % sellers.length],
        customerType: quarterIndex % 2 === 0 ? "Corporativo" : "Pyme",
        sales,
        budget: 145 + regionIndex * 14 + yearIndex * 18 + quarterIndex * 9,
        margin: Math.round(sales * (0.26 + regionIndex * 0.015)),
        units: 18 + regionIndex * 5 + quarterIndex * 4,
        orders: 12 + regionIndex * 4 + yearIndex * 3 + quarterIndex * 2,
      };
    }),
  ),
);

const meta = {
  title: "UI/PivotTable",
  component: PivotTable,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Tabla dinámica para cruzar dimensiones, resumir métricas y obtener totales operativos. Arrastra campos hacia Filas, Columnas o Métrica para construir agrupaciones múltiples.",
      },
    },
  },
  args: { data, fields },
} satisfies Meta<typeof PivotTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  name: "Análisis comercial",
  args: {
    title: "Ventas por región y año",
    description: "Arrastra campos para crear agrupaciones, o usa los selectores como alternativa táctil y accesible.",
    initialRowFields: ["region"],
    initialColumnFields: ["year"],
    initialValueField: "sales",
    initialAggregation: "sum",
    formatValue: (value) => `$${value.toLocaleString("es-CO")} M`,
  },
};

export const PedidosPorCanal: Story = {
  args: {
    initialRowField: "channel",
    initialColumnField: "category",
    initialValueField: "orders",
    initialAggregation: "sum",
  },
};

export const AgrupacionMultiple: Story = {
  name: "Agrupación múltiple",
  args: {
    title: "Desempeño por región, canal y trimestre",
    description: "Una vista jerárquica inicial que puedes reconstruir arrastrando cualquiera de los campos disponibles.",
    initialRowFields: ["region", "channel"],
    initialColumnFields: ["year", "quarter"],
    initialValueField: "budget",
    initialAggregation: "sum",
    formatValue: (value) => `$${value.toLocaleString("es-CO")} M`,
  },
};
