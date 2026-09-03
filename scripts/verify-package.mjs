import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";

const rootUrl = new URL("../", import.meta.url);
const rootPath = fileURLToPath(rootUrl);

/**
 * Construye un consumidor mínimo contra `dist/` (todo bundleado menos React) y
 * devuelve los módulos que entraron en el bundle. Sirve para comprobar que el
 * paquete se poda: importar `Button` no debe arrastrar el resto de la librería.
 */
async function buildConsumer(source) {
  const dir = mkdtempSync(path.join(tmpdir(), "ui-library-treeshake-"));
  try {
    const entry = path.join(dir, "entry.jsx");
    writeFileSync(entry, source.replace("PACKAGE", path.join(rootPath, "dist/esm/index.js")));
    const result = await build({
      root: rootPath,
      logLevel: "silent",
      configFile: false,
      build: {
        write: false,
        lib: { entry, formats: ["es"], fileName: "consumer" },
        rollupOptions: {
          external: ["react", "react-dom", "react/jsx-runtime"],
        },
      },
    });
    // `renderedModules` son los que SOBREVIVEN al tree-shaking (los que solo
    // se parsean y luego se descartan no cuentan).
    const outputs = Array.isArray(result) ? result[0].output : result.output;
    const chunks = outputs.filter((chunk) => chunk.type === "chunk");
    const survivors = chunks.flatMap((chunk) =>
      Object.entries(chunk.modules).filter(([, module]) => module.renderedLength > 0),
    );
    return {
      modules: survivors.map(([id]) => id),
      // Solo el código de la librería: las dependencias de terceros
      // (tailwind-merge, lucide-react…) las paga el consumidor de todos modos.
      libraryBytes: survivors
        .filter(([id]) => id.startsWith(path.join(rootPath, "dist")))
        .reduce((total, [, module]) => total + module.renderedLength, 0),
    };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
const pkg = JSON.parse(readFileSync(new URL("package.json", rootUrl), "utf8"));
const packed = JSON.parse(
  execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], {
    cwd: rootUrl,
    encoding: "utf8",
  }),
)[0];

const publishedFiles = new Set(packed.files.map((file) => file.path));
const requiredFiles = [
  "dist/index.d.ts",
  "dist/style.css",
  "dist/fonts.css",
  "dist/esm/index.js",
  "dist/cjs/index.cjs",
  "tailwind-preset.js",
];
const missingFiles = requiredFiles.filter((file) => !publishedFiles.has(file));
const publishedEsmFiles = [...publishedFiles].filter((file) => file.startsWith("dist/esm/") && file.endsWith(".js"));

if (missingFiles.length > 0) {
  throw new Error(`El paquete no publicaría archivos requeridos: ${missingFiles.join(", ")}`);
}

const esm = readFileSync(new URL("dist/esm/index.js", rootUrl), "utf8");
const versionSource = readFileSync(new URL("src/version.ts", rootUrl), "utf8");
const sourceVersion = versionSource.match(/UI_LIBRARY_VERSION = "([^"]+)"/)?.[1];
if (sourceVersion !== pkg.version) {
  throw new Error(`La versión pública (${sourceVersion}) no coincide con package.json (${pkg.version}).`);
}
// Plugins usados exclusivamente por el preset publicado no deben aparecer en
// el runtime de React, aunque vivan en `dependencies` para que el consumidor
// pueda cargar el preset.
const presetOnlyDependencies = new Set(["tailwindcss-animate"]);
const dependencyNames = Object.keys(pkg.dependencies ?? {}).filter(
  (dependency) => !presetOnlyDependencies.has(dependency),
);
// Con `preserveModules` cada componente vive en su propio archivo: se busca
// la importación externalizada en todo el árbol ESM, no solo en el índice.
const esmSources = publishedEsmFiles
  .map((file) => readFileSync(new URL(file, rootUrl), "utf8"))
  .join("\n");
const missingExternalImports = dependencyNames.filter(
  (dependency) => !esmSources.includes(`from "${dependency}`) && !esmSources.includes(`from '${dependency}`),
);

if (missingExternalImports.length > 0) {
  throw new Error(
    `Estas dependencias no aparecen externalizadas en el bundle ESM: ${missingExternalImports.join(", ")}`,
  );
}

// --- Las fuentes no viajan dentro de style.css (#38) ---
// Un consumidor con su propia tipografía pagaba ~180 KB en base64 que nunca
// usa. Ahora se publican aparte: `@piensa-it/ui-library/fonts.css`.
const styleCss = readFileSync(new URL("dist/style.css", rootUrl), "utf8");
if (styleCss.includes("@font-face")) {
  throw new Error("dist/style.css no debe declarar @font-face: las fuentes van en dist/fonts.css.");
}
if (styleCss.includes("data:font") || styleCss.includes(";base64,")) {
  throw new Error("dist/style.css no debe incrustar fuentes en base64.");
}
const fontsCss = readFileSync(new URL("dist/fonts.css", rootUrl), "utf8");
const expectedFaces = ["Geist Variable", "Inter Variable", "DM Sans Variable"];
const missingFaces = expectedFaces.filter((family) => !fontsCss.includes(family));
if (missingFaces.length > 0) {
  throw new Error(`dist/fonts.css no declara: ${missingFaces.join(", ")}`);
}
const publishedFontFiles = [...publishedFiles].filter((file) => file.endsWith(".woff2"));
if (publishedFontFiles.length !== expectedFaces.length) {
  throw new Error(
    `Se esperaban ${expectedFaces.length} archivos .woff2 publicados, hay ${publishedFontFiles.length}.`,
  );
}

// --- Prueba de poda: importar `Button` no arrastra el resto (#38) ---
// Se construye un consumidor mínimo contra `dist/` con todo bundleado menos
// React, y se revisa qué módulos entraron. Antes de `preserveModules` el
// paquete era un único archivo y Rollup no podía descartar nada.
const pruned = await buildConsumer('import { Button } from "PACKAGE";\nexport default Button;');
const forbidden = [
  "@zag-js/date-picker",
  "@zag-js/combobox",
  "@zag-js/file-upload",
  "recharts",
  "@tanstack/react-table",
  "@internationalized/date",
];
const leaked = forbidden.filter((dependency) => pruned.modules.some((id) => id.includes(`/${dependency}/`)));
if (leaked.length > 0) {
  throw new Error(`Importar solo Button arrastra: ${leaked.join(", ")}`);
}
// Control: el DatePicker sí debe traerse su motor, o la prueba anterior no
// estaría comprobando nada.
const full = await buildConsumer('import { DatePicker } from "PACKAGE";\nexport default DatePicker;');
if (!full.modules.some((id) => id.includes("/@zag-js/date-picker/"))) {
  throw new Error("La prueba de poda no es concluyente: DatePicker tampoco arrastra @zag-js/date-picker.");
}

// Presupuesto del entry público. Incluye gráficas compuestas, configuración
// ERP y el motor liviano de agregación de PivotTable; TanStack y Recharts
// permanecen externalizados. Subido de 133 a 136 KB al incorporar Motion,
// Illustration y AnimatedBanner, y de 136 a 140 KB con Motion fase 2
// (Stagger, Reveal, AnimatedNumber y presets de Skeleton, +3,2 KB) — también
// CSS-first/rAF, sin runtime de animación nuevo.
// Con `preserveModules` el peso del árbol publicado ya no dice nada: lo que
// importa es lo que se lleva un consumidor. Se mide sobre el build real.
// Antes de #38 la librería se publicaba como un solo archivo y este número era
// el paquete entero (~140 KB). Ahora Button arrastra su recipe y `cn`, y nada
// más.
const maxButtonBytes = 8 * 1024;
if (pruned.libraryBytes > maxButtonBytes) {
  throw new Error(
    `Un consumidor que solo importa Button se lleva ${pruned.libraryBytes} bytes de la librería (máx. ${maxButtonBytes}).`,
  );
}
if (full.libraryBytes <= pruned.libraryBytes) {
  throw new Error("La prueba de poda no es concluyente: DatePicker no pesa más que Button.");
}
const esmBytes = packed.files
  .filter((file) => file.path.startsWith("dist/esm/"))
  .reduce((total, file) => total + file.size, 0);

const motionCss = readFileSync(new URL("src/components/ui/motion.css", rootUrl), "utf8");
if (!motionCss.includes("prefers-reduced-motion: reduce")) {
  throw new Error("Motion debe conservar soporte para prefers-reduced-motion.");
}
if (!motionCss.includes("animation-play-state: paused")) {
  throw new Error("Motion debe conservar pausa real mediante animation-play-state.");
}

console.log(
  `Paquete verificado: ${packed.files.length} archivos, ${packed.size} bytes comprimidos, ` +
    `ESM ${esmBytes} bytes en ${publishedEsmFiles.length} módulos. ` +
    `Consumidor mínimo (Button): ${pruned.libraryBytes} bytes de librería; con DatePicker: ${full.libraryBytes}.`,
);
