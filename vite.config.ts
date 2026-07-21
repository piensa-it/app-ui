import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // P4-26: separa librerías pesadas de terceros en sus propios chunks.
        // Junto con el code-splitting por ruta (React.lazy en App.tsx), esto
        // evita el bundle único de 2.49MB que Vite venía advirtiendo en cada
        // build — recharts y los componentes de Radix solo se descargan
        // cuando la ruta que los usa realmente se visita, y cambian con
        // menos frecuencia que el código propio, así que el navegador los
        // cachea por más tiempo.
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-charts": ["recharts"],
          "vendor-query": ["@tanstack/react-query"],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/__tests__/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/hooks/**", "src/utils/**", "src/lib/**", "src/components/**"],
      exclude: ["src/components/ui/**", "src/__tests__/**", "src/test/**"],
      // Piso real de "no regresión", no una meta aspiracional. Cobertura
      // actual medida 2026-07-20: ~1.25% líneas / 0.65% funciones / 1.38%
      // ramas (ver docs/backlog.md P4-2 y P4-24) — casi todo el código
      // sin `hooks/`, `components/` ni `lib/i18n` está sin probar. El CI
      // (`.github/workflows/ci.yml`) corre `npm run test:coverage` y falla
      // si baja de este piso. Subir estos números a medida que se agreguen
      // tests es la forma de que el "quality gate" avance con el proyecto.
      thresholds: {
        lines: 1,
        functions: 0.5,
        branches: 1,
      },
    },
  },
}));
