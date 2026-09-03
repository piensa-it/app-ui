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
export const UI_LIBRARY_VERSION = "0.3.0";

/** Historial público de líneas soportadas, de la más reciente a la más antigua. */
export const UI_LIBRARY_RELEASES: readonly LibraryRelease[] = [
  {
    version: UI_LIBRARY_VERSION,
    channel: "current",
    migration: [
      "El fondo de la página deja de ser blanco: `--background` pasa a ser el nivel `ground` (un gris muy claro) y `--card` el nivel `raised`. Si tu aplicación bajaba el fondo por su cuenta, quita ese parche.",
      "Si un componente propio usa `bg-background` esperando blanco, cámbialo a `bg-raised`. `bg-background` sigue existiendo, pero ahora es el fondo de la página.",
      "Los tokens `--muted`, `--secondary`, `--border` e `--input` bajaron de luminosidad para seguir leyéndose sobre el fondo nuevo. Si los redefines en tu marca, revísalos contra `ground`.",
      "El menú lateral, el selector de empresa y la línea de versión ahora los trae la librería: sustituye tu armazón por `AppShell`, `SidebarBrand` y `AppVersion`, y borra los tuyos.",
      "El espaciado tiene escala publicada. Sustituye los números sueltos (`p-6`, `gap-4`) por los nombres de rol (`p-inset`, `space-y-stack`, `gap-field`) en los componentes que envuelvan a los de la librería.",
      "La densidad se elige una vez con `<UiProvider density>` en vez de por componente.",
      "Quita la dependencia directa de `lucide-react` e importa los iconos desde la librería. La tabla de equivalencias está en `docs/ICONS.md`.",
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
