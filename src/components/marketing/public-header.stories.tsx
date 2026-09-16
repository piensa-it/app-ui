import type { Meta, StoryObj } from "@storybook/react-vite";
import { PublicHeader } from "./public-header";
import { Button } from "../ui/button";
import { ThemeToggle } from "../ui/theme-toggle";
import { LanguageSwitcher } from "./language-switcher";

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
    position: "static",
  },
} satisfies Meta<typeof PublicHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="min-h-48 bg-muted/50">
      <PublicHeader {...args} />
      <div className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-sm text-muted-foreground">Contenido de la página</p>
      </div>
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
    <div className="min-h-48 bg-muted/50">
      <PublicHeader {...args} />
    </div>
  ),
};

const anclas = (
  <>
    <a href="#" className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
      Módulos
    </a>
    <a href="#" className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
      Contacto
    </a>
  </>
);

export const DosFilasEnMovil: Story = {
  name: "Dos filas en móvil (ej. CoreLink, AdapterDian)",
  args: {
    mobileNav: undefined,
    desktopNav: anclas,
    actions: <Button size="sm">Login</Button>,
  },
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: (args) => (
    <div className="min-h-48 bg-muted/50">
      <PublicHeader {...args} />
    </div>
  ),
};

export const SoloAccionesEnMovil: Story = {
  name: "Solo acciones en móvil (ej. Lynx)",
  args: {
    mobileNav: undefined,
    mobileLayout: "actions-only",
    desktopNav: anclas,
    actions: (
      <>
        <Button size="sm" variant="outline" className="hidden sm:inline-flex">
          Agenda tu demo
        </Button>
        <Button size="sm">Entrar</Button>
      </>
    ),
  },
  render: (args) => (
    <div className="min-h-48 bg-muted/50">
      <PublicHeader {...args} />
    </div>
  ),
};

export const SinNavegacion: Story = {
  name: "Sin navegación",
  args: { desktopNav: undefined, mobileNav: undefined },
  render: (args) => (
    <div className="min-h-48 bg-muted/50">
      <PublicHeader {...args} />
    </div>
  ),
};

export const EnIngles: Story = {
  name: "En inglés (labels)",
  args: {
    brandName: "Piensa IT",
    desktopNav: (
      <a href="#" className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
        Services
      </a>
    ),
    mobileNav: (
      <a href="#" className="py-2 text-sm text-muted-foreground">
        Services
      </a>
    ),
    actions: <Button size="sm">Book a call</Button>,
    labels: { openMenu: "Open menu", closeMenu: "Close menu", mainNav: "Main navigation", mobileNav: "Mobile navigation" },
  },
  render: (args) => (
    <div className="min-h-48 bg-muted/50">
      <PublicHeader {...args} />
    </div>
  ),
};

export const ConFirmaTemaEIdioma: Story = {
  name: "Con firma, tema e idioma (plantilla de landing)",
  args: {
    logoSrc: undefined,
    brandName: "Deliver",
    signature: true,
    mobileNav: undefined,
    desktopNav: anclas,
    actions: (
      <>
        <LanguageSwitcher value="en" languages={[{ code: "en", label: "English", href: "#" }, { code: "es", label: "Español", href: "#es" }]} />
        <ThemeToggle value="system" />
        <Button size="sm">Estimar mi plan</Button>
      </>
    ),
  },
  render: (args) => (
    <div className="min-h-48 bg-muted/50">
      <PublicHeader {...args} />
    </div>
  ),
};
