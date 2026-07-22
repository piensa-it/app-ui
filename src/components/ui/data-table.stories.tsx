import type { Meta, StoryObj } from "@storybook/react-vite";
import { DataTable, Column } from "./data-table";
import { Badge } from "./badge";

const meta = {
  title: "UI/DataTable",
  component: DataTable,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Tabla de datos sobre PrimeReact DataTable, con paginación y orden. Componente insignia del cambio a PrimeReact.",
      },
    },
  },
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
