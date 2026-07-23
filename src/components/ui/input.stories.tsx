import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "./input";

const meta = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Campo de texto base. Acepta cualquier prop nativa de `<input>` (type, placeholder, onChange, etc.).",
      },
    },
  },
  args: {
    placeholder: "Correo electrónico",
    type: "email",
  },
  argTypes: {
    variant: { control: "select", options: ["outline", "surface", "subtle"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Deshabilitado: Story = { args: { disabled: true, value: "no-editable@example.com" } };
export const Password: Story = { args: { type: "password", placeholder: "Contraseña" } };
export const Invalido: Story = { args: { "aria-invalid": true, defaultValue: "correo-invalido" } };
