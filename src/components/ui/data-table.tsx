import * as React from "react";
import {
  useTable,
  tableFeatures,
  columnFilteringFeature,
  columnVisibilityFeature,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
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
  type SortingState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Search,
  Settings2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Pagination } from "@/components/ui/pagination";

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
  rowPaginationFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns: { includesString: filterFn_includesString },
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    basic: sortFn_basic,
    datetime: sortFn_datetime,
    text: sortFn_text,
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- fila genérica, igual que el `DataTableValue` anterior sobre PrimeReact.
export type DataTableValue = Record<string, any>;

/** Lo que `DataTable` guarda en `meta` de cada columna de TanStack. */
interface ColumnMeta<TValue extends DataTableValue> {
  className?: string;
  headerClassName?: string;
  ariaLabel?: string;
  footer?: (rows: TValue[]) => React.ReactNode;
}

/**
 * Lo que se persiste bajo `ui-table:<preferencesKey>:prefs`. Antes solo se
 * recordaban las columnas visibles (`ui-table:<key>:columns`); esta forma
 * añade el tamaño de página y el orden, que son los dos que un usuario nota
 * de inmediato cuando desaparecen. A nivel de módulo porque no depende de
 * ningún genérico del componente ni de `preferencesKey` en sí.
 */
interface PrefsTabla {
  columns?: ColumnVisibilityState;
  pageSize?: number;
  sort?: SortingState;
}

const esObjetoPlano = (valor: unknown): valor is Record<string, unknown> =>
  typeof valor === "object" && valor !== null && !Array.isArray(valor);

/**
 * Sin este filtro, dos JSON perfectamente válidos rompen la tabla:
 *
 * - Un array top-level (`[1,2,3]`) hace que `prefsIniciales.sort` resuelva a
 *   `Array.prototype.sort` —un array tiene ese método—, y `useState` recibe
 *   una función como valor inicial: la llama como inicializador perezoso,
 *   sin el array como `this`, y `sort()` revienta con "Cannot convert
 *   undefined or null to object". La tabla ni monta.
 * - Un `pageSize` que no es número entero (`"muchas"`, o un `2.5` que nadie
 *   tecleó a mano) deja a TanStack calculando un tamaño de página roto: con
 *   texto, `NaN` y la tabla vacía —"No hay datos para mostrar"— con filas
 *   reales adentro; con un decimal, un pie que dice "1-2.5 de 30" que además
 *   se reescribe tal cual en el siguiente guardado. Nada en la consola
 *   delata por qué.
 * - Dentro de `sort`, una entrada que no es un objeto (`[null]`, el mismo
 *   array que sobrevive si solo se comprueba que es array) revienta en
 *   cuanto algo le lee `.id` — mismo desenlace que el array top-level: la
 *   tabla ni monta.
 *
 * Por eso se sanea campo por campo, y en `sort` también entrada por entrada:
 * un valor con la forma equivocada se descarta solo a él, no arrastra a los
 * demás.
 */
const sanearPrefs = (bruto: unknown): PrefsTabla => {
  if (!esObjetoPlano(bruto)) return {};
  const prefs: PrefsTabla = {};
  if (esObjetoPlano(bruto.columns)) prefs.columns = bruto.columns as ColumnVisibilityState;
  if (typeof bruto.pageSize === "number" && Number.isInteger(bruto.pageSize) && bruto.pageSize > 0) {
    prefs.pageSize = bruto.pageSize;
  }
  if (Array.isArray(bruto.sort)) {
    prefs.sort = bruto.sort.filter(
      (entrada): entrada is { id: string; desc: boolean } => esObjetoPlano(entrada) && typeof entrada.id === "string",
    ) as SortingState;
  }
  return prefs;
};

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
   * De dónde sale el valor por el que se ordena y se busca, cuando no es un
   * campo de la fila: una etiqueta traducida, dos campos concatenados, una
   * longitud, un booleano como número.
   *
   * Es lo que hace ordenable una columna que no tiene `field`. Ordenar por
   * `estado` cuando en la fila pone `"sent"` y en pantalla «Enviado» ordena
   * por la palabra que el usuario ve, que es la que espera.
   */
  accessor?: (row: TValue) => unknown;
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
      }
    | {
        field?: undefined;
        /** Identidad de la columna. Obligatoria cuando no hay campo. */
        id: string;
        /** De dónde sale el valor que se ordena y se busca, cuando no es un campo de la fila. */
        accessor: (row: TValue) => unknown;
        /** Sin `body`, la celda pinta lo que devuelva `accessor`. */
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
   * el tamaño de página y el orden.
   */
  preferencesKey?: string;
  /** Notifica cambios para persistencia externa en perfiles de usuario. */
  onColumnVisibilityChange?: (visibility: Record<string, boolean>) => void;
  /**
   * Identidad estable de cada fila. Sin ella TanStack usa el índice, y al
   * reordenar o filtrar el estado interno de una fila salta a otra.
   */
  getRowId?: (row: TValue, index: number) => string;
  /**
   * Qué hacer al activar una fila. Con ella la fila se vuelve enfocable y
   * responde a Enter y Espacio, no sólo al ratón.
   *
   * Los clics nacidos dentro de un control de la fila —un botón de acciones,
   * un enlace, una casilla— NO la disparan: pulsar «Eliminar» no puede abrir
   * además el detalle.
   */
  onRowClick?: (row: TValue) => void;
  /**
   * Detalle en línea bajo la fila. Cuando se pasa, la tabla añade al
   * principio una columna estrecha con el botón que lo abre y lo cierra.
   *
   * Se despliega una fila cada vez: dos detalles abiertos a la vez convierten
   * la tabla en una lista y se pierde la comparación entre filas, que es para
   * lo que existe una tabla.
   *
   * La fila abierta se rastrea por `row.id`, así que este prop va emparejado
   * con `getRowId`. Sin él, `row.id` es la posición de TanStack, no una
   * identidad: ordenar desde el encabezado de columna es seguro —reordena
   * la vista, no el arreglo `data`—, pero si el padre vuelve a renderizar con
   * `value` en otro orden (una recarga que trae los mismos registros
   * reordenados), el detalle abierto se queda en la posición y termina
   * mostrando otro registro. En desarrollo, usarlo sin `getRowId` deja un
   * aviso en consola.
   */
  renderExpanded?: (row: TValue) => React.ReactNode;
  className?: string;
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
  getRowId,
  onRowClick,
  renderExpanded,
  className,
}: DataTableProps<TValue>) {
  // Lee las preferencias persistidas de esta tabla. La clave nueva
  // (`:prefs`) se prueba primero; si no existe se cae a la vieja
  // (`:columns`), que es todo lo que guardaban las versiones anteriores de
  // este componente y lo único que hay en el navegador de un usuario que
  // todavía no vio esta versión. La vieja nunca se vuelve a escribir —es
  // solo lectura, de migración— ni se borra una vez que la nueva existe: un
  // downgrade, o una pestaña que quedó con el bundle viejo abierto, la sigue
  // necesitando. Se queda ahí para siempre; el costo es unos bytes por
  // tabla, no una preferencia perdida.
  const leerPrefs = React.useCallback((): PrefsTabla => {
    if (!preferencesKey || typeof window === "undefined") return {};
    try {
      const nuevas = window.localStorage.getItem(`ui-table:${preferencesKey}:prefs`);
      if (nuevas) return sanearPrefs(JSON.parse(nuevas));
      const viejas = window.localStorage.getItem(`ui-table:${preferencesKey}:columns`);
      return viejas ? sanearPrefs({ columns: JSON.parse(viejas) }) : {};
    } catch {
      return {};
    }
  }, [preferencesKey]);

  // Se lee una sola vez al montar: `useState` con una función de
  // inicialización perezosa ignora `leerPrefs` en renders posteriores, que es
  // lo que se quiere — la tabla no debe releer localStorage por su cuenta
  // mientras el usuario interactúa con ella.
  const [prefsIniciales] = React.useState(leerPrefs);

  const [sorting, setSorting] = React.useState<SortingState>(prefsIniciales.sort ?? []);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: prefsIniciales.pageSize ?? rows,
  });
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnQuery, setColumnQuery] = React.useState("");
  const [activeDensity, setActiveDensity] = React.useState(density);
  const [filaAbierta, setFilaAbierta] = React.useState<string | null>(null);
  // Prefijo para el `id` del `<td>` del detalle: único por instancia de
  // `DataTable`, para que dos tablas en la misma pantalla no compartan
  // identificadores.
  const detalleIdBase = React.useId();

  // Aviso de una sola vez al montar (no en cada render): `renderExpanded` sin
  // `getRowId` rastrea la fila abierta por la posición de TanStack, no por su
  // identidad. Ver el JSDoc de `renderExpanded` para el porqué. Se recorta en
  // producción igual que hace `@tanstack/table-core` con sus propios avisos.
  //
  // El array de deps vacío es deliberado, no un descuido: con `renderExpanded`
  // y `getRowId` como deps reales, el aviso se dispararía en cada render para
  // quien pasa una función flecha en línea —el caso más común—, que es peor
  // que el problema que resuelve. La contrapartida: una pantalla que empieza
  // sin `renderExpanded` y lo activa después —detrás de un feature flag, o
  // tras una carga que decide si hay detalle que mostrar— nunca ve el aviso,
  // porque el montaje ya pasó. Vale la pena para el caso común.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ver el comentario de arriba: deliberadamente solo al montar.
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

  // IDs de columna que aceptan orden: la misma condición que arma
  // `enableSorting` más abajo en `columnDefs` (tiene campo o `accessor`, y
  // `sortable`). Sin `accessor` aquí, un orden persistido sobre una columna
  // calculada se descartaría en cada recarga como si la columna no existiera
  // —el mismo síntoma que resuelve `sortingEfectivo` para una columna oculta,
  // pero por la razón equivocada—.
  const idsOrdenables = React.useMemo(
    () =>
      new Set(
        columnSpecs
          .filter((spec) => Boolean(spec.props.field || spec.props.accessor) && (spec.props.sortable ?? false))
          .map((spec) => (spec.props.id ?? spec.props.field) as string),
      ),
    [columnSpecs],
  );

  // Un orden sobre una columna que está oculta (o que ya no admite orden) se
  // descarta al derivarlo, no con estado propio: `sanearPrefs` valida la
  // forma del JSON, pero no sabe qué columnas existen ni cuáles están
  // visibles —esa información solo vive aquí, junto a `columnVisibility`—,
  // así que la integridad referencial se resuelve en esta derivación, no
  // allá. Es un `useMemo`, no un efecto que llame `setSorting`: mutar
  // `sorting` desde un efecto dispararía un render en cascada (el lint de
  // hooks lo marca como error) por cada cambio de columnas, y encima la
  // tabla pintaría un instante con el orden inválido antes de que el efecto
  // corrigiera. Derivarlo evita las dos cosas — nunca hay un render, ni
  // siquiera uno, con un orden sobre una columna que no está en pantalla.
  //
  // Antes de persistir el orden esto no importaba: una recarga lo borraba
  // solo. Ahora sobrevive a la recarga, así que ordenar por «Nombre», ocultar
  // la columna «Nombre» y recargar dejaba la tabla ordenada por una columna
  // que ya no está en pantalla —sin ningún control ahí para deshacerlo—.
  // `sortingEfectivo` (no `sorting`) es lo que ve la tabla y lo que se
  // persiste, así que cubre los tres caminos por los que puede pasar eso: al
  // montar con un `sort` heredado que apunta a una columna ya oculta, al
  // ocultar una columna durante la sesión (el caso que atrapaba al usuario,
  // ya que `columnVisibility` es una dependencia) y al restaurar las
  // columnas por defecto. Se limpia de inmediato, no se conserva por si el
  // usuario vuelve a mostrar la columna: un orden que no se ve y no se puede
  // deshacer es peor que tener que volver a pedirlo.
  const sortingEfectivo = React.useMemo(
    () => sorting.filter((criterio) => idsOrdenables.has(criterio.id) && columnVisibility[criterio.id] !== false),
    [sorting, idsOrdenables, columnVisibility],
  );

  // Una sola escritura para las tres preferencias, bajo la clave nueva. La
  // vieja (`:columns`) queda intacta y no se vuelve a tocar —ver el
  // comentario de `leerPrefs`—. Aquí gana la última escritura: dos pestañas
  // abiertas sobre la misma tabla se pisan la preferencia (la que escribe
  // después borra lo que puso la otra). Ya pasaba con `:columns`, no es algo
  // que esta tarea introduzca, y coordinar entre pestañas (evento `storage`,
  // merge por campo) es complejidad real para un caso que nadie ha reportado.
  React.useEffect(() => {
    if (!preferencesKey || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        `ui-table:${preferencesKey}:prefs`,
        JSON.stringify({ columns: columnVisibility, pageSize: pagination.pageSize, sort: sortingEfectivo }),
      );
    } catch {
      // La tabla sigue funcionando cuando el navegador bloquea almacenamiento.
    }
  }, [columnVisibility, pagination.pageSize, sortingEfectivo, preferencesKey]);

  const columnDefs = React.useMemo<Array<ColumnDef<typeof dataTableFeatures, TValue>>>(() => {
    return columnSpecs.map((spec) => ({
      // Uno de los dos existe siempre: el tipo de `ColumnProps` exige `id`
      // cuando no hay `field`.
      id: (spec.props.id ?? spec.props.field) as string,
      // `accessor` gana a `field`: si la pantalla se molestó en calcular un
      // valor, es ése el que se ordena y se busca.
      ...(spec.props.accessor
        ? { accessorFn: (row: TValue) => spec.props.accessor!(row) }
        : spec.props.field
          ? { accessorKey: spec.props.field }
          : {}),
      header: () => spec.props.header,
      enableSorting: Boolean(spec.props.field || spec.props.accessor) && (spec.props.sortable ?? false),
      enableHiding: spec.props.hideable ?? true,
      cell: (ctx) => (spec.props.body ? spec.props.body(ctx.row.original) : String(ctx.getValue() ?? "")),
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
  }, [columnSpecs]);

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
    getRowId,
    // La tabla ve `sortingEfectivo`, no el `sorting` crudo: así un clic de
    // encabezado (que decide asc/desc/ninguno leyendo el estado actual de la
    // tabla) nunca parte de un criterio fantasma sobre una columna oculta.
    state: { sorting: sortingEfectivo, pagination: effectivePagination, globalFilter, columnVisibility },
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
  const TitleTag = titleAs;

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
   * el árbol de React hasta la fila.
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
   */
  const naceEnUnControl = (target: EventTarget | null) => {
    const element = comoElemento(target);
    return Boolean(element?.closest("button, a, input, select, textarea, label, [role='button'], [role='checkbox']"));
  };

  return (
    <div className={cn("w-full overflow-hidden rounded-lg border border-raised-border bg-card shadow-sm", className)}>
      {title || description || actions || searchable || configurableColumns ? (
        <div className="flex flex-col gap-4 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            {title ? <TitleTag className="font-heading text-base font-semibold text-foreground">{title}</TitleTag> : null}
            {description ? <div className="mt-1 text-sm text-muted-foreground">{description}</div> : null}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {searchable ? (
              <div className="relative min-w-0 sm:w-64">
                <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  aria-label={searchLabel}
                  className="pl-9"
                  placeholder={searchPlaceholder}
                  value={globalFilter}
                  onChange={(event) => {
                    setGlobalFilter(event.target.value);
                    table.setPageIndex(0);
                  }}
                />
              </div>
            ) : null}
            {actions}
            {configurableColumns ? (
              <Popover positioning={{ placement: "bottom-end" }}>
                <PopoverTrigger>
                  <button
                    type="button"
                    aria-label="Configurar columnas"
                    className="inline-flex h-control-default w-control-default shrink-0 items-center justify-center rounded-md border border-input bg-raised text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <Settings2 aria-hidden="true" className="size-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[24rem] p-0">
                  <div className="border-b border-border px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold">Personalizar tabla</p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          Ajusta las columnas y la densidad de esta vista.
                        </p>
                      </div>
                      <span className="rounded-full bg-subtle px-2.5 py-1 text-xs font-semibold text-subtle-foreground">
                        {table.getVisibleLeafColumns().length}/{table.getAllLeafColumns().length} visibles
                      </span>
                    </div>
                  </div>
                  <div className="grid gap-4 border-b border-border p-4">
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Densidad</p>
                      <div className="grid grid-cols-3 rounded-lg bg-muted p-1">
                        {(["compact", "default", "comfortable"] as const).map((option) => (
                          <button
                            key={option}
                            type="button"
                            aria-pressed={activeDensity === option}
                            onClick={() => setActiveDensity(option)}
                            className={cn(
                              "min-h-9 rounded-md px-2 text-xs font-medium transition-colors",
                              activeDensity === option
                                ? "bg-raised text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground",
                            )}
                          >
                            {option === "compact" ? "Compacta" : option === "default" ? "Normal" : "Cómoda"}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="relative">
                      <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={columnQuery}
                        onChange={(event) => setColumnQuery(event.target.value)}
                        placeholder="Buscar columna…"
                        aria-label="Buscar columna"
                        className="pl-9"
                        size="sm"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Columnas</p>
                      <button
                        type="button"
                        onClick={() => table.getAllLeafColumns().forEach((column) => column.getCanHide() && column.toggleVisibility(true))}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Mostrar todas
                      </button>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto p-2">
                    {table.getAllLeafColumns().filter((column) => {
                      const label = (column.columnDef.meta as { ariaLabel?: string } | undefined)?.ariaLabel ?? column.id;
                      return label.toLocaleLowerCase().includes(columnQuery.trim().toLocaleLowerCase());
                    }).map((column) => {
                      const visibleCount = table.getVisibleLeafColumns().length;
                      const cannotHideLast = column.getIsVisible() && visibleCount === 1;
                      return (
                        <button
                          type="button"
                          key={column.id}
                          disabled={!column.getCanHide() || cannotHideLast}
                          onClick={() => column.toggleVisibility()}
                          className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent disabled:cursor-default disabled:opacity-70"
                        >
                          <span className="min-w-0 flex-1 truncate">
                            {(column.columnDef.meta as { ariaLabel?: string } | undefined)?.ariaLabel ?? column.id}
                          </span>
                          {!column.getCanHide() ? <span className="text-[0.6875rem] text-muted-foreground">Fija</span> : null}
                          <span
                            aria-hidden="true"
                            className={cn(
                              "inline-flex h-6 w-10 items-center rounded-full p-0.5 transition-colors",
                              column.getIsVisible() ? "bg-primary" : "bg-muted",
                            )}
                          >
                            <span
                              className={cn(
                                "size-5 rounded-full bg-raised shadow-sm transition-transform",
                                column.getIsVisible() && "translate-x-4",
                              )}
                            />
                          </span>
                          <span className="sr-only">{column.getIsVisible() ? "Ocultar" : "Mostrar"}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="border-t border-border p-2">
                    <button
                      type="button"
                      onClick={() => {
                        setColumnVisibility(defaultVisibility);
                        onColumnVisibilityChange?.(defaultVisibility);
                      }}
                      className="flex min-h-9 w-full items-center justify-center gap-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      <RotateCcw aria-hidden="true" className="size-3.5" />
                      Restaurar columnas
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            ) : null}
          </div>
        </div>
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
                            "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
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
                const abierta = filaAbierta === row.id;
                // No se asume ningún campo (p. ej. `nombre`) en un `TValue`
                // arbitrario: la posición en pantalla es lo único que la
                // tabla conoce de toda fila, así que es lo que distingue un
                // botón «Desplegar» del de al lado para quien navega con
                // lector de pantalla.
                // A propósito distinto de `filaAbierta`: ese guarda `row.id`
                // porque necesita identidad de dato (sobrevivir a un
                // reordenamiento, o no — ver el aviso de arriba). Este `id`
                // solo necesita ser único en el DOM mientras existe, así que
                // la posición en pantalla alcanza y evita tener que sanear un
                // `row.id` arbitrario (el de `getRowId`) para usarlo como
                // atributo `id`. No son el mismo espacio de coordenadas —no
                // deberían compararse entre sí.
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
                            onClick={() => setFilaAbierta(abierta ? null : row.id)}
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
                        <td id={detalleId} colSpan={table.getVisibleLeafColumns().length + 1} className={cellPadding}>
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
