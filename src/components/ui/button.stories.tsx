import type { Meta, StoryObj } from "@storybook/react-vite";
import { Mail } from "lucide-react";
import { Button } from "./button";

const meta = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Botón base del design system, construido con `class-variance-authority` sobre los tokens de color del theme. Soporta `asChild` para renderizar el estilo sobre otro elemento (por ejemplo un `<Link>` de tu router) sin perder accesibilidad ni semántica.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["solid", "subtle", "surface", "outline", "plain", "destructive", "link"],
    },
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "icon"],
    },
  },
  args: {
    children: "Continuar",
    disabled: false,
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  name: "Vista general",
  render: () => (
    <div className="grid gap-5">
      <div>
        <h3 className="text-ui-title font-semibold">Acciones con jerarquía clara</h3>
        <p className="mt-1 text-ui-body-sm text-muted-foreground">Combina énfasis, superficie y tamaño según la decisión.</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button>Guardar cambios</Button>
        <Button variant="surface"><Mail /> Enviar correo</Button>
        <Button variant="outline">Vista previa</Button>
        <Button variant="subtle">Guardar borrador</Button>
        <Button variant="destructive">Eliminar</Button>
      </div>
    </div>
  ),
};

export const Default: Story = {};

export const Subtle: Story = { args: { variant: "subtle" } };
export const Surface: Story = { args: { variant: "surface" } };
export const Outline: Story = { args: { variant: "outline" } };
export const Plain: Story = { args: { variant: "plain" } };
export const Destructive: Story = { args: { variant: "destructive" } };
export const Link: Story = { args: { variant: "link" } };

export const Disabled: Story = { args: { disabled: true } };

export const ConIcono: Story = {
  name: "Con ícono",
  render: (args) => (
    <Button {...args}>
      <Mail /> Enviar correo
    </Button>
  ),
};

export const TodasLasVariantes: Story = {
  name: "Todas las variantes",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button>Solid</Button>
      <Button variant="subtle">Subtle</Button>
      <Button variant="surface">Surface</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="plain">Plain</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};
