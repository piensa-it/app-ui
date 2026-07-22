import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select } from "./select";

const meta = {
  title: "UI/Select",
  component: Select,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Selector desplegable sobre PrimeReact Dropdown, con el tema Tailwind de Piensa IT.",
      },
    },
  },
  args: { options: [] },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const paises = [
  { label: "Colombia", value: "co" },
  { label: "México", value: "mx" },
  { label: "España", value: "es" },
  { label: "Argentina", value: "ar", disabled: true },
];

export const Default: Story = {
  render: () => {
    const Demo = () => {
      const [value, setValue] = useState<string | number | null>(null);
      return <Select options={paises} value={value} onChange={setValue} placeholder="Selecciona un país" />;
    };
    return <Demo />;
  },
};

export const ConFiltro: Story = {
  name: "Con filtro",
  render: () => {
    const Demo = () => {
      const [value, setValue] = useState<string | number | null>("co");
      return <Select options={paises} value={value} onChange={setValue} filter />;
    };
    return <Demo />;
  },
};
