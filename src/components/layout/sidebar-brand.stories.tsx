import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { AppShell } from "./app-shell";
import { SidebarBrand, type SidebarBrandGroup } from "./sidebar-brand";
import { SidebarNav, SidebarNavItem } from "./sidebar-nav";
import { AppVersion } from "./app-version";
import { PageContainer } from "./page-container";
import { PageHeader } from "./page-header";
import { ReceiptIcon, SettingsIcon, UsersIcon } from "@/icons";

const meta = {
  title: "Layout/SidebarBrand",
  component: SidebarBrand,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      story: { height: "460px", inline: false },
      description: {
        component:
          "Identidad de la organización en la cabecera del menú lateral: logo o iniciales, nombre, distintivo de entorno y un único menú con todo lo que se puede cambiar desde ahí (empresa, entorno, sucursal…). La fila entera es un solo control — dos controles compartiendo esos dos centímetros se activan sin querer.",
      },
    },
  },
  // `name` es obligatorio: cada story lo sustituye en su `render`, pero el
  // tipo del meta lo exige.
  args: { name: "Acme S.A." },
} satisfies Meta<typeof SidebarBrand>;

export default meta;
type Story = StoryObj<typeof meta>;

const nav = (
  <SidebarNav>
    <SidebarNavItem icon={<ReceiptIcon />} active>
      Movimientos
    </SidebarNavItem>
    <SidebarNavItem icon={<UsersIcon />}>Clientes</SidebarNavItem>
    <SidebarNavItem icon={<SettingsIcon />}>Configuración</SidebarNavItem>
  </SidebarNav>
);

/** Solo el nombre: sin `groups` no hay ningún control que abrir, y el nombre no responde al click. */
export const SoloNombre: Story = {
  name: "Solo nombre, sin selector",
  render: () => (
    <AppShell brand={<SidebarBrand name="Acme S.A." />} sidebar={nav} sidebarFooter={<AppVersion version="1.4.2" />}>
      <PageContainer>
        <PageHeader title="Movimientos" description="Una sola empresa: la cabecera no abre ningún menú." />
      </PageContainer>
    </AppShell>
  ),
};

function ConGruposDemo() {
  const [empresa, setEmpresa] = useState("acme-co");
  const [entorno, setEntorno] = useState("prd");
  const grupos: SidebarBrandGroup[] = [
    {
      id: "empresa",
      label: "Empresa",
      value: empresa,
      onChange: setEmpresa,
      options: [
        { value: "acme-co", label: "Acme Colombia" },
        { value: "acme-mx", label: "Acme México" },
      ],
    },
    {
      id: "entorno",
      label: "Entorno",
      value: entorno,
      onChange: setEntorno,
      options: [
        { value: "prd", label: "Producción", description: "Datos reales de la operación" },
        {
          value: "uat",
          label: "Pruebas (UAT)",
          description: "Datos de ensayo, sin efecto real",
          badge: { label: "UAT", tone: "warning" },
        },
      ],
    },
  ];
  return (
    <AppShell brand={<SidebarBrand name="Acme S.A." groups={grupos} />} sidebar={nav} sidebarFooter={<AppVersion version="1.4.2" />}>
      <PageContainer>
        <PageHeader title="Movimientos" description="El distintivo de entorno sale de la opción elegida en el grupo «Entorno»." />
      </PageContainer>
    </AppShell>
  );
}

/**
 * Con `groups`, la cabecera abre un menú: cada grupo es una sección, y el
 * distintivo de entorno se deriva de la opción elegida (aquí, «Pruebas»).
 */
export const ConGrupos: Story = { name: "Con grupos (empresa y entorno)", render: () => <ConGruposDemo /> };

/**
 * `onSelect` desvía el disparador entero: en vez de abrir el menú propio,
 * llama a esto. Su sitio es una decisión que necesita más que un desplegable
 * — cambiar de empresa cambia los datos y quién emite lo que se factura.
 */
export const OnSelectPersonalizado: Story = {
  name: "onSelect (abre un diálogo propio)",
  render: () => (
    <AppShell
      brand={
        <SidebarBrand
          name="Acme S.A."
          environment={{ label: "UAT", tone: "warning" }}
          onSelect={() => alert("Aquí la aplicación abriría su propio selector de empresa.")}
        />
      }
      sidebar={nav}
      sidebarFooter={<AppVersion version="1.4.2" />}
    >
      <PageContainer>
        <PageHeader title="Movimientos" description="Al hacer click en la cabecera se llama a onSelect en vez de abrir un menú." />
      </PageContainer>
    </AppShell>
  ),
};
