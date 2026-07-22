import type { Meta, StoryObj } from "@storybook/react-vite";
import { PublicHeader } from "./PublicHeader";
import { Button } from "../ui/button";

// Logo placeholder neutro — cada producto pasa el suyo vía `logoSrc`.
const placeholderLogo =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 36'%3E%3Crect width='36' height='36' rx='8' fill='%23334155'/%3E%3Ctext x='18' y='24' font-size='16' fill='white' text-anchor='middle' font-family='sans-serif'%3EP%3C/text%3E%3C/svg%3E";

const meta = {
  title: "Marketing/PublicHeader",
  component: PublicHeader,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Header público con scroll-aware blur y menú móvil. Sin acoplamiento a marca (logo/nombre por props) ni a router (`linkComponent` inyectable, usa `<a>` por defecto).",
      },
    },
  },
  args: {
    logoSrc: placeholderLogo,
    brandName: "Mi Producto",
    desktopNav: (
      <>
        <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
          Precios
        </a>
        <Button size="sm">Empezar gratis</Button>
      </>
    ),
    mobileNav: (
      <a href="#" className="py-2 text-sm text-muted-foreground">
        Precios
      </a>
    ),
  },
} satisfies Meta<typeof PublicHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="h-40">
      <PublicHeader {...args} />
    </div>
  ),
};

export const ConBadgeYCrossLink: Story = {
  name: "Con badge y cross-link (ej. Personas/Empresas)",
  args: {
    badge: "Personas",
    crossLink: { to: "#", label: "¿Tienes una empresa?" },
  },
  render: (args) => (
    <div className="h-40">
      <PublicHeader {...args} />
    </div>
  ),
};
