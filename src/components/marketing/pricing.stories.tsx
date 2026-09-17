import type { Meta, StoryObj } from "@storybook/react-vite";

import { PricingPlans, PricingTable } from "./pricing";
import { Section } from "./section";

const meta = {
  title: "Marketing/Pricing",
  component: PricingPlans,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Dos formatos de precios. `PricingPlans`: tarjetas de planes con pestañas por categoría, plan destacado y líneas de detalle. `PricingTable`: tablas por rango de volumen, cada grupo con sus columnas, columna de ahorro y fusión de columnas en móvil. Los números se formatean con `format` y un locale fijo, igual en servidor y navegador.",
      },
    },
  },
  decorators: [(Story) => <Section spacing="sm"><Story /></Section>],
  args: { categories: [] },
} satisfies Meta<typeof PricingPlans>;

export default meta;
type Story = StoryObj<typeof meta>;

const plans = (base: number) => [
  { name: "Inicial", price: base, period: "al mes", details: [{ label: "Incluidos", value: "1.000" }, { label: "Por unidad", value: "$ 50" }, { label: "Adicional", value: "$ 60" }] },
  { name: "Crecimiento", price: base * 3, period: "al mes", highlighted: "Más elegido", details: [{ label: "Incluidos", value: "5.000" }, { label: "Por unidad", value: "$ 36" }, { label: "Adicional", value: "$ 45" }] },
  { name: "Escala", price: base * 8, period: "al mes", details: [{ label: "Incluidos", value: "20.000" }, { label: "Por unidad", value: "$ 24" }, { label: "Adicional", value: "$ 30" }] },
  { name: "Empresa", price: "A la medida", details: [{ label: "Volumen", value: "+100.000" }] },
];

export const PlanesPorCanal: Story = {
  name: "Planes por canal (ej. Deliver /precios)",
  args: {
    format: { currency: "COP", locale: "es-CO" },
    categories: [
      { label: "SMS", plans: plans(50000) },
      { label: "WhatsApp", plans: plans(80000) },
      { label: "Email", plans: plans(30000) },
    ],
    note: "Precios en pesos colombianos, sin IVA. Los segmentos no usados no se acumulan.",
  },
};

export const TablaPorRangos: Story = {
  name: "Tabla por rangos (ej. AdapterDian)",
  render: () => (
    <PricingTable
      format={{ currency: "COP", locale: "es-CO" }}
      note="Los planes se combinan. Por encima del último rango, precio a la medida."
      groups={[
        {
          title: "Emisión",
          columns: [
            { key: "plan", header: "Plan" },
            { key: "docs", header: "Documentos/año", kind: "number", mergeOnMobile: true },
            { key: "price", header: "Valor anual", kind: "price" },
            { key: "saving", header: "Ahorro", kind: "highlight" },
          ],
          rows: [
            { plan: "Micro", docs: "60", price: 50000, saving: "—" },
            { plan: "Pyme", docs: "600", price: 129000, saving: "35 %" },
            { plan: "Empresa", docs: "5.000", price: 259000, saving: "60 %" },
          ],
        },
        {
          title: "Recepción",
          width: "half",
          columns: [
            { key: "plan", header: "Plan" },
            { key: "docs", header: "Documentos/año", kind: "number", mergeOnMobile: true },
            { key: "price", header: "Valor anual", kind: "price" },
          ],
          rows: [
            { plan: "Básico", docs: "24", price: 55000 },
            { plan: "Plus", docs: "500", price: 169000 },
          ],
        },
        {
          title: "Nómina",
          width: "half",
          columns: [
            { key: "plan", header: "Plan" },
            { key: "people", header: "Empleados", kind: "number", mergeOnMobile: true },
            { key: "price", header: "Valor anual", kind: "price" },
          ],
          rows: [
            { plan: "Básico", people: "2", price: 55000 },
            { plan: "Plus", people: "25", price: 175000 },
          ],
        },
      ]}
    />
  ),
};
