import type { Meta, StoryObj } from "@storybook/react-vite";
import { Accordion, AccordionTab } from "./accordion";

const meta = {
  title: "UI/Accordion",
  component: Accordion,
  tags: ["autodocs"],
  parameters: {
    docs: { description: { component: "Contenido colapsable accesible sobre Ark UI, con estados, foco y movimiento configurados por tokens." } },
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Accordion>
      <AccordionTab header="¿Cómo instalo la librería?">
        <p className="text-sm">Con `npm install @piensa-it/ui-library` desde GitHub Packages.</p>
      </AccordionTab>
      <AccordionTab header="¿Cómo cambio el tema?">
        <p className="text-sm">Sobreescribiendo las CSS variables definidas en `globals.css`.</p>
      </AccordionTab>
    </Accordion>
  ),
};

export const WithOpenItem: Story = {
  render: () => (
    <Accordion defaultValue={["personalizacion"]}>
      <AccordionTab value="personalizacion" header="Personalización por producto">
        Cambia la paleta con <code className="rounded bg-muted px-1.5 py-0.5 text-xs">data-ui-palette</code> sin modificar el componente.
      </AccordionTab>
      <AccordionTab value="accesibilidad" header="Accesibilidad y teclado">
        Usa Tab para navegar y Enter o Espacio para expandir cada sección.
      </AccordionTab>
      <AccordionTab value="disabled" header="Opción no disponible" disabled>
        Este contenido permanece deshabilitado.
      </AccordionTab>
    </Accordion>
  ),
};
