import type { Meta, StoryObj } from "@storybook/react-vite";
import { Mail, MapPin } from "lucide-react";

import { ContactForm } from "./contact-form";
import { ContactSection } from "./contact-section";
import { Section, SectionHeading } from "./section";

const meta = {
  title: "Marketing/ContactForm",
  component: ContactForm,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Formulario de contacto sin backend propio: valida, llama a `onSubmit` y anuncia el resultado. Sin `onSubmit` se envía de forma nativa a `action` (Netlify Forms), y sin JavaScript sigue funcionando con los `required` nativos.",
      },
    },
  },
  decorators: [(Story) => <Section spacing="sm"><Story /></Section>],
} satisfies Meta<typeof ContactForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    consent: { label: "Acepto el tratamiento de mis datos personales.", required: true },
    onSubmit: () => new Promise((resolve) => setTimeout(resolve, 800)),
  },
};

export const EnInglesConLateral: Story = {
  name: "En inglés con datos al lado (ej. piensait.com)",
  decorators: [
    (Story) => (
      <div className="flex flex-col gap-10">
        <SectionHeading eyebrow="Get in touch" title="Tell us what breaks at 7am" rule />
        <Story />
      </div>
    ),
  ],
  args: {
    placeholders: { name: "Jane Doe", company: "Retail chain, group or banner", email: "jane@company.com", phone: "+1 203 555 0100" },
    consent: { label: "I accept the processing of my personal data.", required: true },
    honeypot: "website",
    labels: {
      name: "Full name",
      company: "Company",
      email: "Work email",
      phone: "Phone",
      message: "Message",
      submit: "Send message",
      submitting: "Sending…",
      success: "Thanks. We reply within one business day.",
      error: "We couldn't send your message. Try again.",
      required: "This field is required.",
      invalidEmail: "Enter a valid email.",
      consentRequired: "You must accept to continue.",
    },
    onSubmit: () => new Promise((resolve) => setTimeout(resolve, 800)),
    aside: (
      <ContactSection
        layout="aside"
        channels={[
          { type: "link", href: "#", label: "Norwalk, Connecticut", description: "Headquarters", icon: <MapPin /> },
          { type: "link", href: "mailto:info@example.com", label: "info@example.com", description: "Email", icon: <Mail /> },
        ]}
      />
    ),
  },
};
