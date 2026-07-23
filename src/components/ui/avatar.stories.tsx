import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar } from "./avatar";

const meta = {
  title: "UI/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  parameters: {
    docs: { description: { component: "Avatar con imagen, iniciales y fallback para representar personas o entidades." } },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Iniciales: Story = { args: { label: "AM" } };
export const Icono: Story = { name: "Ícono", args: { icon: "pi pi-user" } };
export const Cuadrado: Story = { args: { label: "PI", shape: "square" } };
