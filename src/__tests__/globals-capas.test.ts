import { describe, expect, it } from "vitest";

import { capaDe, compilarGlobals } from "../test/compilar-tailwind";

/**
 * En la cascada de CSS, lo que no está en ninguna capa gana **siempre** a lo
 * que sí lo está, por tardío que sea lo segundo. Con Tailwind 3 no se notaba
 * —su PostCSS aplanaba las capas y decidía el orden de aparición—, pero con
 * las capas nativas de v4 un bloque de tokens suelto le gana a la aplicación
 * que redefine esos mismos tokens dentro de `@layer base`, que es como lo
 * documenta el README.
 *
 * Le costó a CoreLink un tema oscuro entero: el suyo perdía contra el nuestro
 * y la aplicación salía en el gris de fábrica en vez de su azul marino (#70).
 * El fallo no da error ni aviso, solo colores equivocados, así que se
 * comprueba sobre el CSS compilado y no leyendo la fuente.
 */
describe("globals.css · los tokens viven todos en la misma capa", () => {
  // Cada patrón incluye un token del propio bloque: sin eso se comprobaría el
  // `:root` de la capa `theme`, que es el de Tailwind y no el nuestro.
  const bloques = [
    ["tema claro", /:root\s*\{[^}]*--ground:/],
    ["tema oscuro", /\.dark\s*\{[^}]*--ground:/],
    ["menú lateral", /\[data-sidebar\]\s*\{[^}]*--sidebar-alpha:/],
    ["variante del menú", /\[data-sidebar="ink"\]\s*\{[^}]*--sidebar:/],
    ["densidad", /\[data-ui-density="compact"\]\s*\{[^}]*--control-compact:/],
    ["tipografía", /\[data-ui-font="geist"\]\s*\{[^}]*--font-sans:/],
  ] as const;

  it.each(bloques)("los tokens de %s caen en la capa base", async (_nombre, patron) => {
    expect(capaDe(await compilarGlobals(), patron)).toBe("base");
  });

  it("el tema claro y el oscuro juegan con las mismas reglas", async () => {
    // Que estén los dos en `base` es lo que permite a una aplicación ganarle a
    // cualquiera de los dos con su propia hoja. Si solo uno estuviera en capa,
    // el tema de la aplicación saldría a medias.
    const css = await compilarGlobals();
    expect(capaDe(css, /\.dark\s*\{[^}]*--ground:/)).toBe(capaDe(css, /:root\s*\{[^}]*--ground:/));
  });
});
