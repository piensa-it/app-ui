import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { AppSwitcher, type AppSwitcherGroup } from "./app-switcher";
import { Button } from "./button";
import {
  BanknoteIcon,
  DashboardIcon,
  ReceiptIcon,
  SettingsIcon,
  UsersIcon,
  WalletIcon,
} from "@/icons";

const meta = {
  title: "UI/AppSwitcher",
  component: AppSwitcher,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Una ventana para elegir entre pocas cosas importantes: buscador arriba, recientes primero y el resto en cuadrícula con icono y descripción. No es la paleta de comandos —aquella busca pantallas, cientos, en lista—; esto elige entre quince cosas y se ve como lo que es.",
      },
    },
  },
} satisfies Meta<typeof AppSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Quince módulos en cuatro grupos, como los de CoreLink. */
export const modulos: AppSwitcherGroup[] = [
  {
    id: "dian",
    label: "Electrónico · DIAN",
    items: [
      { id: "ventas", label: "Ventas", description: "Cotizar, vender y facturar electrónicamente.", icon: ReceiptIcon },
      { id: "compras", label: "Compras", description: "Órdenes, recepción y facturas de proveedor.", icon: ReceiptIcon },
      { id: "nomina", label: "Nómina", description: "Liquidación y nómina electrónica.", icon: UsersIcon },
    ],
  },
  {
    id: "finanzas",
    label: "Finanzas",
    items: [
      { id: "tesoreria", label: "Tesorería", description: "Caja, bancos y conciliación.", icon: WalletIcon },
      { id: "cxc", label: "Cuentas por cobrar", description: "Cartera, recaudo y mora.", icon: BanknoteIcon },
      { id: "cxp", label: "Cuentas por pagar", description: "Obligaciones y pagos programados.", icon: BanknoteIcon },
      { id: "contabilidad", label: "Contabilidad", description: "Asientos, cierres y estados financieros.", icon: DashboardIcon },
    ],
  },
  {
    id: "operacion",
    label: "Operación",
    items: [
      { id: "inventario", label: "Inventario", description: "Existencias, bodegas y traslados.", icon: DashboardIcon },
      { id: "produccion", label: "Producción", description: "Órdenes de fabricación y consumos.", icon: DashboardIcon },
      { id: "logistica", label: "Logística", description: "Despachos y rutas.", icon: DashboardIcon },
      { id: "activos", label: "Activos fijos", description: "Depreciación y control de activos.", icon: WalletIcon },
    ],
  },
  {
    id: "gestion",
    label: "Gestión",
    items: [
      { id: "crm", label: "CRM", description: "Clientes, oportunidades y seguimiento.", icon: UsersIcon },
      { id: "proyectos", label: "Proyectos", description: "Tareas, horas y rentabilidad.", icon: DashboardIcon },
      { id: "reportes", label: "Reportes", description: "Tableros e informes.", icon: DashboardIcon },
      { id: "ajustes", label: "Ajustes", description: "Configuración y usuarios.", icon: SettingsIcon },
    ],
  },
];

/**
 * El caso que motivó el componente: quince opciones, con grupos y recientes.
 * Con una ventana de 700 px de alto se llega a todas, porque es la lista la
 * que se desplaza y no la ventana la que crece.
 */
export const QuinceOpciones: Story = {
  name: "Quince opciones",
  args: { open: true, onOpenChange: () => {}, onSelect: () => {}, title: "Cambiar de módulo", groups: modulos },
  render: (args) => {
    const Demo = () => {
      const [abierto, setAbierto] = useState(true);
      const [activo, setActivo] = useState("tesoreria");
      return (
        <div className="p-inset">
          <Button onClick={() => setAbierto(true)}>Cambiar de módulo</Button>
          <p className="mt-ui-sm text-ui-body-sm text-muted-foreground">Módulo activo: {activo}</p>
          <AppSwitcher
            {...args}
            open={abierto}
            onOpenChange={setAbierto}
            description="Cada módulo trae su propio menú y su propio tablero."
            searchPlaceholder="Buscar por nombre o por lo que hace…"
            activeId={activo}
            onSelect={setActivo}
            recent={["tesoreria", "compras", "nomina"]}
            recentLabel="Donde estabas"
            hint={
              <>
                Para buscar pantallas, no módulos: <kbd>Ctrl</kbd> <kbd>K</kbd>.
              </>
            }
          />
        </div>
      );
    };
    return <Demo />;
  },
};

/** Sin recientes ni descripción: la forma mínima. */
export const Minimo: Story = {
  name: "Mínimo",
  args: { open: true, onOpenChange: () => {}, onSelect: () => {}, title: "Cambiar de módulo", groups: modulos.slice(0, 1) },
  render: (args) => {
    const Demo = () => {
      const [abierto, setAbierto] = useState(true);
      return (
        <div className="p-inset">
          <Button onClick={() => setAbierto(true)}>Abrir</Button>
          <AppSwitcher {...args} open={abierto} onOpenChange={setAbierto} />
        </div>
      );
    };
    return <Demo />;
  },
};

/** Pocas opciones importantes: la marca, el entorno y el rol de cada una. */
const empresas: AppSwitcherGroup[] = [
  {
    id: "empresas",
    label: "Empresas",
    items: [
      {
        id: "acme",
        label: "Acme S.A.",
        icon: UsersIcon,
        details: [
          { label: "NIT", value: "900.000.000-1" },
          { label: "Entras como", value: "Administrador" },
        ],
      },
      {
        id: "beta",
        label: "Beta S.A.S.",
        icon: UsersIcon,
        badge: { label: "Pruebas", tone: "warning" },
        details: [
          { label: "NIT", value: "800.000.000-2" },
          { label: "Entras como", value: "Contador" },
        ],
      },
      {
        id: "gamma",
        label: "Gamma Ltda.",
        icon: UsersIcon,
        details: [
          { label: "NIT", value: "700.000.000-3" },
          { label: "Entras como", value: "Solo lectura" },
        ],
      },
    ],
  },
];

/**
 * Cuando elegir no es cambiar de pestaña. Cambiar de empresa cambia los datos
 * que se ven, los permisos con los que se entra y la empresa que emite lo que
 * se factura: cada opción trae lo que hace falta para no equivocarse, y elegir
 * lleva a un segundo paso —dentro de la misma ventana— que lo repite antes de
 * confirmar. Desde ahí se puede volver sin elegir.
 *
 * Con una sola empresa no se abre nada: eso lo decide el disparador
 * (`SidebarBrand onSelect={empresas.length > 1 ? abrir : undefined}`).
 */
export const Empresas: Story = {
  name: "Con detalles y confirmación",
  args: { open: true, onOpenChange: () => {}, onSelect: () => {}, title: "Cambiar de empresa", groups: empresas },
  render: (args) => {
    const Demo = () => {
      const [abierto, setAbierto] = useState(true);
      const [activa, setActiva] = useState("acme");
      return (
        <div className="p-inset">
          <Button onClick={() => setAbierto(true)}>Cambiar de empresa</Button>
          <p className="mt-ui-sm text-ui-body-sm text-muted-foreground">Empresa activa: {activa}</p>
          <AppSwitcher
            {...args}
            open={abierto}
            onOpenChange={setAbierto}
            description="Elegí con qué empresa trabajar."
            searchPlaceholder="Buscar por nombre o NIT…"
            activeId={activa}
            onSelect={setActiva}
            confirm={{
              title: (item) => `Cambiar a ${item.label}`,
              description:
                "Cambia todo: los datos que ves, los permisos con los que entras y la empresa que emite lo que factures.",
              confirmLabel: "Cambiar de empresa",
            }}
          />
        </div>
      );
    };
    return <Demo />;
  },
};
