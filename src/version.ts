export type ReleaseChannel = "current" | "lts" | "maintenance" | "deprecated";

export interface LibraryRelease {
  version: string;
  channel: ReleaseChannel;
  publishedAt?: string;
  /**
   * Qué hay que hacer al subir a esta versión, no qué cambió en ella. Cada
   * entrada es una instrucción para quien actualiza; el detalle del cambio
   * vive en el CHANGELOG. Vacío significa "subir y ya".
   */
  migration: readonly string[];
}

/** Versión compilada del paquete. Debe coincidir con `package.json`. */
export const UI_LIBRARY_VERSION = "0.13.0";

/**
 * Notas de migración de la 1.0.0 (#150), ya escritas y listas — pendientes
 * solo de que el PR de release las mueva al frente de `UI_LIBRARY_RELEASES`
 * y bombee `UI_LIBRARY_VERSION` (junto con `package.json`) a `"1.0.0"`. Se
 * dejan fuera del array por ahora a propósito: `version.test.ts` exige que
 * `UI_LIBRARY_RELEASES[0].version === UI_LIBRARY_VERSION`, y este PR tiene
 * instrucción explícita de no tocar `package.json` ni bombear versión — eso
 * es aparte, después de revisar el resto.
 *
 * A diferencia de toda entrada anterior, esta NO es aditiva: rompe deliberadamente
 * (ver DESIGN_SYSTEM.md > "Compatibilidad" — la puerta de "antes de 1.0 se permite
 * romper" se usa aquí por última vez y se cierra con esta misma versión).
 */
export const UI_LIBRARY_RELEASE_1_0_0: LibraryRelease = {
  version: "1.0.0",
  channel: "current",
  migration: [
    "Esta versión ROMPE, a propósito y por última vez sin costar una mayor (ver DESIGN_SYSTEM.md > \"Compatibilidad\"): son las tres correcciones que había que hacer antes de prometer estabilidad. Los tres pasos son independientes entre sí — aplicalos en el orden que prefieras.",
    "Nombres de props (#62): `Slider.onValueChange` y `RadioGroup.onValueChange` pasan a llamarse `onChange`. La regla que decide para cualquier control, propio o de la librería: ¿el valor es un booleano de sí/no? → `checked`/`onCheckedChange` (Checkbox, Switch, sin cambios). ¿Es una selección de un conjunto? → `value`/`onChange` (RadioGroup, Slider, Select, MultiSelect, DatePicker, AutoComplete — los últimos cuatro ya usaban `onChange`, sin cambios). `Tabs` NO cambia pese a usar `onValueChange`: no es un control de formulario sino navegación, su valor no es un dato del modelo. Para migrar mecánicamente: `node node_modules/@piensa-it/ui-library/scripts/codemod-props-control.mjs --dry \"src/**/*.tsx\"` para ver qué tocaría, y sin `--dry` para aplicarlo. Es consciente de la etiqueta JSX: solo toca `onValueChange` dentro de un `<Slider ...>` o `<RadioGroup ...>`, así que no le hace nada a tus `Tabs`, `Accordion` ni a un handler propio que se llame igual por coincidencia. Revisá igual el diff antes de commitear.",
    "`Layout` se retira (#54): sale del barrel junto con `LayoutProps`. Sustituilo por `AppShell` — resolvía lo mismo con menos, y mantenerlos a los dos vivos era la fuente de confusión que motivó el retiro. `AppShell` pide `sidebar` (un `SidebarNav`) además de `brand`; si tu `Layout` no tenía menú lateral, envolvé tu contenido en un `SidebarNav` mínimo con un solo `SidebarNavItem`, o si de verdad no querés menú, armá tu propio header con `div`/`header` — la librería ya no ofrece un armazón sin menú. Ver el Quick start del README o Storybook > `Layout/AppShell` para un ejemplo completo, incluida la barra superior, el plegado recordado por dispositivo y las formas (`docked`, `floating`, `rail`, `framed`, `rail-panel`).",
    "Alias de `Button` retirados: `variant=\"default\"` → `variant=\"solid\"`, `variant=\"secondary\"` → `variant=\"subtle\"`, `variant=\"ghost\"` → `variant=\"plain\"`, `size=\"default\"` → `size=\"md\"`. Buscá esos cuatro strings en tu código — `grep -rn 'variant=\"default\"\\|variant=\"secondary\"\\|variant=\"ghost\"\\|size=\"default\"' src` — y sustituilos uno a uno; no hay codemod para este paso porque los mismos strings literales (`\"default\"`, `\"secondary\"`) también los usan `Badge` y otros componentes con su propio significado, y un reemplazo automático sin distinguir el componente los rompería en silencio. El aspecto visual no cambia: cada alias apuntaba a la misma clase que su reemplazo.",
    "Si mantenías tu propia tabla de naming como referencia, hay una nueva regla escrita para que decida sola, sin mirar al componente hermano — está en DESIGN_SYSTEM.md > \"APIs predecibles\".",
  ],
};

/** Historial público de líneas soportadas, de la más reciente a la más antigua. */
export const UI_LIBRARY_RELEASES: readonly LibraryRelease[] = [
  {
    version: UI_LIBRARY_VERSION,
    channel: "current",
    migration: [
      "Todo es aditivo: subir no requiere cambios. Nada de lo que usaba la 0.12.0 cambia de comportamiento, incluida la jerarquía de N niveles.",
      "Retirá también, si mantenías tu propia tabla: filas que abren un panel llevan `onRowClick` —el componente ya ignora los clics nacidos en un botón, un enlace, un ítem de menú portado o el chevron del árbol—; el detalle desplegable bajo la fila lleva `renderExpanded` (con `getRowId`, o la fila abierta se identifica por posición y salta de registro al reordenar) y convive con la jerarquía: una fila del árbol puede tener detalle además de hijas. Columnas que se ordenan por un valor calculado —una etiqueta traducida, dos campos concatenados, un booleano como número, incluso dentro de un árbol— usan `accessor` en vez de `field`; declarar los dos a la vez es error de compilación.",
      "`preferencesKey` ahora recuerda cuatro cosas —columnas visibles, expansión, tamaño de página y orden— bajo `ui-table:<clave>:prefs`. Las claves anteriores (`:columns`, `:expanded`) se siguen leyendo y NO se borran, así que nadie pierde lo suyo. Si construís `preferencesKey` con algo variable —la empresa activa, el módulo, una pestaña—, pasá `key={preferencesKey}` al `DataTable`: la tabla lee las preferencias una sola vez al montar, y sin remontarla escribiría las de la clave vieja sobre la nueva.",
      "Si tus pruebas localizan el buscador de una tabla por su nombre accesible, pasá `searchLabel`: por defecto todas las tablas se llaman «Buscar en la tabla».",
      "Si encabezabas la tabla con un `<h3>` propio, pasá `title` con `titleAs=\"h3\"` y retirá el tuyo: el componente ya pinta la tarjeta y su cabecera.",
    ],
  },
  {
    version: "0.12.0",
    channel: "maintenance",
    publishedAt: "2026-09-09",
    migration: [
      "Todo es aditivo: subir no requiere cambios. Una `DataTable` sin `getSubRows` se comporta exactamente igual que en 0.11.0, y nada de esto cambia lo que ya usaba la jerarquía.",
      "Tablas jerárquicas: si tenés una tabla de árbol escrita a mano, ya podés retirarla. Pasá `getSubRows` —el interruptor del modo jerárquico—, `getRowId` con el identificador de tus filas, y marcá con `tree` la columna que lleva la sangría y el control de expandir. El resto de columnas se declaran igual que siempre.",
      "Si tus datos vienen planos con `parentId` —lo que sale de una consulta SQL— usá `buildTree(rows, { id, parentId })`, que exporta la librería. No admitimos las dos formas a propósito: una sola entrada en el componente y la conversión probada aparte, incluidos los datos sucios (huérfanas se muestran como raíces, los ciclos se cortan, los ids repetidos descartan la segunda aparición).",
      "Buscar, ordenar y paginar ya funcionan sobre el árbol sin que hagas nada: la búsqueda deja visibles a los ancestros de lo encontrado, ordenar reordena entre hermanos sin aplanar, y paginar reparte por raíz, así que una familia nunca queda partida entre dos páginas. Ojo con esto último: el paginador cuenta raíces, no filas, así que «5 por página» puede pintar bastantes más filas.",
      "`defaultExpandedDepth` fija qué niveles arrancan abiertos; con `preferencesKey` la expansión se recuerda por dispositivo, junto a las columnas. Si querés llevar tú el estado, pasá `expanded` y `onExpandedChange`.",
      "Accesibilidad: cada fila anota `aria-expanded`, `aria-level`, `aria-posinset` y `aria-setsize`. NO es un `treegrid` completo —no hay navegación de rejilla con flechas—, así que no lo anuncies como tal ni construyas encima asumiéndolo.",
      "`getRowId` es nuevo y sirve también en tablas planas: sin él TanStack identifica las filas por índice, y los índices se reasignan al ordenar o filtrar.",
    ],
  },
  {
    version: "0.11.0",
    channel: "maintenance",
    publishedAt: "2026-09-08",
    migration: [
      "Todo es aditivo: subir no requiere cambios. `ProfileForm` sigue en vertical, exactamente como en 0.10.0.",
      "Ancho de la pantalla de ajustes: NO ensanches su `PageContainer` para llenar la ventana. `default` es el correcto, y el tope nuevo de `Field` ya evita que un campo se estire. Reservá `wide` para cuando alguna sección traiga una tabla o una rejilla que de verdad aproveche el ancho.",
      "Disposición horizontal, opcional: si la querés en el perfil —rótulo y ayuda a la izquierda, control acotado a la derecha—, pasá `orientation=\"horizontal\"` **junto con** `descriptions`. Sin las descripciones no la actives: la columna izquierda se queda con solo el rótulo y el bloque se ve descuadrado, como un fallo de alineación. Los textos son tuyos; la librería no los inventa.",
      "Controles compuestos: si armaste una fila propia con `Field` envolviendo algo que no es un único control enfocable —un `AvatarPicker`, un grupo de radios a mano—, pasale `compositeControl`. Sin él, su `<label for>` apunta a un elemento que no existe: al pulsarlo no pasa nada y no hay asociación accesible.",
      "Si parcheaste la fila del avatar de `ProfileForm` porque el rótulo salía encima en vez de al lado, quitá el parche: era un defecto nuestro y está corregido.",
    ],
  },
  {
    version: "0.10.0",
    channel: "maintenance",
    publishedAt: "2026-09-08",
    migration: [
      "Todo es aditivo: subir no requiere cambios. Lo que sigue es cómo adoptar la pantalla estándar de perfil y configuración.",
      "Perfil y configuración: sustituí el armazón de tus dos pantallas por `SettingsPage`, dentro de tu `PageContainer`. Va `title`, `description` y `sections`; cada sección lleva `id` y `content`. Los `id` conocidos —`account`, `appearance`, `security`, `notifications`— ya traen rótulo e icono, así que no les pases `label`; una sección propia tuya sí necesita el suyo.",
      "Guardado: dale a cada sección `onSave`, `dirty` y `saving` y `SettingsPage` le pinta el pie con Guardar y Cancelar. Una sección sin `onSave` no lleva pie. El guardado es por sección, no global: cada una resuelve su error por su cuenta. Ojo, sin `dirty` el botón nunca se habilita.",
      "Cambios sin guardar: con `dirty` puesto, cambiar de pestaña pide confirmación sola (`guardUnsaved`, activo de fábrica) y reutiliza `confirmAlert`, así que necesitás `UiProvider` montado. Cubre solo el cambio de pestaña: si querés proteger también la salida de la pantalla, eso sigue siendo tuyo —tu router o `beforeunload`—.",
      "Datos de la persona: sustituí tu formulario de perfil por `ProfileForm` como contenido de la sección `account`. Trae avatar, nombre, correo, teléfono y cargo; lo tuyo —documento, sede, contraseña— entra por `children` y hereda la rejilla, con `span=\"full\"` si lo querés a lo ancho. Guardá `avatarFile` solo cuando venga: aparece nada más cuando el cambio fue subir o quitar la foto.",
      "Apariencia: no estrena componente. Poné tu `AppearanceSettings` de siempre como contenido de la sección `appearance` y ganás su rótulo, su icono y su sitio.",
      "Sección atada a la URL: si querés que la pestaña abierta viva en la ruta, pasá `section` y `onSectionChange`. Sin ellas `SettingsPage` la lleva sola.",
      "Pestañas: el indicador de la pestaña activa no se pintaba y ahora sí. Si parcheaste eso en tu aplicación, quitá el parche.",
    ],
  },
  {
    version: "0.9.0",
    channel: "maintenance",
    publishedAt: "2026-09-07",
    migration: [
      "Todo es aditivo: subir no requiere cambios. Lo que sigue es cómo adoptar el armazón estándar.",
      "Barra superior: a la izquierda `ScreenSearch` (las pantallas en `groups`, `onSelect` navega con tu router; Ctrl K); a la derecha solo `NotificationsMenu` (tus avisos en `items`) y `UserMenu`. Periodo, buscadores de datos y botones de crear bajan al `PageHeader` de su pantalla.",
      "Cabecera del menú: sustituí `SidebarBrand` por `SidebarIdentity` en `brand`: `system` (nombre y logo), `company` con caption «Compañía», tus opciones y el `badge` de entorno por compañía, y `module` solo si tenés módulos. La empresa se cambia ahí y en ningún otro sitio; la persona vive en `UserMenu`.",
      "Menú: agrupá los enlaces en `SidebarNavGroup` con `collapsible` y `groupId`, y pasá `storageKey` al `AppShell` para que se recuerde.",
      "Forma y color: elegí `layout` en `AppShell` (docked, floating, rail, framed o rail-panel), `sidebarTone` si querés el menú claro, y `data-ui-look` (classic, soft, deep, flat) y `data-ui-palette` (ocho, con cyan y sun) en tu raíz. Si ya tenés `AppearanceSettings`, añadí `look` a `sections`.",
      "Indicadores: dale a cada `Stat` un `icon` del catálogo y un `tone` solo cuando la cifra sea noticia. No pongas botón de ocultar: si una pantalla los muestra lo decide tu configuración técnica.",
      "Tablas: usá la `DataTable` de la librería sin envolverla en `Card` ni en un `div` con borde; columnas numéricas con `align=\"right\"`; badges de estado con las variantes de `Badge`, sin grises crudos.",
      "Paletas: Océano, Esmeralda y Ámbar se oscurecen 4–5 puntos en claro para cumplir AA; si usás una de las tres, tus botones salen un pelo más oscuros. Nada que hacer.",
    ],
  },
  {
    version: "0.8.0",
    channel: "maintenance",
    publishedAt: "2026-09-06",
    migration: [
      "Todo es aditivo: subir no requiere cambios. Lo que sigue es lo que podés retirar de tu aplicación.",
      "Menú de usuario: sustituí tu desplegable de la barra superior por `UserMenu` con `onProfile`, `onSettings`, `onSignOut` y, si querés confirmación, `confirmSignOut`. Va en el `topbar` de `AppShell`.",
      "Perfil: sustituí tu selector de color del avatar por `AvatarPicker`; entrega la foto como `File` y el color en `H S% L%`. Nombre, correo y contraseña siguen siendo tuyos, con `Field`, `Input` y `FormGrid`.",
      "Apariencia: sustituí tu tarjeta de apariencia por `AppearanceSettings`; guardá el objeto que entrega y aplicá `.dark`, `data-ui-palette`, `data-ui-font` y `<UiProvider density>` en tu raíz. Si tu paleta era propia, pasala en `palettes` como `{ id, label, primary }`.",
    ],
  },
  {
    version: "0.7.3",
    channel: "maintenance",
    publishedAt: "2026-09-06",
    migration: [
      "Tema oscuro: el menú lateral baja al nivel `surface` y el grafito pierde el tinte azul. Nada que hacer, salvo que redefinas `--sidebar-*` bajo tu propio `[data-sidebar]`: entonces añade también la versión `.dark`, o heredarás la nuestra.",
    ],
  },
  {
    version: "0.7.2",
    channel: "maintenance",
    publishedAt: "2026-09-06",
    migration: [
      "Iconos: los once que faltaban ya están en el catálogo (`EuroIcon`, `PoundSterlingIcon`, `HotelIcon`, `UserCogIcon`, `ArrowLeftRightIcon`, `ArrowDownLeftIcon`, `FlagIcon`, `PlugIcon`, `ScrollTextIcon`, `ToggleLeftIcon`, `ToggleRightIcon`). Retirá los sustitutos marcados `TODO(app-ui#90)` e importalos de la librería.",
      "`PageContainer`/`Stagger`: un bloque que no pinta nada ya no deja hueco. Retirá la regla `[data-ui-stagger] > [data-ui-stagger-item]:empty { display: none }` marcada `TODO(app-ui#91)` de tu CSS: la trae la librería.",
    ],
  },
  {
    version: "0.7.1",
    channel: "maintenance",
    publishedAt: "2026-09-04",
    migration: [
      "Solo entran 41 iconos al catálogo (docs/ICONS.md). Nada que migrar: si tu app los pedía desde lucide, ya podés importarlos de la librería y retirar lucide-react.",
    ],
  },
  {
    version: "0.7.0",
    channel: "maintenance",
    publishedAt: "2026-09-04",
    migration: [
      "Todo lo de esta versión es aditivo salvo una cosa: `AppVersion` muestra ahora solo la versión de la aplicación. Si en una pantalla de ayuda querés también la de la librería y la fecha de compilación, pasale `details`.",
      "Selector de empresa: sustituí el bloque de marca duplicado por `SidebarBrand` con `onSelect`, y la ventana propia por `AppSwitcher` con `details` y `confirm`. Pasá `onSelect` en `undefined` cuando haya una sola empresa.",
      "Selector de módulos: sustituí la ventana propia por `AppSwitcher` con `groups`, `recent` y `hint`. Las pruebas que localizaban `menuitem` pasan a `option`, y una opción reciente sale dos veces: desambiguá con `.first()`.",
      "Tarjetas de indicadores: retirá el `KpiCard` propio y pasá sus usos a `Stat` con `tone`. La regla entre `warning` y `negative` es el plazo, no la gravedad.",
      "Selector de color del tema: si tu paleta movía `--accent`, dejá de hacerlo, y si no movía `--ring`, empezá. Mejor: construila con `createPalette({ primary })`, que solo admite los siete tokens tematizables. Con tema oscuro, escribila en una regla con `paletteDeclarations`.",
    ],
  },
  {
    version: "0.6.0",
    channel: "maintenance",
    publishedAt: "2026-09-04",
    migration: [
      "Renombra las clases del espaciado con el codemod que trae el paquete: `node node_modules/@piensa-it/ui-library/scripts/codemod-espaciado.mjs \"src/**/*.{ts,tsx,css}\"`. Pasa `--dry` antes para ver qué tocaría. `p-md` pasa a `p-ui-md`, `gap-sm` a `gap-ui-sm`; los nombres por rol (`p-inset`, `space-y-stack`, `gap-field`) no cambian.",
      "IMPORTANTE, y es lo que arregla esta versión: `max-w-xs` … `max-w-2xl` vuelven a valer lo de Tailwind. Si en la 0.5.0 los sustituiste por medidas literales (`max-w-[42rem]`) o por las utilidades `panel-*`, ya puedes devolverlos a su nombre. `w-*`, `min-w-*` y `basis-*` con esos mismos nombres también vuelven.",
      "Las utilidades `panel-xs` … `panel-2xl` desaparecen: existían solo para sortear ese choque de nombres. Usa `max-w-*`.",
      "Si sacaste tu bloque `.dark` de `@layer base` para que ganara al nuestro, devuélvelo a su sitio: el nuestro ya vive en `base` y el tuyo, importado después, gana por orden dentro de la misma capa.",
    ],
  },
  {
    version: "0.5.0",
    channel: "maintenance",
    publishedAt: "2026-09-04",
    migration: [
      "Tailwind 4: si tu aplicación extiende nuestro preset, sustituye `@tailwind base/components/utilities` por `@import \"tailwindcss\";` más `@config \"./tailwind.config.js\";`, y cambia `postcss.config.js` a `@tailwindcss/postcss`. El preset en sí no cambia.",
      "Tailwind 4: quita `autoprefixer` de tus dependencias, que v4 lo trae incorporado.",
      "Tailwind 4: sustituye `outline-none` por `outline-hidden` en tu código. En v4 `outline-none` quita el contorno de verdad, y con él la pista del modo de alto contraste.",
      "Tailwind 4, IMPORTANTE: si usas `max-w-sm|md|lg|xl|2xl`, revísalos. Nuestra escala de espaciado usa esos mismos nombres y en v4 gana sobre los anchos máximos, así que `max-w-lg` pasa a valer 1,5 rem en vez de 32 rem. Usa un valor explícito o las utilidades `panel-*`.",
      "Tailwind 4: si dependías de `button { cursor: pointer }` del reset, ya no viene; la librería lo devuelve para sus propios componentes, pero tu código puede necesitarlo.",
      "React 19: no hay nada que hacer. `peerDependencies` admite 18 y 19, así que puedes quedarte donde estás y subir cuando quieras.",
      "Los botones de icono recuperan su ancho: si parcheaste `w-control-*` en tu aplicación, quita el parche.",
      "Si parcheaste la tipografía o la posición del menú lateral, o el ancho de la marca al plegar, quita esos parches también.",
    ],
  },
  {
    version: "0.4.2",
    channel: "maintenance",
    publishedAt: "2026-09-03",
    migration: [
      "Nada obligatorio: 0.4.2 son correcciones de presentación.",
      "Si tienes pantallas que comparten componente entre rutas, pásale `animateKey={pathname}` a `PageContainer` para que la entrada se repita en todas y no solo en algunas.",
    ],
  },
  {
    version: "0.4.1",
    channel: "maintenance",
    publishedAt: "2026-09-03",
    migration: [
      "Nada obligatorio: 0.4.1 son correcciones. Si parcheaste alguna de estas cosas en tu aplicación, ya puedes quitar el parche.",
      "Quita cualquier regla propia que forzara el tamaño de letra del menú lateral: `cn` ya no descarta la clase de tamaño al combinarla con un color.",
      "Quita la regla que fijaba el menú lateral al desplazar: `AppShell` lo trae fijo y del alto de la ventana.",
      "Quita el envoltorio de `Column` que abría el tipo de `field`: una columna sin campo se declara ahora con `id` y `body`.",
      "Si usas `asChild` en `SidebarNavItem`, envuelve la etiqueta en un elemento (`<NavLink to=\"/x\"><span>Inicio</span></NavLink>`) para que se pueda ocultar al plegar el menú.",
      "El distintivo de entorno ya no va en versales. Pasa `uppercase: true` si lo prefieres como estaba.",
    ],
  },
  {
    version: "0.4.0",
    channel: "maintenance",
    publishedAt: "2026-09-03",
    migration: [
      "Todo lo de esta versión es aditivo: subir desde 0.3.0 no requiere cambios.",
      "Sustituye `className=\"text-right tabular-nums\"` en columnas de cifras por `align=\"right\"`, que lo trae incluido.",
      "Sustituye las tarjetas de indicadores hechas a mano por `Stat` y `StatGroup`; deja de usar un encabezado para la cifra.",
      "Sustituye `grid gap-… sm:grid-cols-2` en formularios por `FormGrid`, y `className=\"sm:col-span-2\"` en un campo por `span=\"full\"`.",
      "Un `Select` dentro de una barra de herramientas ya no necesita un contenedor de ancho fijo: usa `width=\"auto\"`.",
      "Anota el tipo de la fila en las columnas (`<Column<Movimiento> field=\"valor\" />`) para que un campo mal escrito falle al compilar.",
    ],
  },
  {
    version: "0.3.0",
    channel: "maintenance",
    publishedAt: "2026-09-03",
    migration: [
      "El fondo de la página deja de ser blanco: `--background` pasa a ser el nivel `ground` (un gris muy claro) y `--card` el nivel `raised`. Si tu aplicación bajaba el fondo por su cuenta, quita ese parche.",
      "Si un componente propio usa `bg-background` esperando blanco, cámbialo a `bg-raised`. `bg-background` sigue existiendo, pero ahora es el fondo de la página.",
      "Los tokens `--muted`, `--secondary`, `--border` e `--input` bajaron de luminosidad para seguir leyéndose sobre el fondo nuevo. Si los redefines en tu marca, revísalos contra `ground`.",
      "El menú lateral, el selector de empresa y la línea de versión ahora los trae la librería: sustituye tu armazón por `AppShell`, `SidebarBrand` y `AppVersion`, y borra los tuyos.",
      "El espaciado tiene escala publicada. Sustituye los números sueltos (`p-6`, `gap-4`) por los nombres de rol (`p-inset`, `space-y-stack`, `gap-field`) en los componentes que envuelvan a los de la librería.",
      "La densidad se elige una vez con `<UiProvider density>` en vez de por componente.",
      "Quita la dependencia directa de `lucide-react` e importa los iconos desde la librería. La tabla de equivalencias está en `docs/ICONS.md`.",
      "Las fuentes salieron de `styles.css`: si usas alguno de los presets tipográficos, añade `import \"@piensa-it/ui-library/fonts.css\"`. Si usas tu propia tipografía, no hagas nada y te ahorras 180 KB.",
      "Si extiendes el preset de Tailwind, `content` ahora lo exporta el propio preset: `content: [...uiLibraryContent, \"./src/**/*.{ts,tsx}\"]`.",
    ],
  },
  {
    version: "0.2.1",
    channel: "maintenance",
    publishedAt: "2026-09-03",
    migration: [
      "El paginador de `DataTable` pasa a ser automático: desaparece cuando las filas caben en una página. Pasa `paginator` explícito para conservar el comportamiento anterior.",
      "`toast.success` dura 4 segundos en vez de 2, y el resto 4 en vez de 5.",
      "`Dialog` y `Sheet` dejan de cerrarse por cascada de capas y por foco fuera. Si dependías de ese cierre, ciérralos desde tu propio estado.",
    ],
  },
  {
    version: "0.1.0",
    channel: "maintenance",
    publishedAt: "2026-07-31",
    migration: [],
  },
];
