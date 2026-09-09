import type { Meta, StoryObj } from "@storybook/react-vite";
import { Breadcrumb } from "./breadcrumb";

const meta = {
  title: "UI/Breadcrumb",
  component: Breadcrumb,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Navegación de vuelta para pantallas de detalle: `nav` + lista ordenada, `aria-current=\"page\"` en el paso actual. Marcado propio — Ark UI no lo trae.",
      },
    },
  },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      { label: "Clientes", href: "/clientes" },
      { label: "Empresas ACME", href: "/clientes/acme" },
      { label: "Factura #4021" },
    ],
  },
};

export const DosNiveles: Story = {
  args: {
    items: [{ label: "Inicio", href: "/" }, { label: "Perfil" }],
  },
};

export const UnSoloNivel: Story = {
  parameters: {
    docs: { description: { story: "Con un solo paso no hay separador que pintar." } },
  },
  args: {
    items: [{ label: "Panel" }],
  },
};

export const RouterInyectado: Story = {
  parameters: {
    docs: {
      description: {
        story: "`linkComponent` recibe el `<Link>` del router de la app consumidora, igual que `PublicHeader`.",
      },
    },
  },
  args: {
    items: [
      { label: "Clientes", href: "/clientes" },
      { label: "Empresas ACME" },
    ],
    linkComponent: ({ to, children, ...rest }) => (
      <a href={to} data-router-link="true" {...rest}>
        {children}
      </a>
    ),
  },
};
