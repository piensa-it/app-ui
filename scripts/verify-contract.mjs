import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Verifica dos reglas de CLAUDE.md que hoy nadie comprueba (#52):
//   1. Todo export de valor de `src/index.ts` aparece en al menos una
//      prueba bajo `src/__tests__/` — si no, «no rompemos la API pública»
//      es una intención, no una garantía (#50).
//   2. Todo componente exportado (PascalCase, definido bajo
//      `src/components/`) tiene una story propia junto a su archivo — sin
//      ella no sale en el sitio de documentación público.
//
// Deliberadamente NO comprueba tipos (`export type ...`), ni exige story a
// exports que no son componentes (hooks `useX`, funciones `camelCase`,
// constantes de configuración): esas reglas del repo hablan de
// "componentes", no de cualquier valor exportado.

const rootUrl = new URL("../", import.meta.url);
const rootPath = fileURLToPath(rootUrl);

/** Extrae `{ A, B, type C }` de cada `export { ... } from "./ruta"` de src/index.ts. */
function parseNamedExports(indexSource) {
  const exports = [];
  const re = /export\s*\{([^}]*)\}\s*from\s*"([^"]+)"/g;
  let match;
  while ((match = re.exec(indexSource))) {
    const [, block, from] = match;
    for (const rawEntry of block.split(",")) {
      const entry = rawEntry.trim();
      if (!entry) continue;
      const isType = entry.startsWith("type ");
      const name = entry
        .replace(/^type\s+/, "")
        .split(/\s+as\s+/)
        .pop()
        .trim();
      exports.push({ name, isType, from });
    }
  }
  return exports;
}

/** Resuelve `"./components/ui/card"` a la ruta real del archivo fuente (.ts o .tsx). */
function resolveSourceFile(from) {
  for (const ext of [".tsx", ".ts"]) {
    const candidate = path.join(rootPath, "src", from.replace(/^\.\//, "") + ext);
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

/** Un export "es un componente" si vive bajo src/components/ y su nombre empieza en mayúscula
 * (así se excluyen hooks `useX` y funciones utilitarias en camelCase, aunque compartan carpeta). */
function looksLikeComponent(exportEntry, sourceFile) {
  if (!sourceFile) return false;
  const relativeToComponents = path.relative(path.join(rootPath, "src", "components"), sourceFile);
  if (relativeToComponents.startsWith("..")) return false;
  return /^[A-Z]/.test(exportEntry.name);
}

function storyFileFor(sourceFile) {
  const withoutExt = sourceFile.replace(/\.tsx?$/, "");
  return `${withoutExt}.stories.tsx`;
}

const indexSource = readFileSync(new URL("src/index.ts", rootUrl), "utf8");
const namedExports = parseNamedExports(indexSource);
// `export * from "./icons"` no declara nombres explícitos: los iconos son
// re-exports directos de lucide-react y no son componentes propios ni API
// que vaya a romperse por nuestro lado, así que quedan fuera a propósito.

const valueExports = namedExports.filter((entry) => !entry.isType);

const testDir = path.join(rootPath, "src", "__tests__");
const testFiles = readdirSync(testDir).filter((file) => file.endsWith(".test.ts") || file.endsWith(".test.tsx"));
const testsContent = testFiles.map((file) => readFileSync(path.join(testDir, file), "utf8")).join("\n");

function escapeForRegex(name) {
  return name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const missingTests = [];
const missingStories = [];
const checkedStoryFiles = new Set();

for (const entry of valueExports) {
  const wordBoundary = new RegExp(`\\b${escapeForRegex(entry.name)}\\b`);
  if (!wordBoundary.test(testsContent)) {
    missingTests.push(entry.name);
  }

  const sourceFile = resolveSourceFile(entry.from);
  if (looksLikeComponent(entry, sourceFile)) {
    const storyFile = storyFileFor(sourceFile);
    if (!checkedStoryFiles.has(storyFile)) {
      checkedStoryFiles.add(storyFile);
      if (!existsSync(storyFile)) {
        missingStories.push(`${entry.name} (${path.relative(rootPath, storyFile)})`);
      }
    }
  }
}

let failed = false;

if (missingTests.length > 0) {
  failed = true;
  console.error(
    `\nSin prueba de humo en src/__tests__/ (${missingTests.length} export${missingTests.length === 1 ? "" : "s"}):`,
  );
  for (const name of missingTests) console.error(`  - ${name}`);
}

if (missingStories.length > 0) {
  failed = true;
  console.error(
    `\nSin story propia (${missingStories.length} componente${missingStories.length === 1 ? "" : "s"}):`,
  );
  for (const entry of missingStories) console.error(`  - ${entry}`);
}

if (failed) {
  console.error(
    "\nCLAUDE.md: todo componente exportado tiene story y al menos una prueba de humo. Ver #52.",
  );
  process.exit(1);
}

console.log(
  `Contrato verificado: ${valueExports.length} exports de valor, todos con prueba; ` +
    `${checkedStoryFiles.size} componentes, todos con story.`,
);
