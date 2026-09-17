import type { Meta, StoryObj } from "@storybook/react-vite";
import { Code2, Send, Activity, Database } from "lucide-react";

import { ProcessSteps } from "./process-steps";
import { Section } from "./section";

const meta = {
  title: "Marketing/ProcessSteps",
  component: ProcessSteps,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: { description: { component: "«Cómo funciona» en pasos numerados, como lista ordenada. Horizontal (vertical en móvil) o vertical con conector." } },
  },
  decorators: [(Story) => <Section spacing="sm"><Story /></Section>],
  args: { steps: [] },
} satisfies Meta<typeof ProcessSteps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TresPasos: Story = {
  name: "Tres pasos con ícono (ej. Deliver)",
  args: {
    steps: [
      { icon: Code2, title: "Integra una vez", description: "Una llamada a la API para todos los canales." },
      { icon: Send, title: "Envía", description: "Deliver elige el proveedor y reintenta." },
      { icon: Activity, title: "Sigue cada mensaje", description: "Estados y webhooks por envío." },
    ],
  },
};

export const CuatroPasosSinCaja: Story = {
  name: "Cuatro pasos sin caja (ej. Lynx, piensait.com)",
  args: {
    variant: "plain",
    steps: [
      { icon: Database, title: "El activo" },
      { title: "El contrato" },
      { title: "La factura" },
      { title: "El reporte" },
    ],
  },
};

export const Vertical: Story = {
  args: {
    orientation: "vertical",
    variant: "plain",
    steps: [
      { title: "On-site discovery", description: "We walk the stores before writing code." },
      { title: "Integration mapping", description: "ERP, POS and WMS, as they are." },
      { title: "Build in increments", description: "Every two weeks, in production." },
    ],
  },
};
