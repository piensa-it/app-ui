import type { Meta, StoryObj } from "@storybook/react-vite";

import { Section } from "./section";
import { StatRow } from "./stat-row";

const meta = {
  title: "Marketing/StatRow",
  component: StatRow,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: { description: { component: "Fila de cifras. El valor llega formateado (`92 %`, `50+`), así que el HTML del servidor trae la cifra final." } },
  },
  decorators: [(Story) => <Section spacing="sm"><Story /></Section>],
  args: { items: [] },
} satisfies Meta<typeof StatRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ConRotulo: Story = {
  name: "Cinco cifras con rótulo (ej. Lynx)",
  args: {
    label: "El portafolio",
    items: [
      { value: "8", label: "Edificios" },
      { value: "38", label: "Contratos" },
      { value: "92 %", label: "Ocupación" },
      { value: "18.2k m²", label: "Área" },
      { value: "5", label: "Módulos" },
    ],
  },
};

export const Acento: Story = {
  name: "Tres cifras en color de marca (ej. piensait.com)",
  args: {
    accent: true,
    items: [
      { value: "15+", label: "Years in business" },
      { value: "5", label: "Countries" },
      { value: "50+", label: "Projects delivered" },
    ],
  },
};
