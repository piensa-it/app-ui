import type { Meta, StoryObj } from "@storybook/react-vite";
import { DataTable, Column } from "./data-table";
import { Button } from "./button";
import { Badge } from "./badge";
import { buildTree, type TreeRow } from "@/lib/tree";
import { FolderPlus, Pencil, Trash } from "lucide-react";

/**
 * La jerarquía no es un componente aparte: es `DataTable` con `getSubRows`.
 * Esta sección existe solo para que el caso se encuentre tan fácil como si lo
 * fuera — el componente, las pruebas y el pie de página siguen siendo los
 * mismos de "UI/DataTable".
 */
const meta = {
  title: "UI/DataTable/Jerarquía",
  component: DataTable,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "`getSubRows` es el interruptor: sin esa prop, `DataTable` se comporta exactamente igual que en «UI/DataTable», sin sangría ni control de expandir. Con ella, cada fila con hijas se puede desplegar, la búsqueda deja visibles a los ancestros de lo encontrado, ordenar reordena entre hermanos sin aplanar el árbol, y paginar reparte por raíz, no por fila — una raíz con muchas hijas nunca queda partida entre dos páginas.",
      },
    },
  },
  args: { value: [] },
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

interface Activo {
  id: string;
  parentId?: string;
  nombre: string;
  tipo: "edificio" | "local" | "sublocal";
  areaM2: number;
}

type ActivoArbol = TreeRow<Activo>;

const getSubRows = (activo: ActivoArbol) => activo.children;
const getRowId = (activo: ActivoArbol) => activo.id;

/**
 * Doce edificios (raíces), cada uno con dos locales y uno de ellos con una
 * bodega — tres niveles reales, no un ejemplo de dos filas. Los nombres de
 * local se repiten a propósito ("Local B" antes que "Local A" dentro de cada
 * edificio) para que ordenar por nombre tenga un efecto visible: los
 * hermanos cambian de lugar entre sí, nunca se mezclan con los de otro
 * edificio.
 */
const NOMBRES_EDIFICIO = [
  "Edificio Norte",
  "Edificio Sur",
  "Edificio Centro",
  "Edificio Oriente",
  "Edificio Occidente",
  "Edificio Altavista",
  "Edificio Miraflores",
  "Edificio Belencito",
  "Edificio Laureles",
  "Edificio Provenza",
  "Edificio Manila",
  "Edificio Poblado",
];

function construirActivosPlanos(): Activo[] {
  const filas: Activo[] = [];
  NOMBRES_EDIFICIO.forEach((nombre, indice) => {
    const edificioId = `edificio-${indice + 1}`;
    filas.push({ id: edificioId, nombre, tipo: "edificio", areaM2: 4200 + indice * 180 });

    const zona = nombre.replace("Edificio ", "");
    const localBId = `${edificioId}-local-b`;
    filas.push({ id: localBId, parentId: edificioId, nombre: "Local B", tipo: "local", areaM2: 92 });
    filas.push({
      id: `${localBId}-bodega`,
      parentId: localBId,
      nombre: `Bodega ${zona}`,
      tipo: "sublocal",
      areaM2: 14,
    });

    filas.push({
      id: `${edificioId}-local-a`,
      parentId: edificioId,
      nombre: "Local A",
      tipo: "local",
      areaM2: 78,
    });
  });
  return filas;
}

const activosPlanos = construirActivosPlanos();
const activosArbol = buildTree(activosPlanos);

const TIPO_VARIANT: Record<Activo["tipo"], "default" | "secondary" | "outline"> = {
  edificio: "default",
  local: "secondary",
  sublocal: "outline",
};

/**
 * Enseña el criterio de aceptación explícito de la incidencia #135: búsqueda,
 * orden y paginación **a la vez**, sobre un árbol de tres niveles.
 *
 * - Busca "Bodega" y solo queda esa rama, con sus dos ancestros (el local y
 *   el edificio) visibles y expandidos aunque ellos mismos no casen con el
 *   texto — es `filterFromLeafRows`, no lógica propia.
 * - Ordena por "Área" y los locales cambian de orden entre sí dentro de cada
 *   edificio (nunca se mezclan con los de otro edificio ni con las raíces).
 * - Con `rows={5}` y doce edificios, el paginador reparte por raíz: la
 *   página 1 trae los cinco primeros edificios completos, hijas incluidas
 *   —nunca una familia partida entre dos páginas—.
 */
export const ArbolCompleto: Story = {
  name: "Árbol completo: búsqueda, orden y paginación",
  render: () => (
    <DataTable
      value={activosArbol}
      getSubRows={getSubRows}
      getRowId={getRowId}
      defaultExpandedDepth={1}
      title="Activos inmobiliarios"
      description="Edificio, local y sublocal en la misma tabla, con búsqueda, orden y paginación activos."
      searchable
      searchPlaceholder="Buscar activo…"
      rows={5}
      rowsPerPageOptions={[5, 10, 25]}
    >
      <Column field="nombre" header="Nombre" tree sortable />
      <Column
        field="tipo"
        header="Tipo"
        body={(activo: ActivoArbol) => <Badge variant={TIPO_VARIANT[activo.tipo]}>{activo.tipo}</Badge>}
      />
      <Column
        field="areaM2"
        header="Área (m²)"
        sortable
        align="right"
        body={(activo: ActivoArbol) => activo.areaM2.toLocaleString("es-CO")}
      />
    </DataTable>
  ),
};

/**
 * Enseña la puerta de entrada real de las aplicaciones consumidoras: los
 * datos casi nunca llegan anidados, llegan de una consulta plana con
 * `parentId`. `buildTree` es la única conversión que entiende `DataTable` —
 * no hay una segunda prop para aceptar datos planos directamente—, así que
 * el patrón siempre es `getSubRows={(fila) => fila.children}` sobre el
 * resultado de `buildTree`.
 */
export const DesdeListaPlanaConParentId: Story = {
  name: "Desde lista plana con parentId",
  render: () => {
    const arbol = buildTree(activosPlanos.slice(0, 12));
    return (
      <DataTable
        value={arbol}
        getSubRows={(activo: TreeRow<Activo>) => activo.children}
        getRowId={(activo: TreeRow<Activo>) => activo.id}
        defaultExpandedDepth={Infinity}
        title="Activos inmobiliarios"
        description="Mismos datos que llegarían de una consulta SQL: una lista plana con parentId, convertida con buildTree."
      >
        <Column field="nombre" header="Nombre" tree />
        <Column
          field="tipo"
          header="Tipo"
          body={(activo: TreeRow<Activo>) => <Badge variant={TIPO_VARIANT[activo.tipo]}>{activo.tipo}</Badge>}
        />
      </DataTable>
    );
  },
};

/**
 * Enseña que las acciones por fila —editar, borrar, agregar un hijo— no
 * necesitan ninguna API nueva de jerarquía: se resuelven igual que en una
 * tabla plana, con `body` en una columna de presentación. Los tres botones
 * no hacen nada (`onClick` vacío) porque la lógica de negocio vive en cada
 * aplicación, no aquí.
 */
export const AccionesPorFila: Story = {
  name: "Acciones por fila (editar, borrar, agregar hijo)",
  render: () => (
    <DataTable
      value={buildTree(activosPlanos.slice(0, 8))}
      getSubRows={(activo: TreeRow<Activo>) => activo.children}
      getRowId={(activo: TreeRow<Activo>) => activo.id}
      defaultExpandedDepth={Infinity}
      title="Activos inmobiliarios"
      description="Editar, borrar y agregar hijo se resuelven con body, como en cualquier columna de presentación."
    >
      <Column field="nombre" header="Nombre" tree />
      <Column
        field="tipo"
        header="Tipo"
        body={(activo: TreeRow<Activo>) => <Badge variant={TIPO_VARIANT[activo.tipo]}>{activo.tipo}</Badge>}
      />
      <Column
        id="acciones"
        header="Acciones"
        hideable={false}
        body={(activo: TreeRow<Activo>) => (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Agregar hijo a ${activo.nombre}`}
              onClick={() => {}}
            >
              <FolderPlus />
            </Button>
            <Button variant="ghost" size="icon" aria-label={`Editar ${activo.nombre}`} onClick={() => {}}>
              <Pencil />
            </Button>
            <Button variant="ghost" size="icon" aria-label={`Borrar ${activo.nombre}`} onClick={() => {}}>
              <Trash />
            </Button>
          </div>
        )}
      />
    </DataTable>
  ),
};
