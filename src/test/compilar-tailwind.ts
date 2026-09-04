import fs from "node:fs";
import path from "node:path";
import postcss from "postcss";
import tailwindcss from "@tailwindcss/postcss";

/**
 * Compila el CSS real de Tailwind para una prueba.
 *
 * Existe porque hay comprobaciones que solo tienen sentido sobre el CSS
 * generado: si una clase se emite, qué valor acaba teniendo un elemento, o si
 * dos utilidades se pisan. Mirar la lista de clases del componente no lo diría.
 *
 * En Tailwind 4 el punto de entrada es `@tailwindcss/postcss`, y las fuentes se
 * declaran dentro del propio CSS con `@source` en vez de con la opción
 * `content` de la configuración.
 */
export interface OpcionesCompilacion {
  /** Rutas o globs de los que extraer clases, relativos a la raíz del repo. */
  fuentes?: string[];
  /** Clases sueltas, cuando no interesa escanear archivos. */
  clases?: string[];
  /** CSS extra que se añade después de las importaciones. */
  css?: string;
}

export async function compilarTailwind({
  fuentes = [],
  clases = [],
  css = "",
}: OpcionesCompilacion): Promise<string> {
  const raiz = process.cwd();
  const entrada = [
    '@import "tailwindcss";',
    `@config "${path.join(raiz, "tailwind.config.ts")}";`,
    ...fuentes.map((fuente) => `@source "${path.join(raiz, fuente)}";`),
    ...(clases.length > 0 ? [`@source inline("${clases.join(" ")}");`] : []),
    css,
  ].join("\n");

  const resultado = await postcss([tailwindcss(), desenvolverCapas]).process(entrada, {
    from: path.join(raiz, "src/styles/globals.css"),
  });
  return resultado.css;
}

/**
 * Saca las reglas de dentro de `@layer`.
 *
 * jsdom no implementa las capas en cascada: ignora por completo lo que vive
 * dentro de un `@layer`, y Tailwind 4 mete ahí todas sus utilidades. Sin esto,
 * cualquier comprobación de estilo calculado daría el valor por defecto y las
 * pruebas pasarían o fallarían por el motivo equivocado.
 *
 * Se pierde la precedencia entre capas, que en un navegador sí cuenta. Es
 * aceptable aquí: estas pruebas comprueban qué declara una clase, no quién gana
 * entre dos capas.
 */
const desenvolverCapas: postcss.Plugin = {
  postcssPlugin: "desenvolver-capas",
  OnceExit(root) {
    root.walkAtRules("layer", (regla) => {
      if (regla.nodes) regla.replaceWith(regla.nodes);
      else regla.remove();
    });
  },
};

/**
 * Compila `src/styles/globals.css` tal cual, **conservando las capas**.
 *
 * `compilarTailwind` las desenvuelve para que jsdom pueda leer estilos; acá
 * hace falta lo contrario, porque lo que se comprueba es precisamente en qué
 * capa acaba cada bloque de tokens.
 */
export async function compilarGlobals(): Promise<string> {
  const ruta = path.join(process.cwd(), "src/styles/globals.css");
  const resultado = await postcss([tailwindcss()]).process(fs.readFileSync(ruta, "utf8"), {
    from: ruta,
  });
  return resultado.css;
}

/**
 * En qué capa en cascada cae un bloque de CSS, o `null` si queda fuera de
 * todas.
 *
 * Se localiza por expresión regular y no por selector a secas porque un mismo
 * selector aparece varias veces: el `:root` de la capa `theme` es el de
 * Tailwind, no el nuestro. La expresión debe empezar en el selector e incluir
 * algo que identifique el bloque —normalmente uno de sus tokens—, para no
 * comprobar el bloque equivocado y dar la prueba por buena.
 *
 * Se cuentan llaves en vez de resolver el anidamiento con otra expresión
 * regular porque lo que importa es si el bloque de la capa seguía abierto en
 * esa posición: un `@layer` que ya cerró antes no cuenta.
 */
export function capaDe(css: string, patron: RegExp): string | null {
  const encontrado = css.match(patron);
  if (encontrado?.index === undefined) {
    throw new Error(`el patrón ${patron} no aparece en el CSS compilado`);
  }
  const posicion = encontrado.index;

  const capas = [...css.matchAll(/@layer\s+([a-z-]+)\s*\{/g)].reverse();
  for (const capa of capas) {
    const apertura = (capa.index as number) + capa[0].length;
    if (apertura > posicion) continue;
    let profundidad = 0;
    let cerrada = false;
    for (let i = apertura; i < posicion; i++) {
      if (css[i] === "{") profundidad++;
      else if (css[i] === "}") {
        if (profundidad === 0) {
          cerrada = true;
          break;
        }
        profundidad--;
      }
    }
    if (!cerrada) return capa[1];
  }
  return null;
}
