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
export const UI_LIBRARY_VERSION = "0.4.2";

/** Historial público de líneas soportadas, de la más reciente a la más antigua. */
export const UI_LIBRARY_RELEASES: readonly LibraryRelease[] = [
  {
    version: UI_LIBRARY_VERSION,
    channel: "current",
    migration: [
      "Tailwind 4: si tu aplicación extiende nuestro preset, sustituye `@tailwind base/components/utilities` por `@import \"tailwindcss\";` más `@config \"./tailwind.config.js\";`, y cambia `postcss.config.js` a `@tailwindcss/postcss`. El preset en sí no cambia.",
      "Tailwind 4: quita `autoprefixer` de tus dependencias, que v4 lo trae incorporado.",
      "Tailwind 4: sustituye `outline-none` por `outline-hidden` en tu código. En v4 `outline-none` quita el contorno de verdad, y con él la pista del modo de alto contraste.",
      "Tailwind 4, IMPORTANTE: si usas `max-w-sm|md|lg|xl|2xl`, revísalos. Nuestra escala de espaciado usa esos mismos nombres y en v4 gana sobre los anchos máximos, así que `max-w-lg` pasa a valer 1,5 rem en vez de 32 rem. Usa un valor explícito o las utilidades `panel-*`.",
      "Tailwind 4: si dependías de `button { cursor: pointer }` del reset, ya no viene; la librería lo devuelve para sus propios componentes, pero tu código puede necesitarlo.",
      "React 19: no hay nada que hacer. `peerDependencies` admite 18 y 19, así que puedes quedarte donde estás y subir cuando quieras.",
      "Nada obligatorio del resto: 0.4.2 son correcciones de presentación.",
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
