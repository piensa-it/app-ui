import type { Config } from "tailwindcss";
import preset from "./tailwind-preset.js";

/**
 * Config de Tailwind usada SOLO para construir esta librería (playground de
 * dev + generación de dist/style.css). Reusa el mismo preset que se publica
 * como "@piensa-it/ui-library/tailwind-preset" para que los repos
 * consumidores compartan exactamente los mismos tokens — ver README >
 * "Theming por marca".
 */
const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx,mdx}"],
  presets: [preset],
  // `theme.container` vive ahora como `@utility container` en globals.css:
  // Tailwind 4 lo ignora en la configuración, en silencio.
};

export default config;
