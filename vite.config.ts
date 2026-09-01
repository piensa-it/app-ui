import { defineConfig } from "vite";
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

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
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
      fileName: (format) => `ui-library.${format === "es" ? "es" : "cjs"}.js`,
      // Desde Vite 6 el CSS de una librería se nombra a partir del `fileName`
      // de la entrada (daría `ui-library.css`). Se fija explícitamente para
      // seguir emitiendo `dist/style.css`, que es la ruta que package.json
      // publica como "./styles.css" y la que ya importan los consumidores.
      cssFileName: "style",
    },
    rollupOptions: {
      external: isExternalDependency,
      output: {
        // Preserva nombres reconocibles para debugging en apps consumidoras.
        exports: "named",
      },
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
