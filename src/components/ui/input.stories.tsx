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

export const Showcase: Story = {
  name: "Vista general",
  render: () => (
    <div className="grid max-w-xl gap-5">
      <div>
        <h3 className="text-ui-title font-semibold">Campos para cada superficie</h3>
        <p className="mt-1 text-ui-body-sm text-muted-foreground">Estados claros para formularios, filtros y búsquedas.</p>
      </div>
      <Input variant="surface" placeholder="Buscar clientes…" />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input variant="outline" placeholder="nombre@empresa.com" />
        <Input variant="subtle" placeholder="Código interno" />
      </div>
      <Input aria-invalid defaultValue="correo-invalido" />
    </div>
  ),
};

export const Default: Story = {};
export const Deshabilitado: Story = { args: { disabled: true, value: "no-editable@example.com" } };
export const Password: Story = { args: { type: "password", placeholder: "Contraseña" } };
export const Invalido: Story = { args: { "aria-invalid": true, defaultValue: "correo-invalido" } };

export const TodasLasVariantes: Story = {
  name: "Todas las superficies",
  render: () => (
    <div className="grid max-w-md gap-4">
      <Input variant="outline" placeholder="Outline" />
      <Input variant="surface" placeholder="Surface" />
      <Input variant="subtle" placeholder="Subtle" />
    </div>
  ),
};
