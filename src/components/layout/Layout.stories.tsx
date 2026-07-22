import type { Meta, StoryObj } from "@storybook/react-vite";
import { Layout } from "./Layout";
import { Button } from "../ui/button";

const meta = {
  title: "Layout/Layout",
  component: Layout,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Layout base de aplicación: header sticky + contenido + footer opcional. Agnóstico de marca — recibe el logo/nombre por `brand` y las acciones del header por `headerActions`.",
      },
    },
  },
} satisfies Meta<typeof Layout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    brand: <span className="text-lg font-bold">Mi Producto</span>,
    headerActions: <Button size="sm">Iniciar sesión</Button>,
    footer: "© 2026 Mi Producto. Todos los derechos reservados.",
    children: (
      <div className="mx-auto max-w-2xl py-8">
        <h1 className="mb-2 font-heading text-2xl font-semibold">Contenido de la página</h1>
        <p className="text-muted-foreground">
          Todo lo que pases como `children` se renderiza aquí, dentro del `&lt;main&gt;` con scroll propio.
        </p>
      </div>
    ),
  },
};

export const SinFooter: Story = {
  name: "Sin footer",
  args: {
    ...Default.args,
    footer: undefined,
  },
};
