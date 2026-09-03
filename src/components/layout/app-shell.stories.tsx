import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { AppShell } from "./app-shell";
import { SidebarBrand } from "./sidebar-brand";
import { SidebarNav, SidebarNavItem } from "./sidebar-nav";
import { AppVersion } from "./app-version";
import { PageContainer } from "./page-container";
import { PageHeader } from "./page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardIcon, ReceiptIcon, SettingsIcon, UsersIcon } from "@/icons";

const meta = {
  title: "Layout/AppShell",
  component: AppShell,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Armazón de aplicación: menú lateral, barra superior y contenido. Trae resuelto el plegado con la preferencia recordada por dispositivo, la animación de ancho, el panel móvil y el carácter cromático del menú.",
      },
    },
  },
  // `sidebar` y `children` son obligatorios: cada story los sustituye en su
  // `render`, pero el tipo del meta los exige.
  args: { sidebar: null, children: null },
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

const ENLACES = [
  { id: "inicio", label: "Inicio", icon: DashboardIcon },
  { id: "movimientos", label: "Movimientos", icon: ReceiptIcon },
  { id: "clientes", label: "Clientes", icon: UsersIcon },
  { id: "ajustes", label: "Ajustes", icon: SettingsIcon },
];

function Navegacion() {
  const [activo, setActivo] = useState("inicio");
  return (
    <SidebarNav>
      {ENLACES.map(({ id, label, icon: Icon }) => (
        <SidebarNavItem
          key={id}
          icon={<Icon />}
          active={activo === id}
          onClick={(event) => {
            event.preventDefault();
            setActivo(id);
          }}
        >
          {label}
        </SidebarNavItem>
      ))}
    </SidebarNav>
  );
}

const grupos = [
  {
    id: "empresa",
    label: "Empresa",
    value: "acme",
    options: [
      { value: "acme", label: "Acme S.A." },
      { value: "globex", label: "Globex Ltda." },
    ],
  },
  {
    id: "entorno",
    label: "Entorno",
    value: "prd",
    options: [
      { value: "prd", label: "Producción", description: "Datos reales de la operación" },
      { value: "uat", label: "Pruebas (UAT)", description: "Datos de ensayo, sin efecto real", badge: { label: "UAT", tone: "warning" as const } },
    ],
  },
];

/** El armazón completo, tal como lo montaría una aplicación. */
export const Default: Story = {
  name: "Armazón completo",
  render: () => {
    const Demo = () => {
      return (
        <AppShell
          storageKey="demo"
          brand={<SidebarBrand name="Acme S.A." groups={grupos} />}
          sidebar={<Navegacion />}
          sidebarFooter={<AppVersion version="1.4.2" buildDate="2026-09-03" />}
          topbar={<Button size="sm" variant="outline">Mi perfil</Button>}
        >
          <PageContainer>
            <PageHeader
              title="Arqueo de caja"
              description="Cierre del turno de la mañana."
              actions={<Button>Cerrar turno</Button>}
            />
            <Card>
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-ui-body-sm text-muted-foreground">
                  Una tarjeta se dibuja sobre `raised` y la página sobre `ground`: por eso se distingue del fondo
                  sin necesidad de un gris inventado.
                </p>
              </CardContent>
            </Card>
          </PageContainer>
        </AppShell>
      );
    };
    return <Demo />;
  },
};

/**
 * Las tres variantes de carácter del menú. El menú es oscuro en tema claro y en
 * oscuro: es un plano distinto de la interfaz, no una superficie más.
 */
export const Variantes: Story = {
  name: "Carácter del menú",
  render: () => (
    <div className="grid gap-lg">
      {(["graphite", "ink", "smoke"] as const).map((variant) => (
        <div key={variant} className="overflow-hidden rounded-lg border border-border">
          <AppShell
            variant={variant}
            brand={<SidebarBrand name="Acme S.A." />}
            sidebar={<Navegacion />}
            sidebarFooter={<AppVersion version="1.4.2" />}
            className="min-h-[22rem]"
          >
            <PageContainer animate={false}>
              <PageHeader as="h2" title={variant} description="Cambia con `variant`; se afina con los tokens `--sidebar-*`." />
            </PageContainer>
          </AppShell>
        </div>
      ))}
    </div>
  ),
};

/** Plegado: el ancho se anima solo y la preferencia se recuerda por dispositivo. */
export const Plegado: Story = {
  name: "Menú plegado",
  render: () => (
    <AppShell
      defaultCollapsed
      brand={<SidebarBrand name="Acme S.A." groups={grupos} />}
      sidebar={<Navegacion />}
    >
      <PageContainer>
        <PageHeader title="Movimientos" description="El menú recuerda si lo dejaste plegado." />
      </PageContainer>
    </AppShell>
  ),
};
