import type { Meta, StoryObj } from "@storybook/react-vite";
import { PublicFooter } from "./public-footer";
import { Mail, MapPin } from "lucide-react";

const placeholderLogo =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 36'%3E%3Crect width='36' height='36' rx='8' fill='%23334155'/%3E%3Ctext x='18' y='24' font-size='16' fill='white' text-anchor='middle' font-family='sans-serif'%3EP%3C/text%3E%3C/svg%3E";

const meta = {
  title: "Marketing/PublicFooter",
  component: PublicFooter,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Footer público de 4 columnas: marca+descripción, producto, legal y redes. Todas las secciones (columns, legalLinks, socialLinks) son opcionales.",
      },
    },
  },
  args: {
    logoSrc: placeholderLogo,
    brandName: "Mi Producto",
    description: "Una línea describiendo el producto o la audiencia.",
  },
} satisfies Meta<typeof PublicFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Minimo: Story = { name: "Mínimo (solo marca + copyright)" };

export const Completo: Story = {
  args: {
    columns: [
      {
        title: "Producto",
        links: [
          { to: "#", label: "Funcionalidades" },
          { to: "#", label: "Precios" },
        ],
      },
    ],
    legalLinks: [
      { to: "#", label: "Términos" },
      { to: "#", label: "Tratamiento de datos" },
      { label: "Cookies", onClick: () => alert("Abrir preferencias de cookies") },
    ],
    credit: (
      <>
        Desarrollado con ❤️ por{" "}
        <a href="https://piensait.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          PiensaIT.com
        </a>
      </>
    ),
  },
};

export const ContactoYVersion: Story = {
  name: "Contacto y versión en inglés (ej. piensait.com, CoreLink)",
  args: {
    brandName: "Piensa IT",
    description: "Software that runs large-format retail.",
    columns: [{ title: "Navigate", links: [{ to: "#", label: "Services" }, { to: "#", label: "How we work" }] }],
    contact: [
      { label: "Norwalk, Connecticut", icon: <MapPin /> },
      { label: "info@piensait.com", href: "mailto:info@piensait.com", icon: <Mail /> },
    ],
    version: "corelink@0.1.436+1f175e5",
    year: 2026,
    labels: { contact: "Contact", rightsReserved: "All rights reserved." },
  },
};

export const ConFirma: Story = {
  name: "Con firma «by Piensa IT»",
  args: { logoSrc: undefined, brandName: "Deliver", signature: true, description: "SMS, WhatsApp, Email y Push desde una API.", year: 2026 },
};
