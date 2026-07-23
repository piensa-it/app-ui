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

export const Showcase: Story = {
  name: "Vista general",
  render: () => (
    <div className="flex flex-wrap items-center gap-5">
      <Avatar label="AM" size="xl" variant="elevated" />
      <Avatar label="PI" size="lg" variant="outline" shape="square" />
      <div className="flex -space-x-2">
        {["AG", "LP", "MR", "+8"].map((label) => (
          <Avatar key={label} label={label} variant="soft" className="ring-2 ring-background" />
        ))}
      </div>
    </div>
  ),
};

export const Iniciales: Story = { args: { label: "AM" } };
export const Icono: Story = { name: "Ícono", args: { icon: "pi pi-user" } };
export const Cuadrado: Story = { args: { label: "PI", shape: "square" } };

export const TamanosYSuperficies: Story = {
  name: "Tamaños y superficies",
  render: () => (
    <div className="grid gap-6">
      <div className="flex items-end gap-3">
        {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
          <Avatar key={size} label="AM" size={size} />
        ))}
      </div>
      <div className="flex items-center gap-4">
        <Avatar label="SF" variant="soft" />
        <Avatar label="OL" variant="outline" shape="square" />
        <Avatar label="EL" variant="elevated" shape="square" />
      </div>
    </div>
  ),
};
