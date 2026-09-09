import type { Meta, StoryObj } from "@storybook/react-vite";

import { UserMenu } from "./user-menu";
import { UiProvider } from "@/components/providers/ui-provider";
import { HelpIcon } from "@/icons";

const meta = {
  title: "Layout/UserMenu",
  component: UserMenu,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "El menú de la persona en la barra superior: quién es, su perfil, su configuración y cerrar sesión, en ese orden y siempre en el mismo sitio. La librería no conoce el router ni la sesión: todo son callbacks.",
      },
    },
  },
  decorators: [
    (Story) => (
      <UiProvider>
        <div className="flex h-16 items-center justify-end border-b border-border bg-surface px-ui-md">
          <Story />
        </div>
      </UiProvider>
    ),
  ],
  args: {
    user: { name: "Andrés Montoya", email: "andres@piensait.com", role: "Cajera", avatarColor: "350 75% 45%" },
    onProfile: () => {},
    onSettings: () => {},
    onSignOut: () => {},
  },
} satisfies Meta<typeof UserMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Iniciales sobre el color elegido por la persona, nombre y rol. */
export const Default: Story = { name: "Con iniciales" };

/** Con foto, la muestra en vez de las iniciales. */
export const ConFoto: Story = {
  name: "Con foto",
  args: {
    user: {
      name: "Andrés Montoya",
      email: "andres@piensait.com",
      role: "Cajera",
      avatarSrc: "https://api.dicebear.com/9.x/thumbs/svg?seed=Andres&backgroundColor=b6e3f4",
    },
  },
};

/**
 * Cerrar sesión pide confirmación. Reutiliza `confirmAlert` —hace falta
 * `UiProvider` montado— y no monta una capa modal propia.
 */
export const ConConfirmacion: Story = {
  name: "Confirma al cerrar sesión",
  args: { confirmSignOut: true },
};

/** Las acciones propias de la aplicación van entre «Configuración» y «Cerrar sesión». */
export const ConAccionesPropias: Story = {
  name: "Con acciones propias",
  args: {
    items: [{ id: "ayuda", label: "Ayuda", icon: HelpIcon, onSelect: () => {} }],
  },
};

/** Sin color propio, las iniciales van sobre el color de marca. Sin correo, el rol ocupa su sitio en la cabecera. */
export const SinColor: Story = {
  name: "Sin color ni correo",
  args: { user: { name: "Carolina Ríos Betancur", role: "Administradora" } },
};
