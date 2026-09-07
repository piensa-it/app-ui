import type { Meta, StoryObj } from "@storybook/react-vite";

import { AppShell } from "./app-shell";
import { NotificationsMenu } from "./notifications-menu";
import { SidebarIdentity } from "./sidebar-identity";
import { SidebarNav, SidebarNavItem } from "./sidebar-nav";
import { UserMenu } from "./user-menu";
import { PageContainer } from "./page-container";
import { PageHeader } from "./page-header";
import { DashboardIcon } from "@/icons";

const avisos = [
  { id: "a", title: "Conciliación pendiente", description: "Banco de Bogotá 4218 · 3 diferencias en agosto", time: "Hace 5 min", unread: true },
  { id: "b", title: "Pago aprobado", description: "Anticipo contrato mantenimiento · Servicios Andinos", time: "Ayer", unread: true },
  { id: "c", title: "Extracto descargado", description: "Septiembre, cuenta corriente 4218", time: "Hace 3 días" },
];

const meta = {
  title: "Layout/NotificationsMenu",
  component: NotificationsMenu,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      story: { height: "420px", inline: false },
      description: {
        component:
          "La campana de la barra superior, a la izquierda de la persona: el número de pendientes y un panel con las últimas. Estándar en todas las aplicaciones; de dónde salen los avisos y a dónde llevan lo pone la aplicación con `items` y `onSelect`.",
      },
    },
  },
  args: { items: avisos, onSelect: () => {}, onViewAll: () => {}, onMarkAllRead: () => {} },
} satisfies Meta<typeof NotificationsMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

function Armazon({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      brand={<SidebarIdentity system={{ name: "Sistema" }} company={{ caption: "Compañía", value: "acme", label: "Acme S.A." }} />}
      sidebar={
        <SidebarNav>
          <SidebarNavItem icon={<DashboardIcon />} active>
            Tablero
          </SidebarNavItem>
        </SidebarNav>
      }
      topbar={
        <>
          {children}
          <UserMenu user={{ name: "Andrés Montoya", email: "andres@piensait.com", role: "Cajera" }} onProfile={() => {}} onSettings={() => {}} onSignOut={() => {}} />
        </>
      }
    >
      <PageContainer>
        <PageHeader title="Tablero" description="La barra superior es estándar: notificaciones y persona. Lo demás va en cada pantalla." />
      </PageContainer>
    </AppShell>
  );
}

/** En su sitio: a la izquierda de la persona, con el número de pendientes. */
export const EnLaBarra: Story = {
  name: "En la barra",
  render: (args) => <Armazon><NotificationsMenu {...args} /></Armazon>,
};

/** El panel abierto: no leídas con punto y en negrita, «Marcar todo como leído» y «Ver todas». */
export const Abierto: Story = {
  render: (args) => <Armazon><NotificationsMenu {...args} open /></Armazon>,
};

/** Sin pendientes: la campana sin número, y el panel lo dice. */
export const SinPendientes: Story = {
  name: "Sin pendientes",
  args: { items: [] },
  render: (args) => <Armazon><NotificationsMenu {...args} open /></Armazon>,
};
