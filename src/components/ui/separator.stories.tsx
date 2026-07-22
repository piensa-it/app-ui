import type { Meta, StoryObj } from "@storybook/react-vite";
import { Separator } from "./separator";

const meta = {
  title: "UI/Separator",
  component: Separator,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Línea divisoria (basada en Radix Separator). Usa `orientation=\"vertical\"` dentro de un contenedor `flex` con altura definida.",
      },
    },
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <div className="w-64">
      <p className="text-sm">Sección A</p>
      <Separator className="my-4" />
      <p className="text-sm">Sección B</p>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-8 items-center gap-4 text-sm">
      <span>Item 1</span>
      <Separator orientation="vertical" />
      <span>Item 2</span>
      <Separator orientation="vertical" />
      <span>Item 3</span>
    </div>
  ),
};
