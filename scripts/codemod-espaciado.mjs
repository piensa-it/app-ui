#!/usr/bin/env node
/**
 * Renombra las clases de la escala de espaciado a su nombre con prefijo:
 * `p-md` → `p-ui-md`, `gap-sm` → `gap-ui-sm`, `-mt-lg` → `-mt-ui-lg`.
 *
 * Hace falta al subir a 0.6.0. Los pasos sueltos del espaciado se llamaban
 * igual que la escala de contenedores de Tailwind (`sm`, `md`, `lg`…) y en
 * Tailwind 4 el espaciado le gana siempre, así que `max-w-2xl` valía 3 rem en
 * vez de 42 rem. Ver #71.
 *
 * Solo toca los prefijos que leen el espaciado. `max-w-lg`, `w-md` y
 * `min-w-sm` se dejan como están **a propósito**: son justamente los que
 * vuelven a funcionar con esta versión.
 *
 * Los nombres por rol (`p-inset`, `space-y-stack`, `gap-field`) no cambian.
 *
 * Uso:
 *   node scripts/codemod-espaciado.mjs "src/**\/*.{ts,tsx,css,mdx}"
 *   node scripts/codemod-espaciado.mjs --dry "src/**\/*.tsx"
 */
import fs from "node:fs";
import path from "node:path";

/** Prefijos de utilidad que resuelven contra la escala de espaciado. */
const PREFIJOS = [
  "p", "px", "py", "pt", "pr", "pb", "pl", "ps", "pe",
  "m", "mx", "my", "mt", "mr", "mb", "ml", "ms", "me",
  "gap", "gap-x", "gap-y",
  "space-x", "space-y",
  "inset", "inset-x", "inset-y",
  "top", "right", "bottom", "left", "start", "end",
  "translate-x", "translate-y",
  "scroll-m", "scroll-mx", "scroll-my", "scroll-mt", "scroll-mr", "scroll-mb", "scroll-ml",
  "scroll-p", "scroll-px", "scroll-py", "scroll-pt", "scroll-pr", "scroll-pb", "scroll-pl",
  "indent",
];

/** Pasos que cambian de nombre. Los de rol se quedan como están. */
const PASOS = ["2xs", "xs", "sm", "md", "lg", "xl", "2xl"];

// El límite por delante admite el inicio, un espacio, una comilla, un corchete
// —clases dentro de `cn([...])`— o los dos puntos de una variante
// (`sm:gap-md`, `hover:p-lg`, `group-data-[x]:mt-sm`).
const PATRON = new RegExp(
  `(^|[\\s"'\`\\[:{(,])(-?(?:${PREFIJOS.join("|")})-)(${PASOS.join("|")})(?=$|[\\s"'\`\\])},:])`,
  "gm",
);

const argumentos = process.argv.slice(2);
const soloVista = argumentos.includes("--dry");
const patrones = argumentos.filter((a) => a !== "--dry");

if (patrones.length === 0) {
  console.error("uso: node scripts/codemod-espaciado.mjs [--dry] <glob> [glob...]");
  process.exit(1);
}

/** Expande los globs sin depender de nada externo. */
function* archivos(patron) {
  const base = patron.split(/[*?[]/)[0];
  const raiz = base.endsWith("/") ? base : path.dirname(base);
  const extensiones = (patron.match(/\{([^}]+)\}/)?.[1] ?? patron.split(".").pop() ?? "")
    .split(",")
    .map((e) => "." + e.replace(/^\./, "").replace(/[*/]/g, ""))
    .filter((e) => e.length > 1);

  const pila = [raiz];
  while (pila.length > 0) {
    const actual = pila.pop();
    if (!fs.existsSync(actual)) continue;
    for (const entrada of fs.readdirSync(actual, { withFileTypes: true })) {
      const completa = path.join(actual, entrada.name);
      if (entrada.isDirectory()) {
        if (entrada.name !== "node_modules" && !entrada.name.startsWith(".")) pila.push(completa);
      } else if (extensiones.length === 0 || extensiones.some((e) => completa.endsWith(e))) {
        yield completa;
      }
    }
  }
}

let tocados = 0;
let sustituciones = 0;

for (const patron of patrones) {
  for (const archivo of archivos(patron)) {
    const original = fs.readFileSync(archivo, "utf8");
    let cuenta = 0;
    const nuevo = original.replace(PATRON, (_todo, antes, prefijo, paso) => {
      cuenta++;
      return `${antes}${prefijo}ui-${paso}`;
    });
    if (cuenta === 0) continue;
    tocados++;
    sustituciones += cuenta;
    console.log(`  ${archivo}: ${cuenta}`);
    if (!soloVista) fs.writeFileSync(archivo, nuevo);
  }
}

console.log(
  soloVista
    ? `\n${sustituciones} clases en ${tocados} archivos (sin escribir: se pasó --dry)`
    : `\n${sustituciones} clases reescritas en ${tocados} archivos`,
);
