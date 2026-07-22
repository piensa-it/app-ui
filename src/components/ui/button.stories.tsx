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
      options: ["default", "secondary", "outline", "ghost", "destructive", "link"],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
    },
  },
  args: {
    children: "Continuar",
    disabled: false,
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Secondary: Story = { args: { variant: "secondary" } };
export const Outline: Story = { args: { variant: "outline" } };
export const Ghost: Story = { args: { variant: "ghost" } };
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
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};
