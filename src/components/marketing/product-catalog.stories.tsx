import type { Meta, StoryObj } from "@storybook/react-vite";
import { Building2, FileText, Mail, Network } from "lucide-react";

import { ProductCatalog } from "./product-catalog";
import { Section, SectionHeading } from "./section";

const meta = {
  title: "Marketing/ProductCatalog",
  component: ProductCatalog,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Catálogo de productos: la web de la empresa enlaza a cada landing, y cada landing muestra «Otros productos» con `compact`. `accent` tiñe la tarjeta con el color del producto en canales HSL, sin hex.",
      },
    },
  },
  decorators: [(Story) => <Section spacing="sm"><Story /></Section>],
  args: { products: [] },
} satisfies Meta<typeof ProductCatalog>;

export default meta;
type Story = StoryObj<typeof meta>;

const logo = (Icon: typeof Mail) => (
  <span className="grid size-10 place-items-center rounded-lg bg-muted text-foreground">
    <Icon className="size-5" />
  </span>
);

const products = [
  { name: "Deliver", logo: logo(Mail), tagline: "SMS, WhatsApp, Email y Push desde una API", category: "APIs", href: "#", accent: "243 75% 58%", links: [{ label: "Documentación", href: "#docs" }, { label: "Precios", href: "#precios" }] },
  { name: "AdapterDian", logo: logo(FileText), tagline: "Facturación electrónica DIAN por API", category: "APIs", href: "#", accent: "174 60% 30%", links: [{ label: "Documentación", href: "#docs" }] },
  { name: "CoreLink", logo: logo(Network), tagline: "Facturación, recepción y nómina electrónica", category: "Plataformas", href: "#", accent: "0 72% 48%" },
  { name: "Lynx", logo: logo(Building2), tagline: "Real Estate Operating System", category: "Plataformas", href: "#", status: { label: "Nuevo", tone: "success" as const } },
];

export const Agrupado: Story = {
  name: "Agrupado por categoría (ej. piensait.com)",
  decorators: [
    (Story) => (
      <div className="flex flex-col gap-10">
        <SectionHeading eyebrow="Productos" title="Lo que construimos" description="Cada producto con su landing y su documentación." />
        <Story />
      </div>
    ),
  ],
  args: { products, groupBy: "category", columns: 2 },
};

export const Compacto: Story = {
  name: "Compacto: otros productos de Piensa IT",
  args: { products: products.slice(1), variant: "compact" },
};
