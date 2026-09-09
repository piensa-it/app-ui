import type { Meta, StoryObj } from "@storybook/react-vite";

import { PageHeader } from "./page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const meta = {
  title: "Layout/PageHeader",
  component: PageHeader,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Encabezado de página: título, descripción y acciones, con el ritmo del sistema. Va como primer hijo de `PageContainer`.",
      },
    },
  },
  args: { title: "Arqueo de caja" },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Título, descripción y una acción principal alineada a la derecha. */
export const Default: Story = {
  name: "Título, descripción y acción",
  args: {
    title: "Arqueo de caja",
    description: "Cierre del turno de la mañana.",
    actions: <Button>Cerrar turno</Button>,
  },
};

/** Solo el título es obligatorio: sin descripción ni acciones el encabezado no deja huecos. */
export const SoloTitulo: Story = {
  name: "Solo título",
  args: { title: "Movimientos" },
};

/** `above` va por encima del título: migas de pan, un botón de volver, un distintivo de estado. */
export const ConEncabezadoSuperior: Story = {
  name: "Contenido por encima (above)",
  args: {
    title: "Factura #4521",
    description: "Emitida el 3 de septiembre de 2026.",
    above: <Badge variant="warning">Pendiente de pago</Badge>,
    actions: (
      <>
        <Button variant="outline">Descargar PDF</Button>
        <Button>Registrar pago</Button>
      </>
    ),
  },
};

/** `as="h2"` para encabezar una sección dentro de la página, no la página entera — baja el tamaño del texto. */
export const NivelDeSeccion: Story = {
  name: "Encabezado de sección (as=\"h2\")",
  args: {
    as: "h2",
    title: "Últimos movimientos",
    description: "Los diez más recientes de esta cuenta.",
  },
};
