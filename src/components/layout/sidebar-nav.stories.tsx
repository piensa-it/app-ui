import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { AppShell } from "./app-shell";
import { SidebarBrand } from "./sidebar-brand";
import { SidebarNav, SidebarNavGroup, SidebarNavItem } from "./sidebar-nav";
import { AppVersion } from "./app-version";
import { PageContainer } from "./page-container";
import { PageHeader } from "./page-header";
import { Badge } from "@/components/ui/badge";
import { BankIcon, ReceiptIcon, SettingsIcon, UsersIcon, WalletIcon } from "@/icons";

const meta = {
  title: "Layout/SidebarNav",
  component: SidebarNav,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      story: { height: "460px", inline: false },
      description: {
        component:
          "Lista de enlaces del menú lateral. `SidebarNavItem` resuelve el estado activo, el foco y el modo plegado; `SidebarNavGroup` agrupa enlaces bajo un título, opcionalmente colapsable. La librería no conoce el router: el estado activo lo decide `active`, y `asChild` deja que el enlace lo renderice el de la aplicación.",
      },
    },
  },
  // `children` es obligatorio: cada story lo sustituye en su `render`, pero
  // el tipo del meta lo exige.
  args: { children: null },
} satisfies Meta<typeof SidebarNav>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Enlaces sueltos, sin agrupar: para un menú corto que no necesita secciones. */
export const SinGrupos: Story = {
  name: "Enlaces sin agrupar",
  render: () => (
    <AppShell
      brand={<SidebarBrand name="Acme S.A." />}
      sidebar={
        <SidebarNav>
          <SidebarNavItem icon={<ReceiptIcon />} active>
            Movimientos
          </SidebarNavItem>
          <SidebarNavItem icon={<UsersIcon />}>Clientes</SidebarNavItem>
          <SidebarNavItem icon={<SettingsIcon />}>Configuración</SidebarNavItem>
        </SidebarNav>
      }
      sidebarFooter={<AppVersion version="1.4.2" />}
    >
      <PageContainer>
        <PageHeader title="Movimientos" description="Tres enlaces: no hace falta agruparlos." />
      </PageContainer>
    </AppShell>
  ),
};

/** Cada `SidebarNavGroup` es una sección con su propio título; `collapsible` añade el control para plegarla. */
export const ConGrupos: Story = {
  name: "Con grupos colapsables",
  render: () => (
    <AppShell
      brand={<SidebarBrand name="Acme S.A." />}
      sidebar={
        <SidebarNav>
          <SidebarNavGroup label="Operación" collapsible groupId="operacion">
            <SidebarNavItem icon={<ReceiptIcon />} active>
              Movimientos
            </SidebarNavItem>
            <SidebarNavItem icon={<WalletIcon />}>Arqueo de caja</SidebarNavItem>
          </SidebarNavGroup>
          <SidebarNavGroup label="Administración" collapsible groupId="administracion" defaultOpen={false}>
            <SidebarNavItem icon={<UsersIcon />}>Usuarios</SidebarNavItem>
            <SidebarNavItem icon={<SettingsIcon />}>Permisos</SidebarNavItem>
          </SidebarNavGroup>
        </SidebarNav>
      }
      sidebarFooter={<AppVersion version="1.4.2" />}
    >
      <PageContainer>
        <PageHeader title="Movimientos" description="La sección «Administración» empieza cerrada; se recuerda por dispositivo." />
      </PageContainer>
    </AppShell>
  ),
};

/** `badge` añade un distintivo al final del enlace — un contador, un estado — que se oculta con el menú plegado. */
export const ConDistintivo: Story = {
  name: "Enlace con distintivo (badge)",
  render: () => (
    <AppShell
      brand={<SidebarBrand name="Acme S.A." />}
      sidebar={
        <SidebarNav>
          <SidebarNavItem icon={<ReceiptIcon />} active badge={<Badge size="sm">12</Badge>}>
            Pendientes
          </SidebarNavItem>
          <SidebarNavItem icon={<BankIcon />}>Cuentas bancarias</SidebarNavItem>
        </SidebarNav>
      }
      sidebarFooter={<AppVersion version="1.4.2" />}
    >
      <PageContainer>
        <PageHeader title="Pendientes" description="El distintivo desaparece con el menú plegado a solo iconos." />
      </PageContainer>
    </AppShell>
  ),
};

function ConMenuPlegableDemo() {
  const [colapsado, setColapsado] = useState(false);
  return (
    <AppShell
      brand={<SidebarBrand name="Acme S.A." />}
      sidebar={
        <SidebarNav>
          <SidebarNavItem icon={<ReceiptIcon />} active>
            Movimientos
          </SidebarNavItem>
          <SidebarNavItem icon={<UsersIcon />}>Clientes</SidebarNavItem>
        </SidebarNav>
      }
      sidebarFooter={<AppVersion version="1.4.2" />}
      collapsed={colapsado}
      onCollapsedChange={setColapsado}
    >
      <PageContainer>
        <PageHeader
          title="Movimientos"
          description="Plegado, cada enlace conserva su nombre accesible aunque el texto se oculte visualmente."
        />
      </PageContainer>
    </AppShell>
  );
}

/** Con el menú plegado a solo iconos, cada enlace conserva su nombre para lectores de pantalla (`sr-only`), no solo el icono. */
export const MenuPlegado: Story = { name: "Menú plegado (solo iconos)", render: () => <ConMenuPlegableDemo /> };
