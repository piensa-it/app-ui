// Tipos del preset publicado, para que un consumidor con TypeScript estricto
// (`astro check`, `tsc --noImplicitAny`) no falle con TS7016 al importar
// "@piensa-it/ui-library/tailwind-preset". Ver #212.
import type { Config } from "tailwindcss";

/** Rutas de los módulos publicados de la librería, para el `content` de Tailwind. */
export declare const content: string[];

/** Preset de Tailwind con los tokens compartidos (colores, radios, fuentes). */
declare const preset: Partial<Config>;
export default preset;
