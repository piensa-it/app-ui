import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { UI_LIBRARY_RELEASES, UI_LIBRARY_RELEASE_1_0_0 } from "../version";

/**
 * `UI_LIBRARY_RELEASE_1_0_0` (#150) vive fuera de `UI_LIBRARY_RELEASES` a
 * propósito, en lo que se hace el release: ver el comentario junto a su
 * definición en `src/version.ts`. Mientras flota ahí, nada más la referencia,
 * así que si una de las tres rupturas que describe se corrige o se amplía
 * mientras tanto, las notas se desactualizan en silencio y el PR de release
 * terminaría moviendo una migración que ya no es la que hay.
 *
 * Esta prueba la ata a la realidad de dos formas: su posición (nunca a medio
 * array) y sus afirmaciones (siguen siendo ciertas sobre el código actual).
 */
describe("notas de migración de la 1.0.0 (#150)", () => {
  it("está a la cabeza de UI_LIBRARY_RELEASES o fuera del array por completo, nunca a medio camino", () => {
    const indice = UI_LIBRARY_RELEASES.findIndex((r) => r.version === "1.0.0");
    expect(
      indice === -1 || indice === 0,
      `UI_LIBRARY_RELEASE_1_0_0 aparece en la posición ${indice} de UI_LIBRARY_RELEASES: debe estar en la cabeza (ya publicada) o no estar (todavía no)`,
    ).toBe(true);

    // Si ya está en el array, tiene que ser exactamente esta constante, y
    // UI_LIBRARY_VERSION coincidir — eso ya lo cubre version.test.ts, así
    // que aquí solo se confirma que no hay dos definiciones divergentes.
    if (indice === 0) {
      expect(UI_LIBRARY_RELEASES[0]).toEqual(UI_LIBRARY_RELEASE_1_0_0);
    }
  });

  it("sigue siendo cierto que `buttonVariants` no acepta los alias retirados", () => {
    const fuente = readFileSync(
      path.resolve(process.cwd(), "src/lib/recipes/button.ts"),
      "utf8",
    );
    // Claves de variante retiradas: comprobación textual, no de tipos, para
    // que falle también si alguien las reintroduce sin tipar `variant` como
    // `any`. `\bdefault:\s*"` no matchea `defaultVariants:` (le sigue
    // "Variants", no ":").
    for (const alias of ["ghost:", "secondary:", /\bdefault:\s*"/]) {
      const patron = typeof alias === "string" ? new RegExp(`\\b${alias}`) : alias;
      expect(
        patron.test(fuente),
        `las notas de la 1.0.0 dicen que \`${alias}\` se retiró de button.ts, pero sigue ahí`,
      ).toBe(false);
    }
  });

  it("sigue siendo cierto que el barrel no exporta `Layout`", () => {
    const barril = readFileSync(path.resolve(process.cwd(), "src/index.ts"), "utf8");
    // Los comentarios de sección ("// --- Layout ---", la categoría de
    // exports) mencionan la palabra sin exportar el componente — se filtran
    // antes de buscar, para no confundir un encabezado con un export real.
    const sinComentarios = barril
      .split("\n")
      .filter((linea) => !linea.trim().startsWith("//"))
      .join("\n");
    expect(
      /\bLayout\b/.test(sinComentarios),
      "las notas de la 1.0.0 dicen que `Layout` salió del barrel, pero src/index.ts vuelve a exportarlo (o a referenciarlo fuera de un comentario)",
    ).toBe(false);
  });
});
