import type { Meta, StoryObj } from "@storybook/react-vite";

import { C4Diagram } from "./c4-diagram";
import { tienda } from "./ejemplos/c4-tienda";

const meta = {
  title: "Diagramas/C4Diagram",
  component: C4Diagram,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Diagramas C4 sobre `ProcessMap`: los `hijos` de la raíz son el **contexto**, los de un sistema sus **contenedores** y los de un contenedor sus **componentes**. Los límites (`limites`/`limite`) se pintan como carriles y las relaciones asíncronas con trazo discontinuo.",
      },
    },
  },
  args: { raiz: tienda },
} satisfies Meta<typeof C4Diagram>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Contexto: Story = {};

export const HaciaLaDerecha: Story = {
  name: "Hacia la derecha",
  args: { direccion: "derecha" },
};

export const Oscuro: Story = {
  name: "Tema oscuro",
  globals: { theme: "dark" },
};
