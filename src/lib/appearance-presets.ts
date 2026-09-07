/**
 * Lo que el sistema de diseño trae de fábrica y un panel de apariencia puede
 * ofrecer: las seis paletas y los cuatro presets tipográficos, con su nombre.
 */
/** Las seis paletas incluidas, con su nombre. */
export const BUNDLED_PALETTES: readonly { id: string; label: string }[] = [
  { id: "indigo", label: "Índigo" },
  { id: "ocean", label: "Océano" },
  { id: "violet", label: "Violeta" },
  { id: "emerald", label: "Esmeralda" },
  { id: "ruby", label: "Rubí" },
  { id: "amber", label: "Ámbar" },
];

/** Los cuatro presets tipográficos, con su nombre. */
export const FONT_PRESETS: readonly { id: string; label: string }[] = [
  { id: "geist", label: "Geist" },
  { id: "inter", label: "Inter" },
  { id: "dm-sans", label: "DM Sans" },
  { id: "system", label: "Del sistema" },
];

/**
 * Los cuatro estilos visuales, con su nombre. `classic` es el de fábrica y
 * no redefine ningún token. Ver `looks.css`.
 */
export const BUNDLED_LOOKS: readonly { id: string; label: string }[] = [
  { id: "classic", label: "Clásico" },
  { id: "soft", label: "Suave" },
  { id: "deep", label: "Profundo" },
  { id: "flat", label: "Plano" },
];
