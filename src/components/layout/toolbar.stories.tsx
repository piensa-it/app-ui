import type { Meta, StoryObj } from "@storybook/react-vite";

import { Toolbar, ToolbarSeparator } from "./toolbar";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const meta = {
  title: "Layout/Toolbar",
  component: Toolbar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Fila de controles con el espaciado del sistema: la barra superior, las acciones de una tarjeta, los filtros sobre una tabla. Usa `ToolbarSeparator` para empujar a la derecha lo que venga después.",
      },
    },
  },
  args: { children: null },
} satisfies Meta<typeof Toolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

const periodos = [
  { value: "hoy", label: "Hoy" },
  { value: "semana", label: "Esta semana" },
  { value: "mes", label: "Este mes" },
];

/** Filtros a la izquierda, la acción principal empujada a la derecha con `ToolbarSeparator`. */
export const Default: Story = {
  name: "Filtros y acción",
  render: () => (
    <Toolbar>
      <Select aria-label="Periodo" options={periodos} value="mes" onChange={() => {}} className="w-40" />
      <Input placeholder="Buscar…" className="w-48" aria-label="Buscar" />
      <ToolbarSeparator visible />
      <Button>Nuevo</Button>
    </Toolbar>
  ),
};

/** Sin ningún `ToolbarSeparator`: los controles se acomodan uno tras otro y saltan de línea si no caben. */
export const SoloControles: Story = {
  name: "Sin separador",
  render: () => (
    <Toolbar>
      <Button variant="outline">Exportar</Button>
      <Button variant="outline">Importar</Button>
      <Button>Nuevo</Button>
    </Toolbar>
  ),
};

/** `visible` dibuja además una línea vertical; sin él, `ToolbarSeparator` solo empuja. */
export const SeparadorInvisible: Story = {
  name: "Separador sin línea",
  render: () => (
    <Toolbar>
      <Button variant="plain">Cancelar</Button>
      <ToolbarSeparator />
      <Button variant="outline">Guardar borrador</Button>
      <Button>Publicar</Button>
    </Toolbar>
  ),
};
