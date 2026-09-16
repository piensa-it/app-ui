import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../ui/button";
import { CtaBanner } from "./cta-banner";
import { Section } from "./section";

const meta = {
  title: "Marketing/CtaBanner",
  component: CtaBanner,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: { description: { component: "Llamado a la acción de cierre. Degradado de marca (hacia `--marketing-highlight-to`), rejilla o superficie sobria; una o dos acciones." } },
  },
  decorators: [(Story) => <Section spacing="sm"><Story /></Section>],
  args: { title: "" },
} satisfies Meta<typeof CtaBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Degradado: Story = {
  name: "Degradado con botón invertido (ej. Deliver)",
  args: {
    title: "¿Cuánto costaría para tu aplicación?",
    description: "Ingresa tus volúmenes por canal y mira el plan que te conviene.",
    actions: <Button variant="surface">Abrir el estimador</Button>,
  },
};

export const RejillaDosAcciones: Story = {
  name: "Rejilla con dos acciones (ej. Lynx)",
  args: {
    background: "grid",
    title: "Conoce Lynx con tu propio portafolio",
    actions: (
      <>
        <Button>Agenda tu demo</Button>
        <Button variant="outline">Escríbenos por WhatsApp</Button>
      </>
    ),
  },
};
