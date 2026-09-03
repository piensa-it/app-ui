import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react-swc";
import dts from "vite-plugin-dts";
import path from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(path.resolve(__dirname, "package.json"), "utf-8"));

// Cualquier dependency/peerDependency del package.json se externaliza: la
// librería no debe empaquetar React ni sus propias dependencias (Radix,
// framer-motion, etc.) dentro del bundle — cada repo consumidor las
// resuelve desde su propio node_modules. Esto mantiene el paquete liviano
// y evita duplicados/versiones cruzadas en runtime.
const externalDeps = [
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.peerDependencies ?? {}),
];

// Rollup compara strings de `external` de forma exacta. Ark UI y otros
// paquetes se importan mediante subpaths (`@ark-ui/react/dialog`), así que
// externalizar solo el nombre raíz terminaría incluyendo esos módulos en el
// bundle. Esta función cubre tanto el paquete como cualquiera de sus subpaths.
const isExternalDependency = (id: string) =>
  externalDeps.some((dependency) => id === dependency || id.startsWith(`${dependency}/`));

/**
 * Las tres fuentes variables pesan ~180 KB en base64 y viajaban dentro de
 * `dist/style.css`, aunque el consumidor use su propia tipografía (#38). Este
 * plugin las publica aparte: los `.woff2` como archivos y `dist/fonts.css`
 * apuntando a ellos, para importar a voluntad
 * (`@piensa-it/ui-library/fonts.css`).
 */
const FONT_FACES = [
  { family: "Geist Variable", weight: "100 900", file: "@fontsource-variable/geist/files/geist-latin-wght-normal.woff2" },
  { family: "Inter Variable", weight: "100 900", file: "@fontsource-variable/inter/files/inter-latin-wght-normal.woff2" },
  { family: "DM Sans Variable", weight: "100 1000", file: "@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2" },
];

const fontsStylesheet = (): PluginOption => ({
  name: "ui-library-fonts-stylesheet",
  apply: "build",
  generateBundle() {
    const rules = FONT_FACES.map(({ family, weight, file }) => {
      const source = path.resolve(__dirname, "node_modules", file);
      const fileName = `fonts/${path.basename(file)}`;
      this.emitFile({ type: "asset", fileName, source: readFileSync(source) });
      return [
        "@font-face {",
        `  font-family: "${family}";`,
        "  font-style: normal;",
        "  font-display: swap;",
        `  font-weight: ${weight};`,
        `  src: url("./${fileName}") format("woff2-variations");`,
        "}",
      ].join("\n");
    });
    this.emitFile({
      type: "asset",
      fileName: "fonts.css",
      source: `/** Subsets latinos autoalojados; cubren español sin descargar scripts externos. */\n${rules.join("\n\n")}\n`,
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    fontsStylesheet(),
    // Genera dist/index.d.ts a partir de src/index.ts. Se omite en modo
    // "development" (npm run build:dev) para acelerar el ciclo local.
    mode !== "development" &&
      dts({
        tsconfigPath: "./tsconfig.app.json",
        include: ["src"],
        exclude: ["src/**/*.test.*", "src/test/**", "src/App.tsx", "src/main.tsx"],
        rollupTypes: true,
        insertTypesEntry: true,
      }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "PiensaItUiLibrary",
      formats: ["es", "cjs"],
      // Desde Vite 6 el CSS de una librería se nombra a partir del `fileName`
      // de la entrada (daría `ui-library.css`). Se fija explícitamente para
      // seguir emitiendo `dist/style.css`, que es la ruta que package.json
      // publica como "./styles.css" y la que ya importan los consumidores.
      cssFileName: "style",
    },
    rollupOptions: {
      external: isExternalDependency,
      // Un módulo por archivo fuente (`preserveModules`) en vez de un único
      // bundle: así el bundler del consumidor poda a nivel de módulo y quien
      // importa solo `Button` no arrastra `@zag-js/date-picker` ni Recharts
      // (#38). `sideEffects` en package.json solo marca el CSS, así que cada
      // módulo JS sin uso se descarta entero aunque tenga `cva(...)` o
      // `createContext` a nivel superior. La importación pública sigue siendo
      // desde la raíz del paquete: `dist/esm/index.js` reexporta todo.
      output: [
        {
          format: "es",
          dir: "dist",
          entryFileNames: "esm/[name].js",
          preserveModules: true,
          preserveModulesRoot: "src",
          exports: "named",
        },
        {
          format: "cjs",
          dir: "dist",
          entryFileNames: "cjs/[name].cjs",
          preserveModules: true,
          preserveModulesRoot: "src",
          exports: "named",
        },
      ],
    },
    sourcemap: true,
    // El CSS de todos los componentes se emite consolidado como
    // dist/style.css (ver "exports" -> "./styles.css" en package.json).
    cssCodeSplit: false,
    // public/ (favicon del playground, etc.) solo se sirve en `npm run dev`;
    // no debe copiarse a dist/ ni publicarse dentro del paquete npm.
    copyPublicDir: false,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
}));
