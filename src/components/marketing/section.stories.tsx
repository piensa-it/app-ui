import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { MapPin } from "lucide-react";

import { Button } from "../ui/button";
import { Eyebrow, Highlight, Section, SectionHeading } from "./section";

const meta = {
  title: "Marketing/Section",
  component: Section,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Contenedor y encabezado comunes de las secciones de landing: ancho, márgenes, fondo alterno (`muted`), bloque oscuro (`inverted`) y fondo decorativo de rejilla y halo. `SectionHeading` pone eyebrow, título con `Highlight` y subtítulo. Todo se renderiza en el servidor.",
      },
    },
  },
  args: { children: null },
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Section id="canales">
      <SectionHeading
        eyebrow="Canales"
        title="Un contrato, cuatro formas de llegar"
        description="La misma petición sirve para SMS, WhatsApp, Email y Push."
      />
    </Section>
  ),
};

export const TonosYFondos: Story = {
  name: "Tonos y fondos",
  render: () => (
    <>
      <Section tone="muted" spacing="sm">
        <SectionHeading align="center" eyebrow="muted" title="Fondo alterno para separar secciones" />
      </Section>
      <Section background="grid-glow" spacing="sm">
        <SectionHeading
          align="center"
          eyebrow={<Eyebrow variant="pill" indicator="dot">Plantillas</Eyebrow>}
          title={<>Mensajes que se ven <Highlight>bien en cada canal</Highlight></>}
          description="Rejilla con máscara radial y halo del color de marca."
        />
      </Section>
      <Section tone="inverted" background="grid" spacing="sm">
        <SectionHeading
          eyebrow="How we work"
          title={<>Retail software is not <Highlight variant="accent">a greenfield problem</Highlight></>}
          description="Bloque oscuro con los tokens del tema oscuro, aunque la página esté en claro."
          rule
          actions={<Button>Book a call</Button>}
        />
      </Section>
    </>
  ),
};

export const EyebrowsYResaltados: Story = {
  name: "Eyebrows y resaltados",
  render: () => (
    <Section spacing="sm">
      <div className="flex flex-col gap-8">
        <div className="flex flex-wrap gap-4">
          <Eyebrow>Texto</Eyebrow>
          <Eyebrow variant="pill" indicator="dot">
            Pastilla con punto
          </Eyebrow>
          <Eyebrow variant="pill" indicator={<MapPin />}>
            Norwalk, Connecticut
          </Eyebrow>
        </div>
        <SectionHeading
          as="h3"
          title={
            <>
              Degradado: <Highlight>tus mensajes llegan</Highlight>
            </>
          }
        />
        <div style={{ "--marketing-highlight-to": "hsl(var(--chart-4))" } as CSSProperties}>
          <SectionHeading
            as="h3"
            title={
              <>
                Degradado hacia otro color con <Highlight>--marketing-highlight-to</Highlight>
              </>
            }
          />
        </div>
        <SectionHeading
          as="h3"
          title={
            <>
              Acento en cursiva: la factura <Highlight variant="accent" italic>no termina</Highlight>
            </>
          }
        />
      </div>
    </Section>
  ),
};
