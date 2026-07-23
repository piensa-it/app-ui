import type { Meta, StoryObj } from "@storybook/react-vite";
import { DataTable, Column } from "./data-table";
import { Badge } from "./badge";
import { Button } from "./button";
import { Download, Plus } from "lucide-react";

const meta = {
  title: "UI/DataTable",
  component: DataTable,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Tabla de datos sobre TanStack Table (headless), con paginación y orden.",
      },
    },
  },
  args: { value: [] },
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

interface Usuario {
  nombre: string;
  correo: string;
  estado: "activo" | "inactivo";
}

const usuarios: Usuario[] = [
  { nombre: "Ana Gómez", correo: "ana@piensait.com", estado: "activo" },
  { nombre: "Luis Pérez", correo: "luis@piensait.com", estado: "activo" },
  { nombre: "Marta Ruiz", correo: "marta@piensait.com", estado: "inactivo" },
];

export const Default: Story = {
  render: () => (
    <DataTable value={usuarios}>
      <Column field="nombre" header="Nombre" sortable />
      <Column field="correo" header="Correo" sortable />
      <Column
        field="estado"
        header="Estado"
        body={(row: Usuario) => (
          <Badge variant={row.estado === "activo" ? "success" : "outline"}>{row.estado}</Badge>
        )}
      />
    </DataTable>
  ),
};

export const Workspace: Story = {
  name: "Completa",
  render: () => (
    <DataTable
      value={[...usuarios, ...usuarios.map((usuario, index) => ({ ...usuario, correo: `${index + 1}.${usuario.correo}` }))]}
      title="Miembros del equipo"
      description="Administra accesos, estados y datos de contacto."
      searchable
      striped
      rows={5}
      rowsPerPageOptions={[5, 10, 25]}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download /> Exportar</Button>
          <Button size="sm"><Plus /> Agregar</Button>
        </div>
      }
    >
      <Column field="nombre" header="Nombre" sortable />
      <Column field="correo" header="Correo" sortable />
      <Column
        field="estado"
        header="Estado"
        body={(row: Usuario) => <Badge variant={row.estado === "activo" ? "success" : "outline"}>{row.estado}</Badge>}
      />
    </DataTable>
  ),
};

export const Loading: Story = {
  render: () => (
    <DataTable value={[]} title="Miembros del equipo" description="Cargando información…" loading>
      <Column field="nombre" header="Nombre" />
      <Column field="correo" header="Correo" />
      <Column field="estado" header="Estado" />
    </DataTable>
  ),
};
