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
        component: "Tabla de datos sobre TanStack Table (headless), con paginación y orden. El paginador es automático: solo aparece cuando hay más filas que `rows`.",
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
  area?: string;
  cargo?: string;
  ultimoAcceso?: string;
  sede?: string;
  supervisor?: string;
  costoMensual?: number;
}

const usuarios: Usuario[] = [
  { nombre: "Ana Gómez", correo: "ana@piensait.com", estado: "activo" },
  { nombre: "Luis Pérez", correo: "luis@piensait.com", estado: "activo" },
  { nombre: "Marta Ruiz", correo: "marta@piensait.com", estado: "inactivo" },
];

const usuariosErp: Usuario[] = [
  ["Ana Gómez", "Finanzas", "Analista senior", "Bogotá", "Carolina Ríos"],
  ["Luis Pérez", "Operaciones", "Coordinador", "Medellín", "Julián Mora"],
  ["Marta Ruiz", "Compras", "Compradora", "Bogotá", "Carolina Ríos"],
  ["Carlos Díaz", "Tecnología", "Administrador", "Cali", "Andrés Gil"],
  ["Laura Soto", "Talento", "Líder", "Medellín", "Julián Mora"],
  ["Diego León", "Ventas", "Ejecutivo", "Barranquilla", "María Vega"],
  ["Sofía Torres", "Servicio", "Especialista", "Bogotá", "Carolina Ríos"],
  ["Jorge Ramírez", "Logística", "Planificador", "Cali", "Andrés Gil"],
  ["Valentina Castro", "Finanzas", "Tesorera", "Medellín", "Julián Mora"],
  ["Samuel Herrera", "Tecnología", "Desarrollador", "Bogotá", "Andrés Gil"],
  ["Camila Vargas", "Marketing", "Diseñadora", "Cali", "María Vega"],
  ["Nicolás Mejía", "Ventas", "Ejecutivo senior", "Bogotá", "María Vega"],
  ["Isabella Rojas", "Compras", "Analista", "Barranquilla", "Carolina Ríos"],
  ["Mateo Navarro", "Operaciones", "Supervisor", "Medellín", "Julián Mora"],
  ["Mariana Arias", "Talento", "Generalista", "Bogotá", "Carolina Ríos"],
  ["Felipe Mendoza", "Logística", "Coordinador", "Cali", "Andrés Gil"],
  ["Gabriela Ortiz", "Servicio", "Agente senior", "Barranquilla", "María Vega"],
  ["Tomás Silva", "Tecnología", "Arquitecto", "Medellín", "Andrés Gil"],
  ["Sara Cárdenas", "Marketing", "Analista", "Bogotá", "María Vega"],
  ["Juan Esteban López", "Finanzas", "Contador", "Cali", "Carolina Ríos"],
].map(([nombre, area, cargo, sede, supervisor], index) => ({
  nombre,
  correo: `${nombre.toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, ".")}@piensait.com`,
  estado: index === 2 || index === 12 ? "inactivo" as const : "activo" as const,
  area,
  cargo,
  sede,
  supervisor,
  ultimoAcceso: index % 3 === 0 ? "Hoy, 08:42" : index % 3 === 1 ? "Ayer, 17:15" : "22 jul, 09:30",
  costoMensual: 4200 + index * 185,
}));

export const Showcase: Story = {
  name: "Vista operativa",
  render: () => (
    <DataTable
      value={usuariosErp}
      title="Miembros del equipo"
      description="Busca, ordena y personaliza las columnas de esta vista operativa."
      searchable
      configurableColumns
      striped
      rows={10}
      rowsPerPageOptions={[10, 25, 50]}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download /> Exportar</Button>
          <Button size="sm"><Plus /> Agregar miembro</Button>
        </div>
      }
    >
      <Column field="nombre" header="Nombre" sortable />
      <Column field="correo" header="Correo" sortable />
      <Column field="area" header="Área" sortable />
      <Column field="cargo" header="Cargo" defaultVisible={false} />
      <Column field="sede" header="Sede" sortable />
      <Column field="supervisor" header="Supervisor" defaultVisible={false} />
      <Column
        field="costoMensual"
        header="Costo mensual"
        defaultVisible={false}
        body={(row: Usuario) => `$${row.costoMensual?.toLocaleString("es-CO")}`}
      />
      <Column field="ultimoAcceso" header="Último acceso" />
      <Column
        field="estado"
        header="Estado"
        hideable={false}
        body={(row: Usuario) => <Badge variant={row.estado === "activo" ? "success" : "outline"}>{row.estado}</Badge>}
      />
    </DataTable>
  ),
};

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
      configurableColumns
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

interface Arqueo {
  moneda: string;
  billetes: number;
  monedas: number;
  total: number;
}

const arqueo: Arqueo[] = [
  { moneda: "USD", billetes: 12450, monedas: 38.5, total: 12488.5 },
  { moneda: "EUR", billetes: 8300, monedas: 12.75, total: 8312.75 },
  { moneda: "COP", billetes: 4850000, monedas: 12500, total: 4862500 },
];

const formatoMonto = (valor: number) => valor.toLocaleString("es-CO", { minimumFractionDigits: 2 });

/**
 * `className` de `Column` se aplica al `<th>` y a cada `<td>`, así una cifra
 * y su encabezado quedan alineados a la derecha con una sola clase.
 * `headerClassName` permite un encabezado distinto cuando hace falta.
 *
 * Con 3 filas y `rows={10}`, `paginator="auto"` (el valor por defecto) no
 * muestra el pie de paginación: no hay nada que paginar.
 */
export const ColumnaNumerica: Story = {
  name: "Columna numérica alineada a la derecha",
  render: () => (
    <DataTable value={arqueo} title="Arqueo por moneda" description="Tablas cortas no muestran paginador.">
      <Column field="moneda" header="Moneda" sortable />
      <Column
        field="billetes"
        header="Billetes"
        sortable
        className="text-right tabular-nums"
        body={(row: Arqueo) => formatoMonto(row.billetes)}
      />
      <Column
        field="monedas"
        header="Monedas"
        className="text-right tabular-nums"
        body={(row: Arqueo) => formatoMonto(row.monedas)}
      />
      <Column
        field="total"
        header="Total"
        sortable
        className="text-right tabular-nums font-semibold"
        headerClassName="text-right"
        body={(row: Arqueo) => formatoMonto(row.total)}
      />
    </DataTable>
  ),
};

/** `paginator={false}` muestra todas las filas sin pie de paginación. */
export const SinPaginador: Story = {
  name: "Sin paginador",
  render: () => (
    <DataTable value={usuariosErp.slice(0, 12)} paginator={false} title="Listado completo">
      <Column field="nombre" header="Nombre" sortable />
      <Column field="area" header="Área" />
      <Column field="sede" header="Sede" />
    </DataTable>
  ),
};

/** `paginator` fuerza el pie aunque las filas quepan en una página. */
export const PaginadorForzado: Story = {
  name: "Paginador siempre visible",
  render: () => (
    <DataTable value={usuarios} paginator>
      <Column field="nombre" header="Nombre" sortable />
      <Column field="correo" header="Correo" />
    </DataTable>
  ),
};
