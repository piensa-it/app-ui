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
import { BoxesIcon, CompanyIcon, DashboardIcon, ReceiptIcon, WalletIcon } from "@/icons";

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
  { value: "acme", label: "Acme S.A.", description: "Entras como Administrador", details: [{ label: "NIT", value: "900.123.456" }], icon: CompanyIcon },
  { value: "globex", label: "Globex Ltda.", description: "Entras como Consulta", details: [{ label: "NIT", value: "800.987.654" }], badge: { label: "UAT", tone: "warning" as const }, icon: CompanyIcon },
  { value: "initech", label: "Initech S.A.S.", description: "Entras como Tesorero", details: [{ label: "NIT", value: "811.222.333" }], icon: CompanyIcon },
];

const modulos = [
  { value: "tesoreria", label: "Tesorería", description: "Caja, bancos y conciliación.", icon: WalletIcon, group: "Finanzas" },
  { value: "cartera", label: "Cartera", description: "Facturas, recaudos y cobranza.", icon: ReceiptIcon, group: "Finanzas" },
  { value: "compras", label: "Compras", description: "Órdenes, proveedores y recepción.", icon: BoxesIcon, group: "Operación" },
];

const dialogoCompania = {
  title: "Compañías que puedes operar",
  description: "Entras a cada una con el rol que te dieron allí, y ese rol decide qué puedes hacer.",
  hint: "¿Te falta un permiso? Lo da quien administre esa compañía, desde Configuración → Usuarios y accesos.",
};
const dialogoModulo = {
  title: "Cambiar de módulo",
  description: "Cada módulo trae su propio menú y su propio tablero.",
  recent: ["cartera"],
  hint: "¿Buscas una pantalla y no un módulo? Ctrl K",
};

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

/**
 * Los tres segmentos. Compañía y módulo abren un diálogo (`dialog`): buscador,
 * fichas con icono, descripción, distintivo y detalles (NIT, rol), «aquí
 * estás» y «donde estabas». Es lo que hace falta cuando hay muchas compañías
 * o muchos módulos; el menú corto es para pocas.
 */
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
              company={{ caption: "Compañía", value: empresa, options: empresas, onChange: setEmpresa, dialog: dialogoCompania }}
              module={{ caption: "Módulo", value: modulo, options: modulos, onChange: setModulo, dialog: dialogoModulo }}
            />
          }
        />
      );
    };
    return <Demo />;
  },
};

/** Con pocas opciones, sin `dialog`: el menú corto con marca de selección. */
export const MenuCorto: Story = {
  name: "Menú corto",
  render: (args) => {
    const Demo = () => {
      const [empresa, setEmpresa] = useState("acme");
      return <Armazon brand={<SidebarIdentity {...args} company={{ caption: "Compañía", value: empresa, options: empresas.slice(0, 2), onChange: setEmpresa }} />} />;
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
