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

export const Superficies: Story = {
  args: {
    label: "Campo",
    children: <Input />,
  },
  render: () => (
    <div className="grid max-w-lg gap-4">
      {(["plain", "outline", "surface", "subtle"] as const).map((variant) => (
        <Field
          key={variant}
          variant={variant}
          label={`Campo ${variant}`}
          description="La superficie se adapta al nivel de agrupación requerido."
        >
          <Input variant={variant === "plain" ? "surface" : variant === "outline" ? "outline" : variant} />
        </Field>
      ))}
    </div>
  ),
};
