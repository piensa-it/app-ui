import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { AppShell } from "./app-shell";
import { ScreenSearch } from "./screen-search";
import { SidebarIdentity } from "./sidebar-identity";
import { SidebarNav, SidebarNavItem } from "./sidebar-nav";
import { UserMenu } from "./user-menu";
import { PageContainer } from "./page-container";
import { PageHeader } from "./page-header";
import { DashboardIcon, ReceiptIcon } from "@/icons";

const pantallas = [
  { id: "operacion", label: "Operación", items: [{ id: "tablero", label: "Tablero", description: "Cómo va el mes" }, { id: "movimientos", label: "Movimientos", description: "El detalle del periodo" }, { id: "nuevo", label: "Nuevo movimiento" }] },
  { id: "control", label: "Control", items: [{ id: "conciliacion", label: "Conciliación" }, { id: "reportes", label: "Reportes" }] },
  { id: "maestros", label: "Maestros", items: [{ id: "cuentas", label: "Cuentas bancarias" }] },
];

const meta = {
  title: "Layout/ScreenSearch",
  component: ScreenSearch,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      story: { height: "420px", inline: false },
      description: {
        component:
          "El buscador de pantallas de la barra superior: un campo con la pista del atajo que abre el `AppSwitcher` con todas las pantallas, también con Ctrl K. Estándar en todas las aplicaciones; qué pantallas hay lo pone la aplicación con `groups`.",
      },
    },
  },
  args: { groups: pantallas, onSelect: () => {} },
} satisfies Meta<typeof ScreenSearch>;

export default meta;
type Story = StoryObj<typeof meta>;

/** En su sitio: a la izquierda de la barra, junto al botón de plegar. Pulsa o usa Ctrl K. */
export const EnLaBarra: Story = {
  name: "En la barra",
  render: (args) => {
    const Demo = () => {
      const [vista, setVista] = useState("tablero");
      const actual = pantallas.flatMap((g) => g.items).find((i) => i.id === vista);
      return (
        <AppShell
          brand={<SidebarIdentity system={{ name: "Sistema" }} company={{ caption: "Compañía", value: "acme", label: "Acme S.A." }} />}
          sidebar={
            <SidebarNav>
              <SidebarNavItem icon={<DashboardIcon />} active={vista === "tablero"}>Tablero</SidebarNavItem>
              <SidebarNavItem icon={<ReceiptIcon />} active={vista === "movimientos"}>Movimientos</SidebarNavItem>
            </SidebarNav>
          }
          topbarStart={<ScreenSearch {...args} activeId={vista} onSelect={setVista} />}
          topbar={<UserMenu user={{ name: "Andrés Montoya", email: "andres@piensait.com", role: "Cajera" }} onProfile={() => {}} onSettings={() => {}} onSignOut={() => {}} />}
        >
          <PageContainer>
            <PageHeader title={actual?.label ?? vista} description="Elige una pantalla desde el buscador; con Ctrl K se abre desde cualquier sitio." />
          </PageContainer>
        </AppShell>
      );
    };
    return <Demo />;
  },
};
