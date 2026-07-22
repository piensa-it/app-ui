import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./badge";

const meta = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Etiqueta corta para estado o metadata (ej. contadores, estados de un registro, categorías).",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "success", "warning", "destructive", "outline"],
    },
  },
  args: {
    children: "Badge",
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Secondary: Story = { args: { variant: "secondary" } };
export const Success: Story = { args: { variant: "success" }, name: "Success (ej. pagado, activo)" };
export const Warning: Story = { args: { variant: "warning" }, name: "Warning (ej. pendiente)" };
export const Destructive: Story = { args: { variant: "destructive" }, name: "Destructive (ej. vencido, error)" };
export const Outline: Story = { args: { variant: "outline" } };

export const TodasLasVariantes: Story = {
  name: "Todas las variantes",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};
