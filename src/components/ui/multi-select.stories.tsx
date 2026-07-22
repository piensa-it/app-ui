import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { MultiSelect } from "./multi-select";

const meta = {
  title: "UI/MultiSelect",
  component: MultiSelect,
  tags: ["autodocs"],
  parameters: {
    docs: { description: { component: "Selector múltiple sobre PrimeReact MultiSelect." } },
  },
  args: { options: [] },
} satisfies Meta<typeof MultiSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

const permisos = [
  { label: "Lectura", value: "read" },
  { label: "Escritura", value: "write" },
  { label: "Administración", value: "admin" },
];

export const Default: Story = {
  render: () => {
    const Demo = () => {
      const [value, setValue] = useState<Array<string | number>>(["read"]);
      return <MultiSelect options={permisos} value={value} onChange={setValue} />;
    };
    return <Demo />;
  },
};
