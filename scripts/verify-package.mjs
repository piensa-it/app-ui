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

const maxEsmBytes = 100 * 1024;
const esmEntry = packed.files.find((file) => file.path === "dist/ui-library.es.js");
if (!esmEntry || esmEntry.size > maxEsmBytes) {
  throw new Error(`El bundle ESM supera ${maxEsmBytes} bytes: ${esmEntry?.size ?? "desconocido"}`);
}

console.log(
  `Paquete verificado: ${packed.files.length} archivos, ${packed.size} bytes comprimidos, ESM ${esmEntry.size} bytes.`,
);
