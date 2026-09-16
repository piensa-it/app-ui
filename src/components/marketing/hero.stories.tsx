import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowRight, CheckCircle2, Circle, Loader2, MapPin, ShieldCheck } from "lucide-react";

import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { FeatureGrid } from "./feature-grid";
import { Hero } from "./hero";
import { Eyebrow, Highlight } from "./section";

const meta = {
  title: "Marketing/Hero",
  component: Hero,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Portada de una landing: eyebrow, título `h1` con `Highlight`, descripción, acciones, nota y el artefacto real del producto en `aside`. Sin `aside` queda centrada. `footer` recibe cifras u otro bloque a todo el ancho. Fondo de rejilla y halo por defecto.",
      },
    },
  },
  args: { title: "" },
} satisfies Meta<typeof Hero>;

export default meta;
type Story = StoryObj<typeof meta>;

const Terminal = () => (
  <div className="overflow-hidden rounded-xl border border-border bg-card shadow-lg">
    <div className="flex items-center gap-2 border-b border-border px-4 py-3">
      <span className="size-2.5 rounded-full bg-destructive/60" />
      <span className="size-2.5 rounded-full bg-warning/60" />
      <span className="size-2.5 rounded-full bg-success/60" />
      <span className="ms-2 font-mono text-xs text-muted-foreground">POST /v1/messages</span>
    </div>
    <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-foreground">{`curl https://api.example.com/v1/messages \\
  -H "Authorization: Bearer $API_KEY" \\
  -d '{
    "channel": "whatsapp",
    "to": "+57300…",
    "template": "recordatorio-pago",
    "variables": { "nombre": "Ana" }
  }'

→ 202 Accepted`}</pre>
  </div>
);

export const ConArtefacto: Story = {
  name: "Con artefacto (ej. Deliver)",
  args: {
    eyebrow: "Una plataforma · cuatro canales",
    title: (
      <>
        Tus mensajes llegan. <Highlight>Todos tus canales, en un solo lugar.</Highlight>
      </>
    ),
    description: "SMS, WhatsApp, Email y notificaciones push con un solo contrato de API.",
    actions: (
      <>
        <Button>
          Ver documentación <ArrowRight />
        </Button>
        <Button variant="outline">Estimar mi plan</Button>
      </>
    ),
    aside: <Terminal />,
  },
};

const Factura = () => (
  <Card className="p-6 shadow-lg">
    <p className="font-mono text-xs text-muted-foreground">FE-00482 · Factura electrónica</p>
    <p className="mt-2 font-heading text-2xl font-semibold">$ 4.280.000</p>
    <ol className="mt-6 space-y-3 text-sm">
      <li className="flex items-center gap-2">
        <CheckCircle2 className="size-4 text-success" /> Encolado
      </li>
      <li className="flex items-center gap-2">
        <Loader2 className="size-4 text-primary" /> Enviado a la DIAN
      </li>
      <li className="flex items-center gap-2 text-muted-foreground">
        <Circle className="size-4" /> Validado
      </li>
    </ol>
  </Card>
);

export const ConNotaDeConfianza: Story = {
  name: "Con nota de confianza y acento en cursiva (ej. CoreLink)",
  args: {
    eyebrow: <Eyebrow>Facturación · Recepción · Nómina</Eyebrow>,
    title: (
      <>
        La factura electrónica, <Highlight variant="accent" italic>de principio a fin</Highlight>
      </>
    ),
    description: "Emisión, recepción y nómina conectadas a tu operación.",
    actions: <Button>Hablemos por WhatsApp</Button>,
    note: (
      <>
        <ShieldCheck /> Resolución y numeración autorizadas
      </>
    ),
    aside: <Factura />,
    background: "glow",
  },
};

export const ConCifras: Story = {
  name: "Con cifras debajo y foto (ej. piensait.com)",
  args: {
    eyebrow: (
      <Eyebrow variant="pill" indicator={<MapPin />}>
        Norwalk, Connecticut · Est. 2013
      </Eyebrow>
    ),
    title: (
      <>
        Software that runs large-format <Highlight variant="accent">retail</Highlight>
      </>
    ),
    rule: true,
    description: "Operations platforms, store apps, systems integration and supplier portals.",
    actions: (
      <>
        <Button>
          What we build <ArrowRight />
        </Button>
        <Button variant="outline">How we work</Button>
      </>
    ),
    aside: <div className="aspect-[4/5] w-full rounded-xl border border-border bg-muted" role="img" aria-label="Foto del equipo" />,
    footer: (
      <FeatureGrid
        variant="joined"
        columns={3}
        items={[
          { title: "15+", description: "Years in business" },
          { title: "5", description: "Countries" },
          { title: "50+", description: "Projects delivered" },
        ]}
      />
    ),
  },
};

export const CentradoSinBotones: Story = {
  name: "Centrado, sin botones y con nota (ej. Lynx)",
  args: {
    eyebrow: "Real Estate Operating System",
    title: (
      <>
        El portafolio inmobiliario, <Highlight>del activo a la factura</Highlight>, en un solo sistema
      </>
    ),
    description: "Activos, contratos, facturación, planos y reportes en una sola plataforma.",
    note: "Se entra con la cuenta de Google o de Microsoft, o con tu correo.",
    background: "grid",
  },
};
