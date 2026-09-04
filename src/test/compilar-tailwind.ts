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
