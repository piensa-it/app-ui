import type { Meta, StoryObj } from "@storybook/react-vite";

import { Checklist } from "./checklist";
import { Section } from "./section";

const meta = {
  title: "Marketing/Checklist",
  component: Checklist,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen", docs: { description: { component: "Lista de garantías o beneficios con check." } } },
  decorators: [(Story) => <Section spacing="sm"><Story /></Section>],
  args: { items: [] },
} satisfies Meta<typeof Checklist>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  args: { items: ["Variables por destinatario", "Versiones publicadas", "Vista previa por canal", "Aprobación de Meta", "Diseños de correo"] },
};

export const DosColumnasConDescripcion: Story = {
  name: "Dos columnas con descripción",
  args: {
    columns: 2,
    items: [
      { title: "Reintentos automáticos", description: "Con espera creciente." },
      { title: "Una sola vez", description: "Aunque la petición llegue repetida." },
      { title: "Estado por envío", description: "Encolado, enviado, entregado." },
      { title: "Acceso bajo control", description: "Llaves por ambiente." },
    ],
  },
};
