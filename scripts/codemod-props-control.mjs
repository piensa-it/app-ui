#!/usr/bin/env node
/**
 * Renombra `onValueChange` a `onChange` en los usos JSX de `Slider` y
 * `RadioGroup` — los dos controles que rompe la regla de naming de la 1.0.0
 * (#150, #62): "¿selección de un conjunto? → `value`/`onChange`".
 *
 * A propósito NO es un reemplazo de texto plano como
 * `codemod-espaciado.mjs`: `onValueChange` también lo usan `Tabs`
 * (navegación, no cambia — está excluido a propósito, ver `src/version.ts`),
 * `Accordion`, `Menu.RadioItemGroup` y cualquier handler propio de la
 * aplicación que se llame igual por coincidencia. Un `replace` global
 * renombraría todo eso también y rompería en silencio lo que no debía
 * tocarse.
 *
 * En su lugar, el script recorre cada archivo carácter a carácter, reconoce
 * las etiquetas JSX de apertura (`<Nombre ...>`) sin confundirse con los
 * `>` de una flecha (`=>`) dentro de las llaves de una prop, ni con los que
 * aparecen dentro de una cadena, y solo dentro de una etiqueta `<Slider` o
 * `<RadioGroup` (no `<RadioGroupItem`) sustituye `onValueChange` por
 * `onChange`.
 *
 * No toca `src/components/ui/slider.tsx` ni `radio-group.tsx`: la firma del
 * componente se edita a mano, una vez.
 *
 * Uso:
 *   node scripts/codemod-props-control.mjs "src/**\/*.tsx"
 *   node scripts/codemod-props-control.mjs --dry "src/**\/*.tsx"
 */
import fs from "node:fs";
import path from "node:path";

const OBJETIVO = new Set(["Slider", "RadioGroup"]);

const argumentos = process.argv.slice(2);
const soloVista = argumentos.includes("--dry");
const patrones = argumentos.filter((a) => a !== "--dry");

if (patrones.length === 0) {
  console.error("uso: node scripts/codemod-props-control.mjs [--dry] <glob> [glob...]");
  process.exit(1);
}

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

/**
 * Reescribe un archivo: encuentra cada etiqueta JSX de apertura y, si es
 * `Slider` o `RadioGroup`, sustituye `onValueChange` por `onChange` solo
 * dentro de esa etiqueta.
 */
function reescribir(texto) {
  let salida = "";
  let cuenta = 0;
  let i = 0;
  const n = texto.length;

  while (i < n) {
    const ch = texto[i];

    if (ch === "<" && /[A-Za-z]/.test(texto[i + 1] ?? "")) {
      // Nombre de la etiqueta.
      let j = i + 1;
      while (j < n && /[A-Za-z0-9_.]/.test(texto[j])) j++;
      const nombre = texto.slice(i + 1, j);

      // Encuentra el `>` que cierra la etiqueta, saltando cadenas y llaves
      // anidadas (donde puede haber `=>`, comparaciones `>`, etc).
      let k = j;
      let llaves = 0;
      let cierre = -1;
      while (k < n) {
        const c = texto[k];
        if (c === '"' || c === "'" || c === "`") {
          const comilla = c;
          k++;
          while (k < n && texto[k] !== comilla) {
            if (texto[k] === "\\") k++;
            k++;
          }
          k++;
          continue;
        }
        if (c === "{") {
          llaves++;
          k++;
          continue;
        }
        if (c === "}") {
          llaves--;
          k++;
          continue;
        }
        if (c === "<" && llaves === 0) {
          // Otra etiqueta se abrió antes de cerrar esta — no es una etiqueta
          // JSX real (o el escáner se perdió). Se aborta esta búsqueda.
          break;
        }
        if (c === ">" && llaves === 0) {
          cierre = k;
          break;
        }
        k++;
      }

      if (cierre !== -1 && OBJETIVO.has(nombre)) {
        const etiqueta = texto.slice(i, cierre + 1);
        const reemplazada = etiqueta.replace(/\bonValueChange\b/g, () => {
          cuenta++;
          return "onChange";
        });
        salida += reemplazada;
        i = cierre + 1;
        continue;
      }
    }

    salida += ch;
    i++;
  }

  return { salida, cuenta };
}

let tocados = 0;
let sustituciones = 0;

for (const patron of patrones) {
  for (const archivo of archivos(patron)) {
    const original = fs.readFileSync(archivo, "utf8");
    const { salida, cuenta } = reescribir(original);
    if (cuenta === 0) continue;
    tocados++;
    sustituciones += cuenta;
    console.log(`  ${archivo}: ${cuenta}`);
    if (!soloVista) fs.writeFileSync(archivo, salida);
  }
}

console.log(
  soloVista
    ? `\n${sustituciones} props en ${tocados} archivos (sin escribir: se pasó --dry)`
    : `\n${sustituciones} props reescritas en ${tocados} archivos`,
);
console.log(
  "\nRecordá también: la firma de Slider/RadioGroup cambia (onChange en vez de\nonValueChange), y si tenés tu propio wrapper alrededor de alguno de los dos\ncon el mismo nombre de prop, este script también lo va a tocar si se llama\nSlider o RadioGroup — revisá el diff antes de commitear.",
);
