import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { AppShell } from "./app-shell";
import { SidebarBrand } from "./sidebar-brand";
import { SidebarNav, SidebarNavItem } from "./sidebar-nav";
import { PageContainer } from "./page-container";
import { PageHeader } from "./page-header";
import { TopbarIdentity } from "./topbar-identity";
import { AppSwitcher } from "@/components/ui/app-switcher";
import { Button } from "@/components/ui/button";
import { DashboardIcon, ReceiptIcon } from "@/icons";

const meta = {
  title: "Layout/TopbarIdentity",
  component: TopbarIdentity,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      story: { height: "360px", inline: false },
      description: {
        component:
          "Sistema · empresa · módulo en la barra superior, en el hueco `topbarStart` de `AppShell`. Una aplicación grande y una pequeña muestran lo mismo en el mismo sitio; la pequeña omite el módulo. Cada segmento es un control, o una etiqueta si no hay nada que elegir, y la empresa se cambia en un solo sitio: con esto puesto, `SidebarBrand` va sin el grupo de empresa.",
      },
    },
  },
  args: { system: { name: "MiDivisa" } },
} satisfies Meta<typeof TopbarIdentity>;

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

function Armazon({ children, topbarStart }: { children?: React.ReactNode; topbarStart: React.ReactNode }) {
  return (
    <AppShell
      brand={<SidebarBrand name="Acme S.A." />}
      sidebar={
        <SidebarNav>
          <SidebarNavItem icon={<DashboardIcon />} active>
            Inicio
          </SidebarNavItem>
          <SidebarNavItem icon={<ReceiptIcon />}>Movimientos</SidebarNavItem>
        </SidebarNav>
      }
      topbarStart={topbarStart}
      topbar={<Button size="sm" variant="outline">Mi perfil</Button>}
    >
      <PageContainer>{children ?? <PageHeader title="Inicio" description="La identidad vive arriba; el menú, solo navega." />}</PageContainer>
    </AppShell>
  );
}

/** Los tres segmentos: la empresa y el módulo se cambian desde su menú. */
export const Completo: Story = {
  render: (args) => {
    const Demo = () => {
      const [empresa, setEmpresa] = useState("acme");
      const [modulo, setModulo] = useState("tesoreria");
      return (
        <Armazon
          topbarStart={
            <TopbarIdentity
              {...args}
              company={{ caption: "Empresa", value: empresa, options: empresas, onChange: setEmpresa }}
              module={{ caption: "Módulo", value: modulo, options: modulos, onChange: setModulo }}
            />
          }
        />
      );
    };
    return <Demo />;
  },
};

/** Una aplicación pequeña: sistema y empresa; el módulo se omite y no queda hueco. */
export const SinModulo: Story = {
  name: "Sin módulo",
  render: (args) => {
    const Demo = () => {
      const [empresa, setEmpresa] = useState("acme");
      return <Armazon topbarStart={<TopbarIdentity {...args} company={{ caption: "Empresa", value: empresa, options: empresas, onChange: setEmpresa }} />} />;
    };
    return <Demo />;
  },
};

/**
 * Cambiar de módulo no siempre es cambiar de pestaña: con `onSelect`, el
 * segmento abre lo que la aplicación quiera, aquí un `AppSwitcher` con
 * buscador. La empresa, sin opciones, es solo una etiqueta.
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
            topbarStart={
              <TopbarIdentity
                {...args}
                company={{ caption: "Empresa", value: "acme", label: "Acme S.A." }}
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
