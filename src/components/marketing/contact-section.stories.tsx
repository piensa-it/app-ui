import type { Meta, StoryObj } from "@storybook/react-vite";
import { BookOpen } from "lucide-react";

import { ContactSection } from "./contact-section";
import { Section } from "./section";

const meta = {
  title: "Marketing/ContactSection",
  component: ContactSection,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: { description: { component: "Contacto por WhatsApp, correo u otros canales. Los enlaces `wa.me` y `mailto:` se arman a partir de los datos (`whatsappHref`, `mailtoHref`)." } },
  },
  decorators: [(Story) => <Section spacing="sm"><Story /></Section>],
  args: { channels: [] },
} satisfies Meta<typeof ContactSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Tarjetas: Story = {
  name: "Tarjetas (ej. AdapterDian)",
  args: {
    title: "Solicitar acceso",
    description: "Te respondemos el mismo día hábil.",
    channels: [
      { type: "whatsapp", phone: "+57 300 000 0000", message: "Hola, quiero acceso a la API." },
      { type: "email", address: "info@example.com", label: "Correo" , description: "info@example.com" },
      { type: "link", href: "#", label: "Documentación", description: "/docs", icon: <BookOpen /> },
    ],
  },
};

export const Centrada: Story = {
  name: "Centrada con nota (ej. CoreLink)",
  args: {
    layout: "centered",
    title: "Hablemos",
    description: "Cuéntanos cuántos documentos emites al mes.",
    channels: [
      { type: "whatsapp", phone: "+57 300 000 0000", label: "Escríbenos por WhatsApp" },
      { type: "email", address: "info@example.com" },
    ],
    note: "No publicamos precios: dependen del volumen y de los módulos que necesites.",
  },
};
