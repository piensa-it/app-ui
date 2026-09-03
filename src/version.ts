export type ReleaseChannel = "current" | "lts" | "maintenance" | "deprecated";

export interface LibraryRelease {
  version: string;
  channel: ReleaseChannel;
  publishedAt?: string;
}

/** Versión compilada del paquete. Debe coincidir con `package.json`. */
export const UI_LIBRARY_VERSION = "0.3.0";

/** Historial público de líneas soportadas, de la más reciente a la más antigua. */
export const UI_LIBRARY_RELEASES: readonly LibraryRelease[] = [
  { version: UI_LIBRARY_VERSION, channel: "current" },
  { version: "0.2.1", channel: "maintenance", publishedAt: "2026-09-03" },
  { version: "0.1.0", channel: "maintenance", publishedAt: "2026-07-31" },
];
