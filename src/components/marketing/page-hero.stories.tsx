import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../ui/button";
import { PageHero } from "./page-hero";

const meta = {
  title: "Marketing/PageHero",
  component: PageHero,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen", docs: { description: { component: "Cabecera de páginas interiores: eyebrow, `h1` y párrafo, sin artefacto." } } },
  args: { title: "" },
} satisfies Meta<typeof PageHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Centrada: Story = {
  name: "Centrada (ej. Deliver /precios)",
  args: { eyebrow: "Precios", title: "Paga por lo que envías", description: "Planes mensuales por canal, sin permanencia." },
};

export const AlineadaConAcciones: Story = {
  name: "Alineada a la izquierda con acciones",
  args: {
    align: "start",
    background: "grid",
    eyebrow: "Plantillas",
    title: "Mensajes que se ven bien en cada canal",
    description: "Elige una plantilla, cambia la marca y mira cómo queda.",
    actions: <Button>Cómo usarla</Button>,
  },
};
