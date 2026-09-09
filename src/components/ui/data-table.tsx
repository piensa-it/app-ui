import * as React from "react";
import {
  useTable,
  tableFeatures,
  columnFilteringFeature,
  columnVisibilityFeature,
  globalFilteringFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSortingFeature,
  createExpandedRowModel,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  flexRender,
  type ColumnDef,
  type ColumnVisibilityState,
  type ExpandedState,
  type SortingState,
  type Updater,
} from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { focusRingOutside } from "@/lib/recipes/focus";
import { Pagination } from "@/components/ui/pagination";
import { DataTableToolbar, type DataTableDensity } from "@/components/ui/data-table-toolbar";
import { readTablePrefs, usePersistTablePrefs, useExpandedPreference } from "@/components/ui/data-table-preferences";
import { collectExpandedIds, collectSearchExpandedIds } from "@/lib/tree";

/**
 * Desde la v9 de TanStack Table las features ya no vienen incluidas: hay que
 * registrar explícitamente las que se usan, junto con los row models y las
 * funciones de orden/filtro que antes se resolvían solas. Se declara a nivel de
 * módulo —no dentro del componente— para que la identidad del objeto sea
 * estable entre renders.
 */
const dataTableFeatures = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  globalFilteringFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  expandedRowModel: createExpandedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns: { includesString: filterFn_includesString },
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    basic: sortFn_basic,
    datetime: sortFn_datetime,
    text: sortFn_text,
  },
});

/** Tipo de las features registradas — lo necesita `data-table-toolbar.tsx` para tipar la tabla que recibe. */
export type DataTableFeatures = typeof dataTableFeatures;

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- fila genérica, igual que el `DataTableValue` anterior sobre PrimeReact.
export type DataTableValue = Record<string, any>;

/** Lo que `DataTable` guarda en `meta` de cada columna de TanStack. */
interface ColumnMeta<TValue extends DataTableValue> {
  className?: string;
  headerClassName?: string;
  ariaLabel?: string;
  footer?: (rows: TValue[]) => React.ReactNode;
}

const ALIGNMENTS = {
  left: "",
  center: "text-center",
  // Las cifras se comparan en vertical: alineadas a la derecha y de ancho fijo.
  right: "text-right tabular-nums",
} as const;

interface ColumnBase<TValue extends DataTableValue> {
  header: React.ReactNode;
  sortable?: boolean;
  /** Permite ocultar la columna desde el configurador. @default true */
  hideable?: boolean;
  /** Estado inicial antes de aplicar preferencias persistidas. @default true */
  defaultVisible?: boolean;
  /** Contenido personalizado de la celda. Si se omite, se muestra el valor crudo del campo. */
  body?: (row: TValue) => React.ReactNode;
  /**
   * Alineación de la columna. `right` añade además cifras de ancho fijo
   * (`tabular-nums`), sin las cuales los dígitos bailan de una fila a otra y
   * las cantidades dejan de poder compararse de un vistazo.
   * @default "left"
   */
  align?: "left" | "center" | "right";
  /**
   * Contenido del pie de la columna, para una fila de totales. Recibe **todas**
   * las filas que quedan tras filtrar, no solo las de la página visible: un
   * arqueo suma el periodo entero, no la página.
   *
   * Basta con que una columna lo declare para que la tabla dibuje el pie.
   */
  footer?: (rows: TValue[]) => React.ReactNode;
  /** Clases aplicadas al `<th>` y a cada `<td>` de la columna (ej. `text-right` para cifras). */
  className?: string;
  /** Clases solo para el `<th>`. Si se omite, el encabezado hereda `className`. */
  headerClassName?: string;
  /**
   * Marca la columna que lleva la sangría y el control de expandir en una
   * tabla jerárquica (con `getSubRows`). Sin efecto si `DataTable` no está en
   * modo jerárquico. Si más de una columna la marca, gana la primera.
   */
  tree?: boolean;
}

/**
 * Una columna es de una de tres clases, y la identidad no es lo mismo que el
 * origen del dato:
 *
 * - **De campo**: lee un campo de la fila. Se puede ordenar y buscar por ella.
 *   Anota el tipo (`<Column<Movimiento> field="valor" />`) para que un campo
 *   mal escrito sea un error de compilación y no una columna vacía.
 * - **Calculada**: no lee un campo sino que lo calcula —una etiqueta
 *   traducida, dos campos concatenados, una longitud—. Se identifica con `id`
 *   y ordena/busca por lo que devuelva `accessor`, no por ningún campo crudo.
 *   `body` es opcional: sin él se pinta lo que devuelva `accessor`.
 * - **De presentación**: no corresponde a ningún campo ni tiene por qué
 *   ordenarse —acciones de fila, por ejemplo—. Se identifica con `id` y pinta
 *   con `body`.
 */
export type ColumnProps<TValue extends DataTableValue> = ColumnBase<TValue> &
  (
    | {
        /** Campo de la fila a mostrar. */
        field: keyof TValue & string;
        /** Identidad de la columna. Por defecto, el propio campo. Úsalo para tener dos columnas del mismo campo. */
        id?: string;
        /**
         * No tiene sentido junto a `field`: `body` ya cubre la pintura y el
         * `cell` de respaldo lee `getValue()`, que es el propio campo. Un
         * `field` que gana un `accessor` a medio migrar sortearía y buscaría
         * por otra cosa que la que su nombre sugiere — se prohíbe en el tipo
         * para que sea un error de compilación, no una sorpresa en pantalla.
         */
        accessor?: undefined;
      }
    | {
        field?: undefined;
        /** Identidad de la columna. Obligatoria cuando no hay campo. */
        id: string;
        /**
         * De dónde sale el valor por el que se ordena y se busca, cuando no
         * es un campo de la fila: una etiqueta traducida, dos campos
         * concatenados, una longitud, un booleano como número.
         *
         * Es lo que hace ordenable una columna que no tiene `field`. Ordenar
         * por `estado` cuando en la fila pone `"sent"` y en pantalla
         * «Enviado» ordena por la palabra que el usuario ve, que es la que
         * espera. Funciona igual dentro de una tabla jerárquica
         * (`getSubRows`): TanStack ordena entre hermanos del mismo nivel sin
         * aplanar el árbol, y `accessor` sólo decide de dónde sale el valor.
         *
         * Límite conocido: la búsqueda en una tabla jerárquica fuerza a
         * expandir los ancestros de una coincidencia mirando los campos
         * crudos de la fila, no accessors calculados — una columna sin
         * `field` no participa en ese forzado, aunque su valor calculado sí
         * entra en el filtro global normal (`getValue()`).
         */
        accessor: (row: TValue) => unknown;
        /**
         * Sin `body`, la celda pinta lo que devuelva `accessor`, convertido a
         * texto (`String(...)`). Vale para una etiqueta, un número, una
         * fecha ya formateada — no para un objeto ni un arreglo: eso pinta
         * literalmente `[object Object]` sin ningún error que lo delate. Si
         * `accessor` devuelve algo que no es ya texto plano, pon `body`.
         */
        body?: (row: TValue) => React.ReactNode;
      }
    | {
        field?: undefined;
        /** Identidad de la columna. Obligatoria cuando no hay campo. */
        id: string;
        accessor?: undefined;
        /** Una columna sin campo tiene que pintar algo. */
        body: (row: TValue) => React.ReactNode;
      }
  );

/**
 * Marcador de columna — no se renderiza directamente. `DataTable` recorre
 * sus hijos `Column` para construir las `ColumnDef` de TanStack Table.
 */
function Column<TValue extends DataTableValue>(_props: ColumnProps<TValue>): null {
  return null;
}

/**
 * Si una columna acepta orden: tiene de dónde leer un valor —`field` o
 * `accessor`— y lo pidió con `sortable`. Una sola definición para que
 * `idsOrdenables` y `enableSorting` (en `columnDefs`) nunca puedan volver a
 * decir cosas distintas — ya ocurrió una vez, cuando `accessor` llegó y solo
 * uno de los dos se actualizó.
 */
const esOrdenable = <TValue extends DataTableValue>(props: ColumnProps<TValue>): boolean =>
  Boolean(props.field || props.accessor) && (props.sortable ?? false);

export interface DataTableProps<TValue extends DataTableValue> {
  value: TValue[];
  /** Elementos `Column` que definen las columnas de la tabla. */
  children?: React.ReactNode;
  /**
   * `true` muestra siempre el pie de paginación, `false` lo omite y muestra
   * todas las filas, `"auto"` lo muestra solo cuando hay más filas que `rows`.
   * @default "auto"
   */
  paginator?: boolean | "auto";
  rows?: number;
  rowsPerPageOptions?: number[];
  emptyMessage?: React.ReactNode;
  /** Nombre accesible de la tabla cuando no se muestra un caption visible. */
  "aria-label"?: string;
  /** Caption visible que describe el conjunto de datos. */
  caption?: React.ReactNode;
  title?: React.ReactNode;
  /**
   * Etiqueta con la que se pinta `title`. `"div"` por defecto para no
   * inventar estructura donde la pantalla no la pidió; una pantalla que
   * encabeza una sección con la tabla pasa el nivel que le toca.
   */
  titleAs?: "h2" | "h3" | "h4" | "div";
  description?: React.ReactNode;
  actions?: React.ReactNode;
  searchable?: boolean;
  searchPlaceholder?: string;
  /**
   * Nombre accesible del buscador. Antes de este prop el `aria-label` estaba
   * fijo a «Buscar en la tabla»: todas las pantallas anunciaban el mismo
   * nombre y una prueba de extremo a extremo no tenía forma de distinguir un
   * buscador de otro cuando había más de uno en pantalla.
   *
   * Es independiente de `searchPlaceholder` y no cae a su valor: si se fija
   * el placeholder sin fijar este prop, el campo muestra un texto pero
   * anuncia otro —hay que poner los dos a la vez.
   */
  searchLabel?: string;
  loading?: boolean;
  /** Densidad vertical de las filas. @default "default" */
  density?: "compact" | "default" | "comfortable";
  /** Alterna un fondo sutil entre filas. */
  striped?: boolean;
  /** Muestra el configurador de columnas en la barra superior. */
  configurableColumns?: boolean;
  /**
   * Clave de localStorage para recordar, por tabla, las columnas visibles,
   * la expansión (en modo jerárquico), el tamaño de página y el orden.
   */
  preferencesKey?: string;
  /** Notifica cambios para persistencia externa en perfiles de usuario. */
  onColumnVisibilityChange?: (visibility: Record<string, boolean>) => void;
  className?: string;
  /**
   * Identidad estable de cada fila. Sin él, TanStack usa el índice, que cambia
   * al ordenar o filtrar. **Requisito**, no mejora, en modo jerárquico: sin
   * ids estables la expansión se guarda contra la fila equivocada en cuanto
   * se ordena, filtra o cambia de página. También lo es, en la práctica, junto
   * a `renderExpanded`: sin él la fila abierta se identifica por la posición
   * de TanStack y salta de registro si el padre vuelve a renderizar con
   * `value` en otro orden.
   *
   * Cuando se pasa, cada `<tr>` de datos lleva además `data-row-id` con el
   * id devuelto. Sin `getRowId` el atributo no se emite: un «row-id» con el
   * índice posicional de TanStack dentro invitaría a un selector que
   * funciona hasta el día que la tabla se ordena o filtra.
   */
  getRowId?: (row: TValue, index: number) => string;
  /**
   * Qué hacer al activar una fila. Con ella la fila se vuelve enfocable y
   * responde a Enter y Espacio, no sólo al ratón.
   *
   * Los clics nacidos dentro de un control de la fila —un botón de acciones,
   * un enlace, una casilla, el chevron de expandir de una fila jerárquica—
   * NO la disparan: pulsar «Eliminar» no puede abrir además el detalle, y
   * expandir un nodo del árbol no puede además activar `onRowClick`.
   */
  onRowClick?: (row: TValue) => void;
  /**
   * Detalle en línea bajo la fila. Cuando se pasa, la tabla añade al
   * principio una columna estrecha con el botón que lo abre y lo cierra.
   *
   * Por defecto se despliega una fila cada vez: abrir otra repliega la
   * anterior. Dos detalles abiertos a la vez convierten la tabla en una
   * lista y se pierde la comparación entre filas, que es para lo que existe
   * una tabla — ver `multiple` para el caso en que esa comparación es
   * justamente el trabajo de la pantalla.
   *
   * La fila abierta se rastrea por `row.id`, así que este prop va emparejado
   * con `getRowId`. Sin él, `row.id` es la posición de TanStack, no una
   * identidad: ordenar desde el encabezado de columna es seguro —reordena
   * la vista, no el arreglo `data`—, pero si el padre vuelve a renderizar con
   * `value` en otro orden (una recarga que trae los mismos registros
   * reordenados), el detalle abierto se queda en la posición y termina
   * mostrando otro registro. En desarrollo, usarlo sin `getRowId` deja un
   * aviso en consola.
   *
   * **Convive con la jerarquía** (`getSubRows`): son dos mecanismos
   * independientes —estado propio, columna propia— y no se pisan. Una fila
   * del árbol, tenga o no hijas, puede llevar además su detalle desplegable;
   * expandir el nodo no abre el detalle, ni al revés.
   */
  renderExpanded?: (row: TValue) => React.ReactNode;
  /**
   * Permite tener varias filas desplegadas a la vez.
   *
   * Por defecto NO: `renderExpanded` cierra la fila anterior al abrir otra,
   * porque dos detalles abiertos convierten la tabla en una lista y se
   * pierde la comparación entre filas, que es para lo que existe una tabla.
   *
   * Se enciende cuando comparar dos detalles ES el trabajo de la pantalla:
   * los ítems de dos categorías, los clientes de dos segmentos, dos vistas
   * previas de lista de precios, uno junto al otro.
   */
  multiple?: boolean;
  /**
   * Accessor a las hijas de una fila (ej. `(fila) => fila.children`).
   * **Activa el modo jerárquico** — sin esta prop, `DataTable` se comporta
   * exactamente igual que antes de que existiera la jerarquía. `DataTable`
   * solo entiende datos ya anidados; el caso plano con `parentId` se resuelve
   * aparte con `buildTree`.
   */
  getSubRows?: (row: TValue) => TValue[] | undefined;
  /**
   * Profundidad expandida por defecto cuando no hay nada persistido ni
   * controlado — `0` no expande nada, `Infinity` expande el árbol entero.
   * Solo fija el estado **inicial**; no vuelve a aplicarse si cambia después
   * de montar la tabla. @default 0
   */
  defaultExpandedDepth?: number;
  /** Estado de expansión controlado. Sin esta prop, `DataTable` lo gestiona internamente (y lo persiste si hay `preferencesKey`). */
  expanded?: ExpandedState;
  /** Notifica cambios de expansión, se use o no de forma controlada. */
  onExpandedChange?: (expanded: ExpandedState) => void;
}

/**
 * Tabla de datos sobre TanStack Table (headless): paginación y orden
 * incluidos, con el tema Tailwind de la librería. Úsala junto a `Column`
 * para definir las columnas — la lógica de tabla no viene acoplada a
 * ninguna dependencia de UI, TanStack Table solo calcula filas/orden/página.
 *
 * @example
 * ```tsx
 * <DataTable value={usuarios} rows={10}>
 *   <Column field="nombre" header="Nombre" sortable />
 *   <Column field="email" header="Correo" />
 * </DataTable>
 * ```
 */
function DataTable<TValue extends DataTableValue>({
  value,
  children,
  paginator = "auto",
  rows = 10,
  rowsPerPageOptions = [10, 25, 50],
  emptyMessage = "No hay datos para mostrar.",
  "aria-label": ariaLabel = "Tabla de datos",
  caption,
  title,
  titleAs = "div",
  description,
  actions,
  searchable = false,
  searchPlaceholder = "Buscar en la tabla…",
  searchLabel = "Buscar en la tabla",
  loading = false,
  density = "default",
  striped = false,
  configurableColumns = false,
  preferencesKey,
  onColumnVisibilityChange,
  className,
  getRowId,
  onRowClick,
  renderExpanded,
  multiple = false,
  getSubRows,
  defaultExpandedDepth = 0,
  expanded: controlledExpanded,
  onExpandedChange,
}: DataTableProps<TValue>) {
  // `getSubRows` es el interruptor: sin él nada de lo que sigue en este
  // componente se activa, y el render es el mismo de antes de la jerarquía.
  const isHierarchical = typeof getSubRows === "function";

  // Lee las preferencias persistidas de esta tabla una sola vez al montar
  // — un `useState` con inicializador perezoso ignora `readTablePrefs` en
  // renders posteriores, que es lo que se quiere: la tabla no debe releer
  // `localStorage` por su cuenta mientras el usuario interactúa con ella.
  const [prefsIniciales] = React.useState(() => readTablePrefs(preferencesKey));

  const [sorting, setSorting] = React.useState<SortingState>(prefsIniciales.sort ?? []);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: prefsIniciales.pageSize ?? rows,
  });
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [activeDensity, setActiveDensity] = React.useState<DataTableDensity>(density);
  // Un `Set` en vez de un solo `string | null`: `multiple` es lo único que
  // cambia entre abrir una fila y abrir varias, así que basta con decidir,
  // al abrir, si se vacía el resto del set o no — el caso de una sola fila
  // (`multiple` en false) nunca llega a tener más de un elemento.
  const [filasAbiertas, setFilasAbiertas] = React.useState<Set<string>>(() => new Set());
  // Prefijo para el `id` del `<td>` del detalle: único por instancia de
  // `DataTable`, para que dos tablas en la misma pantalla no compartan
  // identificadores.
  const detalleIdBase = React.useId();

  // Aviso de una sola vez al montar (no en cada render): `renderExpanded` sin
  // `getRowId` rastrea la fila abierta por la posición de TanStack, no por su
  // identidad. Ver el JSDoc de `renderExpanded` para el porqué. Se recorta en
  // producción igual que hace `@tanstack/table-core` con sus propios avisos.
  const avisoDisparado = React.useRef(false);
  React.useEffect(() => {
    if (avisoDisparado.current) return;
    if (process.env.NODE_ENV === "production") return;
    if (!renderExpanded || getRowId) return;
    avisoDisparado.current = true;
    console.warn(
      "DataTable: `renderExpanded` sin `getRowId` rastrea la fila abierta por la posición de TanStack, no por su identidad. " +
        "Ordenar desde el encabezado de columna es seguro, pero si el padre vuelve a renderizar con `value` en otro orden " +
        "(p. ej. una recarga que trae los mismos registros reordenados), el detalle abierto se queda en la posición y termina " +
        "mostrando otro registro. Pasa `getRowId` a `DataTable` para evitarlo.",
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deliberadamente solo al montar, ver el comentario de arriba.
  }, []);

  const columnSpecs = React.useMemo(
    () =>
      React.Children.toArray(children).filter(
        (child): child is React.ReactElement<ColumnProps<TValue>> =>
          React.isValidElement(child) && child.type === Column,
      ),
    [children],
  );

  const defaultVisibility = React.useMemo<ColumnVisibilityState>(
    () =>
      Object.fromEntries(
        columnSpecs.map((spec) => [spec.props.id ?? spec.props.field, spec.props.defaultVisible !== false]),
      ),
    [columnSpecs],
  );
  const [columnVisibility, setColumnVisibility] = React.useState<ColumnVisibilityState>(() => ({
    ...defaultVisibility,
    ...(prefsIniciales.columns ?? {}),
  }));

  // Estado inicial cuando no hay nada persistido ni controlado: solo se
  // evalúa una vez, dentro del `useState` perezoso de `useExpandedPreference`
  // — `defaultExpandedDepth` fija el arranque, no se reaplica después.
  const computeDefaultExpanded = React.useCallback((): ExpandedState => {
    if (!isHierarchical) return {};
    if (defaultExpandedDepth === Infinity) return true;
    if (defaultExpandedDepth <= 0) return {};
    return collectExpandedIds(value, defaultExpandedDepth, getSubRows!, getRowId);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deliberadamente solo se usa como valor inicial, no se re-ejecuta ante cambios posteriores.
  }, []);
  const [realExpanded, setRealExpanded, isExpandedControlled] = useExpandedPreference(
    controlledExpanded,
    onExpandedChange,
    () => prefsIniciales.expanded ?? computeDefaultExpanded(),
  );

  // Columnas con campo: son las únicas por las que se puede buscar (mismo
  // criterio que usa TanStack para decidir qué columnas son "globalmente
  // filtrables" por defecto).
  const searchableFields = React.useMemo(
    () => columnSpecs.filter((spec) => spec.props.field).map((spec) => spec.props.field as string),
    [columnSpecs],
  );

  // TanStack decide qué filas *sobreviven* al filtro (`filterFromLeafRows`),
  // no cuáles se ven expandidas — lo que casa con la búsqueda tiene que
  // forzarse a mano. Se calcula aparte de `realExpanded` para no persistir
  // una expansión que solo existe mientras dura la búsqueda.
  const searchExpandedIds = React.useMemo(() => {
    if (!isHierarchical || !globalFilter.trim()) return null;
    return collectSearchExpandedIds(value, globalFilter, searchableFields, getSubRows!, getRowId);
  }, [isHierarchical, globalFilter, value, searchableFields, getSubRows, getRowId]);

  const effectiveExpanded = React.useMemo<ExpandedState>(() => {
    if (!searchExpandedIds || realExpanded === true) return realExpanded;
    return { ...searchExpandedIds, ...realExpanded };
  }, [realExpanded, searchExpandedIds]);

  const handleExpandedChange = React.useCallback(
    (updater: Updater<ExpandedState>) => {
      const next = typeof updater === "function" ? updater(effectiveExpanded) : updater;
      if (next === true || !searchExpandedIds) {
        setRealExpanded(next);
        return;
      }
      // No se persiste lo que abrió la búsqueda — salvo que se haya tocado a
      // mano, y entonces sí manda sobre el forzado. Colapsar una fila borra
      // su clave del mapa (no la deja en `false`): hay que detectar esa
      // ausencia aparte, comparando contra las claves que la búsqueda forzó,
      // y guardar el `false` explícito nosotros — si no, en el siguiente
      // render la búsqueda la vuelve a forzar a abrir.
      const withoutSearchDefaults: Record<string, boolean> = {};
      for (const id of Object.keys(searchExpandedIds)) {
        if (!(id in next)) withoutSearchDefaults[id] = false;
      }
      for (const [id, isExpanded] of Object.entries(next)) {
        if (searchExpandedIds[id] && isExpanded === true) continue;
        withoutSearchDefaults[id] = isExpanded;
      }
      setRealExpanded(withoutSearchDefaults);
    },
    [effectiveExpanded, searchExpandedIds, setRealExpanded],
  );

  // IDs de columna que aceptan orden: `esOrdenable`, la misma que arma
  // `enableSorting` más abajo en `columnDefs`. Sin ella aquí, un orden
  // persistido sobre una columna calculada se descartaría en cada recarga
  // como si la columna no existiera —el mismo síntoma que resuelve
  // `sortingEfectivo` para una columna oculta, pero por la razón equivocada—.
  const idsOrdenables = React.useMemo(
    () =>
      new Set(
        columnSpecs
          .filter((spec) => esOrdenable(spec.props))
          .map((spec) => (spec.props.id ?? spec.props.field) as string),
      ),
    [columnSpecs],
  );

  // Un orden sobre una columna que está oculta (o que ya no admite orden) se
  // descarta al derivarlo, no con estado propio — ver el detalle en el
  // historial del componente. `sortingEfectivo` (no `sorting`) es lo que ve
  // la tabla y lo que se persiste.
  const sortingEfectivo = React.useMemo(
    () => sorting.filter((criterio) => idsOrdenables.has(criterio.id) && columnVisibility[criterio.id] !== false),
    [sorting, idsOrdenables, columnVisibility],
  );

  // Una sola escritura para las cuatro preferencias, bajo la clave nueva.
  usePersistTablePrefs(
    preferencesKey,
    { columns: columnVisibility, expanded: realExpanded, pageSize: pagination.pageSize, sort: sortingEfectivo },
    isExpandedControlled,
  );

  const columnDefs = React.useMemo<Array<ColumnDef<typeof dataTableFeatures, TValue>>>(() => {
    const treeSpecIndex = isHierarchical ? columnSpecs.findIndex((spec) => spec.props.tree) : -1;
    return columnSpecs.map((spec, index) => ({
      // Uno de los dos existe siempre: el tipo de `ColumnProps` exige `id`
      // cuando no hay `field`.
      id: (spec.props.id ?? spec.props.field) as string,
      // Dos casos mutuamente excluyentes, no una prioridad: el tipo de
      // `ColumnProps` ya prohíbe declarar `field` y `accessor` a la vez, así
      // que nunca hay que decidir cuál gana.
      ...(spec.props.accessor
        ? { accessorFn: (row: TValue) => spec.props.accessor!(row) }
        : spec.props.field
          ? { accessorKey: spec.props.field }
          : {}),
      header: () => spec.props.header,
      enableSorting: esOrdenable(spec.props),
      enableHiding: spec.props.hideable ?? true,
      cell: (ctx) => {
        const content = spec.props.body ? spec.props.body(ctx.row.original) : String(ctx.getValue() ?? "");
        if (index !== treeSpecIndex) return content;
        const row = ctx.row;
        const canExpand = row.getCanExpand();
        const rowLabel = spec.props.field ? String(ctx.row.original[spec.props.field] ?? "") : `fila ${row.id}`;
        return (
          <span className="flex items-center gap-1.5" style={{ paddingLeft: `${row.depth * 1.5}rem` }}>
            {canExpand ? (
              <button
                type="button"
                onClick={row.getToggleExpandedHandler()}
                aria-label={row.getIsExpanded() ? `Colapsar ${rowLabel}` : `Expandir ${rowLabel}`}
                className={cn(
                  "inline-flex size-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                  focusRingOutside,
                )}
              >
                <ChevronRight
                  aria-hidden="true"
                  className={cn("size-4 transition-transform duration-fast", row.getIsExpanded() && "rotate-90")}
                />
              </button>
            ) : (
              <span aria-hidden="true" className="inline-block size-5 shrink-0" />
            )}
            <span className="min-w-0 truncate">{content}</span>
          </span>
        );
      },
      meta: {
        // La alineación va primero para que `className` pueda anularla.
        className: cn(ALIGNMENTS[spec.props.align ?? "left"], spec.props.className),
        headerClassName: cn(
          ALIGNMENTS[spec.props.align ?? "left"],
          spec.props.headerClassName ?? spec.props.className,
        ),
        footer: spec.props.footer,
        ariaLabel:
          typeof spec.props.header === "string" ? spec.props.header : (spec.props.id ?? spec.props.field),
      },
    }));
  }, [columnSpecs, isHierarchical]);

  // Con `paginator` desactivado ya no se puede omitir el row model de
  // paginación: en la v9 las features son estáticas. Se deja registrada y se
  // fuerza una sola página que abarca todas las filas — mismo resultado
  // visible que antes daba no registrar el row model.
  const effectivePagination = React.useMemo(
    () => (paginator ? pagination : { pageIndex: 0, pageSize: Math.max(value.length, 1) }),
    [paginator, pagination, value.length],
  );

  const table = useTable({
    features: dataTableFeatures,
    data: value,
    columns: columnDefs,
    state: {
      // La tabla ve `sortingEfectivo`, no el `sorting` crudo: así un clic de
      // encabezado (que decide asc/desc/ninguno leyendo el estado actual de
      // la tabla) nunca parte de un criterio fantasma sobre una columna
      // oculta.
      sorting: sortingEfectivo,
      pagination: effectivePagination,
      globalFilter,
      columnVisibility,
      ...(isHierarchical ? { expanded: effectiveExpanded } : {}),
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: (updater) => {
      setColumnVisibility((current) => {
        const next = typeof updater === "function" ? updater(current) : updater;
        onColumnVisibilityChange?.(next);
        return next;
      });
    },
    // Solo se pasa cuando viene: sin él, TanStack sigue identificando filas
    // por índice, igual que antes de que existiera esta prop.
    ...(getRowId ? { getRowId } : {}),
    // Todo lo de abajo solo se activa en modo jerárquico — en plano, ni
    // siquiera se le pasan estas opciones a TanStack, así que nada cambia.
    ...(isHierarchical
      ? {
          getSubRows,
          onExpandedChange: handleExpandedChange,
          // «parent rows will be included so long as one of their child or
          // grand-child rows is also included» — resuelve buscar sin romper
          // el árbol.
          filterFromLeafRows: true,
          // «expanded rows will always render on their parent's page» —
          // resuelve paginar por raíces sin partir familias.
          paginateExpandedRows: false,
        }
      : {}),
  });

  // Las filas que quedan tras filtrar, en su orden actual: es lo que recibe el
  // pie de totales.
  const filteredRows = React.useMemo(
    () => table.getFilteredRowModel().rows.map((row) => row.original),
    [table, globalFilter, value, sortingEfectivo],
  );
  const hasFooter = columnSpecs.some((spec) => spec.props.footer);
  const totalRows = table.getFilteredRowModel().rows.length;
  const pageCount = table.getPageCount();
  const showPaginator = paginator === true || (paginator === "auto" && totalRows > pagination.pageSize);
  const cellPadding = {
    compact: "px-4 py-2",
    default: "px-4 py-3",
    comfortable: "px-4 py-4",
  }[activeDensity];

  /*
   * `target` nunca se comprueba con `instanceof Element`/`instanceof Node`:
   * un portal puede montar en otro documento (otra ventana, un iframe), y ahí
   * la clase `Element` no es la misma que la de este realm — `instanceof`
   * daría `false` para un elemento perfectamente real. Comprobar que tiene
   * forma de elemento (`closest` como función) funciona en cualquier realm.
   */
  const comoElemento = (target: EventTarget | null): Element | null =>
    target && typeof (target as Element).closest === "function" ? (target as Element) : null;

  /*
   * El kebab de acciones de una fila (`MenuTrigger` + `MenuContent`) pinta su
   * `MenuItem` en un `Portal`, igual que `Select` — en el DOM ese ítem cuelga
   * de `document.body`, no del `<tr>`. `closest()` viaja por el DOM: un clic
   * en «Eliminar» no encuentra ningún control camino arriba y se cuela como
   * clic de fila, así que un solo click borraba la fila Y abría su detalle.
   * React sí entrega el evento al `onClick` del `<tr>` porque su árbol de
   * bubbling es el de React, no el del DOM — por eso el primer filtro no es
   * "¿hay un control en el camino?" sino "¿el clic nació siquiera dentro de
   * este `<tr>`?": si no, es de un portal y no es de la fila. Aplica igual al
   * `onKeyDown`: un Enter sobre un ítem de menú portado también burbujea por
   * el árbol de React hasta la fila. El chevron de expandir del árbol NO
   * pasa por este filtro —nace dentro del `<tr>`, no está portado— y se
   * detiene en el siguiente: es un `<button>` real.
   */
  const naceFueraDeLaFila = (currentTarget: HTMLTableRowElement, target: EventTarget | null) => {
    const element = comoElemento(target);
    return !element || !currentTarget.contains(element);
  };

  /*
   * Ya dentro de la fila, un control real tampoco la dispara — por dos
   * mecanismos distintos, que llegan al mismo `label` en la lista:
   *
   * - `RadioGroupItem` (radio-group.tsx) deja su `<input>` real recortado a
   *   1px (`peer sr-only`, sin geometría): en producción el clic siempre
   *   aterriza en el `<label>` que envuelve el círculo, o en su texto —
   *   nunca en el input.
   * - `Switch`/`Checkbox` sí cubren el control entero (hidden-input.ts: el
   *   input al 100% de ancho/alto, `clip: auto`), así que en un navegador
   *   real el clic cae en ese input aunque el usuario apunte al texto. Pero
   *   Testing Library no hace ese cálculo de superposición: `getByText`
   *   dispara el clic directo sobre el `<span>` que encontró, sin pasar por
   *   el input que lo cubre — el mismo hueco, solo que producido por la
   *   herramienta de prueba y no por el navegador.
   *
   * El botón de expandir del árbol y el de `renderExpanded` son `<button>`
   * simples: entran por el selector sin necesitar caso propio.
   */
  const naceEnUnControl = (target: EventTarget | null) => {
    const element = comoElemento(target);
    return Boolean(element?.closest("button, a, input, select, textarea, label, [role='button'], [role='checkbox']"));
  };

  return (
    <div className={cn("w-full overflow-hidden rounded-lg border border-raised-border bg-card shadow-sm", className)}>
      {title || description || actions || searchable || configurableColumns ? (
        <DataTableToolbar
          title={title}
          titleAs={titleAs}
          description={description}
          actions={actions}
          searchable={searchable}
          searchPlaceholder={searchPlaceholder}
          searchLabel={searchLabel}
          configurableColumns={configurableColumns}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          table={table}
          activeDensity={activeDensity}
          onActiveDensityChange={setActiveDensity}
          defaultVisibility={defaultVisibility}
          setColumnVisibility={setColumnVisibility}
          onColumnVisibilityChange={onColumnVisibilityChange}
        />
      ) : null}
      <div className="overflow-x-auto">
        <table aria-label={caption ? undefined : ariaLabel} className="w-full border-collapse text-sm">
          {caption ? <caption className="px-4 py-3 text-left font-medium">{caption}</caption> : null}
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border bg-muted/50">
                {renderExpanded ? (
                  <th className="w-14 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {/* La celda del cuerpo trae un botón enfocable: un `<th>`
                        con `aria-hidden` deja esa columna sin encabezado para
                        quien navega celda por celda con lector de pantalla.
                        `sr-only` la mantiene fuera de la vista sin sacarla del
                        árbol de accesibilidad. */}
                    <span className="sr-only">Detalle</span>
                  </th>
                ) : null}
                {headerGroup.headers.map((header) => {
                  const sortDir = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      aria-sort={
                        sortDir === "asc" ? "ascending" : sortDir === "desc" ? "descending" : "none"
                      }
                      className={cn(
                        "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground",
                        (header.column.columnDef.meta as { headerClassName?: string } | undefined)?.headerClassName,
                      )}
                    >
                      {header.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className={cn(
                            "inline-flex min-h-8 items-center gap-1.5 rounded-sm text-left",
                            // Preflight resetea `button { text-transform: none }`; sin esto el
                            // encabezado ordenable pierde las mayúsculas del <th>.
                            "uppercase",
                            "transition-colors duration-fast hover:text-foreground",
                            focusRingOutside,
                          )}
                          aria-label={`Ordenar por ${
                            (header.column.columnDef.meta as { ariaLabel?: string } | undefined)?.ariaLabel ?? header.id
                          }`}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sortDir === "asc" ? (
                            <ArrowUp aria-hidden="true" className="h-3.5 w-3.5" />
                          ) : sortDir === "desc" ? (
                            <ArrowDown aria-hidden="true" className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowUpDown aria-hidden="true" className="h-3.5 w-3.5 opacity-40" />
                          )}
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: Math.min(rows, 5) }).map((_, rowIndex) => (
                <tr key={`loading-${rowIndex}`} className="border-b border-border last:border-0">
                  {renderExpanded ? <td className={cellPadding} /> : null}
                  {table.getVisibleLeafColumns().map((column, columnIndex) => (
                    <td key={`${column.id ?? columnIndex}`} className={cellPadding}>
                      <div className={cn("h-4 animate-pulse rounded bg-muted", columnIndex === 0 ? "w-3/5" : columnIndex % 2 ? "w-4/5" : "w-2/5")} />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={table.getVisibleLeafColumns().length + (renderExpanded ? 1 : 0)}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, rowIndex) => {
                const abierta = filasAbiertas.has(row.id);
                // No se asume ningún campo (p. ej. `nombre`) en un `TValue`
                // arbitrario: la posición en pantalla es lo único que la
                // tabla conoce de toda fila, así que es lo que distingue un
                // botón «Desplegar» del de al lado para quien navega con
                // lector de pantalla. A propósito distinto de `filasAbiertas`
                // (identidad de dato, `row.id`): este `id` solo necesita ser
                // único en el DOM mientras existe.
                const detalleId = `${detalleIdBase}-fila-${rowIndex}`;
                return (
                  <React.Fragment key={row.id}>
                    <tr
                      data-row-id={getRowId ? row.id : undefined}
                      tabIndex={onRowClick ? 0 : undefined}
                      onClick={
                        onRowClick
                          ? (event) => {
                              if (naceFueraDeLaFila(event.currentTarget, event.target)) return;
                              if (naceEnUnControl(event.target)) return;
                              onRowClick(row.original);
                            }
                          : undefined
                      }
                      onKeyDown={
                        onRowClick
                          ? (event) => {
                              if (event.key !== "Enter" && event.key !== " ") return;
                              if (naceFueraDeLaFila(event.currentTarget, event.target)) return;
                              if (naceEnUnControl(event.target)) return;
                              // El Espacio desplaza la página si se le deja.
                              event.preventDefault();
                              onRowClick(row.original);
                            }
                          : undefined
                      }
                      className={cn(
                        "border-b border-border last:border-0 transition-colors duration-fast hover:bg-accent/50",
                        striped && "even:bg-muted/30",
                        onRowClick && "cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
                      )}
                      // Sin `role="treegrid"` a propósito: exigiría navegación
                      // de rejilla a nivel de celda y cambiaría el teclado del
                      // caso plano. Sobre la tabla normal, el rol `row` sí
                      // admite estos cuatro atributos.
                      {...(isHierarchical
                        ? {
                            "aria-level": row.depth + 1,
                            "aria-setsize": row.getParentRow()?.subRows.length ?? totalRows,
                            "aria-posinset": row.index + 1,
                            ...(row.getCanExpand() ? { "aria-expanded": row.getIsExpanded() } : {}),
                          }
                        : {})}
                    >
                      {renderExpanded ? (
                        <td className={cellPadding}>
                          <button
                            type="button"
                            aria-expanded={abierta}
                            aria-controls={detalleId}
                            aria-label={
                              abierta
                                ? `Replegar el detalle de la fila ${rowIndex + 1}`
                                : `Desplegar el detalle de la fila ${rowIndex + 1}`
                            }
                            className="grid size-6 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                            onClick={() =>
                              setFilasAbiertas((previas) => {
                                const siguientes = multiple ? new Set(previas) : new Set<string>();
                                if (abierta) {
                                  siguientes.delete(row.id);
                                } else {
                                  siguientes.add(row.id);
                                }
                                return siguientes;
                              })
                            }
                          >
                            {abierta ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                          </button>
                        </td>
                      ) : null}
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className={cn(
                            cellPadding,
                            (cell.column.columnDef.meta as { className?: string } | undefined)?.className,
                          )}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                    {renderExpanded && abierta ? (
                      <tr className="border-b border-border bg-muted/20">
                        <td
                          id={detalleId}
                          colSpan={table.getVisibleLeafColumns().length + 1}
                          className={cellPadding}
                        >
                          {renderExpanded(row.original)}
                        </td>
                      </tr>
                    ) : null}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
          {/* El pie solo existe si alguna columna declara `footer`. Se calcula
              sobre las filas filtradas —no las de la página— porque un total
              de página no es un total. */}
          {hasFooter && !loading ? (
            <tfoot aria-label="Totales" className="border-t-2 border-border bg-muted/40 font-medium">
              <tr>
                {renderExpanded ? <td className={cellPadding} /> : null}
                {table.getVisibleLeafColumns().map((column) => {
                  const footer = (column.columnDef.meta as ColumnMeta<TValue> | undefined)?.footer;
                  return (
                    <td
                      key={column.id}
                      className={cn(cellPadding, (column.columnDef.meta as ColumnMeta<TValue> | undefined)?.className)}
                    >
                      {footer ? footer(filteredRows) : null}
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>
      {showPaginator && !loading ? (
        <Pagination
          pageIndex={pagination.pageIndex}
          pageCount={pageCount}
          pageSize={pagination.pageSize}
          totalItems={totalRows}
          pageSizeOptions={rowsPerPageOptions}
          onPageIndexChange={(index) => table.setPageIndex(index)}
          onPageSizeChange={(size) => table.setPageSize(size)}
        />
      ) : null}
    </div>
  );
}

export { DataTable, Column };
