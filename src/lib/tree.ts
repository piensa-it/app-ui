/**
 * Convierte una lista plana con referencia al padre (`parentId`) en una lista
 * anidada — la única forma que `DataTable` entiende para dibujar jerarquía
 * (`getSubRows`). Es la herramienta que resuelve el caso plano: en vez de que
 * `DataTable` acepte dos formas de datos, acepta una sola y esta función
 * puente hace la conversión, probada aparte de cualquier render.
 *
 * Casos de datos sucios — se decide no lanzar nunca, porque una fila con un
 * dato inconsistente no debería tumbar la tabla entera de producción:
 *
 * - **Huérfanas** (`parentId` no apunta a ninguna fila de la lista): se
 *   muestran como raíces. Se prefiere mostrar de más a perder la fila.
 * - **Ciclos** (A es antepasado de B y B es antepasado de A): se cortan en el
 *   punto donde se detectan. La primera vez que se baja por una rama y se
 *   vuelve a encontrar un id ya visitado en esa misma rama, esa arista se
 *   descarta — la fila no se duplica bajo sí misma. Si el ciclo no cuelga de
 *   ninguna raíz alcanzable (ej. A y B solo se referencian entre sí), el
 *   primero de ellos en aparecer en `rows` se promueve a raíz para no perder
 *   el resto del ciclo.
 * - **Ids repetidos**: la primera fila con un id dado gana su lugar en el
 *   árbol; las siguientes filas con el mismo id se descartan por completo
 *   (ni como hijas ni como raíces). Conservarlas produciría dos nodos con el
 *   mismo id — rompe `getRowId` y las claves de React, que dependen de que
 *   cada id sea único.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- fila genérica, igual que `DataTableValue`.
export type TreeSourceRow = Record<string, any>;

export interface BuildTreeOptions<TChildrenKey extends string = "children"> {
  /** Campo que identifica cada fila. @default "id" */
  id?: string;
  /** Campo que referencia al id del padre. @default "parentId" */
  parentId?: string;
  /** Campo donde se colocan las hijas anidadas. @default "children" */
  childrenKey?: TChildrenKey;
}

export type TreeRow<TRow extends TreeSourceRow, TChildrenKey extends string = "children"> = TRow & {
  [K in TChildrenKey]: Array<TreeRow<TRow, TChildrenKey>>;
};

/**
 * Construye un árbol a partir de una lista plana con `parentId`.
 *
 * @example
 * ```ts
 * buildTree(unidades, { id: "id", parentId: "parentId" })
 * // -> [{ ...unidad, children: [{ ...unidad, children: [] }] }]
 * ```
 */
export function buildTree<TRow extends TreeSourceRow, TChildrenKey extends string = "children">(
  rows: readonly TRow[],
  options: BuildTreeOptions<TChildrenKey> = {},
): Array<TreeRow<TRow, TChildrenKey>> {
  const idKey = options.id ?? "id";
  const parentIdKey = options.parentId ?? "parentId";
  const childrenKey = (options.childrenKey ?? "children") as TChildrenKey;

  // 1. Deduplicar por id: la primera aparición gana.
  const byId = new Map<unknown, TRow>();
  for (const row of rows) {
    const id = row[idKey];
    if (id === undefined || id === null) continue;
    if (!byId.has(id)) byId.set(id, row);
  }

  // 2. Agrupar hijas por `parentId` válido. Sin padre válido → raíz.
  const childrenOf = new Map<unknown, TRow[]>();
  const roots: TRow[] = [];
  for (const row of byId.values()) {
    const parentId = row[parentIdKey];
    const hasValidParent =
      parentId !== undefined && parentId !== null && parentId !== row[idKey] && byId.has(parentId);
    if (hasValidParent) {
      const siblings = childrenOf.get(parentId);
      if (siblings) siblings.push(row);
      else childrenOf.set(parentId, [row]);
    } else {
      roots.push(row);
    }
  }
  // Las filas sin id no pueden tener hijas ni ser referenciadas: se muestran
  // igual, como raíces sueltas, en vez de desaparecer.
  for (const row of rows) {
    const id = row[idKey];
    if (id === undefined || id === null) roots.push(row);
  }

  // 3. Bajar desde las raíces cortando ciclos por ruta (no globalmente): la
  // misma fila puede aparecer bajo dos raíces distintas sin que eso sea un
  // ciclo, siempre que no se repita dentro de su propia ascendencia.
  const visited = new Set<unknown>();
  const attach = (row: TRow, ancestry: ReadonlySet<unknown>): TreeRow<TRow, TChildrenKey> => {
    const id = row[idKey];
    visited.add(id);
    const nextAncestry = new Set(ancestry);
    nextAncestry.add(id);
    const children = (childrenOf.get(id) ?? [])
      .filter((child) => !nextAncestry.has(child[idKey]))
      .map((child) => attach(child, nextAncestry));
    return { ...row, [childrenKey]: children } as TreeRow<TRow, TChildrenKey>;
  };

  const tree = roots.map((row) => attach(row, new Set()));

  // 4. Lo que siga sin visitar solo puede ser un ciclo sin entrada desde
  // ninguna raíz (ej. A padre de B y B padre de A, sin nada más apuntándolos).
  // Se promueve a raíz el primero en aparecer en los datos originales, lo que
  // corta el ciclo en ese punto igual que en el paso 3.
  for (const row of rows) {
    const id = row[idKey];
    if (id !== undefined && id !== null && byId.get(id) === row && !visited.has(id)) {
      tree.push(attach(row, new Set()));
    }
  }

  return tree;
}

/**
 * Calcula, replicando el mismo esquema de ids que usa TanStack Table
 * (`getRowId` si se provee; si no, índices unidos por "." como
 * `padre.índice`), qué filas deben partir expandidas para que se vean
 * `depth` niveles de hijas. `depth = Infinity` expande todo — se resuelve
 * aparte con el valor especial `true` que entiende TanStack, sin recorrer el
 * árbol.
 */
export function collectExpandedIds<TRow>(
  rows: readonly TRow[],
  depth: number,
  getSubRows: (row: TRow) => TRow[] | undefined,
  getRowId?: (row: TRow, index: number) => string,
): Record<string, boolean> {
  const expanded: Record<string, boolean> = {};

  const walk = (nodes: readonly TRow[], level: number, parentPath: string) => {
    nodes.forEach((node, index) => {
      const id = getRowId ? getRowId(node, index) : parentPath ? `${parentPath}.${index}` : String(index);
      const children = getSubRows(node);
      if (children && children.length > 0) {
        if (level < depth) expanded[id] = true;
        walk(children, level + 1, id);
      }
    });
  };

  walk(rows, 0, "");
  return expanded;
}

/**
 * Índice bidireccional id↔fila, con el mismo esquema de ids que
 * {@link collectExpandedIds} (`getRowId` si se provee; si no, índices unidos
 * por "." como `padre.índice`) — el que usa TanStack Table internamente.
 *
 * Lo necesita la selección de filas de `DataTable` (#137) para dos
 * traducciones que TanStack no resuelve por sí solo:
 *
 * - `onRowSelectionChange` entrega un mapa `{ [id]: true }` — hay que volver
 *   a la fila completa para `selectionActions` y `onSelectedChange`, que
 *   reciben filas, no ids (ver el porqué en el DocBlock de `selected` en
 *   `data-table.tsx`).
 * - `selected` (controlado) entrega filas — hay que volver al id para
 *   construir el `RowSelectionState` que espera TanStack.
 *
 * `idOf` indexa por identidad de objeto (`Map`, no por valor): asume que las
 * filas que van y vienen por `selected`/`onSelectedChange` son las mismas
 * referencias que trae `value` (o un subconjunto filtrado de ellas), como ya
 * asume el resto de `DataTable` con `columnVisibility` y las demás
 * preferencias derivadas de props.
 */
export function buildRowIndex<TRow>(
  rows: readonly TRow[],
  getSubRows?: (row: TRow) => TRow[] | undefined,
  getRowId?: (row: TRow, index: number) => string,
): { byId: Map<string, TRow>; idOf: Map<TRow, string> } {
  const byId = new Map<string, TRow>();
  const idOf = new Map<TRow, string>();

  const walk = (nodes: readonly TRow[], parentPath: string) => {
    nodes.forEach((node, index) => {
      const id = getRowId ? getRowId(node, index) : parentPath ? `${parentPath}.${index}` : String(index);
      byId.set(id, node);
      idOf.set(node, id);
      const children = getSubRows?.(node);
      if (children && children.length > 0) walk(children, id);
    });
  };

  walk(rows, "");
  return { byId, idOf };
}

/**
 * Busca `query` en `fields` de cada fila del árbol y devuelve los ids —con
 * el mismo esquema que {@link collectExpandedIds}— de las filas que hay que
 * forzar a expandir para que lo encontrado quede visible: los antepasados de
 * cualquier coincidencia, propia o de una descendiente. TanStack no hace
 * esto solo — su `filterFromLeafRows` decide qué filas *sobreviven* al
 * filtro, no cuáles se ven expandidas.
 */
export function collectSearchExpandedIds<TRow>(
  rows: readonly TRow[],
  query: string,
  fields: readonly string[],
  getSubRows: (row: TRow) => TRow[] | undefined,
  getRowId?: (row: TRow, index: number) => string,
): Record<string, boolean> {
  const normalizedQuery = query.trim().toLowerCase();
  const expanded: Record<string, boolean> = {};
  if (!normalizedQuery || fields.length === 0) return expanded;

  const rowMatches = (row: TRow): boolean =>
    fields.some((field) => String((row as TreeSourceRow)[field] ?? "").toLowerCase().includes(normalizedQuery));

  // Devuelve si el propio nodo o alguna descendiente casa con la búsqueda.
  const walk = (nodes: readonly TRow[], parentPath: string): boolean => {
    let anyMatch = false;
    nodes.forEach((node, index) => {
      const id = getRowId ? getRowId(node, index) : parentPath ? `${parentPath}.${index}` : String(index);
      const children = getSubRows(node) ?? [];
      const childMatch = children.length > 0 ? walk(children, id) : false;
      if (childMatch) expanded[id] = true;
      if (rowMatches(node) || childMatch) anyMatch = true;
    });
    return anyMatch;
  };

  walk(rows, "");
  return expanded;
}
