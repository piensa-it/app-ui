import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { AppShell } from "./app-shell";
import { SidebarIdentity } from "./sidebar-identity";
import { SidebarNav, SidebarNavItem } from "./sidebar-nav";
import { AppVersion } from "./app-version";
import { PageContainer } from "./page-container";
import { PageHeader } from "./page-header";
import { AppSwitcher } from "@/components/ui/app-switcher";
import { Button } from "@/components/ui/button";
import { DashboardIcon, ReceiptIcon } from "@/icons";

const meta = {
  title: "Layout/SidebarIdentity",
  component: SidebarIdentity,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      story: { height: "420px", inline: false },
      description: {
        component:
          "Sistema, compañía —con su entorno— y módulo en la cabecera del menú lateral, en el hueco `brand` de `AppShell`. Una aplicación grande y una pequeña muestran lo mismo en el mismo sitio; la pequeña omite el módulo. Cada segmento es un control, o una etiqueta si no hay nada que elegir. La persona no va aquí: vive arriba a la derecha, en `UserMenu`.",
      },
    },
  },
  args: { system: { name: "MiDivisa" } },
} satisfies Meta<typeof SidebarIdentity>;

export default meta;
type Story = StoryObj<typeof meta>;

const empresas = [
  { value: "acme", label: "Acme S.A.", description: "NIT 900.123.456" },
  { value: "globex", label: "Globex Ltda.", description: "NIT 800.987.654", badge: { label: "UAT", tone: "warning" as const } },
];

const modulos = [
  { value: "tesoreria", label: "Tesorería" },
  { value: "cartera", label: "Cartera" },
  { value: "compras", label: "Compras" },
];

function Armazon({ brand, defaultCollapsed = false }: { brand: React.ReactNode; defaultCollapsed?: boolean }) {
  return (
    <AppShell
      defaultCollapsed={defaultCollapsed}
      brand={brand}
      sidebarFooter={<AppVersion version="1.4.2" />}
      sidebar={
        <SidebarNav>
          <SidebarNavItem icon={<DashboardIcon />} active>
            Inicio
          </SidebarNavItem>
          <SidebarNavItem icon={<ReceiptIcon />}>Movimientos</SidebarNavItem>
        </SidebarNav>
      }
      topbar={<Button size="sm" variant="outline">Mi perfil</Button>}
    >
      <PageContainer>
        <PageHeader title="Inicio" description="La identidad vive en la cabecera del menú; la persona, arriba a la derecha." />
      </PageContainer>
    </AppShell>
  );
}

/** Los tres segmentos: la compañía (con su entorno) y el módulo se cambian desde su menú. */
export const Completo: Story = {
  render: (args) => {
    const Demo = () => {
      const [empresa, setEmpresa] = useState("globex");
      const [modulo, setModulo] = useState("tesoreria");
      return (
        <Armazon
          brand={
            <SidebarIdentity
              {...args}
              company={{ caption: "Compañía", value: empresa, options: empresas, onChange: setEmpresa }}
              module={{ caption: "Módulo", value: modulo, options: modulos, onChange: setModulo }}
            />
          }
        />
      );
    };
    return <Demo />;
  },
};

/** Una aplicación pequeña: sistema y compañía; el módulo se omite y no queda hueco. */
export const SinModulo: Story = {
  name: "Sin módulo",
  render: (args) => {
    const Demo = () => {
      const [empresa, setEmpresa] = useState("acme");
      return <Armazon brand={<SidebarIdentity {...args} company={{ caption: "Compañía", value: empresa, options: empresas, onChange: setEmpresa }} />} />;
    };
    return <Demo />;
  },
};

/** Plegado queda la marca, con sistema y compañía en el nombre accesible; sigue abriendo el menú de compañía. */
export const Plegado: Story = {
  render: (args) => {
    const Demo = () => {
      const [empresa, setEmpresa] = useState("acme");
      return (
        <Armazon
          defaultCollapsed
          brand={
            <SidebarIdentity
              {...args}
              company={{ caption: "Compañía", value: empresa, options: empresas, onChange: setEmpresa }}
              module={{ caption: "Módulo", value: "tesoreria", label: "Tesorería" }}
            />
          }
        />
      );
    };
    return <Demo />;
  },
};

/**
 * Cambiar de módulo no siempre es cambiar de pestaña: con `onSelect`, el
 * segmento abre lo que la aplicación quiera, aquí un `AppSwitcher` con
 * buscador. La compañía, sin opciones, es solo una etiqueta.
 */
export const ConAppSwitcher: Story = {
  name: "Módulo que abre un AppSwitcher",
  render: (args) => {
    const Demo = () => {
      const [abierto, setAbierto] = useState(false);
      const [modulo, setModulo] = useState("tesoreria");
      return (
        <>
          <Armazon
            brand={
              <SidebarIdentity
                {...args}
                company={{ caption: "Compañía", value: "acme", label: "Acme S.A." }}
                module={{ caption: "Módulo", value: modulo, options: modulos, onSelect: () => setAbierto(true) }}
              />
            }
          />
          <AppSwitcher
            open={abierto}
            onOpenChange={setAbierto}
            title="Cambiar de módulo"
            activeId={modulo}
            onSelect={(id) => {
              setModulo(id);
              setAbierto(false);
            }}
            groups={[{ id: "modulos", label: "Módulos", items: modulos.map((m) => ({ id: m.value, label: m.label })) }]}
          />
        </>
      );
    };
    return <Demo />;
  },
};
