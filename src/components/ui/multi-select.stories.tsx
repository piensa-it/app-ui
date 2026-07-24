import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { MultiSelect } from "./multi-select";

const permisos = [
  { label: "Dashboard", value: "dashboard" },
  { label: "Ventas", value: "sales" },
  { label: "Compras", value: "purchases" },
  { label: "Inventario", value: "inventory" },
  { label: "Tesorería", value: "treasury" },
  { label: "Contabilidad", value: "accounting" },
  { label: "Nómina", value: "payroll" },
  { label: "CRM", value: "crm" },
  { label: "Reportes", value: "reports" },
  { label: "Configuración", value: "settings" },
  { label: "Auditoría", value: "audit" },
  { label: "Administración", value: "admin" },
];

const meta = {
  title: "UI/MultiSelect",
  component: MultiSelect,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Selector múltiple accesible con chips removibles. Actualmente no filtra por texto; para selección única con búsqueda usa AutoComplete · Lista con búsqueda.",
      },
    },
  },
  args: { options: permisos },
} satisfies Meta<typeof MultiSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  name: "Asignar módulos",
  render: () => {
    const Demo = () => {
      const [value, setValue] = useState<Array<string | number>>(["dashboard", "sales"]);
      return (
        <div className="grid max-w-xl gap-3">
          <div>
            <h3 className="text-ui-title font-semibold">Módulos habilitados</h3>
            <p className="mt-1 text-ui-body-sm text-muted-foreground">
              Selecciona varios módulos y elimina selecciones directamente desde sus chips.
            </p>
          </div>
          <MultiSelect options={permisos} value={value} onChange={setValue} size="lg" variant="surface" />
          <p className="text-ui-body-sm text-muted-foreground">{value.length} de {permisos.length} módulos seleccionados.</p>
        </div>
      );
    };
    return <Demo />;
  },
};

export const Default: Story = {
  render: () => {
    const Demo = () => {
      const [value, setValue] = useState<Array<string | number>>(["dashboard"]);
      return <MultiSelect options={permisos} value={value} onChange={setValue} />;
    };
    return <Demo />;
  },
};
