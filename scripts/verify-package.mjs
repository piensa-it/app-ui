import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const rootUrl = new URL("../", import.meta.url);
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
  "dist/ui-library.es.js",
  "dist/ui-library.cjs.js",
  "tailwind-preset.js",
];
const missingFiles = requiredFiles.filter((file) => !publishedFiles.has(file));

if (missingFiles.length > 0) {
  throw new Error(`El paquete no publicaría archivos requeridos: ${missingFiles.join(", ")}`);
}

const esm = readFileSync(new URL("dist/ui-library.es.js", rootUrl), "utf8");
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
const missingExternalImports = dependencyNames.filter(
  (dependency) => !esm.includes(`from \"${dependency}`) && !esm.includes(`from '${dependency}`),
);

if (missingExternalImports.length > 0) {
  throw new Error(
    `Estas dependencias no aparecen externalizadas en el bundle ESM: ${missingExternalImports.join(", ")}`,
  );
}

// Presupuesto del entry público. Incluye gráficas compuestas, configuración
// ERP y el motor liviano de agregación de PivotTable; TanStack y Recharts
// permanecen externalizados. Subido de 126 a 133 KB por el componente Menu
// (nuevo, compound sobre Ark UI) y las vistas de mes/año del DatePicker
// (antes solo tenía vista de día) — Pagination se extrajo de DataTable sin
// agregar código nuevo, es neutro en tamaño.
const maxEsmBytes = 133 * 1024;
const esmEntry = packed.files.find((file) => file.path === "dist/ui-library.es.js");
if (!esmEntry || esmEntry.size > maxEsmBytes) {
  throw new Error(`El bundle ESM supera ${maxEsmBytes} bytes: ${esmEntry?.size ?? "desconocido"}`);
}

console.log(
  `Paquete verificado: ${packed.files.length} archivos, ${packed.size} bytes comprimidos, ESM ${esmEntry.size} bytes.`,
);
