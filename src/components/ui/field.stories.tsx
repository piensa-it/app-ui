import type { Meta, StoryObj } from "@storybook/react-vite";
import { Field } from "./field";
import { Input } from "./input";

const meta = {
  title: "UI/Field",
  component: Field,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Patrón accesible para componer label, ayuda, control y mensaje de error.",
      },
    },
  },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Correo electrónico",
    description: "Lo usaremos para enviarte notificaciones importantes.",
    children: <Input type="email" placeholder="nombre@empresa.com" />,
  },
};

export const ConError: Story = {
  args: {
    label: "Correo electrónico",
    error: "Ingresa un correo electrónico válido.",
    required: true,
    children: <Input defaultValue="correo-invalido" />,
  },
};
